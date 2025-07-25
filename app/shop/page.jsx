'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { db } from '@/firebase/config';
import {
  collection,
  query,
  getDocs,
  where,
  orderBy,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import Image from 'next/image';
import {
  ShoppingCartIcon,
  XMarkIcon,
  ChevronDownIcon,
  Bars3Icon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as SolidHeartIcon } from '@heroicons/react/24/solid';
import useCart from '@/hooks/useCart';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [availability, setAvailability] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [cartQuantities, setCartQuantities] = useState({});
  const { handleAddToCart, cart } = useCart();
  const { user } = useAuth();

  // Favourites state
  const [favourites, setFavourites] = useState([]); // array of itemIds

  // Helper to slugify product name
  const toSlug = (str) =>
    str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    outOfStock: 0,
    priceRange: { min: 0, max: 1000 },
  });

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'cakes', name: 'Cakes' },
    { id: 'pastries', name: 'Pastries' },
    { id: 'breads', name: 'Breads' },
    { id: 'cookies', name: 'Cookies' },
    { id: 'beverages', name: 'Beverages' },
  ];

  const sortOptions = [
    { id: 'newest', name: 'Newest First' },
    { id: 'oldest', name: 'Oldest First' },
    { id: 'priceAsc', name: 'Price: Low to High' },
    { id: 'priceDesc', name: 'Price: High to Low' },
    { id: 'nameAsc', name: 'Name: A to Z' },
    { id: 'nameDesc', name: 'Name: Z to A' },
  ];

  const itemsPerPageOptions = [10, 20, 30, 50];

  // --- Favourites Firestore Logic ---
  useEffect(() => {
    if (!user) {
      setFavourites([]);
      return;
    }
    // Listen to /favourites/{userId}/items subcollection
    const favItemsRef = collection(db, 'favourites', user.uid, 'items');
    const q = query(favItemsRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFavourites(snapshot.docs.map(doc => doc.id)); // Array of itemIds
    });
    return () => unsubscribe();
  }, [user]);

  // Add item to favourites
  const handleAddFavourite = async (product) => {
    if (!user) {
      toast.error('Please log in to add favourites');
      return;
    }
    try {
      // /favourites/{userId}/items/{itemId}
      await setDoc(doc(db, 'favourites', user.uid, 'items', product.id), {
        addedAt: new Date(),
        productId: product.id,
        ...product,
      });
      toast.success('Added to Favourites!');
    } catch (err) {
      console.error('Error adding favourite:', err);
      toast.error('Failed to add favourite');
    }
  };

  // Remove item from favourites
  const handleRemoveFavourite = async (productId) => {
    if (!user) {
      toast.error('Please log in to remove favourites');
      return;
    }
    try {
      await deleteDoc(doc(db, 'favourites', user.uid, 'items', productId));
      toast.success('Removed from Favourites!');
    } catch (err) {
      console.error('Error removing favourite:', err);
      toast.error('Failed to remove favourite');
    }
  };

  // Is item in favourites
  const isFavourite = (productId) => favourites.includes(productId);

  // --- Cart logic ---
  useEffect(() => {
    if (Array.isArray(cart)) {
      const cartMap = {};
      cart.forEach(item => {
        cartMap[item.productId] = item.quantity;
      });
      setCartQuantities(cartMap);
    }
  }, [cart]);

  // --- Fetch Products ---
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
          break;
        case 'priceDesc':
          queryConstraints.push(orderBy('price', 'desc'));
          break;
        case 'nameAsc':
          queryConstraints.push(orderBy('name', 'asc'));
          break;
        case 'nameDesc':
          queryConstraints.push(orderBy('name', 'desc'));
          break;
        case 'oldest':
          queryConstraints.push(orderBy('createdAt', 'asc'));
          break;
        case 'newest':
        default:
          queryConstraints.push(orderBy('createdAt', 'desc'));
          break;
      }

      const q = query(productsRef, ...queryConstraints);
      const snapshot = await getDocs(q);

      let fetchedProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      let filtered = fetchedProducts.filter(product =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
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
          min: fetchedProducts.length ? Math.min(...fetchedProducts.map(p => p.price)) : 0,
          max: fetchedProducts.length ? Math.max(...fetchedProducts.map(p => p.price)) : 1000,
        },
      };

      setStats(statsData);
      setProducts(fetchedProducts);
      setFilteredProducts(filtered);

    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [selectedCategory, sortBy]);

  useEffect(() => {
    if (products.length > 0) {
      let filtered = [...products];
      filtered = filtered.filter(product =>
        product.price >= priceRange[0] && product.price <= priceRange[1]
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

  // Out of stock logic, low stock badges
  const isStrictlyOutOfStock = (product) =>
    !product.quantity || product.quantity === 0;

  const lowStockMessage = (product) => {
    if (!product.quantity || product.quantity === 0) return null;
    if (product.quantity <= 10)
      return `Only ${product.quantity} left!`;
    if (product.quantity > 10 && product.quantity <= 14)
      return `${product.quantity} left`;
    return null;
  };

  // Add to cart with up-to-date Firestore check
  const handleAddToCartWithLimit = async (product) => {
    const currentQtyInCart = cartQuantities[product.id] || 0;
    try {
      const productRef = doc(db, 'bakeryItems', product.id);
      const snap = await getDoc(productRef);
      let liveQuantity = product.quantity;
      if (snap.exists()) {
        const data = snap.data();
        liveQuantity = data.quantity;
      }
      if (!liveQuantity || liveQuantity === 0) {
        toast.error('Item is out of stock');
        return;
      }
      if (currentQtyInCart >= liveQuantity) {
        toast.error(`Only ${liveQuantity} available. You can't add more.`);
        return;
      }
      await handleAddToCart(product);
      toast.success('Added to cart!');
    } catch (err) {
      console.error('Error checking stock before add to cart:', err);
      toast.error('Failed to check stock.');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-right" />
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden mr-4 text-gray-800 hover:text-gray-700"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <h1 className="text-xl font-bold text-gray-800">Our Shop</h1>
            </div>
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
          <div className="sticky top-17 p-2 space-y-6">
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
              className="fixed inset-0 z-90 bg-white md:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-gray-900 font-semibold">Menu & Filters</h2>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-gray-900"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  <div>
                    <h2 className="text-gray-900 font-semibold mb-3">Sort By</h2>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-white border border-gray-900 rounded-md px-3 py-2 text-gray-600"
                    >
                      {sortOptions.map(option => (
                        <option key={option.id} value={option.id}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <h2 className="text-gray-900 font-semibold mb-3">Categories</h2>
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
                  <div>
                    <h2 className="text-gray-900 font-semibold mb-3">Availability</h2>
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
                  <button
                    onClick={() => {
                      resetFilters();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-gray-100 text-gray-900 px-3 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors"
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
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                {paginatedProducts.map((product) => {
                  const outOfStock = isStrictlyOutOfStock(product);
                  const lowStock = lowStockMessage(product);
                  const currentQtyInCart = cartQuantities[product.id] || 0;
                  const disableAdd =
                    outOfStock || currentQtyInCart >= (product.quantity || 0);

                  return (
                    <motion.div
                      key={product.id}
                      variants={itemVariants}
                      whileHover={{
                        y: -5,
                        transition: { duration: 0.2 }
                      }}
                      className="bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative"
                    >
                      {/* Heart/Favourite Icon (top-right, both desktop & mobile) */}
                      <button
                        aria-label={isFavourite(product.id) ? 'Remove from Favourites' : 'Add to Favourites'}
                        onClick={e => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (isFavourite(product.id)) {
                            handleRemoveFavourite(product.id);
                          } else {
                            handleAddFavourite(product);
                          }
                        }}
                        className="absolute top-3 right-3 z-20 p-1 rounded-full hover:bg-pink-100 transition"
                      >
                        {isFavourite(product.id) ? (
                          <SolidHeartIcon
                            className="h-6 w-6 text-pink-500"
                            aria-hidden="true"
                          />
                        ) : (
                          <HeartIcon
                            className="h-6 w-6 text-gray-200 hover:text-pink-500 drop-shadow-[0_0_2px_rgba(255,255,255,1.4)] transition"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                      {/* Product Card Link */}
                      <Link href={`/product/${toSlug(product.name)}`} className="block group cursor-pointer">
                        <div className="relative h-56 overflow-hidden group">
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"/>
                          {(outOfStock || !product.inStock) && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                              Out of Stock
                            </div>
                          )}
                          {product.isNew && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                              New
                            </div>
                          )}
                          {/* Show "Only X left!" if 1-10, or X left if 11-14 */}
                          {lowStock && (
                            <div className="absolute bottom-2 left-2 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-medium shadow">
                              {lowStock}
                            </div>
                          )}
                          {/* Show "In Cart: X" if any in cart */}
                          {currentQtyInCart > 0 && (
                            <div className="absolute bottom-2 right-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium shadow">
                              In Cart: {currentQtyInCart}
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors duration-200">
                                {product.name}
                              </h3>
                              <p className="text-sm text-gray-500">{product.category}</p>
                            </div>
                            <span className="text-lg font-bold text-green-600">
                              ₹ {product.price.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10">
                            {product.description}
                          </p>
                        </div>
                      </Link>
                      {/* Add to Cart Button */}
                      <motion.button
                        whileHover={{ scale: !disableAdd ? 1.02 : 1 }}
                        whileTap={{ scale: !disableAdd ? 0.98 : 1 }}
                        onClick={async (event) => {
                          event.stopPropagation();
                          await handleAddToCartWithLimit(product);
                        }}
                        disabled={disableAdd}
                        className={`w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-b-md text-sm font-medium transform transition-all duration-200 ${
                          !disableAdd
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCartIcon className="h-4 w-4" />
                        <span>
                          {!disableAdd
                            ? 'Add to Cart'
                            : outOfStock
                            ? 'Out of Stock'
                            : `Only ${product.quantity} available`}
                        </span>
                      </motion.button>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all duration-200"
                  >
                    Previous
                  </motion.button>
                  <span className="px-4 py-2 text-sm font-medium rounded-md bg-white border border-gray-300 text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow transition-all duration-200"
                  >
                    Next
                  </motion.button>
                </div>
              )}

              {/* Empty State */}
              {!loading && filteredProducts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-center py-12"
                >
                  <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                  <p className="mt-2 text-sm text-gray-500">Try adjusting your filters</p>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;