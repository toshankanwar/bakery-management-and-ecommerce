'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrashIcon, 
  MinusIcon, 
  PlusIcon, 
  ShoppingBagIcon,
  ArrowLeftIcon,
  XMarkIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/firebase/config';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  where,
  setDoc
} from 'firebase/firestore';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import PageWrapper from '@/components/PageWrapper';

const DeliveryAlert = ({ cartItems }) => {
  const [position, setPosition] = useState(-100);
  const [showAlert, setShowAlert] = useState(true);
  const [message] = useState(() => {
    const messages = [
      { text: "is flying off the shelves!", count: "3" },
      { text: "is trending now!", count: "5" },
      { text: "is in high demand!", count: "4" },
      { text: "might sell out soon!", count: "6" }
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prev => {
        if (prev > window.innerWidth) {
          setShowAlert(false);
          setTimeout(() => {
            setPosition(-100);
            setShowAlert(true);
          }, 1000);
          return -100;
        }
        return prev + 1;
      });
    }, 10);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {showAlert && cartItems.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 flex items-center">
              <div className="relative w-full h-6">
                <motion.div
                  style={{ x: position }}
                  className="absolute flex items-center"
                >
                  <motion.div
                    animate={{
                      rotate: [0, 0, -5, 5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity
                    }}
                    className="text-2xl"
                  >
                    🚚
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="ml-3 bg-white px-4 py-1 rounded-full shadow-md"
                  >
                    <p className="text-sm text-amber-700">
                      <span className="font-semibold">Hurry up!</span> {' '}
                      {cartItems[0]?.name} {message.text} {' '}
                      <span className="font-medium">{message.count} other people</span> have this in their cart
                    </p>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
  const [editingRequest, setEditingRequest] = useState({});
  const { user } = useAuthContext();
  const router = useRouter();

  const fetchCartItems = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const cartRef = collection(db, 'carts', user.uid, 'items');
      const q = query(cartRef, where('quantity', '>', 0));
      const snapshot = await getDocs(q);
      
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        specialRequest: doc.data().specialRequest || ''
      }));

      setCartItems(items);
    } catch (error) {
      console.error('Error fetching cart:', {
        error: error.message,
        timestamp: '2025-06-16 16:39:55',
        user: 'Kala-bot-apk'
      });
      toast.error('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, [user]);

  const updateQuantity = async (itemId, newQuantity) => {
    if (!user || newQuantity < 0 || newQuantity > 50) return;
    
    setUpdating(itemId);
    try {
      const itemRef = doc(db, 'carts', user.uid, 'items', itemId);
      await updateDoc(itemRef, {
        quantity: newQuantity,
        updatedAt: new Date().toISOString()
      });

      setCartItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
      toast.success('Cart updated');
    } catch (error) {
      console.error('Error updating quantity:', {
        error: error.message,
        timestamp: '2025-06-16 16:39:55',
        user: 'Kala-bot-apk'
      });
      toast.error('Failed to update quantity');
    } finally {
      setUpdating(null);
    }
  };

  const updateSpecialRequest = async (itemId, request) => {
    if (!user) return;
    
    setUpdating(itemId);
    try {
      const itemRef = doc(db, 'carts', user.uid, 'items', itemId);
      await updateDoc(itemRef, {
        specialRequest: request,
        updatedAt: new Date().toISOString()
      });

      setCartItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, specialRequest: request }
            : item
        )
      );
      setEditingRequest(prev => ({
        ...prev,
        [itemId]: false
      }));
      toast.success('Special request updated');
    } catch (error) {
      console.error('Error updating special request:', {
        error: error.message,
        timestamp: '2025-06-16 16:39:55',
        user: 'Kala-bot-apk'
      });
      toast.error('Failed to update special request');
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId) => {
    if (!user) return;
    
    setIsDeleting(itemId);
    try {
      const itemRef = doc(db, 'carts', user.uid, 'items', itemId);
      await deleteDoc(itemRef);

      setCartItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', {
        error: error.message,
        timestamp: '2025-06-16 16:39:55',
        user: 'Kala-bot-apk'
      });
      toast.error('Failed to remove item');
    } finally {
      setIsDeleting(null);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 100 ? 0 : 10;
  const total = subtotal + shipping;

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <ShoppingBagIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Please login to view your cart</h2>
          <p className="text-gray-600 mb-6">Sign in to access your shopping cart and checkout</p>
          <Link 
            href="/login"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors duration-200"
          >
            Sign In
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <PageWrapper>
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <Link
            href="/shop"
            className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Continue Shopping
          </Link>
        </div>

        {/* Delivery Alert */}
        {cartItems.length > 0 && <DeliveryAlert cartItems={cartItems} />}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
          </div>
        ) : cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-8 text-center"
          >
            <ShoppingBagIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some delicious items to your cart and they will appear here</p>
            <Link
              href="/shop"
              className="inline-flex items-center px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors duration-200"
            >
              Start Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0">
                      {/* Image */}
                      <div className="relative h-24 w-24 rounded-md overflow-hidden group">
                        <Image
                          src={item.image || '/default-product.png'}
                          alt={item.name}
                          fill
                          sizes="96px"
                          className="object-cover transition-transform duration-200 group-hover:scale-105"
                          onError={(e) => {
                            e.target.src = '/default-product.png';
                          }}
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 sm:ml-6 space-y-4">
                        {/* Name and Remove Button */}
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors duration-200">
                              {item.name}
                            </h3>
                            <p className="mt-1 text-sm text-gray-500 capitalize">{item.category}</p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => removeItem(item.id)}
                            disabled={isDeleting === item.id}
                            className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                          >
                            {isDeleting === item.id ? (
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
                            ) : (
                              <XMarkIcon className="h-5 w-5" />
                            )}
                          </motion.button>
                        </div>

                        {/* Price and Quantity Controls */}
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">Price:</span>
                            <span className="font-medium">₹{item.price.toFixed(2)}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">Quantity:</span>
                            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                              <motion.button
                                whileHover={{ backgroundColor: '#f3f4f6' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                disabled={updating === item.id || item.quantity <= 1}
                                className="px-2 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                              >
                                <MinusIcon className="h-4 w-4" />
                              </motion.button>
                              
                              <span className="w-8 text-center font-medium text-gray-900">
                                {updating === item.id ? (
                                  <div className="h-4 w-4 mx-auto animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />
                                ) : (
                                  item.quantity
                                )}
                              </span>

                              <motion.button
                                whileHover={{ backgroundColor: '#f3f4f6' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => updateQuantity(item.id, Math.min(50, item.quantity + 1))}
                                disabled={updating === item.id || item.quantity >= 50}
                                className="px-2 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                              >
                                <PlusIcon className="h-4 w-4" />
                              </motion.button>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">Total:</span>
                            <span className="font-semibold text-green-600">
                              ₹{(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Special Request Section */}
                        <div className="mt-4 border-t pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Special Request</span>
                            {!editingRequest[item.id] && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setEditingRequest(prev => ({ ...prev, [item.id]: true }))}
                                className="text-green-600 hover:text-green-700"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </motion.button>
                            )}
                          </div>
                          {editingRequest[item.id] ? (
                            <div className="space-y-2">
                              <textarea
                                value={item.specialRequest}
                                onChange={(e) => {
                                  const newRequest = e.target.value;
                                  if (newRequest.length <= 200) {
                                    setCartItems(prev =>
                                      prev.map(cartItem =>
                                        cartItem.id === item.id
                                          ? { ...cartItem, specialRequest: newRequest }
                                          : cartItem
                                      )
                                    );
                                  }
                                }}
                                placeholder="Add any special instructions (e.g., allergies, preferences)"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                                rows={3}
                              />
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  {200 - (item.specialRequest?.length || 0)} characters remaining
                                </span>
                                <div className="space-x-2">
                                  <button
                                    onClick={() => {
                                      setEditingRequest(prev => ({ ...prev, [item.id]: false }));
                                      setCartItems(prev =>
                                        prev.map(cartItem =>
                                          cartItem.id === item.id
                                            ? { ...cartItem, specialRequest: cartItem.specialRequest || '' }
                                            : cartItem
                                        )
                                      );
                                    }}
                                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => updateSpecialRequest(item.id, item.specialRequest)}
                                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-600">
                              {item.specialRequest || 'No special instructions added'}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm p-6 sticky top-20"
              >
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {subtotal >= 100 ? (
                        <span className="text-green-600">Free</span>
                      ) : (
                        `₹10.00`
                      )}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-green-600">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {subtotal < 100 && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <motion.div 
                        className="bg-green-600 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (subtotal/100) * 100)}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Add ₹{(100 - subtotal).toFixed(2)} more for free shipping
                    </p>
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => router.push('/checkout')}
                  className="w-full mt-6 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  Proceed to Checkout
                </motion.button>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
    </PageWrapper>
  );
};

export default CartPage;