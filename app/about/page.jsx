'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  UserGroupIcon,
  HeartIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const AboutPage = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const values = [
    {
      icon: HeartIcon,
      title: "Made with Love",
      description: "Every product is crafted with passion and care, ensuring the highest quality for our customers."
    },
    {
      icon: SparklesIcon,
      title: "Fresh Daily",
      description: "We bake fresh every morning, using only the finest ingredients to create delicious treats."
    },
    {
      icon: UserGroupIcon,
      title: "Family Owned",
      description: "A family tradition since 2023, bringing smiles to generations of customers."
    },
    {
      icon: ShieldCheckIcon,
      title: "Quality Assured",
      description: "We maintain the highest standards of quality and food safety in all our products."
    }
  ];

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-[60vh] overflow-hidden"
      >
        <Image
          src="https://cdn.pixabay.com/photo/2016/11/29/09/00/doughnuts-1868573_1280.jpg"
          alt="Bakery Interior"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center text-white px-4"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Our Story
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto">
              Crafting moments of joy through exceptional baking since 2023
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 py-16"
      >
        

{/* Mission Statement */}
<motion.div
  variants={itemVariants}
  className="text-center mb-16"
>
  <h2 className="text-3xl font-bold text-gray-900 mb-6">
    Our Mission
  </h2>
  <div className="text-lg text-gray-600 max-w-4xl mx-auto space-y-6">
    <p>
      At Toshan Bakery, we believe in creating more than just baked goods. 
      We craft experiences, memories, and moments of pure delight through our 
      artisanal creations, combining traditional techniques with innovative flavors.
    </p>
    
    <p>
      Our journey began in a small kitchen with big dreams and a passion for perfection. 
      Today, we continue to honor that legacy by handcrafting each item with the same 
      dedication and love that started our story. Every morning, as the sun rises, our 
      master bakers begin their day with a simple mission: to bring joy to your table.
    </p>

    <div className="grid md:grid-cols-2 gap-8 mt-8">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white p-6 rounded-xl shadow-sm"
      >
        <h3 className="text-xl font-semibold text-green-600 mb-3">
          Our Commitment
        </h3>
        <p className="text-gray-600">
          We take pride in sourcing only the finest ingredients, supporting local 
          farmers and suppliers whenever possible. Our recipes have been perfected 
          over generations, blending traditional methods with contemporary tastes 
          to create something truly special.
        </p>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white p-6 rounded-xl shadow-sm"
      >
        <h3 className="text-xl font-semibold text-green-600 mb-3">
          Our Promise
        </h3>
        <p className="text-gray-600">
          Each day, we strive to exceed expectations, creating not just pastries 
          and breads, but moments of happiness. Whether it's your morning coffee 
          companion or the centerpiece of your celebration, our creations are made 
          to make your moments memorable.
        </p>
      </motion.div>
    </div>

    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-gradient-to-r from-green-50 to-white p-8 rounded-xl mt-8"
    >
      <h3 className="text-xl font-semibold text-green-600 mb-3">
        Our Heritage
      </h3>
      <p className="text-gray-600">
        Drawing inspiration from both traditional Indian sweets and international 
        pastry arts, we've created a unique fusion that celebrates our heritage 
        while embracing modern culinary innovations. Our signature creations blend 
        the rich, aromatic spices of Indian cuisine with classic European baking 
        techniques, resulting in treats that are both familiar and excitingly new.
      </p>
    </motion.div>

    <div className="grid md:grid-cols-3 gap-6 mt-8">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-white p-4 rounded-lg shadow-sm"
      >
        <p className="text-2xl font-bold text-green-600 mb-2">30+</p>
        <p className="text-gray-600">Unique Daily Items</p>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-white p-4 rounded-lg shadow-sm"
      >
        <p className="text-2xl font-bold text-green-600 mb-2">100%</p>
        <p className="text-gray-600">Natural Ingredients</p>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        className="bg-white p-4 rounded-lg shadow-sm"
      >
        <p className="text-2xl font-bold text-green-600 mb-2">5AM</p>
        <p className="text-gray-600">Fresh Daily Baking</p>
      </motion.div>
    </div>

    <p className="italic text-gray-500 mt-8">
      "Every creation that leaves our bakery carries with it our commitment to 
      quality, our passion for baking, and our desire to make your day a little 
      sweeter."
    </p>
  </div>
</motion.div>

        {/* Values Grid */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          {values.map((value) => (
            <motion.div
              key={value.title}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05,
                backgroundColor: '#f0fdf4',
                transition: { duration: 0.2 }
              }}
              className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <value.icon className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {value.title}
              </h3>
              <p className="text-gray-600">
                {value.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Developer Section */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-2xl shadow-sm p-8 mb-16"
        >
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Meet The Developer
          </h2>
          <div className="max-w-3xl mx-auto">
            <motion.div
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              className="flex flex-col md:flex-row items-center gap-8 p-6 rounded-2xl bg-gradient-to-br from-green-50 to-white"
            >
              <div className="relative w-48 h-48 rounded-full overflow-hidden border-4 border-green-500 shadow-lg">
                <Image
                  src="/toshan-profile.jpg"
                  alt="Toshan Kanwar"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Toshan Kanwar
                </h3>
                <p className="text-green-600 font-medium mb-4">
                  Full Stack Developer
                </p>
                <p className="text-gray-600 mb-4">
                  Passionate about creating seamless digital experiences and bringing innovative solutions to life.
                </p>
                <motion.a
                  href="https://toshankanwar.website"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center text-green-600 hover:text-green-700 font-medium"
                >
                  <span className="underline">toshankanwar.website</span>
                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                </motion.a>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Acknowledgment Section */}
        <motion.div
          variants={itemVariants}
          className="mb-16 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Special Thanks
          </h2>
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-green-50 to-white p-8 rounded-2xl shadow-sm"
          >
            <p className="text-lg text-gray-600 mb-4">
              A heartfelt thank you to the brilliant developers of
            </p>
            <motion.a
              href="https://thecraftgallery.in"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl font-semibold text-green-600 hover:text-green-700 inline-flex items-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              thecraftgallery.in
              <ArrowRightIcon className="w-4 h-4 ml-1" />
            </motion.a>
            <p className="text-gray-600 mt-4">
              Their innovative work and dedication have been a true inspiration for this project.
            </p>
          </motion.div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          className="text-center bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-8 text-white"
        >
          <h2 className="text-3xl font-bold mb-4">
            Come Visit Us
          </h2>
          <p className="text-lg mb-6">
            Experience the aroma of freshly baked goods and the warmth of our hospitality
          </p>
          <Link href="/contact">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Contact Us
            </motion.button>
          </Link>
        </motion.div>
        
      </motion.div>
    </div>
  );
};

export default AboutPage;