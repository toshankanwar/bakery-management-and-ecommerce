// app/checkout/page.jsx
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
  getDoc,
  updateDoc 
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { 
  MapPinIcon,
  PhoneIcon,
  CreditCardIcon,
  CashIcon,
  QrCodeIcon,
  ChevronRightIcon,
  ShoppingBagIcon,
  XMarkIcon,
  CheckIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const indianStates = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
].sort();

const UPIPaymentModal = ({ isOpen, onClose, orderId, amount, onPaymentComplete }) => {
  const [qrCode, setQrCode] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [checking, setChecking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    if (isOpen) {
      const upiId = 'toshankanwar3@okicici';
      const upiUrl = `upi://pay?pa=${upiId}&pn=Toshan Bakery&tr=${orderId}&am=${amount}&cu=INR`;
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(upiUrl)}&size=200x200`;
      setQrCode(qrUrl);

      const checkInterval = setInterval(() => {
        checkPaymentStatus(orderId);
      }, 5000);

      const timerInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(checkInterval);
            clearInterval(timerInterval);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(checkInterval);
        clearInterval(timerInterval);
      };
    }
  }, [isOpen, orderId, amount]);

  const checkPaymentStatus = async (orderId) => {
    try {
      setChecking(true);
      const orderRef = doc(db, 'orders', orderId);
      const orderSnap = await getDoc(orderRef);
      
      if (orderSnap.exists()) {
        const orderData = orderSnap.data();
        if (orderData.paymentStatus === 'completed') {
          setPaymentStatus('completed');
          setTimeout(onPaymentComplete, 1500);
        } else if (orderData.paymentStatus === 'failed') {
          setPaymentStatus('failed');
        }
      }
    } catch (error) {
      console.error('Error checking payment:', {
        error: error.message,
        timestamp: '2025-06-16 18:24:30',
        user: 'Kala-bot-apk'
      });
    } finally {
      setChecking(false);
    }
  };

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
          <QrCodeIcon className="h-8 w-8 mx-auto text-green-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Scan & Pay</h3>
          <p className="text-sm text-gray-600 mb-4">
            Amount to Pay: ₹{amount.toFixed(2)}
          </p>
          
          {qrCode && (
            <div className="flex justify-center mb-4">
              <div className="relative border-2 border-green-600 rounded-lg p-2">
                <Image
                  src={qrCode}
                  alt="Payment QR Code"
                  width={200}
                  height={200}
                  className="rounded-lg"
                />
              </div>
            </div>
          )}

          <div className="space-y-4">
            {paymentStatus === 'pending' && (
              <div>
                <div className="text-sm text-yellow-600 animate-pulse">
                  Waiting for payment...
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  Time remaining: {Math.floor(timeLeft / 60)}:
                  {(timeLeft % 60).toString().padStart(2, '0')}
                </div>
              </div>
            )}

            {paymentStatus === 'completed' && (
              <div className="text-sm text-green-600">
                <CheckIcon className="h-6 w-6 mx-auto mb-2" />
                Payment successful! Redirecting...
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div className="text-sm text-red-600">
                <XCircleIcon className="h-6 w-6 mx-auto mb-2" />
                Payment failed. Please try again.
              </div>
            )}

            <div className="text-xs text-gray-500 mt-4">
              Note: Please don't close this window while payment is processing
            </div>
          </div>
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
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: user?.email || '',
    state: '',
    city: '',
    address: '',
    apartment: '',
    pincode: '',
    paymentMethod: 'COD'
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
        console.error('Error fetching cart:', {
          error: error.message,
          timestamp: '2025-06-16 18:24:30',
          user: 'Kala-bot-apk'
        });
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

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const orderRef = await addDoc(collection(db, 'orders'), {
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
        updatedAt: new Date().toISOString()
      });

      if (formData.paymentMethod === 'UPI') {
        setCurrentOrderId(orderRef.id);
        setShowUPIModal(true);
      } else {
        const deletePromises = cartItems.map(item => 
          deleteDoc(doc(db, 'carts', user.uid, 'items', item.id))
        );
        await Promise.all(deletePromises);
        
        router.push('/orders');
        toast.success('Order placed successfully!');
      }
    } catch (error) {
      console.error('Error creating order:', {
        error: error.message,
        timestamp: '2025-06-16 18:24:30',
        user: 'Kala-bot-apk'
      });
      toast.error('Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentComplete = async () => {
    try {
      if (currentOrderId) {
        await updateDoc(doc(db, 'orders', currentOrderId), {
          orderStatus: 'confirmed',
          paymentStatus: 'completed',
          updatedAt: new Date().toISOString()
        });

        const deletePromises = cartItems.map(item => 
          deleteDoc(doc(db, 'carts', user.uid, 'items', item.id))
        );
        await Promise.all(deletePromises);
      }
      
      setShowUPIModal(false);
      router.push('/orders');
      toast.success('Payment successful! Order placed.');
    } catch (error) {
      console.error('Error processing payment completion:', error);
      toast.error('Error completing order');
    }
  };

  const handlePaymentCancel = async () => {
    try {
      if (currentOrderId) {
        await updateDoc(doc(db, 'orders', currentOrderId), {
          orderStatus: 'cancelled',
          paymentStatus: 'failed',
          updatedAt: new Date().toISOString()
        });
      }
      setShowUPIModal(false);
      toast.error('Payment cancelled. Please try again after some time.');
    } catch (error) {
      console.error('Error cancelling payment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

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
                    Pay using qr code
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
        onClose={handlePaymentCancel}
        orderId={currentOrderId}
        amount={total}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  );
};

export default CheckoutPage;