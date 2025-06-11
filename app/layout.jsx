import './globals.css';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Sweet Delights Bakery',
  description: 'Fresh and delicious bakery items delivered to your doorstep',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <AuthProvider>
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