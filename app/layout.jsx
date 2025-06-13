import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Toshan Bakery',
  description: 'Fresh and delicious bakery items delivered to your doorstep',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
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
        </AuthProvider>
      </body>
    </html>
  )
}