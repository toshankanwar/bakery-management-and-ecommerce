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
  Cog6ToothIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '@/contexts/AuthContext';
import { logoutUser } from '@/firebase/auth';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading } = useAuthContext();

  // Handle scroll lock when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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

  const handleLogout = async () => {
    try {
      await logoutUser();
      setIsProfileOpen(false);
      setIsOpen(false);
    } catch (error) {
      console.error('Error logging out:', {
        error: error.message,
        timestamp: '2025-06-11 16:44:51',
        user: 'Kala-bot-apk'
      });
    }
  };

  const ProfileDropdown = ({ isMobile = false }) => (
    <AnimatePresence>
      {isProfileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`absolute ${
            isMobile 
              ? 'top-full left-0 right-0 mt-1'
              : 'right-0 mt-2 w-48'
          } rounded-md shadow-lg py-1 bg-white/95 backdrop-blur-sm ring-1 ring-black ring-opacity-5 z-50 profile-dropdown`}
        >
          <Link href="/profile">
            <motion.div
              whileHover={{ backgroundColor: '#f0fdf4' }}
              className="px-4 py-2.5 text-sm text-gray-700 hover:text-green-600 flex items-center space-x-3"
            >
              <UserIcon className="h-5 w-5" />
              <span>My Profile</span>
            </motion.div>
          </Link>

          <Link href="/orders">
            <motion.div
              whileHover={{ backgroundColor: '#f0fdf4' }}
              className="px-4 py-2.5 text-sm text-gray-700 hover:text-green-600 flex items-center space-x-3"
            >
              <ClipboardDocumentListIcon className="h-5 w-5" />
              <span>My Orders</span>
            </motion.div>
          </Link>

          <Link href="/wishlist">
            <motion.div
              whileHover={{ backgroundColor: '#f0fdf4' }}
              className="px-4 py-2.5 text-sm text-gray-700 hover:text-green-600 flex items-center space-x-3"
            >
              <HeartIcon className="h-5 w-5" />
              <span>Wishlist</span>
            </motion.div>
          </Link>

          <Link href="/settings">
            <motion.div
              whileHover={{ backgroundColor: '#f0fdf4' }}
              className="px-4 py-2.5 text-sm text-gray-700 hover:text-green-600 flex items-center space-x-3"
            >
              <Cog6ToothIcon className="h-5 w-5" />
              <span>Settings</span>
            </motion.div>
          </Link>

          <Link href="/reset-password">
            <motion.div
              whileHover={{ backgroundColor: '#f0fdf4' }}
              className="px-4 py-2.5 text-sm text-gray-700 hover:text-green-600 flex items-center space-x-3 border-b border-gray-200"
            >
              <KeyIcon className="h-5 w-5" />
              <span>Reset Password</span>
            </motion.div>
          </Link>

          <motion.button
            onClick={handleLogout}
            whileHover={{ backgroundColor: '#fef2f2' }}
            className="w-full text-left px-4 py-2.5 text-sm text-red-600 flex items-center space-x-3"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span>Logout</span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const NavLink = ({ href, children }) => {
    const isActive = pathname === href;
    
    return (
      <Link
        href={href}
        onClick={() => setIsOpen(false)}
        className={`${
          isActive ? 'text-green-600' : 'text-gray-600'
        } block px-6 py-3 text-lg font-medium hover:bg-green-50/50 transition-colors duration-200`}
      >
        {children}
      </Link>
    );
  };

  const ProfileButton = ({ onClick }) => (
    <motion.button
      onClick={onClick}
      className="relative p-2 rounded-full hover:bg-gray-50 transition-colors duration-200"
    >
      {user?.photoURL ? (
        <img
          src={user.photoURL}
          alt="Profile"
          className="h-8 w-8 rounded-full"
        />
      ) : (
        <UserCircleIcon className="h-8 w-8 text-gray-600" />
      )}
    </motion.button>
  );

  return (
    <>
      {/* Blur Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-white/100 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <nav className="bg-white/100 backdrop-blur-sm shadow-md fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo */}
            <div className="flex-1 flex items-center justify-start">
              <Link href="/" className="flex-shrink-0">
                <motion.span
                  className="text-2xl font-bold bg-gradient-to-r from-green-600 to-yellow-500 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sweet Delights
                </motion.span>
              </Link>

              <div className="hidden md:flex items-center ml-10 space-x-8">
                <NavLink href="/">Home</NavLink>
                <NavLink href="/shop">Shop</NavLink>
                <NavLink href="/contact">Contact</NavLink>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-600 hover:text-green-600"
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
              </motion.button>

              <Link href="/cart">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative text-gray-600 hover:text-green-600"
                >
                  <ShoppingCartIcon className="h-6 w-6" />
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    0
                  </span>
                </motion.div>
              </Link>

              {/* Auth Section */}
              {!loading && (
                <>
                  {user ? (
                    <div className="relative">
                      <ProfileButton onClick={() => setIsProfileOpen(!isProfileOpen)} />
                      <ProfileDropdown />
                    </div>
                  ) : (
                    <div className="hidden md:flex items-center space-x-4">
                      <Link href="/login">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 text-gray-600 hover:text-green-600"
                        >
                          Login
                        </motion.div>
                      </Link>
                      <Link href="/signup">
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Sign Up
                        </motion.div>
                      </Link>
                    </div>
                  )}
                </>
              )}

              {/* Mobile Menu Button */}
              <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden text-gray-600 hover:text-green-600"
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

          {/* Mobile Menu - Slides from right */}
          <AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ translateX: '100%' }}
      animate={{ translateX: '0%' }}
      exit={{ translateX: '100%' }}
      transition={{ duration: 0.3 }}
      className="fixed top-0 right-0 bottom-0 w-full bg-white z-50 md:hidden"
    >
      <div className="flex flex-col h-full">
        {/* Close button at top */}
        <div className="flex justify-end p-6 border-b border-white">
          <motion.button
            onClick={() => setIsOpen(false)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-black-900 hover:text-gray-700 rounded-full font-black"
          >
            <XMarkIcon className="h-8 w-8" />
          </motion.button>
        </div>

        {/* Navigation Links */}
        <div className="pt-8">
          <div className="flex flex-col items-center space-y-6">
            <NavLink href="/">
              <span className="text-xl font-medium text-gray-800">Home</span>
            </NavLink>
            <NavLink href="/shop">
              <span className="text-xl font-medium text-gray-800">Shop</span>
            </NavLink>
            <NavLink href="/contact">
              <span className="text-xl font-medium text-gray-800">Contact</span>
            </NavLink>

            {!user && (
              <>
                <NavLink href="/login">
                  <span className="text-xl font-medium text-gray-800">Login</span>
                </NavLink>
                <NavLink href="/signup">
                  <span className="text-xl font-medium text-gray-800">Sign Up</span>
                </NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>
        </div>
      </nav>
    </>
  );
};

export default Navbar;