import React, { useEffect, useState } from "react";
import { ShoppingBag, Clock, Package, ChevronLeft } from 'lucide-react';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "./Firebase/FirebaseConfig";
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';
import CookingAnimation from '../components/CookingAnimation';
import DeliveryBikeAnimation from '../components/DeliveryBikeAnimation';

const OrderHistoryPage = () => {
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      out_for_delivery: "bg-purple-100 text-purple-800",
      delivered: "bg-indigo-100 text-indigo-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return statusColors[status] || "bg-gray-100 text-gray-800";
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

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate('/login');
        return;
      }

      const userId = user.uid;
      console.log("Fetching orders for user ID:", userId);

      const q = query(
        collection(db, "orders"),
        where("customer.userId", "==", userId)
      );

      const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
        const orders = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Fetched orders:", orders);

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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-4 bg-red-50 text-red-800 rounded-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
    <nav className="flex flex-wrap items-center space-x-2 mb-6 text-gray-600">
      <Link to="/menu" className="flex items-center hover:text-gray-900 transition-colors">
        <ChevronLeft className="h-4 w-4" />
        <span>Back</span>
      </Link>
    </nav>
  
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-lg p-4 md:p-6"
    >
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <ShoppingBag className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
        <h2 className="text-xl md:text-3xl font-bold text-gray-800">Order History</h2>
      </div>
  
      <AnimatePresence>
        {orderHistory.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8 md:py-12"
          >
            <img
              src="/empty-bag.svg"
              alt="No orders"
              className="w-32 h-32 md:w-48 md:h-48 mx-auto mb-6"
            />
            <p className="text-base md:text-xl text-gray-600">You haven't placed any orders yet.</p>
            <Link
              to="/menu"
              className="mt-4 inline-block px-4 py-2 md:px-6 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse Our Menu
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            {orderHistory.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="border border-gray-200 rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow bg-white"
              >
                <div className="flex flex-wrap justify-between items-start mb-4 gap-4">
                  <div>
                    <p className="text-sm md:text-lg font-semibold text-gray-800">Order ID: {order.id}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <p className="text-xs md:text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                    {order.status === "processing" && <CookingAnimation />}
                    {order.status === "out_for_delivery" && <DeliveryBikeAnimation />}
                  </div>
                </div>
  
                <div className="space-y-4 mt-4">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-wrap justify-between items-center py-3 border-t border-gray-100"
                    >
                      <div>
                        <p className="text-sm md:text-lg font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs md:text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="text-sm md:text-lg font-semibold text-gray-800">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
  
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap justify-between items-center">
                    <div>
                      <p className="text-xs md:text-sm font-medium text-gray-600">Delivery Option:</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Package className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
                        <p className="text-sm md:text-lg font-medium text-gray-800">{order.deliveryOption}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs md:text-sm font-medium text-gray-600">Total Amount:</p>
                      <p className="text-lg md:text-2xl font-bold text-blue-600">
                        {formatPrice(order.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  </div>
  
  );
};

export default OrderHistoryPage;

