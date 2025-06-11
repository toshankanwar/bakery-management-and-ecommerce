'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ChevronRightIcon, 
  StarIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';

const HomePage = () => {
  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Featured products data
  const featuredProducts = [
    {
      id: 1,
      name: 'Classic Croissant',
      price: '$3.99',
      image: '/croissant.jpg',
      category: 'Pastries'
    },
    {
      id: 2,
      name: 'Chocolate Cake',
      price: '$24.99',
      image: '/chocolate-cake.jpg',
      category: 'Cakes'
    },
    {
      id: 3,
      name: 'Sourdough Bread',
      price: '$6.99',
      image: '/sourdough.jpg',
      category: 'Breads'
    },
    {
      id: 4,
      name: 'Fruit Tart',
      price: '$4.99',
      image: '/fruit-tart.jpg',
      category: 'Desserts'
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Food Blogger',
      content: 'The best bakery I have ever visited! Their croissants are simply amazing.',
      rating: 5,
      image: '/testimonial1.jpg'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Food Critic',
      content: 'Exceptional quality and incredible attention to detail in every pastry.',
      rating: 5,
      image: '/testimonial2.jpg'
    },
    {
      id: 3,
      name: 'Emma Wilson',
      role: 'Regular Customer',
      content: 'Their cakes made our wedding day even more special. Highly recommend!',
      rating: 5,
      image: '/testimonial3.jpg'
    }
  ];

  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-green-50">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bakery.jpg"
            alt="Bakery Hero"
            fill
            className="object-cover opacity-90"
            priority
          />
          <div className="absolute inset-0 bg-white/50" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-gray-800 px-4"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Toshan Bakery
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            Artisanal breads & pastries baked fresh daily
          </p>
          <Link href="/shop">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-600 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-green-700 transition-colors duration-200"
            >
              Explore Our Products
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 px-4 bg-green-50">
        <motion.div
          ref={ref}
          initial="initial"
          animate={inView ? "animate" : "initial"}
          variants={staggerContainer}
          className="max-w-7xl mx-auto"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-4xl font-bold text-center mb-12 text-gray-800"
          >
            Featured Products
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <motion.div
                key={product.id}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="bg-white rounded-lg overflow-hidden shadow-lg"
              >
                <div className="relative h-64">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <span className="text-green-600 text-sm font-medium">
                    {product.category}
                  </span>
                  <h3 className="text-xl font-semibold mt-2 text-gray-800">{product.name}</h3>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-2xl font-bold text-gray-800">{product.price}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors duration-200"
                    >
                      <ChevronRightIcon className="h-6 w-6" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
          >
            <div className="relative h-[600px]">
              <Image
                src="/bakery-interior.jpg"
                alt="Bakery Interior"
                fill
                className="object-cover rounded-lg"
              />
            </div>
            <div>
              <h2 className="text-4xl font-bold mb-6 text-gray-800">Our Story</h2>
              <p className="text-gray-600 mb-6 text-lg">
                Since 1995, Sweet Delights has been crafting exceptional artisanal breads
                and pastries. Our commitment to quality ingredients and traditional
                baking methods has made us a beloved destination for food lovers.
              </p>
              <ul className="space-y-4 mb-8">
                {['Artisanal Baking', 'Premium Ingredients', 'Traditional Methods'].map((item) => (
                  <motion.li
                    key={item}
                    whileHover={{ x: 10 }}
                    className="flex items-center space-x-3 text-lg text-gray-700"
                  >
                    <ArrowRightIcon className="h-5 w-5 text-green-600" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
              <Link href="/about">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-green-600 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-green-700 transition-colors duration-200"
                >
                  Learn More
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-green-50">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-center mb-12 text-gray-800"
          >
            What Our Customers Say
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -10 }}
                className="bg-white p-6 rounded-lg shadow-lg"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">{testimonial.name}</h3>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{testimonial.content}</p>
                <div className="flex space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="h-5 w-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 bg-white">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl font-bold mb-6 text-gray-800">Stay Updated</h2>
          <p className="text-gray-600 mb-8">
            Subscribe to our newsletter for special offers and updates
          </p>
          <form className="flex flex-col md:flex-row gap-4 justify-center">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-6 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent md:w-96"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-green-600 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-green-700 transition-colors duration-200"
            >
              Subscribe
            </motion.button>
          </form>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;