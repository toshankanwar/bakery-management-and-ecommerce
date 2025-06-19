'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { 
  ChevronRightIcon,
  ShoppingBagIcon,
  TruckIcon,
  SparklesIcon,
  PhoneIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Utility to generate slug from product name
function slugify(str) {
  return str
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-')          // Replace spaces with -
    .replace(/[^\w\-]+/g, '')      // Remove all non-word chars
    .replace(/\-\-+/g, '-')        // Replace multiple - with single -
    .replace(/^-+/, '')            // Trim - from start of text
    .replace(/-+$/, '');           // Trim - from end of text
}

const HomePage = () => {
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        const q = query(
          collection(db, 'bakeryItems'),
          orderBy('createdAt', 'desc'),
          limit(8)
        );
        const snapshot = await getDocs(q);
        const products = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecentProducts(products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentProducts();
  }, []);

  const features = [
    {
      icon: <TruckIcon className="h-6 w-6" />,
      title: "Home Delivery",
      description: "Available in selected areas"
    },
    {
      icon: <SparklesIcon className="h-6 w-6" />,
      title: "Fresh Daily",
      description: "Baked fresh every morning"
    },
    {
      icon: <ClockIcon className="h-6 w-6" />,
      title: "Store Hours",
      description: "Open 7 AM - 9 PM"
    },
    {
      icon: <PhoneIcon className="h-6 w-6" />,
      title: "Order Now",
      description: "Call us for orders"
    }
  ];

  const categories = [
    {
      name: 'Breads',
      image: 'https://cdn.pixabay.com/photo/2024/01/27/10/24/bread-8535650_1280.jpg',
      description: 'Freshly baked daily bread',
      link: '/shop'
    },
    {
      name: 'Cakes',
      image: 'https://cdn.pixabay.com/photo/2023/09/21/11/41/ai-generated-8266497_1280.jpg',
      description: 'Custom celebration cakes',
      link: '/shop'
    },
    {
      name: 'Pastries',
      image: 'https://cdn.pixabay.com/photo/2016/03/27/17/49/cupcakes-1283247_1280.jpg',
      description: 'Delightful sweet treats',
      link: '/shop'
    },
    {
      name: 'Cookies',
      image: 'https://cdn.pixabay.com/photo/2022/12/05/20/29/cookie-7637659_1280.jpg',
      description: 'Perfect tea-time snacks',
      link: '/shop'
    }
  ];

  const testimonials = [
    {
      text: "The quality of breads and pastries is exceptional. Perfect for my morning coffee!",
      author: "Himanshu Sahu",
      role: "Regular Customer"
    },
    {
      text: "Their custom cakes made our wedding day even more special. Highly recommend!",
      author: "Poshan Kanwar.",
      role: "Wedding Client"
    },
    {
      text: "Fresh, delicious, and always consistent quality. Best bakery in town!",
      author: "Prithviraj Diwan.",
      role: "Local Resident"
    }
  ];

  const specialOffers = [
    {
      title: "Weekend Special",
      description: "20% off on all pastries",
      validTill: "Every Weekend"
    },
    {
      title: "Early Bird",
      description: "Fresh bread at special price",
      validTill: "Daily 7AM-9AM"
    },
    {
      title: "Bulk Orders",
      description: "Special rates for events",
      validTill: "Available Always"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={"https://cdn.pixabay.com/photo/2016/11/29/10/09/bakery-1868925_1280.jpg"}
            alt="Toshan Bakery"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto"
        >
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 drop-shadow-lg">
            Toshan Bakery
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-200 drop-shadow">
            Quality baked goods made fresh daily
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop">
              <motion.button
                whileHover={{ scale: 1.07, boxShadow: '0 6px 24px 0 rgba(22,163,74,0.30)', backgroundColor: '#22c55e' }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-700 transition-all duration-300 shadow-md"
              >
                View Our Menu
              </motion.button>
            </Link>
            <Link href="/about">
              <motion.button
                whileHover={{ scale: 1.07, boxShadow: '0 6px 24px 0 rgba(22,163,74,0.15)', color: '#22c55e', backgroundColor: '#fff' }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-gray-900 px-8 py-4 rounded-full text-lg font-semibold hover:text-green-700 hover:bg-green-50 transition-all duration-300 shadow-md"
              >
                Our Story
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, boxShadow: '0 16px 32px 0 rgba(22,163,74,0.18)' }}
                className="flex items-center gap-4 p-6 rounded-xl bg-white shadow transition-all duration-300 hover:bg-green-50"
              >
                <div className="p-3 bg-green-100 rounded-full text-green-600 transition-all duration-300">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Products Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Latest Products</h2>
              <p className="text-gray-600 mt-2">Fresh from our ovens</p>
            </div>
            <Link href="/shop">
              <motion.button
                whileHover={{ scale: 1.05, color: '#16a34a' }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold transition-all duration-300"
              >
                View All
                <ChevronRightIcon className="h-5 w-5" />
              </motion.button>
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-64 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {recentProducts.map((product) => (
                <motion.div
                  key={product.id}
                  whileHover={{ y: -12, scale: 1.035, boxShadow: '0 16px 32px 0 rgba(22,163,74,0.16)' }}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-green-200 transition-all duration-300"
                >
                  <Link href={`/product/${slugify(product.name)}`}>
                    <div className="relative h-64 overflow-hidden group">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                    <div className="p-4 border-t border-gray-100">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {product.category}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">
                          ₹{product.price}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.13, backgroundColor: '#15803d', boxShadow: '0 4px 14px 0 rgba(22,163,74,0.19)' }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-green-600 text-white p-2 rounded-full hover:shadow-lg hover:shadow-green-600/50 transition-all duration-300"
                        >
                          <ShoppingBagIcon className="h-5 w-5" />
                        </motion.button>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Our Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link key={category.name} href={category.link}>
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: '0 14px 28px 0 rgba(34,197,94,0.16)' }}
                  className="relative h-48 rounded-xl overflow-hidden group shadow transition-all duration-300"
                >
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center backdrop-blur-[2px] group-hover:backdrop-blur-0">
                    <div className="text-center transition-transform duration-300 group-hover:-translate-y-2">
                      <h3 className="text-white text-xl font-semibold">{category.name}</h3>
                      <p className="text-sm text-white mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="py-16 px-4 bg-green-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
            Special Offers
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Take advantage of our ongoing special offers and deals
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {specialOffers.map((offer, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10, scale: 1.05, boxShadow: '0 14px 28px 0 rgba(34,197,94,0.20)' }}
                className="bg-green-100 rounded-xl p-6 text-center border border-green-200 shadow transition-all duration-300"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {offer.title}
                </h3>
                <p className="text-gray-600 mb-4">{offer.description}</p>
                <span className="text-sm text-green-700 font-medium">
                  {offer.validTill}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Promise Section */}
      <section className="py-16 px-4 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="relative h-[400px] rounded-xl overflow-hidden group"
              whileHover={{ scale: 1.02, boxShadow: '0 14px 28px 0 rgba(34,197,94,0.13)' }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src="https://cdn.pixabay.com/photo/2016/12/17/20/52/cake-1914463_1280.jpg"
                alt="Our Baking Process"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-opacity duration-300" />
            </motion.div>
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900">
                Our Quality Promise
              </h2>
              <p className="text-gray-600 mb-6">
                At Toshan Bakery, we're committed to using only the finest ingredients
                and traditional baking methods to create products that delight our
                customers every day.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="p-1 bg-green-100 rounded-full mt-1">
                    <SparklesIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Premium Ingredients</h3>
                    <p className="text-gray-600">Carefully selected quality ingredients</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 bg-green-100 rounded-full mt-1">
                    <SparklesIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Traditional Methods</h3>
                    <p className="text-gray-600">Time-tested baking techniques</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="p-1 bg-green-100 rounded-full mt-1">
                    <SparklesIcon className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Daily Fresh</h3>
                    <p className="text-gray-600">Baked fresh every morning</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
            What Our Customers Say
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Don't just take our word for it – hear from our valued customers
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -10, scale: 1.03, boxShadow: '0 14px 28px 0 rgba(34,197,94,0.10)' }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-green-200 transition-all duration-300"
              >
                <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Store Information Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Visit Our Store</h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <ClockIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Business Hours</h3>
                    <p className="text-gray-600">Monday - Sunday: 7:00 AM - 9:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <PhoneIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Contact Us</h3>
                    <p className="text-gray-600">Phone: +91 1234567890</p>
                    <p className="text-gray-600">Email: contact@toshankanwar.website</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <TruckIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Delivery Areas</h3>
                    <p className="text-gray-600">We deliver to all major areas in the city</p>
                  </div>
                </div>
              </div>
            </div>
            <motion.div 
              className="relative h-[300px] md:h-full rounded-xl overflow-hidden group"
              whileHover={{ scale: 1.02, boxShadow: '0 14px 28px 0 rgba(34,197,94,0.13)' }}
              transition={{ duration: 0.3 }}
            >
              <Image
                src="https://cdn.pixabay.com/photo/2019/05/05/18/58/girl-4181395_1280.jpg"
                alt="Our Store"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pre-Order CTA Section */}
      <section className="py-16 px-4 bg-green-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Want to Pre-Order?</h2>
          <p className="mb-8 text-green-50">
            Place your orders in advance for special occasions or bulk requirements
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.07, boxShadow: '0 6px 24px 0 rgba(255,255,255,0.2)', color: '#22c55e', backgroundColor: '#fff' }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-green-600 px-8 py-3 rounded-full font-semibold hover:bg-green-50 transition-all duration-300"
              >
                Contact Us
              </motion.button>
            </Link>
            <Link href="/shop">
              <motion.button
                whileHover={{ scale: 1.07, backgroundColor: '#15803d', boxShadow: '0 6px 24px 0 rgba(22,163,74,0.24)' }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-800 transition-all duration-300"
              >
                View Menu
              </motion.button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-4 bg-green-50">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl font-bold mb-6 text-gray-900">
            Place Your Order
          </h2>
          <p className="text-gray-600 mb-8">
            Call us or visit our store to place your order
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="tel:+911234567890">
              <motion.button
                whileHover={{ scale: 1.07, backgroundColor: '#16a34a', boxShadow: '0 6px 24px 0 rgba(22,163,74,0.24)' }}
                whileTap={{ scale: 0.95 }}
                className="bg-green-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <PhoneIcon className="h-5 w-5" />
                Call Now
              </motion.button>
            </Link>
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.07, color: '#22c55e', backgroundColor: '#fff', boxShadow: '0 6px 24px 0 rgba(22,163,74,0.10)' }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-gray-900 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300"
              >
                Store Location
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;