'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { sendPasswordResetEmail } from '@/firebase/auth';
import Toast from '@/components/Toast';

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [notification, setNotification] = useState({
    message: '',
    type: 'error'
  });
  const [loading, setLoading] = useState(false);

  const showNotification = (message, type = 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification({ message: '', type: 'error' });
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { success, error } = await sendPasswordResetEmail(email);

      if (success) {
        showNotification('Password reset email sent! Please check your inbox.', 'success');
        // Optional: Redirect to login page after a delay
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        showNotification(error || 'Failed to send reset email. Please try again.');
      }
    } catch (err) {
      console.error('Error sending reset email:', {
        error: err.message,
        timestamp: '2025-06-11 19:21:21',
        user: 'Kala-bot-apk'
      });
      showNotification('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Toast 
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ message: '', type: 'error' })}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg"
      >
        <div>
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="mx-auto h-12 w-12 text-center"
          >
            🔑
          </motion.div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none relative block w-full px-3 py-2 mt-1 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 focus:z-10 sm:text-sm"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              {loading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Sending...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </motion.button>

            <div className="flex items-center justify-center space-x-4 text-sm">
              <Link
                href="/login"
                className="font-medium text-green-600 hover:text-green-500 transition-colors"
              >
                Back to Login
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                href="/signup"
                className="font-medium text-green-600 hover:text-green-500 transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            If you don't receive an email within a few minutes, please check your spam folder or{' '}
            <Link
              href="/contact"
              className="font-medium text-green-600 hover:text-green-500 transition-colors"
            >
              contact support
            </Link>.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;