'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { db } from '@/firebase/config';

// Social Icon SVGs
const socialIcons = {
  facebook: (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22.675 0h-21.35..."/>
    </svg>
  ),
  github: (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 .297c-6.63 0..."/>
    </svg>
  ),
  youtube: (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a2.997 2.997 0..."/>
    </svg>
  ),
};

const socialLinks = [
  { name: 'Facebook', url: 'https://www.facebook.com/toshan.kanwar.73', icon: socialIcons.facebook },
  { name: 'GitHub', url: 'https://github.com/toshankanwar', icon: socialIcons.github },
  { name: 'YouTube', url: 'https://www.youtube.com/@ToshanKanwarOfficials', icon: socialIcons.youtube },
];

const legalLinks = [
  { name: 'Privacy Policy', href: '/privacy-policy' },
  { name: 'Terms & Conditions', href: '/terms-and-conditions' },
  { name: 'Cancellation & Refund', href: '/cancellation-and-refund' },
  { name: 'Shipping & Delivery', href: '/shipping-and-delivery' },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { duration: 0.5 } } };

  // --- Newsletter Logic ---
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setStatus('error');
      setMessage('Please enter a valid email address.');
      return;
    }
    setStatus('loading');
    setMessage('');

    try {
      // Check if email already exists in Firestore
      const q = query(
        collection(db, 'newsletterSubscribers'),
        where('email', '==', email.trim().toLowerCase())
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        // Email already found
        setStatus('error');
        setMessage('You are already subscribed!');
        setStatus(null);
        return;
      }

      // Add new subscription if not present
      await addDoc(collection(db, 'newsletterSubscribers'), {
        email: email.trim().toLowerCase(),
        createdAt: serverTimestamp(),
      });

      setStatus('success');
      setMessage('Thank you for subscribing!');
      setEmail('');
    } catch (err) {
      console.error('Subscription error:', err);
      setStatus('error');
      setMessage('Failed to subscribe. Please try again.');
    }
  };

  return (
    <footer className="bg-white shadow-lg mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants} className="space-y-4">
            <motion.div variants={itemVariants}>
              <Link href="/">
                <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-yellow-500 bg-clip-text text-transparent">
                  Toshan Bakery
                </span>
              </Link>
            </motion.div>
            <motion.p variants={itemVariants} className="text-gray-600 text-sm">
              Crafting moments of joy with every bite. Your local artisan bakery bringing sweetness to your everyday life.
            </motion.p>
          </motion.div>

          {/* Quick Links */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants} className="space-y-4">
            <motion.h3 variants={itemVariants} className="text-lg font-semibold text-gray-800">Quick Links</motion.h3>
            <motion.div variants={containerVariants} className="space-y-2">
              {['About', 'Shop', 'Orders', 'Favourite'].map((item) => (
                <motion.div key={item} variants={itemVariants}>
                  <Link href={`/${item.toLowerCase().replace(' ', '-')}`} className="text-gray-600 hover:text-green-600 transition-colors block text-sm">
                    {item}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Legal Links */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants} className="space-y-4">
            <motion.h3 variants={itemVariants} className="text-lg font-semibold text-gray-800">Legal & Policies</motion.h3>
            <motion.div variants={containerVariants} className="space-y-2">
              {legalLinks.map((item) => (
                <motion.div key={item.name} variants={itemVariants}>
                  <Link href={item.href} className="text-gray-600 hover:text-green-600 transition-colors block text-sm">
                    {item.name}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Contact */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants} className="space-y-4">
            <motion.h3 variants={itemVariants} className="text-lg font-semibold text-gray-800">Contact Us</motion.h3>
            <motion.div variants={containerVariants} className="space-y-2">
              <motion.div variants={itemVariants} className="flex items-center text-gray-600">
                <PhoneIcon className="h-5 w-5 mr-2" /> <span className="text-sm">+91 93*****93</span>
              </motion.div>
              <motion.div variants={itemVariants} className="flex items-center text-gray-600">
                <EnvelopeIcon className="h-5 w-5 mr-2" /> <span className="text-sm">contact@toshankanwar.website</span>
              </motion.div>
              <motion.div variants={itemVariants} className="flex items-center text-gray-600">
                <MapPinIcon className="h-5 w-5 mr-2" /> <span className="text-sm">IIIT Naya Raipur Chhattisgarh India</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Newsletter */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerVariants} className="mt-8 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Social */}
            <motion.div variants={itemVariants} className="flex space-x-6">
              {socialLinks.map(({ name, url, icon }) => (
                <motion.a key={name} href={url} target="_blank" rel="noopener noreferrer" whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.95 }} className="text-gray-600 hover:text-green-600">
                  <span className="sr-only">{name}</span>
                  {icon}
                </motion.a>
              ))}
            </motion.div>
            {/* Newsletter Form (Functional) */}
            <motion.form variants={itemVariants} onSubmit={handleSubscribe} className="space-y-2 max-w-xs ml-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 text-gray-900"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" disabled={status === 'loading'} className="w-full px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
                {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
              </motion.button>
              {message && <p className={`text-sm ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
            </motion.form>
          </div>

          {/* Footer Text */}
          <motion.p variants={itemVariants} className="text-sm text-gray-600 flex flex-col sm:flex-row items-center justify-center gap-1 text-center mt-8">
            <span className="flex flex-wrap items-center justify-center gap-1">
              Designed & Developed with{" "}
              <svg 
                className="w-4 h-4 mx-1 text-red-500 animate-pulse" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              by <a href="https://toshankanwar.website" target="_blank" rel="noopener noreferrer" className="font-medium text-green-600 hover:text-green-700 hover:underline">Toshan Kanwar</a>
            </span>
            <span className="text-xs text-gray-500 mt-1 sm:mt-0">
              <span className="hidden sm:inline mx-1">•</span>
              Built with <a href="https://nextjs.org" target="_blank" rel="noopener noreferrer" className="hover:text-gray-800">Next.js</a> +{" "}
              <a href="https://firebase.google.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-800">Firebase</a> • Mobile First • Responsive
            </span>
            <span className="hidden sm:inline mx-1">•</span>
            <span>© {currentYear} Toshan Bakery. All rights reserved.</span>
          </motion.p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
