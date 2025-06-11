'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/firebase/config';
import { 
  collection, 
  query, 
  getDocs, 
  where, 
  orderBy
} from 'firebase/firestore';
import Image from 'next/image';
import { 
  ShoppingCartIcon, 
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  ChevronDownIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import { Slider } from '@mui/material';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [availability, setAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    outOfStock: 0,
    priceRange: { min: 0, max: 1000 }
  });

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'cakes', name: 'Cakes' },
    { id: 'pastries', name: 'Pastries' },
    { id: 'breads', name: 'Breads' },
    { id: 'cookies', name: 'Cookies' },
    { id: 'beverages', name: 'Beverages' }
  ];

  const sortOptions = [
    { id: 'newest', name: 'Newest First' },
    { id: 'oldest', name: 'Oldest First' },
    { id: 'priceAsc', name: 'Price: Low to High' },
    { id: 'priceDesc', name: 'Price: High to Low' },
    { id: 'nameAsc', name: 'Name: A to Z' },
    { id: 'nameDesc', name: 'Name: Z to A' }
  ];

  const itemsPerPageOptions = [10, 20, 30, 50];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const productsRef = collection(db, 'bakeryItems');
      let queryConstraints = [];

      if (selectedCategory !== 'all') {
        queryConstraints.push(where('category', '==', selectedCategory));
      }

      switch (sortBy) {
        case 'priceAsc':
          queryConstraints.push(orderBy('price', 'asc'));
          queryConstraints.push(orderBy('__name__', 'asc'));
          break;
        case 'priceDesc':
          queryConstraints.push(orderBy('price', 'desc'));
          queryConstraints.push(orderBy('__name__', 'desc'));
          break;
        case 'nameAsc':
          queryConstraints.push(orderBy('name', 'asc'));
          queryConstraints.push(orderBy('__name__', 'asc'));
          break;
        case 'nameDesc':
          queryConstraints.push(orderBy('name', 'desc'));
          queryConstraints.push(orderBy('__name__', 'desc'));
          break;
        default:
          queryConstraints.push(orderBy('createdAt', 'desc'));
      }

      const q = query(productsRef, ...queryConstraints);
      const snapshot = await getDocs(q);
      
      let fetchedProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      let filtered = fetchedProducts.filter(product => 
        product.price >= priceRange[0] && 
        product.price <= priceRange[1]
      );

      if (availability !== 'all') {
        filtered = filtered.filter(product => 
          availability === 'inStock' ? product.inStock : !product.inStock
        );
      }

      const statsData = {
        total: fetchedProducts.length,
        inStock: fetchedProducts.filter(p => p.inStock).length,
        outOfStock: fetchedProducts.filter(p => !p.inStock).length,
        priceRange: {
          min: Math.min(...fetchedProducts.map(p => p.price)),
          max: Math.max(...fetchedProducts.map(p => p.price))
        }
      };

      setStats(statsData);
      setProducts(fetchedProducts);
      setFilteredProducts(filtered);

    } catch (error) {
      console.error('Error fetching products:', {
        error: error.message,
        timestamp: '2025-06-11 10:53:55',
        user: 'Kala-bot-apk'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy]);

  useEffect(() => {
    if (products.length > 0) {
      let filtered = [...products];

      filtered = filtered.filter(product => 
        product.price >= priceRange[0] && 
        product.price <= priceRange[1]
      );

      if (availability !== 'all') {
        filtered = filtered.filter(product => 
          availability === 'inStock' ? product.inStock : !product.inStock
        );
      }

      setFilteredProducts(filtered);
      setCurrentPage(1);
    }
  }, [priceRange, availability, products]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setPriceRange([stats.priceRange.min, stats.priceRange.max]);
    setAvailability('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const handleAddToCart = (product) => {
    console.log('Added to cart:', product);
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  return (
    <div className="max-h-screen bg-white">
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm shadow-sm">
  <div className="max-w-7xl mx-auto">
    <div className="flex items-center justify-between h-14 px-4">
      {/* Left side - Title and Hamburger */}
      <div className="flex items-center">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden mr-4 text-gray-500 hover:text-gray-700"
        >
          <Bars3Icon className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Our Products</h1>
      </div>

      {/* Desktop Sort Options */}
      <div className="hidden md:flex items-center space-x-5">
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            {sortOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        <div className="relative">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            {itemsPerPageOptions.map(option => (
              <option key={option} value={option}>
                {option} per page
              </option>
            ))}
          </select>
          <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>
    </div>
  </div>
</div>
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:block max-w-[280px] h-[calc(100vh-4rem)] bg-white ">
          <div className="sticky top-0 p-2 space-y-6">
            {/* Categories */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Categories</h2>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-green-600 text-white'
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Price Range</h2>
              <Slider
                value={priceRange}
                onChange={(_, newValue) => setPriceRange(newValue)}
                valueLabelDisplay="auto"
                min={stats.priceRange.min}
                max={stats.priceRange.max}
                className="text-green-600"
              />
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>

            {/* Availability */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Availability</h2>
              <div className="space-y-1">
                <button
                  onClick={() => setAvailability('all')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    availability === 'all'
                      ? 'bg-green-600 text-white'
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  All ({stats.total})
                </button>
                <button
                  onClick={() => setAvailability('inStock')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    availability === 'inStock'
                      ? 'bg-green-600 text-white'
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  In Stock ({stats.inStock})
                </button>
                <button
                  onClick={() => setAvailability('outOfStock')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    availability === 'outOfStock'
                      ? 'bg-green-600 text-white'
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  Out of Stock ({stats.outOfStock})
                </button>
              </div>
            </div>

            {/* Reset Filters */}
            <button
              onClick={resetFilters}
              className="w-full bg-gray-100 text-gray-600 px-3 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween' }}
              className="fixed inset-0 z-40 bg-white md:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold">Menu & Filters</h2>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* Mobile Sort Options */}
                  <div>
                    <h2 className="text-lg font-semibold mb-3">Sort By</h2>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      {sortOptions.map(option => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Mobile Categories */}
                  <div>
                    <h2 className="text-lg font-semibold mb-3">Categories</h2>
                    <div className="space-y-1">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            selectedCategory === category.id
                              ? 'bg-green-600 text-white'
                              : 'hover:bg-gray-50 text-gray-600'
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mobile Price Range */}
                  <div>
                    <h2 className="text-lg font-semibold mb-3">Price Range</h2>
                    <Slider
                      value={priceRange}
                      onChange={(_, newValue) => setPriceRange(newValue)}
                      valueLabelDisplay="auto"
                      min={stats.priceRange.min}
                      max={stats.priceRange.max}
                      className="text-green-600"
                    />
                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>

                  {/* Mobile Availability */}
                  <div>
                    <h2 className="text-lg font-semibold mb-3">Availability</h2>
                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setAvailability('all');
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          availability === 'all'
                            ? 'bg-green-600 text-white'
                            : 'hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        All ({stats.total})
                      </button>
                      <button
                        onClick={() => {
                          setAvailability('inStock');
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          availability === 'inStock'
                            ? 'bg-green-600 text-white'
                            : 'hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        In Stock ({stats.inStock})
                      </button>
                      <button
                        onClick={() => {
                          setAvailability('outOfStock');
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          availability === 'outOfStock'
                            ? 'bg-green-600 text-white'
                            : 'hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        Out of Stock ({stats.outOfStock})
                      </button>
                    </div>
                  </div>

                  {/* Mobile Reset Filters */}
                  <button
                    onClick={() => {
                      resetFilters();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-gray-100 text-gray-600 px-3 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        <div className="flex-1 p-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {paginatedProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    variants={itemVariants}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="relative h-48">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover rounded-t-lg"
                      />
                      {!product.inStock && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Out of Stock
                        </div>
                      )}
                      {product.isNew && (
                        <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          New
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-500">{product.category}</p>
                        </div>
                        <span className="text-lg font-bold text-green-600">
                          ${product.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                        className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium ${
                          product.inStock
                            ? 'bg-green-600 hover:bg-green-700 text-white'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        } transition-colors duration-200`}
                      >
                        <ShoppingCartIcon className="h-4 w-4" />
                        <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm font-medium rounded-md bg-white border border-gray-300 text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}

              {/* Empty State */}
              {!loading && filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                  <p className="mt-2 text-sm text-gray-500">Try adjusting your filters</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;