'use client';

import { useEffect, useState } from 'react';
import { db } from '@/firebase/config';
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon as SolidHeartIcon } from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import { Toaster, toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

// Helper to generate slug from product name
const toSlug = (str = '') =>
  str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

const FavouritePage = () => {
  const { user, signIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  // Fetch user's favourite items from /favourites/{userId}/items
  useEffect(() => {
    if (!user) {
      setLoading(false);
      setProducts([]);
      return;
    }
    const fetchFavourites = async () => {
      setLoading(true);
      try {
        const favSnapshot = await getDocs(collection(db, 'favourites', user.uid, 'items'));
        const favProducts = favSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            category: data.category,
            price: data.price,
            imageUrl: data.imageUrl,
            description: data.description,
          };
        });
        setProducts(favProducts);
      } catch (err) {
        toast.error('Error loading favourites');
        setProducts([]);
      }
      setLoading(false);
    };
    fetchFavourites();
  }, [user]);

  // Remove favourite item
  const handleRemove = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'favourites', user.uid, 'items', id));
      setProducts(products.filter(p => p.id !== id));
      toast.success('Removed from favourites!');
    } catch (err) {
      toast.error('Failed to remove.');
    }
  };

  // Responsive animation variants
  const itemVariant = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // Sign-in prompt for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-green-50 to-pink-50 p-4">
        <Toaster position="top-right" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 max-w-sm w-full text-center"
        >
          <SolidHeartIcon className="h-10 w-10 mx-auto text-pink-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Sign in to view your favourites</h2>
          <p className="mb-6 text-gray-500">Save bakery items you love and access them anytime.</p>
          <button
            onClick={signIn}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition"
          >
            Sign In
          </button>
        </motion.div>
      </div>
    );
  }

  // Main favourites view for authenticated user
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-green-50 to-pink-50 p-4">
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Favourites</h1>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <SolidHeartIcon className="h-8 w-8 mx-auto text-pink-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No favourite items found</h3>
            <p className="mt-2 text-sm text-gray-500">Go to shop and add some!</p>
            <Link
              href="/shop"
              className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              Browse Shop
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map(product => (
              <motion.div
                key={product.id}
                variants={itemVariant}
                initial="hidden"
                animate="show"
                transition={{ duration: 0.2 }}
                className="relative bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden flex flex-col"
              >
                <Link href={`/product/${toSlug(product.name)}`} className="block group">
                  <div className="relative h-44 sm:h-56 overflow-hidden">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover rounded-t-xl"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-1">{product.category}</p>
                    <span className="text-lg font-bold text-green-600 mb-2">₹ {product.price?.toFixed(2)}</span>
                    <p className="text-xs text-gray-500 line-clamp-2 flex-1">{product.description}</p>
                  </div>
                </Link>
                <button
                  onClick={() => handleRemove(product.id)}
                  className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-pink-100 transition"
                  aria-label="Remove from favourites"
                >
                  <XMarkIcon className="h-5 w-5 text-pink-500" />
                </button>
                <SolidHeartIcon className="absolute top-2 left-2 h-6 w-6 text-pink-500" />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavouritePage;