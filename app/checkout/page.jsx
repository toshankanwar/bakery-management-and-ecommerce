'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthContext } from '@/contexts/AuthContext';
import { db } from '@/firebase/config';
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  doc,
  deleteDoc, 
  where,
  getDoc
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { 
  QrCodeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const indianStates = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
].sort();

const UPIPaymentModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg p-6 max-w-sm w-full relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div className="text-center">
          <QrCodeIcon className="h-8 w-8 mx-auto text-yellow-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-yellow-700">UPI Not Available</h3>
          <p className="text-sm text-yellow-700 mb-4">
            UPI payment is currently <span className="font-semibold">not enabled</span>.<br />
            Please use <span className="font-semibold">Cash on Delivery</span> to prevent any loss. <br />
            We are working on enabling UPI soon. Thank you for your patience!
          </p>
          <motion.button
            onClick={onClose}
            className="mt-2 bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

const CheckoutPage = () => {
  const { user } = useAuthContext();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: user?.email || '',
    state: '',
    city: '',
    address: '',
    apartment: '',
    pincode: '',
    paymentMethod: 'COD',
    deliveryType: 'today',
    deliveryDate: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchCartItems = async () => {
      try {
        const cartRef = collection(db, 'carts', user.uid, 'items');
        const q = query(cartRef, where('quantity', '>', 0));
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        if (items.length === 0) {
          router.push('/cart');
          return;
        }

        setCartItems(items);
      } catch (error) {
        console.error('Error fetching cart:', error);
        toast.error('Failed to load cart items');
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, [user, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // For delivery date, auto-set to empty if type is today
  useEffect(() => {
    if (formData.deliveryType === "today") {
      setFormData(prev => ({ ...prev, deliveryDate: '' }));
    }
  }, [formData.deliveryType]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 100 ? 0 : 10;
  const total = subtotal + shipping;

  const validateForm = () => {
    if (!formData.name || !formData.mobile || !formData.state || !formData.city || !formData.address || !formData.pincode) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (formData.mobile.length !== 10 || !/^\d+$/.test(formData.mobile)) {
      toast.error('Please enter a valid 10-digit mobile number');
      return false;
    }

    if (formData.pincode.length !== 6 || !/^\d+$/.test(formData.pincode)) {
      toast.error('Please enter a valid 6-digit PIN code');
      return false;
    }

    if (formData.deliveryType === "choose" && !formData.deliveryDate) {
      toast.error('Please choose a delivery date');
      return false;
    }

    return true;
  };

  // Check bakery stock for all items and return {ok: boolean, unavailable: [{item, available}]}
  const checkBakeryStock = async () => {
    let unavailable = [];
    for (const item of cartItems) {
      const prodRef = doc(db, 'bakeryItems', item.productId || item.id);
      const snap = await getDoc(prodRef);
      if (!snap.exists()) {
        unavailable.push({ item, available: 0 });
      } else {
        const prod = snap.data();
        const available = prod.quantity ?? 0;
        if (item.quantity > available) {
          unavailable.push({ item, available });
        }
      }
    }
    return {
      ok: unavailable.length === 0,
      unavailable
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      // Check bakery item availability first
      const { ok, unavailable } = await checkBakeryStock();
      if (!ok) {
        unavailable.forEach(({ item, available }) => {
          toast.error(
            `${item.name} only has ${available} in stock. Please adjust your cart.`
          );
        });
        setSubmitting(false);
        return;
      }

      // Prepare orderData with only valid fields for Firestore rules
      const orderData = {
        userId: user.uid,
        userEmail: user.email,
        items: cartItems,
        address: {
          name: formData.name,
          mobile: formData.mobile,
          email: formData.email,
          state: formData.state,
          city: formData.city,
          address: formData.address,
          apartment: formData.apartment,
          pincode: formData.pincode
        },
        paymentMethod: formData.paymentMethod,
        paymentStatus: 'pending',
        orderStatus: formData.paymentMethod === 'COD' ? 'confirmed' : 'pending',
        subtotal,
        shipping,
        total,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deliveryType: formData.deliveryType
      };

      // Only include deliveryDate if deliveryType is 'choose'
      if (formData.deliveryType === "choose") {
        orderData.deliveryDate = formData.deliveryDate;
      }

      await addDoc(collection(db, 'orders'), orderData);

      if (formData.paymentMethod === 'UPI') {
        setShowUPIModal(true);
      } else {
        // Remove cart items
        const deletePromises = cartItems.map(item => 
          deleteDoc(doc(db, 'carts', user.uid, 'items', item.id))
        );
        await Promise.all(deletePromises);

        router.push('/orders');
        toast.success('Order placed successfully!');
      }
    } catch (error) {
      console.error('Error creating order:', error, JSON.stringify(error));
      toast.error('Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Date for delivery min (today)
  const minDate = new Date().toISOString().slice(0,10);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Delivery Address */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Delivery Address
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  maxLength={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900"
                  placeholder="10-digit mobile number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-900"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900"
                  required
                >
                  <option value="">Select your state</option>
                  {indianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900"
                  placeholder="Enter your city"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PIN Code *
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900"
                  placeholder="6-digit PIN code"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900"
                  placeholder="House number and street name"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apartment, Suite, etc. (optional)
                </label>
                <input
                  type="text"
                  name="apartment"
                  value={formData.apartment}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-gray-900"
                  placeholder="Apartment, suite, unit, etc."
                />
              </div>
            </div>
          </div>

          {/* Delivery Time */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Delivery Time
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="deliveryType"
                  value="today"
                  checked={formData.deliveryType === 'today'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Today</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="deliveryType"
                  value="choose"
                  checked={formData.deliveryType === 'choose'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <span className="ml-2 text-sm text-gray-700">Choose a date:</span>
                <input
                  type="date"
                  min={minDate}
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                  disabled={formData.deliveryType !== 'choose'}
                  className="ml-2 px-2 py-1 border border-gray-300 rounded-md text-gray-900"
                />
              </label>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Method
            </h2>
            
            <div className="space-y-4">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={formData.paymentMethod === 'COD'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-gray-900">
                    Cash on Delivery
                  </span>
                  <span className="block text-sm text-gray-500">
                    Pay when you receive your order
                  </span>
                </div>
              </label>

              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="UPI"
                  checked={formData.paymentMethod === 'UPI'}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-gray-900">
                    UPI Payment
                  </span>
                  <span className="block text-sm text-gray-500">
                    <span className="font-semibold text-yellow-700">UPI payment is not enabled. Please use cash on delivery to prevent any loss. We are working on that.</span>
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>
            
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center py-4 border-b last:border-0">
                  <div className="relative h-16 w-16 rounded-md overflow-hidden">
                    <Image
                      src={item.image || '/default-product.png'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 ml-4">
                    <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                    {item.specialRequest && (
                      <p className="mt-1 text-sm text-gray-500">
                        Special Request: {item.specialRequest}
                      </p>
                    )}
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-gray-900">
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `₹${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-gray-900">
                      Total
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={submitting}
            className="w-full py-4 px-6 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2" />
                Processing...
              </div>
            ) : (
              `Place Order - ₹${total.toFixed(2)}`
            )}
          </motion.button>
        </form>
      </div>

      <UPIPaymentModal
        isOpen={showUPIModal}
        onClose={() => setShowUPIModal(false)}
      />
    </div>
  );
};

export default CheckoutPage;