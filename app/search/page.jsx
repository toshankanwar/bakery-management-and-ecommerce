'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import debounce from 'lodash/debounce';
import { db } from '@/firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: 'all',
    priceRange: 'all',
    dietary: 'all'
  });

  // Optimized search function with debounce
  const performSearch = useMemo(
    () =>
      debounce(async (searchTerm, filterOptions) => {
        if (!searchTerm && filterOptions.category === 'all' && filterOptions.priceRange === 'all' && filterOptions.dietary === 'all') {
          setResults([]);
          return;
        }

        setIsLoading(true);
        try {
          const bakeryRef = collection(db, 'bakeryItems');
          let constraints = [];

          // Base query
          if (searchTerm) {
            constraints.push(where('searchTerms', 'array-contains', searchTerm.toLowerCase()));
          }

          // Category filter
          if (filterOptions.category !== 'all') {
            constraints.push(where('category', '==', filterOptions.category));
          }

          // Price range filter
          if (filterOptions.priceRange !== 'all') {
            const [min, max] = filterOptions.priceRange.split('-').map(Number);
            constraints.push(where('price', '>=', min));
            if (max) constraints.push(where('price', '<=', max));
          }

          // Dietary preferences
          if (filterOptions.dietary !== 'all') {
            constraints.push(where(filterOptions.dietary, '==', true));
          }

          const q = query(
            bakeryRef,
            ...constraints,
            orderBy('createdAt', 'desc')
          );

          const querySnapshot = await getDocs(q);
          const items = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          setResults(items);
        } catch (error) {
          console.error('Search error:', {
            error: error instanceof Error ? error.message : String(error),
            timestamp: '2025-06-15 07:04:38',
            user: 'Kala-bot-apk'
          });
        } finally {
          setIsLoading(false);
        }
      }, 300),
    []
  );

  // Trigger search on input or filter change
  useEffect(() => {
    performSearch(searchQuery, filters);
    return () => performSearch.cancel();
  }, [searchQuery, filters, performSearch]);

  // Result card component with animation
  const ResultCard = ({ item }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      <Link href={`/product/${item.id}`}>
        <div className="relative h-48 w-full">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
          {item.discount && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm">
              {item.discount.percentage}% OFF
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-gray-900">{item.name}</h3>
            <span className="text-green-600 font-medium">
              ${item.price.toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-gray-500 line-clamp-2 mb-2">
            {item.description}
          </p>
          <div className="flex flex-wrap gap-2">
            {item.isVegetarian && (
              <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                Vegetarian
              </span>
            )}
            {item.isGlutenFree && (
              <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                Gluten Free
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4">
        {/* Search Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search bakery items..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
              >
                <AdjustmentsHorizontalIcon className="h-5 w-5" />
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-4 pt-4 border-t border-gray-100"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="rounded-lg border border-gray-200 p-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    >
                      <option value="all">All Categories</option>
                      <option value="cakes">Cakes</option>
                      <option value="pastries">Pastries</option>
                      <option value="bread">Bread</option>
                      <option value="cookies">Cookies</option>
                    </select>

                    <select
                      value={filters.priceRange}
                      onChange={(e) => setFilters({ ...filters, priceRange: e.target.value })}
                      className="rounded-lg border border-gray-200 p-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    >
                      <option value="all">All Prices</option>
                      <option value="0-10">Under $10</option>
                      <option value="10-20">$10 - $20</option>
                      <option value="20-50">$20 - $50</option>
                      <option value="50">$50+</option>
                    </select>

                    <select
                      value={filters.dietary}
                      onChange={(e) => setFilters({ ...filters, dietary: e.target.value })}
                      className="rounded-lg border border-gray-200 p-2 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                    >
                      <option value="all">All Dietary</option>
                      <option value="isVegetarian">Vegetarian</option>
                      <option value="isVegan">Vegan</option>
                      <option value="isGlutenFree">Gluten Free</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Results */}
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {results.map((item) => (
                  <ResultCard key={item.id} item={item} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <FunnelIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No items found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;