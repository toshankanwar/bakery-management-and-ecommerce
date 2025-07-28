'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

// HARDCODED Razorpay credentials for demo ONLY. Replace with your own.
const RAZORPAY_KEY_ID = "rzp_live_7p3V38KUQoolpn"; // <-- Insert your Razorpay Key ID here

const MAIL_SERVER_URL = 'https://mail-server-toshan-bakery.onrender.com/send-order-confirmation'; 
const indianStates = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'
].sort();

// UPI Payment Modal with glass blur background
const UPIPaymentModal = ({ isOpen, onClose, onPay }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(30,41,59,0.2)', backdropFilter: 'blur(12px)' }}>
      <motion.div
        initial={{ y: 80, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 80, opacity: 0, scale: 0.96 }}
        className="bg-white bg-opacity-90 rounded-xl p-7 max-w-xs w-full shadow-2xl border border-green-100 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-green-500 focus:outline-none"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <QrCodeIcon className="h-10 w-10 text-green-700 mb-3 drop-shadow" />
          </motion.div>
          <h3 className="text-lg font-bold mb-2 text-green-700">Secure UPI Payment</h3>
          <p className="text-[15px] text-gray-700 mb-5 text-center">
            We support instant and secure UPI payments. <br />
            Please complete your payment to confirm your order. If you cancel, your order will not be placed.
          </p>
          <motion.button
            onClick={onPay}
            className="mt-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:from-green-600 hover:to-green-700 focus:ring-4 focus:ring-green-300 transition"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.97 }}
          >
            Pay Now
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

// Animated Order Confirmation
const OrderConfirmedEffect = ({ show }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center"
        style={{ background: 'rgba(10, 180, 120, 0.10)', backdropFilter: 'blur(10px)' }}
      >
        <motion.div
          initial={{ scale: 0.85, y: 80, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 15 }}
          className="bg-white rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center border border-green-200 relative"
        >
          <motion.div
            initial={{ scale: 0, rotate: 0 }}
            animate={{ scale: [1.3, 0.8, 1.08, 1], rotate: [0, 30, -22, 0] }}
            transition={{ duration: 0.9, ease: "easeInOut", type: "tween" }} // Fixed: use tween!
            className="shadow-md rounded-full mb-4"
          >
            <CheckCircleIcon className="h-20 w-20 text-green-500 animate-bounce-slow" />
          </motion.div>
          <motion.h2
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.18, duration: 0.6, type: "spring" }}
            className="text-3xl font-bold text-green-700 mb-3"
          >
            Order Confirmed!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-gray-700 text-lg"
          >
            Your order was successfully placed and is being processed.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [-10, 12, -4, 0] }}
            transition={{ delay: 0.45, duration: 0.85 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 pointer-events-none"
          >
            <svg width="140" height="30" viewBox="0 0 140 30" fill="none">
              <motion.ellipse
                initial={{ scaleX: 0.8, scaleY: 0.2, opacity: 0.7 }}
                animate={{
                  scaleX: [0.8, 1.2, 1, 0.85],
                  scaleY: [0.2, 0.35, 0.28, 0.22],
                  opacity: [0.7, 1, 0.9, 0.7],
                }}
                transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut", type: "tween" }}
                cx="70" cy="15" rx="56" ry="7" fill="#bbf7d0"
              />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);


// Helper function for border color
const getInputBorder = (value, isFocused, required = true) => {
  if (!required) return isFocused ? 'border-green-500' : 'border-gray-300';
  if (isFocused) return 'border-green-600 shadow-md';
  if (value === '' || value === undefined) return 'border-red-500 shadow';
  return 'border-gray-300';
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
    paymentMethod: 'UPI', // PRIORITY: Default to UPI
    deliveryType: 'choose',
    deliveryDate: '',
  });
  const [focus, setFocus] = useState({});
  const [saveAddress, setSaveAddress] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showOrderConfirmed, setShowOrderConfirmed] = useState(false);

  // Default delivery date: today
  const todayDate = new Date().toISOString().slice(0, 10);

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
    // Set today's date as default
    if (formData.deliveryType === "choose" && !formData.deliveryDate) {
      setFormData(prev => ({ ...prev, deliveryDate: todayDate }));
    }
    if (formData.deliveryType === "today") {
      setFormData(prev => ({ ...prev, deliveryDate: todayDate }));
    }
  // eslint-disable-next-line
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
    
    const paymentOrder = await fetch('https://bakery-online-payment-server.onrender.com/api/payment-order', {
      method: 'POST',
      body: JSON.stringify({ amount: orderData.total * 100 }),
      headers: { 'Content-Type': 'application/json' }
    }).then(res => res.json());

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: paymentOrder.amount,
      currency: "INR",
      name: "Toshan Bakery",
      description: "Your bakery order",
      order_id: paymentOrder.id,
      handler: async function (response) {
        // Payment success, verify on backend
        
        const verify = await fetch('https://bakery-online-payment-server.onrender.com/api/payment-verify', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...response, orderDocId: orderData.orderDocId }),
        }).then((res) => res.json());
        toast.loading("Checking Status please wait ...")
try{
     
        if (verify.status === "success") {
          // Payment and Order both confirmed
          // Remove cart items
          const deletePromises = cartItems.map(item => 
            deleteDoc(doc(db, 'carts', user.uid, 'items', item.id))
          );
          await Promise.all(deletePromises);
        
          sendOrderConfirmationMail(orderData);
          setShowOrderConfirmed(true);
          toast.success("Payment confirmed & order placed!");
        
          setTimeout(() => {
            setShowOrderConfirmed(false);
            router.push("/orders");
          }, 1800);
        
        } else if (verify.status === "payment_confirmed_order_cancelled") {
          // Payment succeeded, but order cancelled due to insufficient stock
          await updateDoc(doc(db, "orders", orderData.orderDocId), {
            paymentStatus: "confirmed",
            orderStatus: "cancelled",
          });
        
          toast.error(
            "Payment confirmed, but order cancelled due to insufficient stock. A refund has been initiated."
          );
        
          // Optionally show UI/notification about refund
          // Do NOT clear cart because order was cancelled
          // You may redirect to orders page or show help info
          setShowOrderConfirmed(false);
        
          setTimeout(() => {
            router.push("/orders");
          }, 2500);
        
        } else if (verify.status === "cancelled") {
          // Both payment and order cancelled (e.g., signature mismatch)
          await updateDoc(doc(db, "orders", orderData.orderDocId), {
            paymentStatus: "cancelled",
            orderStatus: "cancelled",
          });
        
          toast.error("Payment verification failed. Order not confirmed.");
          setShowOrderConfirmed(false);
        
          // Optionally redirect user to retry payment or home page
          setTimeout(() => {
            router.push("/cart");
          }, 1800);
        
        } else if (verify.status === "error") {
          // Some error happened (e.g. order not found)
          toast.error(`Error: ${verify.error || "Payment verification failed."}`);
        
          // Depending on your UI, optionally redirect or reset states
          setShowOrderConfirmed(false);
        
        } else {
          // Unknown or unexpected status, fail-safe handling
          toast.error("Payment verification failed due to unknown error.");
          setShowOrderConfirmed(false);
        }}catch{}
        
      },
      modal: {
        ondismiss: async function () {
          // User cancelled payment, cancel order in Firestore
          await updateDoc(doc(db, "orders", orderData.orderDocId), {
            paymentStatus: "cancelled",
            orderStatus: "cancelled",
          });
          toast.error("Payment cancelled by user. Order not placed.");
        },
      },
      prefill: {
        name: orderData.address.name,
        email: orderData.address.email,
        contact: orderData.address.mobile,
      },
      theme: { color: "#22c55e" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);
    toast.loading("Order Request Sends to backend");
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
        deliveryDate: formData.deliveryDate || todayDate
      };

      // Create order in Firestore (pending status)
      const orderRef = await addDoc(collection(db, 'orders'), orderData);
      orderData.orderDocId = orderRef.id;

      if (formData.paymentMethod === 'UPI') {
        // Show modal, then call Razorpay when user clicks "Pay Now"
        setPendingOrderData(orderData);
        setShowUPIModal(true);
      } else {
        // COD flow: payment is pending, order is confirmed transactionally only if backend confirms
      
        try {
          console.log('Calling decrement-stock API with:', {
            orderDocId: orderData.orderDocId,
            paymentStatus: orderData.paymentStatus,
            orderItems: orderData.items,
          });
          
          toast.loading(' Backend is waking up, please wait...');

          const response = await fetch('https://bakery-item-decrement-server.onrender.com/api/confirm-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderDocId: orderData.orderDocId,
              paymentStatus: orderData.paymentStatus || 'pending',
              orderItems: orderData.items,
            }),
          });
      
          if (!response.ok) {
            // Server responded with error status (4xx or 5xx)
            const errorData = await response.json().catch(() => ({}));
            console.error('Stock decrement API error:', errorData);
            toast.error('Failed to place order due to server error. Please try again.');
            return; // stop further execution
          }
      
          const apiResult = await response.json();
      
          // Handle order confirmation status
          if (apiResult.success === true || apiResult.status === 'success') {
            // Order confirmed
            // Remove cart items
            const deletePromises = cartItems.map(item =>
              deleteDoc(doc(db, 'carts', user.uid, 'items', item.id))
            );
            await Promise.all(deletePromises);
      
            sendOrderConfirmationMail(orderData);
            setShowOrderConfirmed(true);
            toast.success('Order placed successfully!');
      
            setTimeout(() => {
              setShowOrderConfirmed(false);
              router.push('/orders');
            }, 1800);
      
          } else if (
            apiResult.success === false ||
            apiResult.status === 'payment_confirmed_order_cancelled'
          ) {
            // Payment confirmed but order cancelled due to insufficient stock
      
            // Update order status to cancelled (if not already)
            await updateDoc(doc(db, 'orders', orderData.orderDocId), {
              orderStatus: 'cancelled',
            });
      
            toast.error(
              apiResult.message ||
                'Order cancelled due to insufficient stock.'
            );
            setShowOrderConfirmed(false);
      
            // Redirect to orders page (not cart)
            setTimeout(() => {
              router.push('/orders');
            }, 2500);
      
          } else if (
            apiResult.status === 'cancelled'
          ) {
            // New scenario: order not confirmed (order cancelled)
            // Update order status to cancelled just in case
            await updateDoc(doc(db, 'orders', orderData.orderDocId), {
              orderStatus: 'cancelled',
            });
      
            toast.error(
              apiResult.message ||
                'Order could not be confirmed and has been cancelled.'
            );
            setShowOrderConfirmed(false);
      
            // Redirect to orders page (not cart)
            setTimeout(() => {
              router.push('/orders');
            }, 2500);
      
          } else {
            // Unknown status returned
            toast.error('Unexpected response from server. Please contact support.');
            setShowOrderConfirmed(false);
          }
        } catch (error) {
          console.error('Error calling stock decrement API:', error);
          toast.error(
            'Failed to place order. Please check your internet connection and try again.'
          );
          setShowOrderConfirmed(false);
        }
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-50 to-green-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600" />
      </div>
    );
  }

  const minDate = todayDate;

  // Form field meta for modern UI
  const fields = [
    {
      label: "Full Name *", name: "name", type: "text", placeholder: "Enter your full name", required: true,
    },
    {
      label: "Mobile Number *", name: "mobile", type: "tel", placeholder: "10-digit mobile number", required: true, maxLength: 10,
    },
    {
      label: "Email", name: "email", type: "email", placeholder: "", required: false, readOnly: true,
    },
    {
      label: "State *", name: "state", type: "select", required: true, options: indianStates,
    },
    {
      label: "City *", name: "city", type: "text", placeholder: "Enter your city", required: true,
    },
    {
      label: "PIN Code *", name: "pincode", type: "text", placeholder: "6-digit PIN code", required: true, maxLength: 6,
    },
    {
      label: "Street Address *", name: "address", type: "text", placeholder: "House number and street name", required: true,
    },
    {
      label: "Apartment, Suite, etc. (optional)", name: "apartment", type: "text", placeholder: "Apartment, suite, unit, etc.", required: false,
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-tr from-green-50 to-green-100 py-12 relative">
      <OrderConfirmedEffect show={showOrderConfirmed} />
      <div className="max-w-3xl mx-auto px-4">
        <motion.h1
          initial={{ x: -40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.45 }}
          className="text-3xl font-bold text-green-800 mb-8 text-center"
        >
          Checkout
        </motion.h1>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Delivery Address */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white/95 rounded-2xl shadow-lg p-7"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400"></span>
              Delivery Address
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {fields.slice(0, 2).map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input
                    {...(f.maxLength && { maxLength: f.maxLength })}
                    type={f.type}
                    name={f.name}
                    value={formData[f.name]}
                    onChange={handleInputChange}
                    onFocus={() => setFocus(prev => ({ ...prev, [f.name]: true }))}
                    onBlur={() => setFocus(prev => ({ ...prev, [f.name]: false }))}
                    className={`w-full px-3 py-2 rounded-lg transition border ${getInputBorder(formData[f.name], focus[f.name], f.required)} focus:outline-none focus:border-green-500 bg-white text-gray-900`}
                    placeholder={f.placeholder}
                    required={f.required}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{fields[2].label}</label>
                <input
                  type={fields[2].type}
                  name={fields[2].name}
                  value={formData[fields[2].name]}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-900"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{fields[3].label}</label>
                <select
                  name={fields[3].name}
                  value={formData[fields[3].name]}
                  onChange={handleInputChange}
                  onFocus={() => setFocus(prev => ({ ...prev, [fields[3].name]: true }))}
                  onBlur={() => setFocus(prev => ({ ...prev, [fields[3].name]: false }))}
                  className={`w-full px-3 py-2 rounded-lg border ${getInputBorder(formData[fields[3].name], focus[fields[3].name], true)} focus:outline-none focus:border-green-500 text-gray-900`}
                  required
                >
                  <option value="">Select your state</option>
                  {fields[3].options.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>
              {fields.slice(4, 6).map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input
                    {...(f.maxLength && { maxLength: f.maxLength })}
                    type={f.type}
                    name={f.name}
                    value={formData[f.name]}
                    onChange={handleInputChange}
                    onFocus={() => setFocus(prev => ({ ...prev, [f.name]: true }))}
                    onBlur={() => setFocus(prev => ({ ...prev, [f.name]: false }))}
                    className={`w-full px-3 py-2 rounded-lg transition border ${getInputBorder(formData[f.name], focus[f.name], f.required)} focus:outline-none focus:border-green-500 text-gray-900`}
                    placeholder={f.placeholder}
                    required={f.required}
                  />
                </div>
              ))}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{fields[6].label}</label>
                <input
                  type={fields[6].type}
                  name={fields[6].name}
                  value={formData[fields[6].name]}
                  onChange={handleInputChange}
                  onFocus={() => setFocus(prev => ({ ...prev, [fields[6].name]: true }))}
                  onBlur={() => setFocus(prev => ({ ...prev, [fields[6].name]: false }))}
                  className={`w-full px-3 py-2 rounded-lg border ${getInputBorder(formData[fields[6].name], focus[fields[6].name], fields[6].required)} focus:outline-none focus:border-green-500 text-gray-900`}
                  placeholder={fields[6].placeholder}
                  required={fields[6].required}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">{fields[7].label}</label>
                <input
                  type={fields[7].type}
                  name={fields[7].name}
                  value={formData[fields[7].name]}
                  onChange={handleInputChange}
                  onFocus={() => setFocus(prev => ({ ...prev, [fields[7].name]: true }))}
                  onBlur={() => setFocus(prev => ({ ...prev, [fields[7].name]: false }))}
                  className={`w-full px-3 py-2 rounded-lg border ${getInputBorder(formData[fields[7].name], focus[fields[7].name], fields[7].required)} focus:outline-none focus:border-green-500 text-gray-900`}
                  placeholder={fields[7].placeholder}
                />
              </div>
            </div>
            {/* Save address checkbox */}
            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                id="saveAddress"
                checked={saveAddress}
                onChange={() => setSaveAddress(val => !val)}
                className="h-4 w-4 text-green-600 border-gray-300 rounded"
              />
              <label htmlFor="saveAddress" className="ml-2 block text-sm text-gray-700">
                Save this address for future orders
              </label>
            </div>
          </motion.div>
          {/* Delivery Time */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.33, delay: 0.08 }}
            className="bg-white/95 rounded-2xl shadow-lg p-7"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400"></span>
              Delivery Date
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-4">
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
                  value={formData.deliveryDate || todayDate}
                  onChange={handleInputChange}
                  className={`ml-2 px-3 py-1 border rounded-md transition ${getInputBorder(formData.deliveryDate, focus.deliveryDate, true)} focus:outline-none focus:border-green-500 text-gray-900`}
                  required
                  onFocus={() => setFocus(prev => ({ ...prev, deliveryDate: true }))}
                  onBlur={() => setFocus(prev => ({ ...prev, deliveryDate: false }))}
                />
              </label>
            </div>
          </motion.div>

          {/* Payment Method */}
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.36, delay: 0.14 }}
            className="bg-white/95 rounded-2xl shadow-lg p-7"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400"></span>
              Payment Method
            </h2>
            <div className="space-y-4">
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-green-50 transition border-green-200">
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
                    UPI Payment <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-lg ml-1 text-xs font-semibold">Recommended</span>
                  </span>
                  <span className="block text-sm text-gray-500">
                    <span className="font-semibold text-green-700">
                      Fast, secure, and instant order confirmation.
                    </span>
                  </span>
                </div>
              </label>
              <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-green-50 transition border-green-200">
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
                    Pay when you receive your order. Payment status will remain pending until delivery.
                  </span>
                </div>
              </label>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.38, delay: 0.18 }}
            className="bg-white/95 rounded-2xl shadow-lg p-7"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400"></span>
              Order Summary
            </h2>
            <div className="space-y-4 mb-2">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center py-4 border-b last:border-0 border-gray-100">
                  <div className="relative h-16 w-16 rounded-lg overflow-hidden shadow">
                    <Image
                      src={item.image || '/default-product.png'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 ml-4">
                    <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                    <p className="mt-1 text-[15px] text-gray-500">
                      Quantity: <span className="font-semibold">{item.quantity}</span>
                    </p>
                    {item.specialRequest && (
                      <p className="mt-1 text-sm text-gray-500">
                        Special Request: {item.specialRequest}
                      </p>
                    )}
                  </div>
                  <div className="text-base font-medium text-green-700">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-semibold text-gray-900">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700">Shipping</span>
                  <span className="font-semibold text-gray-900">
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `₹${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      ₹{total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            disabled={submitting}
            className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg rounded-xl shadow-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3" />
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
      <style jsx global>{`
        .animate-bounce-slow {
          animation: bounce-slow 1.5s infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0);}
          30% { transform: translateY(-18px);}
          60% { transform: translateY(7px);}
        }
      `}</style>
    </div>
  );
};

export default CheckoutPage;