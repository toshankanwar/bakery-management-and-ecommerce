// app/orders/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthContext } from '@/contexts/AuthContext';
import { db } from '@/firebase/config';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  limit 
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { 
  TruckIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ShoppingBagIcon,
  ChevronDownIcon,
  ArrowDownTrayIcon,
  MapPinIcon,
  PhoneIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import html2pdf from 'html2pdf.js';

const ORDER_STATUS_CONFIG = {
  pending: {
    icon: ClockIcon,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    text: 'Order Pending'
  },
  confirmed: {
    icon: CheckCircleIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    text: 'Order Confirmed'
  },
  processing: {
    icon: TruckIcon,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    text: 'Processing'
  },
  shipped: {
    icon: TruckIcon,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    text: 'Shipped'
  },
  delivered: {
    icon: CheckCircleIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    text: 'Delivered'
  },
  cancelled: {
    icon: XCircleIcon,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    text: 'Cancelled'
  }
};

const PAYMENT_STATUS_CONFIG = {
  pending: {
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    text: 'Payment Pending'
  },
  completed: {
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    text: 'Payment Completed'
  },
  failed: {
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    text: 'Payment Failed'
  }
};

const OrderItem = ({ item }) => (
  <div className="flex items-center space-x-4">
    <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
      <Image
        src={item.image || '/default-product.png'}
        alt={item.name}
        fill
        className="object-cover"
      />
    </div>
    <div className="flex-1 min-w-0">
      <h5 className="text-sm font-medium text-gray-900 truncate">{item.name}</h5>
      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
      {item.specialRequest && (
        <p className="text-sm text-gray-500 truncate">
          Note: {item.specialRequest}
        </p>
      )}
    </div>
    <div className="text-sm font-medium text-gray-900">
      ₹{(item.price * item.quantity).toFixed(2)}
    </div>
  </div>
);

const OrderCard = ({ order, isExpanded, onToggle, onDownloadInvoice }) => {
  const statusConfig = ORDER_STATUS_CONFIG[order.orderStatus];
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      {/* Order Header */}
      <div 
        className="p-6 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-full ${statusConfig.bgColor}`}>
              <StatusIcon className={`h-6 w-6 ${statusConfig.color}`} />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Order #{order.id.slice(-8)}
              </h3>
              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`text-sm font-medium ${statusConfig.color}`}>
              {statusConfig.text}
            </span>
            <motion.button
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            </motion.button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
          </span>
          <span className="text-lg font-bold text-green-600">
            ₹{order.total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Order Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-100"
          >
            <div className="p-6 space-y-6">
              {/* Items */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">
                  Order Items
                </h4>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <OrderItem key={item.id} item={item} />
                  ))}
                </div>
              </div>

              {/* Shipping and Payment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shipping Address */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm font-medium text-gray-900">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                    <h4>Shipping Address</h4>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1 pl-7">
                    <p className="font-medium">{order.address.name}</p>
                    <p>{order.address.address}</p>
                    {order.address.apartment && (
                      <p>{order.address.apartment}</p>
                    )}
                    <p>{order.address.city}, {order.address.state}</p>
                    <p>PIN: {order.address.pincode}</p>
                    <p className="flex items-center mt-2">
                      <PhoneIcon className="h-4 w-4 mr-1" />
                      {order.address.mobile}
                    </p>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm font-medium text-gray-900">
                    <BanknotesIcon className="h-5 w-5 text-gray-400" />
                    <h4>Payment Details</h4>
                  </div>
                  <div className="space-y-3 pl-7">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method</span>
                        <span className="font-medium">
                          {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'UPI Payment'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Status</span>
                        <span className={`font-medium ${
                          PAYMENT_STATUS_CONFIG[order.paymentStatus].color
                        }`}>
                          {PAYMENT_STATUS_CONFIG[order.paymentStatus].text}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span>₹{order.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping</span>
                        <span>
                          {order.shipping === 0 ? (
                            <span className="text-green-600">Free</span>
                          ) : (
                            `₹${order.shipping.toFixed(2)}`
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t font-medium">
                        <span>Total</span>
                        <span className="text-green-600">
                          ₹{order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end pt-4 border-t">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onDownloadInvoice(order)}
                  className="inline-flex items-center px-4 py-2 rounded-lg border border-green-600 text-green-600 hover:bg-green-50"
                >
                  <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                  Download Invoice
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const OrdersPage = () => {
  const { user } = useAuthContext();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const ordersPerPage = 5;

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setError(null);
        const ordersRef = collection(db, 'orders');
        const q = query(
          ordersRef,
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(page * ordersPerPage)
        );

        const snapshot = await getDocs(q);
        const orderData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setOrders(orderData);
        setHasMore(orderData.length === page * ordersPerPage);
      } catch (error) {
        console.error('Error fetching orders:', {
          error: error.message,
          timestamp: '2025-06-16 17:48:48',
          user: 'Kala-bot-apk'
        });
        setError('Failed to load orders');
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };

    fetchOrders();
  }, [user, router, page]);

  const handleLoadMore = () => {
    setLoadingMore(true);
    setPage(prev => prev + 1);
  };

  const generateInvoice = async (order) => {
    try {
      // Create the invoice HTML content
      const invoiceHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1a1a1a; margin-bottom: 10px;">INVOICE</h1>
            <p style="color: #666; margin: 5px 0;">Order #${order.id}</p>
            <p style="color: #666; margin: 5px 0;">Date: ${new Date(order.createdAt).toLocaleString()}</p>
          </div>
          
          <div style="margin-bottom: 30px; padding: 15px; background-color: #f9fafb; border-radius: 8px;">
            <h3 style="color: #1a1a1a; margin-bottom: 10px;">Order Status: ${ORDER_STATUS_CONFIG[order.orderStatus].text}</h3>
            <p style="color: #4b5563; margin: 5px 0;">Payment Method: ${order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'UPI Payment'}</p>
            <p style="color: #4b5563; margin: 5px 0;">Payment Status: ${PAYMENT_STATUS_CONFIG[order.paymentStatus].text}</p>
          </div>
  
          <div style="margin-bottom: 30px;">
            <h3 style="color: #1a1a1a; margin-bottom: 10px;">Shipping Address:</h3>
            <div style="padding: 15px; background-color: #f9fafb; border-radius: 8px;">
              <p style="color: #4b5563; margin: 5px 0; font-weight: bold;">${order.address.name}</p>
              <p style="color: #4b5563; margin: 5px 0;">${order.address.address}</p>
              ${order.address.apartment ? `<p style="color: #4b5563; margin: 5px 0;">${order.address.apartment}</p>` : ''}
              <p style="color: #4b5563; margin: 5px 0;">${order.address.city}, ${order.address.state} ${order.address.pincode}</p>
              <p style="color: #4b5563; margin: 5px 0;">Phone: ${order.address.mobile}</p>
            </div>
          </div>
  
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb;">Item</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb;">Quantity</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Price</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td style="padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
                  <td style="padding: 12px; text-align: center; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">₹${item.price.toFixed(2)}</td>
                  <td style="padding: 12px; text-align: right; border-bottom: 1px solid #e5e7eb;">₹${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
  
          <div style="text-align: right; margin-top: 20px; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
            <p style="color: #4b5563; margin: 5px 0;">Subtotal: ₹${order.subtotal.toFixed(2)}</p>
            <p style="color: #4b5563; margin: 5px 0;">Shipping: ${order.shipping === 0 ? 'Free' : `₹${order.shipping.toFixed(2)}`}</p>
            <h3 style="color: #1a1a1a; margin: 10px 0;">Total: ₹${order.total.toFixed(2)}</h3>
          </div>
  
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">Thank you for your purchase!</p>
            <p style="color: #6b7280; font-size: 14px;">
              Generated on ${new Date().toLocaleString()} by ${order.storeName || 'Toshan Kanwar'}
            </p>
          </div>
        </div>
      `;
  
      // Create an element to render the invoice
      const element = document.createElement('div');
      element.innerHTML = invoiceHtml;
  
      // Configure pdf options
      const opt = {
        margin: [10, 10],
        filename: `invoice-${order.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait'
        }
      };
  
      // Generate PDF
      toast.promise(
        html2pdf().set(opt).from(element).save(),
        {
          pending: 'Generating invoice...',
          success: 'Invoice downloaded successfully',
          error: 'Failed to generate invoice'
        }
      );
  
    } catch (error) {
      console.error('Error generating invoice:', {
        error: error.message,
        timestamp: '2025-06-17 17:55:22',
        user: 'Kala-bot-apk'
      });
      toast.error('Failed to generate invoice');
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.orderStatus === filterStatus);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{error}</h2>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
          >
            <option value="all">All Orders</option>
            {Object.entries(ORDER_STATUS_CONFIG).map(([status, config]) => (
              <option key={status} value={status}>
                {config.text}
              </option>
            ))}
          </select>
        </div>

        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-8 text-center"
          >
            <ShoppingBagIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h2>
            <p className="text-gray-600 mb-6">
              {filterStatus === 'all' 
                ? "You haven't placed any orders yet"
                : `No ${ORDER_STATUS_CONFIG[filterStatus].text.toLowerCase()} orders`
              }
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/shop')}
              className="inline-flex items-center px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700"
            >
              Start Shopping
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isExpanded={expandedOrder === order.id}
                onToggle={() => setExpandedOrder(
                  expandedOrder === order.id ? null : order.id
                )}
                onDownloadInvoice={generateInvoice}
              />
            ))}

            {hasMore && (
              <div className="text-center pt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="px-6 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-green-600 mr-2" />
                      Loading...
                    </span>
                  ) : (
                    'Load More Orders'
                  )}
                </motion.button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;