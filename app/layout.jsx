'use client';

import { useState, useEffect } from 'react';
import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import MobileNav from '@/components/MobileNav';
import LoadingSpinner from '@/components/LoadingSpinner';

// You need this for dynamic head
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] })

// Utility: Map routes to titles
const getTitleByPath = (pathname) => {
  if (pathname === "/") return "Toshan Bakery | Fresh Baked Goods, Cakes, and Pastries";
  if (pathname === "/about") return "About | Toshan Bakery";
  if (pathname === "/shop") return "Shop | Toshan Bakery";
  if (pathname === "/contact") return "Contact | Toshan Bakery";
  if (pathname === "/cart") return "Your Cart | Toshan Bakery";
  if (pathname === "/checkout") return "Checkout | Toshan Bakery";
  if (pathname === "/signup") return "Signup | Toshan Bakery";
  if (pathname.startsWith("/orders")) return "Orders | Toshan Bakery";
  if (pathname.startsWith("/forget-password")) return "Forget Password | Toshan Bakery";
  if (pathname.startsWith("/search")) return "Search | Toshan Bakery";
  if (pathname.startsWith("/profile")) return "Profile | Toshan Bakery";
  if (pathname === "/login") return "Login | Toshan Bakery";
  
  // Dynamically show product name in title if on a product page
  // Expected product page route: /product/[slug] or /shop/[slug]
  const productMatch = pathname.match(/^\/(product|shop)\/([^\/]+)$/);
  if (productMatch) {
    // Convert slug to a proper name ("chocolate-cake" => "Chocolate Cake")
    const slug = productMatch[2];
    const name = slug
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
    return `${name} | Toshan Bakery`;
  }

  return "Toshan Bakery";
};

function MetadataHead({ pathname }) {
  const title = getTitleByPath(pathname);
  // You can further tweak description by page if desired
  return (
    <head>
      <title>{title}</title>
      <meta name="description" content="Toshan Bakery - Order fresh cakes, breads, cookies, and pastries online. Best bakery in town for custom cakes and sweet treats! Delivery and pickup available." />
      <meta name="keywords" content="bakery, Toshan Bakery, cakes, pastries, breads, cookies, fresh, custom cakes, online bakery, sweets, desserts, delivery, order online" />
      <meta name="author" content="Toshan Bakery" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content="Order fresh cakes, pastries, and breads from Toshan Bakery. Delicious treats for every occasion. Delivery and pickup available." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://bakery.toshankanwar.website/"/>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </head>
  );
}

export default function RootLayout({ children }) {
  const [isLoading, setIsLoading] = useState(true);

  // For dynamic title
  let pathname = "/";
  // Only run usePathname in browser, fallback to "/" for SSR
  if (typeof window !== "undefined") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    pathname = window.location.pathname;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en">
      <MetadataHead pathname={pathname} />
      <body className={inter.className}>
        <AuthProvider>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              <Toaster 
                position="top-right"
                reverseOrder={false}
                gutter={8}
                toastOptions={{
                  duration: 2000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                    fontSize: '14px',
                  },
                  success: {
                    duration: 2000,
                    style: {
                      background: '#22c55e',
                      color: '#fff',
                    },
                    iconTheme: {
                      primary: '#fff',
                      secondary: '#22c55e',
                    },
                  },
                  error: {
                    duration: 2000,
                    style: {
                      background: '#ef4444',
                      color: '#fff',
                    },
                    iconTheme: {
                      primary: '#fff',
                      secondary: '#ef4444',
                    },
                  },
                  loading: {
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    iconTheme: {
                      primary: '#fff',
                      secondary: '#363636',
                    },
                  },
                }}
              />
              <Navbar />
              <main className="pt-16">
                {children}
              </main>
              <Footer />
              <MobileNav />
            </>
          )}
        </AuthProvider>
      </body>
    </html>
  );
}