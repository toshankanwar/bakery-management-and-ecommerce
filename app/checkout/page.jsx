'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuthContext } from '@/contexts/AuthContext';
import { db } from "@/firebase/config";
import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  doc,
  setDoc,
  getDoc,
  deleteDoc, 
  updateDoc,
  where
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { 
  QrCodeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

// HARDCODED Razorpay credentials for demo ONLY. Replace with your own.
const RAZORPAY_KEY_ID = "YOUR_RAZORPAY_KEY_ID"; // <-- Insert your Razorpay Key ID here

const MAIL_SERVER_URL = 'https://mail-server-toshan-bakery.onrender.com/send-order-confirmation'; 
const indianStates = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
].sort();

const UPIPaymentModal = ({ isOpen, onClose, onPay }) => {
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
          <h3 className="text-lg font-semibold mb-2 text-yellow-700">Proceed to UPI Payment</h3>
          <p className="text-sm text-yellow-700 mb-4">
            Please proceed to pay using UPI. If you cancel, your order will not be placed.
          </p>
          <motion.button
            onClick={onPay}
            className="mt-2 bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700"
          >
            Pay Now
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
  const [pendingOrderData, setPendingOrderData] = useState(null); // for UPI flow
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
  const [saveAddress, setSaveAddress] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch saved address if available
  useEffect(() => {
    if (user) {
      const fetchSavedAddress = async () => {
        try {
          const addressRef = doc(db, 'addresses', user.uid);
          const addressSnap = await getDoc(addressRef);
          if (addressSnap.exists()) {
            const addr = addressSnap.data();
            setFormData(prev => ({
              ...prev,
              ...addr,
              email: user.email // always use current email
            }));
            setSaveAddress(true); // User has saved address
          }
        } catch (error) {
          console.error("Failed to fetch saved address", error);
        }
      };
      fetchSavedAddress();
    }
  }, [user]);

  // Cart fetch logic
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

  // Dynamically load Razorpay script
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

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

  // Send order confirmation mail
  const sendOrderConfirmationMail = async (orderData) => {
    try {
      await fetch(MAIL_SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: orderData.userEmail,
          name: formData.name,
          order: orderData
        }),
      });
    } catch (e) {
      console.error('Failed to send order confirmation email', e);
    }
  };

  // Razorpay payment handler (UPI only)
  const handleRazorpayPayment = async (orderData) => {
    // Create payment order using API route (hardcoded keys server-side)
    const paymentOrder = await fetch('/api/payment/order', {
      method: 'POST',
      body: JSON.stringify({ amount: orderData.total * 100 }),
      headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json());

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: paymentOrder.amount,
      currency: "INR",
      name: "Bakery Name",
      description: "Your bakery order",
      order_id: paymentOrder.id,
      handler: async function (response) {
        // Payment success, verify on backend
        const verify = await fetch('/api/payment/verify', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...response, orderDocId: orderData.orderDocId }),
        }).then((res) => res.json());

        if (verify.status === "success") {
          // Remove cart items after payment success
          const deletePromises = cartItems.map(item => 
            deleteDoc(doc(db, 'carts', user.uid, 'items', item.id))
          );
          await Promise.all(deletePromises);

          sendOrderConfirmationMail(orderData);
          toast.success("Payment confirmed & order placed!");
          router.push("/orders");
        } else {
          await updateDoc(doc(db, "orders", orderData.orderDocId), {
            paymentStatus: "cancelled",
            orderStatus: "cancelled",
          });
          toast.error("Payment verification failed. Order cancelled.");
        }
      },
      modal: {
        ondismiss: async function () {
          // User cancelled payment, cancel order in Firestore
          await updateDoc(doc(db, "orders", orderData.orderDocId), {
            paymentStatus: "cancelled",
            orderStatus: "cancelled",
          });
          toast.error("Payment cancelled. Order not placed.");
        },
      },
      prefill: {
        name: orderData.address.name,
        email: orderData.address.email,
        contact: orderData.address.mobile,
      },
      theme: { color: "#38a169" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      // Check item availability first
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

      // Save address if the user opted for it
      if (saveAddress) {
        const addressRef = doc(db, 'addresses', user.uid);
        await setDoc(addressRef, {
          name: formData.name,
          mobile: formData.mobile,
          state: formData.state,
          city: formData.city,
          address: formData.address,
          apartment: formData.apartment,
          pincode: formData.pincode,
        });
      }

      // Prepare orderData
      const now = new Date();
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
        orderStatus: 'pending',
        subtotal,
        shipping,
        total,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        deliveryType: formData.deliveryType,
        deliveryDate: formData.deliveryType === "choose" ? formData.deliveryDate : now.toISOString().slice(0, 10)
      };

      // Create order in Firestore (pending status)
      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      orderData.orderDocId = orderRef.id;

      if (formData.paymentMethod === 'UPI') {
        // Show modal, then call Razorpay when user clicks "Pay Now"
        setPendingOrderData(orderData);
        setShowUPIModal(true);
      } else {
        // COD flow: confirm order right away
        await updateDoc(orderRef, {
          paymentStatus: 'confirmed',
          orderStatus: 'confirmed'
        });

        // Remove cart items
        const deletePromises = cartItems.map(item => 
          deleteDoc(doc(db, 'carts', user.uid, 'items', item.id))
        );
        await Promise.all(deletePromises);

        sendOrderConfirmationMail(orderData);
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

  const handleUPIModalPay = () => {
    setShowUPIModal(false);
    if (pendingOrderData) {
      handleRazorpayPayment(pendingOrderData);
      setPendingOrderData(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

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
            {/* Save address checkbox */}
            <div className="flex items-center mt-4">
              <input
                type="checkbox"
                id="saveAddress"
                checked={saveAddress}
                onChange={() => setSaveAddress(val => !val)}
                className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
              />
              <label htmlFor="saveAddress" className="ml-2 block text-sm text-gray-700">
                Save this address for future orders
              </label>
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
                    <span className="font-semibold text-yellow-700">UPI payment is enabled. Order will be placed only after successful payment.</span>
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
        onPay={handleUPIModalPay}
      />
    </div>
  );
};

export default CheckoutPage;