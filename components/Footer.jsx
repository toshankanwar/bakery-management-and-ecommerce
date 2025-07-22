'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

// Social Icon SVGs
const socialIcons = {
  facebook: (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.326v21.348C0 23.403.597 24 1.326 24h11.494v-9.294H9.691V11.41h3.129V8.797c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.92.001c-1.504 0-1.797.715-1.797 1.763v2.314h3.587l-.467 3.296h-3.12V24h6.116C23.403 24 24 23.403 24 22.674V1.326C24 .597 23.403 0 22.675 0"/>
    </svg>
  ),
  github: (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.045-3.338.724-4.042-1.416-4.042-1.416-.546-1.385-1.333-1.754-1.333-1.754-1.089-.745.083-.729.083-.729 1.205.085 1.84 1.236 1.84 1.236 1.072 1.835 2.809 1.305 3.495.998.109-.775.419-1.305.762-1.605-2.665-.304-5.466-1.332-5.466-5.93 0-1.31.469-2.381 1.236-3.221-.123-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23a11.51 11.51 0 013.003-.404c1.018.005 2.045.138 3.003.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.119 3.176.77.84 1.236 1.911 1.236 3.221 0 4.609-2.803 5.624-5.475 5.921.43.372.823 1.102.823 2.222 0 1.604-.014 2.896-.014 3.289 0 .322.218.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
  ),
  youtube: (
    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a2.997 2.997 0 00-2.109-2.118C19.078 3.5 12 3.5 12 3.5s-7.078 0-9.389.567a2.997 2.997 0 00-2.109 2.118A31.8 31.8 0 000 12a31.8 31.8 0 00.502 5.814 2.997 2.997 0 002.109 2.118C4.922 20.5 12 20.5 12 20.5s7.078 0 9.389-.567a2.997 2.997 0 002.109-2.118A31.8 31.8 0 0024 12a31.8 31.8 0 00-.502-5.814zM9.545 15.568V8.432l6.545 3.568-6.545 3.568z"/>
    </svg>
  ),
};

const socialLinks = [
  {
    name: 'Facebook',
    url: 'https://www.facebook.com/toshan.kanwar.73',
    icon: socialIcons.facebook,
  },
  {
    name: 'GitHub',
    url: 'https://github.com/toshankanwar',
    icon: socialIcons.github,
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/@ToshanKanwarOfficials',
    icon: socialIcons.youtube,
  },
];

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
                  Toshan Bakery
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
              {['About', 'Shop', 'Special Orders', 'Careers'].map((item) => (
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
                <span className="text-sm">+91 93*****93</span>
              </motion.div>
              <motion.div variants={itemVariants} className="flex items-center text-gray-600">
                <EnvelopeIcon className="h-5 w-5 mr-2" />
                <span className="text-sm">contact@toshankanwar.website</span>
              </motion.div>
              <motion.div variants={itemVariants} className="flex items-center text-gray-600">
                <MapPinIcon className="h-5 w-5 mr-2" />
                <span className="text-sm">IIIT Naya Raipur Chhattisgarh India</span>
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
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900"
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
              {socialLinks.map(({ name, url, icon }) => (
                <motion.a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-gray-600 hover:text-green-600 transition-colors flex items-center"
                >
                  <span className="sr-only">{name}</span>
                  {icon}
                </motion.a>
              ))}
            </motion.div>
            <motion.p variants={itemVariants} className="text-sm text-gray-600 flex flex-col sm:flex-row items-center justify-center gap-1 text-center">
              <span className="flex flex-wrap items-center justify-center gap-1">
                Designed & Developed with{" "}
                <svg 
                  className="w-4 h-4 mx-1 text-red-500 animate-pulse" 
                  fill="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                by{" "}
                <a 
                  href="https://toshankanwar.website" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="font-medium text-green-600 hover:text-green-700 transition-colors hover:underline"
                >
                  Toshan Kanwar
                </a>
              </span>
              <span className="text-xs text-gray-500 mt-1 sm:mt-0">
                <span className="hidden sm:inline mx-1">•</span>
                Built with{" "}
                <a 
                  href="https://nextjs.org" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Next.js
                </a>
                {" 13 "}+{" and "}
                <a 
                  href="https://firebase.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Firebase
                </a>
                {" "}• Mobile First • Responsive
              </span>
              <span className="hidden sm:inline mx-1">•</span>
              <span>© {currentYear} Toshan Bakery. All rights reserved.</span>
            </motion.p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;