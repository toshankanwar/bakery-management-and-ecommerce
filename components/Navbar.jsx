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
  XMarkIcon,
  HomeIcon,
  ShoppingBagIcon,
  PhoneIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '@/contexts/AuthContext';
import { logoutUser } from '@/firebase/auth';
import useCartItemCount from '@/hooks/useCartItemCount';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const pathname = usePathname();
  const { user, loading } = useAuthContext();
  const itemCount = useCartItemCount();

  // Handle scroll for navbar visibility
  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY < lastScrollY || currentScrollY < 50) {
          setIsVisible(true);
        } else if (currentScrollY > 100 && currentScrollY > lastScrollY) {
          setIsVisible(false);
          setIsProfileOpen(false);
        }
        
        setLastScrollY(currentScrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);
      
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY]);

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
        timestamp: '2025-06-14 10:16:32',
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

          <Link href="/favourite">
            <motion.div
              whileHover={{ backgroundColor: '#f0fdf4' }}
              className="px-4 py-2.5 text-sm text-gray-700 hover:text-green-600 flex items-center space-x-3"
            >
              <HeartIcon className="h-5 w-5" />
              <span>Favourites</span>
            </motion.div>
          </Link>

          <Link href="/forget-password">
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

  const NavLink = ({ href, children, icon: Icon }) => {
    const isActive = pathname === href;
    
    return (
      <Link
        href={href}
        onClick={() => setIsOpen(false)}
        className={`${
          isActive ? 'text-green-600' : 'text-gray-800'
        } block px-6 py-4 text-lg font-medium hover:bg-green-50/50 transition-colors duration-200`}
      >
        <div className="flex items-center space-x-3">
          {Icon && <Icon className="h-6 w-6" />}
          <span>{children}</span>
        </div>
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
        <img
          src="/default-ProfileButton.png"
          alt="Default Avatar"
          className="h-8 w-8 rounded-full object-cover"
        />
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

      <motion.nav 
        className="bg-white/100 backdrop-blur-sm shadow-md fixed w-full z-50"
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo */}
            <div className="flex-1 flex items-center justify-start">
              <Link href="/" className="flex-shrink-0">
                <motion.span
                  className="text-xl font-bold bg-gradient-to-r from-green-600 to-yellow-500 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Toshan Bakery
                </motion.span>
              </Link>

              {/* Center - Navigation Links */}
              <div className="hidden md:block flex-1">
                <div className="flex items-center justify-center space-x-6">
                  <NavLink href="/">Home</NavLink>
                  <NavLink href="/shop">Shop</NavLink>
                  <NavLink href="/about">About</NavLink>
                  <NavLink href="/contact">Contact</NavLink>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-5">
            <Link href="/search" className="hidden md:block">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="text-gray-600 hover:text-green-600 hidden md:block"
              >
                <MagnifyingGlassIcon className="h-6 w-6" />
              </motion.button>
              </Link>

              <Link href="/cart" className="hidden md:block">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative text-gray-600 hover:text-green-600"
                >
                  <ShoppingCartIcon className="h-6 w-6" />
                  <AnimatePresence>
                    {itemCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium"
                      >
                        {itemCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>

              {/* Auth Section */}
              {!loading && (
                <>
                  {user ? (
                    <div className="relative hidden md:block">
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
                className="md:hidden text-gray-900 hover:text-green-600"
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

         
{/* Mobile Menu - Slides from left */}
<AnimatePresence>
  {isOpen && (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
        onClick={() => setIsOpen(false)}
      />

      {/* Menu Drawer */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 30 
        }}
        className="fixed top-0 left-0 h-[100dvh] w-[280px] bg-white shadow-xl z-[61] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <Link href="/" onClick={() => setIsOpen(false)}>
            <motion.span
              className="text-xl font-bold bg-gradient-to-r from-green-600 to-yellow-500 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Toshan Bakery
            </motion.span>
          </Link>
          <motion.button
            onClick={() => setIsOpen(false)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </motion.button>
        </div>

        {/* Menu Content - Scrollable Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Navigation Links */}
          <div className="py-4">
            <div className="space-y-2">
              {[
                { name: 'Home', href: '/', icon: HomeIcon },
                { name: 'Shop', href: '/shop', icon: ShoppingBagIcon },
                { name: 'About', href: '/about', icon: ShoppingBagIcon },
                { name: 'Contact', href: '/contact', icon: ShoppingBagIcon },
                { name: 'Search', href: '/search', icon: MagnifyingGlassIcon },
                { name: 'Cart', href: '/cart', icon: ShoppingCartIcon },
                { name: 'Profile', href: user ? '/profile' : '/login', icon: UserIcon },
              ].map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-6 py-3 space-x-3 ${
                      isActive 
                        ? 'text-green-600 bg-green-50' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                    {item.name === 'Cart' && itemCount > 0 && (
                      <span className="ml-auto bg-green-600 text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {user ? (
              <>
                <div className="h-px bg-gray-200 my-4" />
                <div className="space-y-2">
                  <div className="px-6 py-2">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        {user.photoURL ? (
                          <img 
                            src={user.photoURL} 
                            alt="" 
                            className="h-10 w-10 rounded-full"
                          />
                        ) : (
                          <UserCircleIcon className="h-6 w-6 text-green-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.email}</p>
                        <p className="text-sm text-gray-500">Logged in</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full px-6 py-3 flex items-center space-x-3 text-red-600 hover:bg-red-50"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="px-6 pt-4 space-y-3">
                <Link href="/login" onClick={() => setIsOpen(false)}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 text-center bg-white text-green-600 border-2 border-green-600 rounded-lg font-medium"
                  >
                    Login
                  </motion.div>
                </Link>
                <Link href="/signup" onClick={() => setIsOpen(false)}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 text-center bg-green-600 text-white rounded-lg font-medium"
                  >
                    Sign Up
                  </motion.div>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Bottom spacing for mobile nav */}
        <div className="h-16" />
      </motion.div>
    </>
  )}
</AnimatePresence>
        </div>
      </motion.nav>
    </>
  );
};

export default Navbar;