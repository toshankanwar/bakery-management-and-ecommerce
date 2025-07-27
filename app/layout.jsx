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
  if (pathname === "/favourite") return "Favourite | Toshan Bakery";
  if (pathname === "/privacy-policy") return "Privacy Policy | Toshan Bakery";
  if (pathname === "/terms-and-conditions") return "Terms and Conditions | Toshan Bakery";
  if (pathname === "/cancellation-and-refund") return "Cancellation and Refund | Toshan Bakery";
  if (pathname === "/shipping-and-delivery") return "Shipping and Delivery | Toshan Bakery";
  
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

function MetadataHead({ title }) {
  // You can further tweak description by page if desired
  return (
    <>
      <title>{title}</title>
      <meta name="description" content="Toshan Bakery - Order fresh cakes, breads, cookies, and pastries online. Best bakery in town for custom cakes and sweet treats! Delivery and pickup available." />
      <meta name="keywords" content="bakery, Toshan Bakery, cakes, pastries, breads, cookies, fresh, custom cakes, online bakery, sweets, desserts, delivery, order online" />
      <meta name="author" content="Toshan Bakery" />
      <meta property="og:title" content={title} />
      <meta property="og:site_name" content="Toshan Bakery"/>
      <meta property="og:description" content="Order fresh cakes, pastries, and breads from Toshan Bakery. Delicious treats for every occasion. Delivery and pickup available." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://bakery.toshankanwar.website/"/>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </>
  );
}

// This is a client component, so you can use hooks
export default function RootLayout({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // Set dynamic <title> with useEffect for every navigation (SPA, client-side nav too)
  useEffect(() => {
    const title = getTitleByPath(pathname);
    if (typeof window !== "undefined") {
      document.title = title;
    }
  }, [pathname]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // For Next.js, meta tags in <head> outside of title are static unless using the app router's metadata system.
  // For dynamic title, use useEffect as above; for meta tags, you can render them once here:
  return (
    <html lang="en">
      <head>
        <MetadataHead title={getTitleByPath(pathname)} />
      </head>
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