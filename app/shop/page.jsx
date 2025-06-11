'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/firebase/config';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import Image from 'next/image';
import { 
  ShoppingCartIcon, 
  AdjustmentsHorizontalIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Categories for filter
  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'cakes', name: 'Cakes' },
    { id: 'pastries', name: 'Pastries' },
    { id: 'breads', name: 'Breads' },
    { id: 'cookies', name: 'Cookies' },
    { id: 'beverages', name: 'Beverages' }
  ];

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = () => {
      try {
        let productsQuery;
        
        if (selectedCategory === 'all') {
          productsQuery = query(collection(db, 'bakeryItems'));
        } else {
          productsQuery = query(
            collection(db, 'bakeryItems'),
            where('category', '==', selectedCategory)
          );
        }

        const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
          const productsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setProducts(productsData);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  // Add to cart function
  const handleAddToCart = (product) => {
    // Implement cart functionality
    console.log('Added to cart:', product);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Page Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Our Products</h1>
            <button
              onClick={() => setIsFilterOpen(true)}
              className="md:hidden bg-green-600 text-white p-2 rounded-full"
            >
              <AdjustmentsHorizontalIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Category Filter - Desktop */}
          <div className="hidden md:block w-64">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Categories</h2>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-green-600 text-white'
                        : 'hover:bg-green-50 text-gray-600'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Filter - Mobile */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="fixed inset-y-0 right-0 w-64 bg-white shadow-lg z-50 md:hidden"
              >
                <div className="p-4">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-semibold">Categories</h2>
                    <button
                      onClick={() => setIsFilterOpen(false)}
                      className="text-gray-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setIsFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 rounded-md transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-green-600 text-white'
                            : 'hover:bg-green-50 text-gray-600'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="relative h-64">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                      {/* Availability Label */}
                      {!product.inStock && (
                        <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          Out of Stock
                        </div>
                      )}
                      {product.isNew && (
                        <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                          New
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-semibold">{product.name}</h3>
                          <p className="text-gray-500 text-sm">
                            {product.category}
                          </p>
                        </div>
                        <span className="text-lg font-bold text-green-600">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                        className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md ${
                          product.inStock
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-200 cursor-not-allowed text-gray-500'
                        } transition-colors duration-200`}
                      >
                        <ShoppingCartIcon className="h-5 w-5" />
                        <span>
                          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                        </span>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Empty State */}
            {!loading && products.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900">
                  No products found
                </h3>
                <p className="mt-2 text-gray-500">
                  Try changing your filter selection.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;