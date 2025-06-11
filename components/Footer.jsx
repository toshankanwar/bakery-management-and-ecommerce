'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  FacebookIcon,
  InstagramIcon,
  TwitterIcon
} from '@heroicons/react/24/outline';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <footer className="bg-white shadow-lg mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="space-y-4"
          >
            <motion.div variants={itemVariants}>
              <Link href="/">
                <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-yellow-500 bg-clip-text text-transparent">
                  Sweet Delights
                </span>
              </Link>
            </motion.div>
            <motion.p variants={itemVariants} className="text-gray-600 text-sm">
              Crafting moments of joy with every bite. Your local artisan bakery bringing sweetness to your everyday life.
            </motion.p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="space-y-4"
          >
            <motion.h3 variants={itemVariants} className="text-lg font-semibold text-gray-800">
              Quick Links
            </motion.h3>
            <motion.div variants={containerVariants} className="space-y-2">
              {['About Us', 'Our Menu', 'Special Orders', 'Careers'].map((item) => (
                <motion.div key={item} variants={itemVariants}>
                  <Link 
                    href={`/${item.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-600 hover:text-green-600 transition-colors block text-sm"
                  >
                    {item}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="space-y-4"
          >
            <motion.h3 variants={itemVariants} className="text-lg font-semibold text-gray-800">
              Contact Us
            </motion.h3>
            <motion.div variants={containerVariants} className="space-y-2">
              <motion.div variants={itemVariants} className="flex items-center text-gray-600">
                <PhoneIcon className="h-5 w-5 mr-2" />
                <span className="text-sm">+1 (555) 123-4567</span>
              </motion.div>
              <motion.div variants={itemVariants} className="flex items-center text-gray-600">
                <EnvelopeIcon className="h-5 w-5 mr-2" />
                <span className="text-sm">info@sweetdelights.com</span>
              </motion.div>
              <motion.div variants={itemVariants} className="flex items-center text-gray-600">
                <MapPinIcon className="h-5 w-5 mr-2" />
                <span className="text-sm">123 Baker Street, Sweetville</span>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Newsletter Signup */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="space-y-4"
          >
            <motion.h3 variants={itemVariants} className="text-lg font-semibold text-gray-800">
              Stay Updated
            </motion.h3>
            <motion.p variants={itemVariants} className="text-sm text-gray-600">
              Subscribe to our newsletter for special offers and updates.
            </motion.p>
            <motion.form variants={itemVariants} className="space-y-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Subscribe
              </motion.button>
            </motion.form>
          </motion.div>
        </div>

        {/* Social Media Links */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="mt-8 pt-8 border-t border-gray-200"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <motion.div variants={itemVariants} className="flex space-x-6">
              {['Facebook', 'Twitter', 'Instagram'].map((social) => (
                <motion.a
                  key={social}
                  href={`#${social.toLowerCase()}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-600 hover:text-green-600 transition-colors"
                >
                  <span className="sr-only">{social}</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                </motion.a>
              ))}
            </motion.div>
            <motion.p variants={itemVariants} className="text-sm text-gray-600">
              © {currentYear} Sweet Delights. All rights reserved.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;