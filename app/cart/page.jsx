'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrashIcon, 
  MinusIcon, 
  PlusIcon, 
  ShoppingBagIcon,
  ArrowLeftIcon,
  XMarkIcon
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
  where 
} from 'firebase/firestore';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [isDeleting, setIsDeleting] = useState(null);
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
        ...doc.data()
      }));

      setCartItems(items);
    } catch (error) {
      console.error('Error fetching cart:', {
        error: error.message,
        timestamp: '2025-06-13 17:20:13',
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
        updatedAt: new Date()
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
        timestamp: '2025-06-13 17:20:13',
        user: 'Kala-bot-apk'
      });
      toast.error('Failed to update quantity');
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
        timestamp: '2025-06-13 17:20:13',
        user: 'Kala-bot-apk'
      });
      toast.error('Failed to remove item');
    } finally {
      setIsDeleting(null);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05; // 5% tax
  const shipping = subtotal > 1000 ? 0 : 50; // Free shipping over ₹1000
  const total = subtotal + tax + shipping;

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
                      <div className="relative h-24 w-24 rounded-md overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 sm:ml-6">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                            <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                          </div>
                          <p className="text-lg font-semibold text-green-600">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                              disabled={updating === item.id || item.quantity <= 1}
                              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                            >
                              <MinusIcon className="h-4 w-4 text-gray-600" />
                            </motion.button>
                            <span className="w-8 text-center font-medium">
                              {updating === item.id ? (
                                <div className="h-4 w-4 mx-auto animate-spin rounded-full border-2 border-gray-300 border-t-green-600" />
                              ) : (
                                item.quantity
                              )}
                            </span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => updateQuantity(item.id, Math.min(50, item.quantity + 1))}
                              disabled={updating === item.id || item.quantity >= 50}
                              className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                            >
                              <PlusIcon className="h-4 w-4 text-gray-600" />
                            </motion.button>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => removeItem(item.id)}
                            disabled={isDeleting === item.id}
                            className="flex items-center text-sm font-medium text-red-600 hover:text-red-700"
                          >
                            {isDeleting === item.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-300 border-t-red-600" />
                            ) : (
                              <>
                                <TrashIcon className="h-4 w-4 mr-1" />
                                Remove
                              </>
                            )}
                          </motion.button>
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
                    <span className="text-gray-600">Tax (5%)</span>
                    <span className="font-medium">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-green-600">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                {shipping > 0 && (
                  <p className="mt-3 text-sm text-gray-500">
                    Add ₹{(100 - subtotal).toFixed(2)} more for free shipping
                  </p>
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
  );
};

export default CartPage;