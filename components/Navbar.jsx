'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShoppingCartIcon, 
  MagnifyingGlassIcon,
  UserCircleIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  HeartIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '@/contexts/AuthContext';
import { logoutUser } from '@/firebase/auth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading } = useAuthContext();

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest('.profile-dropdown')) {
        setIsProfileOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isProfileOpen]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      setIsProfileOpen(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Profile Dropdown Component
  const ProfileDropdown = () => (
    <AnimatePresence>
      {isProfileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ 
            duration: 0.2,
            ease: "easeOut"
          }}
          className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-50 profile-dropdown overflow-hidden"
        >
          {/* Profile Link */}
          <Link href="/profile">
            <motion.div
              whileHover={{ backgroundColor: '#f0fdf4' }}
              className="px-4 py-2 text-sm text-gray-700 hover:text-green-600 flex items-center space-x-2 transition-colors duration-200"
            >
              <UserIcon className="h-5 w-5" />
              <span>My Profile</span>
            </motion.div>
          </Link>

          {/* Orders Link */}
          <Link href="/orders">
            <motion.div
              whileHover={{ backgroundColor: '#f0fdf4' }}
              className="px-4 py-2 text-sm text-gray-700 hover:text-green-600 flex items-center space-x-2 transition-colors duration-200"
            >
              <ClipboardDocumentListIcon className="h-5 w-5" />
              <span>My Orders</span>
            </motion.div>
          </Link>

          {/* Wishlist Link */}
          <Link href="/wishlist">
            <motion.div
              whileHover={{ backgroundColor: '#f0fdf4' }}
              className="px-4 py-2 text-sm text-gray-700 hover:text-green-600 flex items-center space-x-2 transition-colors duration-200"
            >
              <HeartIcon className="h-5 w-5" />
              <span>Wishlist</span>
            </motion.div>
          </Link>

          {/* Settings Link */}
          <Link href="/settings">
            <motion.div
              whileHover={{ backgroundColor: '#f0fdf4' }}
              className="px-4 py-2 text-sm text-gray-700 hover:text-green-600 flex items-center space-x-2 transition-colors duration-200"
            >
              <Cog6ToothIcon className="h-5 w-5" />
              <span>Settings</span>
            </motion.div>
          </Link>

          {/* Reset Password Link */}
          <Link href="/reset-password">
            <motion.div
              whileHover={{ backgroundColor: '#f0fdf4' }}
              className="px-4 py-2 text-sm text-gray-700 hover:text-green-600 flex items-center space-x-2 border-b border-gray-200 transition-colors duration-200"
            >
              <KeyIcon className="h-5 w-5" />
              <span>Reset Password</span>
            </motion.div>
          </Link>

          {/* Logout Button */}
          <motion.button
            onClick={handleLogout}
            whileHover={{ backgroundColor: '#fef2f2' }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 flex items-center space-x-2 transition-colors duration-200"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>Logout</span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Custom NavLink component remains the same
  const NavLink = ({ href, children, className, isMobile }) => {
    const isActive = pathname === href;
    
    return (
      <Link
        href={href}
        onClick={() => isMobile && setIsOpen(false)}
        className={`${className} ${
          isActive ? 'text-green-600' : 'text-gray-600'
        } relative group transition-colors duration-200`}
      >
        {children}
        <motion.span
          className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 transform origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isActive ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </Link>
    );
  };

  return (
    <nav className="bg-white shadow-md fixed w-full z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <motion.span
                className="text-2xl font-bold bg-gradient-to-r from-green-600 to-yellow-500 bg-clip-text text-transparent"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Sweet Delights
              </motion.span>
            </Link>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center ml-10 space-x-8">
              <NavLink href="/">Home</NavLink>
              <NavLink href="/shop">Shop</NavLink>
              <NavLink href="/contact">Contact</NavLink>
            </div>
          </div>

          {/* Right side - Search, Cart, and Auth */}
          <div className="flex items-center space-x-6">
            {/* Search Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="text-gray-600 hover:text-green-600 transition-colors duration-200"
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </motion.button>

            {/* Cart Icon */}
            <Link href="/cart">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative text-gray-600 hover:text-green-600 transition-colors duration-200"
              >
                <ShoppingCartIcon className="h-6 w-6" />
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  0
                </motion.span>
              </motion.div>
            </Link>

            {/* Auth Buttons / Profile */}
            <div className="hidden md:flex items-center space-x-4">
              {!loading && (
                <>
                  {user ? (
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsProfileOpen(!isProfileOpen);
                        }}
                        className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors duration-200"
                      >
                        {user.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt="Profile"
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <UserCircleIcon className="h-8 w-8" />
                        )}
                        <span className="text-sm font-medium">
                          {user.displayName || 'User'}
                        </span>
                      </motion.button>
                      <ProfileDropdown />
                    </div>
                  ) : (
                    <>
                      <Link href="/login">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 text-gray-600 hover:text-green-600 transition-colors duration-200"
                        >
                          Login
                        </motion.div>
                      </Link>
                      <Link href="/signup">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
                        >
                          Sign Up
                        </motion.div>
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-gray-600 hover:text-green-600 transition-colors duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-200"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                <NavLink href="/" isMobile>Home</NavLink>
                <NavLink href="/shop" isMobile>Shop</NavLink>
                <NavLink href="/contact" isMobile>Contact</NavLink>
                
                {user ? (
                  <>
                    <Link href="/profile" className="block px-3 py-2 rounded-md hover:bg-green-50 transition-colors duration-200">
                      My Profile
                    </Link>
                    <Link href="/orders" className="block px-3 py-2 rounded-md hover:bg-green-50 transition-colors duration-200">
                      My Orders
                    </Link>
                    <Link href="/wishlist" className="block px-3 py-2 rounded-md hover:bg-green-50 transition-colors duration-200">
                      Wishlist
                    </Link>
                    <Link href="/settings" className="block px-3 py-2 rounded-md hover:bg-green-50 transition-colors duration-200">
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="block px-3 py-2 rounded-md hover:bg-green-50 transition-colors duration-200">
                      Login
                    </Link>
                    <Link href="/signup" className="block px-3 py-2 rounded-md hover:bg-green-50 transition-colors duration-200">
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;