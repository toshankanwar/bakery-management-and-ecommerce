'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  HomeIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  UserIcon,
  ShoppingBagIcon,
  XMarkIcon,
  ShoppingCartIcon,
  PhoneIcon,
  InformationCircleIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon,
  HeartIcon,
  KeyIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid,
  Bars3Icon as Bars3IconSolid,
  UserIcon as UserIconSolid,
  ShoppingBagIcon as ShoppingBagIconSolid
} from '@heroicons/react/24/solid';
import { useAuthContext } from '@/contexts/AuthContext';
import { db } from '@/firebase/config';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { logoutUser } from '@/firebase/auth';

const MenuDrawer = ({ isOpen, onClose, user }) => {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Home', path: '/', icon: HomeIcon },
    { name: 'Shop', path: '/shop', icon: ShoppingCartIcon },
    { name: 'About', path: '/about', icon: InformationCircleIcon },
    { name: 'Contact', path: '/contact', icon: PhoneIcon },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 left-0 h-full w-4/5 max-w-sm bg-white shadow-xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Menu</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="py-4">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={onClose}
                  className={`flex items-center px-6 py-3 space-x-4 transition-colors ${
                    pathname === item.path
                      ? 'text-green-600 bg-green-50'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </div>

            {/* User Section */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 p-4">
  {user ? (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
          <img
            src={user.photoURL || "/default-ProfileButton.png"} // show user photo if exists else default
            alt={user.displayName || "Default Avatar"}
            className="h-10 w-10 object-cover rounded-full" // fixed typo here
            onError={(e) => {
              e.currentTarget.onerror = null; // prevent infinite fallback loop
              e.currentTarget.src = "/default-ProfileButton.png"; // fallback to default if URL is broken
            }}
          />
        </div>
        <div>
          <p className="font-medium text-gray-900">{user.email}</p>
          <p className="text-sm text-gray-500">Logged in</p>
        </div>
      </div>
      <button
        onClick={() => {
          try {
            logoutUser();
            onClose();
          } catch (error) {
            console.error("Error logging out:", {
              error: error.message,
              timestamp: "2025-06-15 06:07:22",
              user: "Kala-bot-apk",
            });
          }
        }}
        className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
      >
        <ArrowLeftOnRectangleIcon className="h-5 w-5" />
        <span>Sign Out</span>
      </button>
    </div>
  ) : (
    <Link
      href="/login"
      onClick={onClose}
      className="flex items-center justify-center space-x-2 w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
    >
      <ArrowRightOnRectangleIcon className="h-5 w-5" />
      <span>Sign In</span>
    </Link>
  )}
</div>


          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const AccountDrawer = ({ isOpen, onClose, user }) => {
  const accountMenuItems = [
    { name: 'Profile', path: '/profile', icon: UserIcon },
    { name: 'My Orders', path: '/orders', icon: ClipboardDocumentListIcon },
    { name: 'Favourite', path: '/favourite', icon: HeartIcon },
    { name: 'Reset Password', path: '/forget-password', icon: KeyIcon },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[51]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-[75%] bg-white shadow-xl z-[52]"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Account</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-600" />
                </button>
              </div>

              {user && (
               <div className="p-4 border-b border-gray-200">
               <div className="flex items-center space-x-3">
                 {/* Avatar container with flex-shrink-0 to prevent shrinking */}
                 <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                   {user.photoURL ? (
                     <img
                       src={user.photoURL}
                       alt="User Avatar"
                       className="h-12 w-12 rounded-full object-cover"
                       onError={e => {
                         e.currentTarget.onerror = null; // prevent infinite fallback loop
                         e.currentTarget.src = "/default-avatar.png"; // fallback image in public folder
                       }}
                     />
                   ) : (
                     <img
                       src="/default-avatar.png"
                       alt="Default Avatar"
                       className="h-12 w-12 rounded-full object-cover"
                     />
                   )}
                 </div>
                 <div className="min-w-0">
                   <p className="font-medium text-gray-900 truncate">{user.email}</p>
                   <p className="text-sm text-gray-500">Logged in</p>
                 </div>
               </div>
             </div>
             
              )}

              <div className="flex-1 overflow-y-auto">
                <div className="py-4">
                  {accountMenuItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.path}
                      onClick={onClose}
                      className="flex items-center px-6 py-4 space-x-4 transition-colors text-gray-700 hover:bg-gray-50"
                    >
                      <item.icon className="h-6 w-6" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={async () => {
                    try {
                      await logoutUser();
                      onClose();
                    } catch (error) {
                      console.error('Error logging out:', {
                        error: error.message,
                        timestamp: '2025-06-15 06:07:22',
                        user: 'Kala-bot-apk'
                      });
                    }
                  }}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-6 w-6" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const MobileNav = () => {
  const pathname = usePathname();
  const { user } = useAuthContext();
  const [cartCount, setCartCount] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // Navigation items
  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: HomeIcon,
      activeIcon: HomeIconSolid
    },
    {
      name: 'Search',
      path: '/search',
      icon: MagnifyingGlassIcon,
      activeIcon: MagnifyingGlassIconSolid
    },
    {
      name: 'Menu',
      action: () => setIsMenuOpen(true),
      icon: Bars3Icon,
      activeIcon: Bars3IconSolid
    },
    {
      name: 'Account',
      action: user ? () => setIsAccountOpen(true) : undefined,
      path: user ? undefined : '/login',
      icon: UserIcon,
      activeIcon: UserIconSolid
    },
    {
      name: 'Cart',
      path: '/cart',
      icon: ShoppingBagIcon,
      activeIcon: ShoppingBagIconSolid,
      badge: cartCount
    }
  ];

  // Fetch cart count
  useEffect(() => {
    let unsubscribe;

    const setupCartListener = async () => {
      if (!user) {
        setCartCount(0);
        return;
      }

      try {
        const cartRef = collection(db, 'carts', user.uid, 'items');
        const q = query(cartRef, where('quantity', '>', 0));
        
        unsubscribe = onSnapshot(q, (snapshot) => {
          setCartCount(snapshot.docs.length);
        }, (error) => {
          console.error('Error fetching cart count:', error);
        });
      } catch (error) {
        console.error('Error setting up cart listener:', error);
        setCartCount(0);
      }
    };

    setupCartListener();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen || isAccountOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen, isAccountOpen]);

  return (
    <>
      {/* Menu Drawer */}
      <MenuDrawer 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        user={user}
      />

      {/* Account Drawer */}
      <AccountDrawer 
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        user={user}
      />

      {/* Spacer */}
      <div className="h-16 md:hidden" />
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-40">
        <div className="max-w-lg mx-auto px-4 py-2">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const isActive = item.path ? pathname === item.path : false;
              const Icon = isActive ? item.activeIcon : item.icon;

              const content = (
                <div className="flex flex-col items-center justify-center py-2 px-3 relative">
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={`relative ${isActive ? 'text-green-600' : 'text-gray-600'}`}
                  >
                    <Icon className="h-6 w-6" />
                    {item.badge > 0 && item.name === 'Cart' && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-medium rounded-full w-4 h-4 flex items-center justify-center"
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </motion.div>
                  <span className={`text-xs mt-1 ${
                    isActive ? 'text-green-600 font-medium' : 'text-gray-600'
                  }`}>
                    {item.name}
                  </span>
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-green-600"
                      layoutId="bottomNav"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30
                      }}
                    />
                  )}
                </div>
              );

              return item.action ? (
                <button
                  key={item.name}
                  onClick={item.action}
                  className="focus:outline-none"
                >
                  {content}
                </button>
              ) : (
                <Link
                  key={item.name}
                  href={item.path}
                  className="focus:outline-none"
                >
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};

export default MobileNav;