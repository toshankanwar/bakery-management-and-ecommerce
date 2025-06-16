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

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Adjust time as needed

    return () => clearTimeout(timer);
  }, []);

  return (
    <html lang="en">
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