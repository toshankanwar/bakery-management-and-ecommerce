'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/firebase/config';
import { collection, getDocs } from 'firebase/firestore';
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  ShoppingCartIcon,
  PlusIcon,
  FireIcon,
  ClockIcon,
  XMarkIcon,
  HeartIcon,
  StarIcon,
  TagIcon,
  CheckIcon,
  MinusIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

const popularSearches = [
  { text: 'Chocolate', icon: '🍫' },
  { text: 'Bread', icon: '🍞' },
  { text: 'Birthday', icon: '🎉' },
  { text: 'Coffee', icon: '☕' },
  { text: 'Cookies', icon: '🍪' },
  { text: 'Pastries', icon: '🥐' },
];

const quickCategories = [
  { name: 'Popular', icon: <FireIcon className="h-5 w-5" />, color: 'bg-rose-50 hover:bg-rose-100 text-rose-500' },
  { name: 'New', icon: <SparklesIcon className="h-5 w-5" />, color: 'bg-sky-50 hover:bg-sky-100 text-sky-500' },
  { name: 'Special', icon: <StarIcon className="h-5 w-5" />, color: 'bg-amber-50 hover:bg-amber-100 text-amber-500' },
  { name: 'Deals', icon: <TagIcon className="h-5 w-5" />, color: 'bg-teal-50 hover:bg-teal-100 text-teal-500' },
];

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCartNotification, setShowCartNotification] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [recentSearches, setRecentSearches] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartItemsCount, setCartItemsCount] = useState(0);

  useEffect(() => {
    const loadStoredData = async () => {
      const savedCart = localStorage.getItem('cart');
      const savedSearches = localStorage.getItem('recentSearches');
      const savedFavorites = localStorage.getItem('favorites');

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
        updateCartTotals(parsedCart);
      }
      if (savedSearches) setRecentSearches(JSON.parse(savedSearches));
      if (savedFavorites) setFavorites(JSON.parse(savedFavorites));

      try {
        const querySnapshot = await getDocs(collection(db, 'bakeryItems'));
        const fetchedItems = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            isFavorite: JSON.parse(savedFavorites || '[]').includes(doc.id)
          }))
          .filter(item => item.inStock);
        
        setItems(fetchedItems);
      } catch (error) {
        console.error('Error fetching items:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredData();
  }, []);

  const updateCartTotals = (cartItems) => {
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    setCartTotal(total);
    setCartItemsCount(count);
    localStorage.setItem('cart', JSON.stringify(cartItems));
  };

  const addToCart = (item) => {
    setCart(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      const updatedCart = existingItem
        ? prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { ...item, quantity: 1 }];
      updateCartTotals(updatedCart);
      return updatedCart;
    });

    setLastAddedItem(item.name);
    setShowCartNotification(true);
    setTimeout(() => {
      setShowCartNotification(false);
      setLastAddedItem(null);
    }, 2000);
  };

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const existingItem = prev.find(i => i.id === itemId);
      const updatedCart = existingItem?.quantity > 1
        ? prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i)
        : prev.filter(i => i.id !== itemId);
      updateCartTotals(updatedCart);
      return updatedCart;
    });
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredResults([]);
      setShowSuggestions(true);
      return;
    }

    const results = items.filter(item => 
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredResults(results);
    setShowSuggestions(query.length < 2);
  };

  const saveRecentSearch = (query) => {
    if (!query.trim()) return;
    const updated = [query, ...recentSearches.filter(item => item !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const toggleFavorite = (itemId) => {
    const updated = favorites.includes(itemId)
      ? favorites.filter(id => id !== itemId)
      : [...favorites, itemId];
    
    setFavorites(updated);
    localStorage.setItem('favorites', JSON.stringify(updated));
    
    const updatedItems = items.map(item => ({
      ...item,
      isFavorite: updated.includes(item.id)
    }));
    setItems(updatedItems);
    
    if (filteredResults.length > 0) {
      setFilteredResults(filteredResults.map(item => ({
        ...item,
        isFavorite: updated.includes(item.id)
      })));
    }
  };

  const ResultCard = ({ item }) => {
    const itemInCart = cart.find(i => i.id === item.id);
    const quantity = itemInCart?.quantity || 0;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -8, transition: { duration: 0.2 } }}
        className="group relative bg-white rounded-xl overflow-hidden transform transition-all duration-300 hover:shadow-lg border border-amber-100/50"
      >
        <Link href={`/product/${item.id}`}>
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={item.imageUrl || '/bakery-placeholder.jpg'}
              alt={item.name}
              fill
              className="object-cover transform transition-transform group-hover:scale-110 duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-amber-50/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(item.id);
              }}
              className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 ${
                item.isFavorite 
                  ? 'bg-rose-500 text-white' 
                  : 'bg-white/90 text-rose-300 hover:text-rose-500'
              }`}
            >
              <HeartIcon className="h-5 w-5" />
            </button>
          </div>
        </Link>
        <div className="p-4">
          <h3 className="font-medium text-amber-700 group-hover:text-amber-500 transition-colors duration-200">
            {item.name}
          </h3>
          <p className="text-sm text-amber-600/60 line-clamp-2 mt-1">
            {item.description || 'No description available'}
          </p>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <span className="text-amber-600 font-medium text-lg">
                ${item.price?.toFixed(2) || '0.00'}
              </span>
              {item.oldPrice && (
                <span className="ml-2 text-sm text-amber-400 line-through">
                  ${item.oldPrice.toFixed(2)}
                </span>
              )}
            </div>
            {quantity > 0 ? (
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFromCart(item.id);
                  }}
                  className="p-1.5 bg-amber-100 text-amber-600 rounded-full hover:bg-amber-200"
                >
                  <MinusIcon className="h-4 w-4" />
                </motion.button>
                <span className="text-amber-600 font-medium min-w-[20px] text-center">
                  {quantity}
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToCart(item);
                  }}
                  className="p-1.5 bg-amber-500 text-white rounded-full hover:bg-amber-600"
                >
                  <PlusIcon className="h-4 w-4" />
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addToCart(item);
                }}
                className="flex items-center gap-2 px-3 py-1.5 bg-amber-500 text-white rounded-full text-sm font-medium hover:bg-amber-600 transition-colors"
              >
                <PlusIcon className="h-4 w-4" />
                Add
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-amber-50/20 py-6">
      <div className="max-w-7xl mx-auto px-4">
        <AnimatePresence>
          {showCartNotification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 right-20 bg-amber-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2"
            >
              <CheckIcon className="h-5 w-5" />
              Added {lastAddedItem} to cart!
            </motion.div>
          )}
        </AnimatePresence>

        <div className="fixed top-4 right-4 z-40">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-md border border-amber-100"
          >
            <ShoppingBagIcon className="h-5 w-5 text-amber-500" />
            <div className="flex items-center gap-1">
              <span className="text-amber-500 font-medium">{cartItemsCount}</span>
              <span className="text-amber-400">·</span>
              <span className="text-amber-500 font-medium">${cartTotal.toFixed(2)}</span>
            </div>
          </motion.button>
        </div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-8 relative overflow-hidden">
            <div className="relative z-10">
              <motion.h1 
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="text-3xl font-semibold text-amber-700 mb-2"
              >
                this page is under development please give time to fix
              </motion.h1>
              <p className="text-amber-600/60 mb-6">
                Discover our delicious collection of freshly baked goods
              </p>
              
              <div className="relative mb-6">
                <div className="relative flex items-center">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 text-amber-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search our bakery..."
                    className="w-full pl-12 pr-4 py-4 rounded-xl border border-amber-200 bg-amber-50/50 focus:bg-white focus:ring-2 focus:ring-amber-200 focus:border-amber-300 transition-all duration-300 text-amber-700 placeholder-amber-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilteredResults([]);
                        setShowSuggestions(true);
                      }}
                      className="absolute right-4 text-amber-400 hover:text-amber-500"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {showSuggestions && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-sm border border-amber-100 p-4 z-50"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                      {quickCategories.map((category) => (
                        <motion.button
                          key={category.name}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            setSearchQuery(category.name);
                            saveRecentSearch(category.name);
                            setShowSuggestions(false);
                            const results = items.filter(item => 
                              item.name.toLowerCase().includes(category.name.toLowerCase()) ||
                              item.description?.toLowerCase().includes(category.name.toLowerCase())
                            );
                            setFilteredResults(results);
                          }}
                          className={`flex flex-col items-center p-3 rounded-lg ${category.color} transition-colors`}
                        >
                          <div className="mb-2">
                            {category.icon}
                          </div>
                          <span className="text-sm font-medium">
                            {category.name}
                          </span>
                        </motion.button>
                      ))}
                    </div>

                    {recentSearches.length > 0 && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium text-amber-700">
                            Recent Searches
                          </h3>
                          <button
                            onClick={() => {
                              setRecentSearches([]);
                              localStorage.removeItem('recentSearches');
                            }}
                            className="text-xs text-amber-400 hover:text-amber-500 flex items-center gap-1"
                          >
                            <XMarkIcon className="h-4 w-4" />
                            Clear
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {recentSearches.map((search) => (
                            <motion.button
                              key={search}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setSearchQuery(search);
                                saveRecentSearch(search);
                                setShowSuggestions(false);
                                const results = items.filter(item => 
                                  item.name.toLowerCase().includes(search.toLowerCase()) ||
                                  item.description?.toLowerCase().includes(search.toLowerCase())
                                );
                                setFilteredResults(results);
                              }}
                              className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 rounded-full text-sm text-amber-600 hover:text-amber-700 transition-colors border border-amber-100"
                            >
                              <ClockIcon className="h-4 w-4" />
                              {search}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-medium text-amber-700 mb-3">
                        Popular Searches
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {popularSearches.map((search) => (
                          <motion.button
                            key={search.text}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSearchQuery(search.text);
                              saveRecentSearch(search.text);
                              setShowSuggestions(false);
                              const results = items.filter(item => 
                                item.name.toLowerCase().includes(search.text.toLowerCase()) ||
                                item.description?.toLowerCase().includes(search.text.toLowerCase())
                              );
                              setFilteredResults(results);
                            }}
                            className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 rounded-full text-sm text-amber-600 hover:text-amber-700 transition-colors border border-amber-100"
                          >
                            <span>{search.icon}</span>
                            {search.text}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-amber-100/30 rounded-full opacity-20 blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-amber-200/30 rounded-full opacity-20 blur-3xl animate-pulse" />
          </div>
        </motion.div>

        <div>
          {searchQuery && filteredResults.length > 0 && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6"
            >
              <p className="text-amber-600">
                Found {filteredResults.length} {filteredResults.length === 1 ? 'item' : 'items'}
              </p>
            </motion.div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-xl p-4 border border-amber-100 animate-pulse">
                  <div className="w-full h-48 bg-amber-50 rounded-lg mb-4" />
                  <div className="h-4 bg-amber-50 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-amber-50 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : searchQuery && filteredResults.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {filteredResults.map((item) => (
                  <ResultCard key={item.id} item={item} />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : searchQuery ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <SparklesIcon className="h-12 w-12 text-amber-200 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-amber-700 mb-2">
                No items found
              </h3>
              <p className="text-amber-600/60">
                Try adjusting your search terms or browse our suggestions
              </p>
            </motion.div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;