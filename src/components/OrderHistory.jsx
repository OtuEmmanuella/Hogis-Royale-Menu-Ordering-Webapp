import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Clock, Package, ChevronLeft, ChevronDown, ChevronUp, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "./Firebase/FirebaseConfig";
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import CookingAnimation from '../components/CookingAnimation';
import DeliveryBikeAnimation from '../components/DeliveryBikeAnimation';

const OrderHistoryPage = () => {
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      const userId = user.uid;
      const q = query(
        collection(db, "orders"),
        where("customer.userId", "==", userId)
      );

      const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
        const orders = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const sortedOrders = orders.sort(
          (a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()
        );

        setOrderHistory(sortedOrders);
        setLoading(false);
        setError(null);
      }, (err) => {
        console.error("Error fetching orders:", err);
        setError("Failed to load order history. Please try again later.");
        setLoading(false);
      });

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  // Get current orders
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orderHistory.slice(indexOfFirstOrder, indexOfLastOrder);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="p-6 bg-rose-50 text-rose-800 rounded-xl shadow-sm border border-rose-200">
          <p className="font-medium text-sm sm:text-base">{error}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <motion.nav 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-3 mb-8"
        >
          <Link 
            to="/menu" 
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-gray-900 bg-white rounded-lg shadow-sm hover:shadow transition-all duration-200"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="font-medium text-xs sm:text-sm">Back to Menu</span>
          </Link>
        </motion.nav>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-4 md:p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
              <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
            <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Order History</h2>
          </div>

          {orderHistory.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <OrderList orders={currentOrders} />
              <Pagination
                ordersPerPage={ordersPerPage}
                totalOrders={orderHistory.length}
                paginate={paginate}
                currentPage={currentPage}
              />
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-8 sm:py-12"
  >
    <img
      src="/empty-bag.svg"
      alt="No orders"
      className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6 opacity-75"
    />
    <h3 className="text-base sm:text-lg font-semibold text-gray-700 mb-2">No Orders Yet</h3>
    <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">Start your culinary journey today!</p>
    <Link
      to="/menu"
      className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
    >
      Browse Our Menu
    </Link>
  </motion.div>
);

const OrderList = ({ orders }) => (
  <div className="space-y-4 sm:space-y-6">
    {orders.map((order, index) => (
      <OrderItem key={order.id} order={order} index={index} />
    ))}
  </div>
);

const OrderItem = ({ order, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpansion = () => setIsExpanded(!isExpanded);

  const formatPrice = (price) => {
    return `₦${price.toLocaleString("en-NG", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp.toDate()).toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: "bg-amber-100 text-amber-800 border border-amber-300",
      processing: "bg-blue-100 text-blue-800 border border-blue-300",
      out_for_delivery: "bg-purple-100 text-purple-800 border border-purple-300",
      delivered: "bg-indigo-100 text-indigo-800 border border-indigo-300",
      completed: "bg-emerald-100 text-emerald-800 border border-emerald-300",
      cancelled: "bg-rose-100 text-rose-800 border border-rose-300",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800 border border-gray-300";
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      pending: "Pending",
      processing: "In Progress",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      completed: "Completed",
      cancelled: "Cancelled",
    };
    return statusLabels[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="border border-gray-200 rounded-xl p-3 sm:p-4 hover:shadow-md transition-all duration-300 bg-white"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
              Order #{order.id.slice(-6)}
            </span>
            <div className="flex items-center gap-1 text-gray-500">
              <Clock className="h-3 w-3" />
              <span className="text-xs">{formatDate(order.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
            {order.status === "processing" && <CookingAnimation />}
            {order.status === "out_for_delivery" && <DeliveryBikeAnimation />}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-gray-500 mb-1">Total Amount</p>
          <p className="text-sm sm:text-base font-bold text-blue-600">
            {formatPrice(order.totalAmount)}
          </p>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {order.items.slice(0, 2).map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="flex justify-between items-center py-2 border-t border-gray-100"
          >
            <div>
              <p className="font-medium text-gray-900 text-xs sm:text-sm">{item.name}</p>
              <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
            </div>
            <p className="font-semibold text-gray-900 text-xs sm:text-sm">
              {formatPrice(item.price * item.quantity)}
            </p>
          </motion.div>
        ))}
        {order.items.length > 2 && !isExpanded && (
          <p className="text-xs text-gray-500 mt-2">
            {order.items.length - 2} more item(s)...
          </p>
        )}
      </div>

      <button
        onClick={toggleExpansion}
        className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm"
      >
        {isExpanded ? (
          <>
            <span>Show Less</span>
            <ChevronUp className="h-4 w-4" />
          </>
        ) : (
          <>
            <span>Show More</span>
            <ChevronDown className="h-4 w-4" />
          </>
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 pt-4 border-t border-gray-200 overflow-hidden"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <InfoSection label="Customer Details" icon={<Package className="h-4 w-4" />}>
                <InfoItem label="Name" value={order.customer.customerName} />
                <InfoItem label="Email" value={order.customer.email} />
                <InfoItem label="Phone" value={order.customer.phone} />
                {order.customer.recipientName && order.customer.recipientPhone && (
  <>
    <InfoItem label="Recipient" value={order.customer.recipientName} />
    <InfoItem label="Recipient's Phone" value={order.customer.recipientPhone} />
  </>
)}



              </InfoSection>

              {order.items.specifications && (
                <InfoSection label="Special Instructions" icon={<Package className="h-4 w-4" />}>
                  <p className="text-xs sm:text-sm text-gray-700">{order.items.specifications}</p>
                </InfoSection>
              )}

              {order?.recipientName && (
                <InfoSection label="Recipient Details" icon={<Package className="h-4 w-4" />}>
                  <InfoItem label="Name" value={order.recipientName} />
                </InfoSection>
              )}

              <InfoSection label="Order Details" icon={<Package className="h-4 w-4" />}>
                <InfoItem label="Payment Reference" value={order.paymentReference} />
                <InfoItem label="Delivery Address" value={order.customer.address} />
                <InfoItem label="Branch" value={order.branchName} />
                <InfoItem label="Location" value={order.deliveryLocation} />
                <InfoItem label="Delivery Method" value={order.deliveryMethod} />
                <InfoItem label="Order Type" value={order.orderType} />
                <InfoItem 
                  label="Payment Method" 
                  value={order?.paymentDetails?.channel || "Payment details unavailable"} 
                />
              </InfoSection>
            </div>
            {order.items.length > 2 && (
              <div className="mt-4 space-y-3">
                <h4 className="font-semibold text-gray-900 text-xs sm:text-sm">Additional Items</h4>
                {order.items.slice(2).map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex justify-between items-center py-2 border-t border-gray-100"
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-xs sm:text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900 text-xs sm:text-sm">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const InfoSection = ({ label, icon, children }) => (
  <div className="bg-gray-50 rounded-lg p-3">
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1 bg-gray-200 rounded-md">
        {icon}
      </div>
      <h4 className="font-semibold text-gray-900 text-xs sm:text-sm">{label}</h4>
    </div>
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

const InfoItem = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between">
    <p className="text-xs font-medium text-gray-500">{label}</p>
    <p className="text-xs text-gray-900">{value}</p>
  </div>
);

const Pagination = ({ ordersPerPage, totalOrders, paginate, currentPage }) => {
  const pageNumbers = [];

  for (let i = 1; i <= Math.ceil(totalOrders / ordersPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <nav className="flex justify-center mt-6">
      <ul className="flex flex-wrap items-center justify-center gap-2">
        <li>
          <button
            onClick={() => paginate(1)}
            disabled={currentPage === 1}
            className="px-2 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 text-xs"
          >
            <ChevronsLeft className="h-3 w-3" />
          </button>
        </li>
        {pageNumbers.map((number) => (
          <li key={number}>
            <button
              onClick={() => paginate(number)}
              className={`px-2 py-1 rounded-md text-xs ${
                currentPage === number
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {number}
            </button>
          </li>
        ))}
        <li>
          <button
            onClick={() => paginate(Math.ceil(totalOrders / ordersPerPage))}
            disabled={currentPage === Math.ceil(totalOrders / ordersPerPage)}
            className="px-2 py-1 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 text-xs"
          >
            <ChevronsRight className="h-3 w-3" />
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default OrderHistoryPage;

