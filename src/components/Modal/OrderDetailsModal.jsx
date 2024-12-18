import React, { useState, useEffect } from 'react';
import { IoMdClose, IoMdCheckmark, IoMdPrint } from 'react-icons/io';
import { FiTruck, FiPackage, FiUser, FiMail, FiPhone, FiMapPin, FiClock, FiCreditCard } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../Firebase/FirebaseConfig';
import Invoice from '../../components/Invoice/Invoice';
import { printInvoice } from '../../utils/printInvoice';

const OrderDetailsModal = ({ isOpen, onClose, onMarkAsCompleted, order, onUpdateStatus, orderId }) => {
  const [currentStatus, setCurrentStatus] = useState(order ? order.status : 'pending');
  const [formattedOrderType, setFormattedOrderType] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);

  // Enhanced delivery and location retrieval
  const getDeliveryMethod = () => {
    return order?.deliveryMethod || 
           orderData?.deliveryMethod || 
           order?.paymentDetails?.metadata?.deliveryMethod || 
           'Not Specified';
  };

  const getDeliveryLocation = () => {
    return order?.deliveryLocation || 
           orderData?.deliveryLocation || 
           order?.paymentDetails?.metadata?.deliveryLocation || 
           'Not Specified';
  };

  useEffect(() => {
    if (order?.paymentDetails?.metadata?.orderType) {
      setFormattedOrderType(formatOrderType(order.paymentDetails.metadata.orderType));
    } else {
      setFormattedOrderType('Unknown Type');
    }
  }, [order]);

  useEffect(() => {
    const fetchOrderData = async () => {
      if (!orderId) return;
      
      setIsLoading(true);
      try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          setOrderData(orderSnap.data());
        } else {
          console.error("No such document!");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId]);

  if (!isOpen || !order) return null;

  const formatPrice = (price) => {
    return `₦${Number(price || 0).toLocaleString('en-NG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      case 'processing': return 'bg-blue-500 text-white';
      case 'out_for_delivery': return 'bg-purple-500 text-white';
      case 'delivered': return 'bg-indigo-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatOrderType = (type) => {
    if (!type) return 'Unknown Type';
    switch (type) {
      case 'dine-in': return 'Dine-In';
      case 'pickup': return 'Takeout - Pickup';
      case 'delivery': return 'Takeout - Delivery';
      default: return 'Unknown Type';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      if (timestamp.seconds) {
        return new Date(timestamp.seconds * 1000).toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else if (timestamp instanceof Date) {
        return timestamp.toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else if (typeof timestamp === 'string') {
        return new Date(timestamp).toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return 'Invalid Date';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const totalPrice = (order.items || []).reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
  const deliveryPrice = order.deliveryPrice || 0;
  const finalAmount = totalPrice + deliveryPrice;

  const handlePrintInvoice = () => {
    printInvoice(order);
  };

  const handleStatusUpdate = async (newStatus) => {
    setIsLoading(true);
    try {
      await onUpdateStatus(order.id, newStatus);
      setCurrentStatus(newStatus);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <div>
                <h2 className="text-3xl font-bold">Order Details</h2>
                <p className="text-sm mt-1 opacity-80">Order #{order.id}</p>
              </div>
              <button 
                onClick={onClose} 
                className="text-white hover:text-gray-200 transition-colors"
              >
                <IoMdClose className="h-8 w-8" />
              </button>
            </div>

            {/* Content */}
            <div className="grid md:grid-cols-2 gap-8 p-6 overflow-y-auto">
              {/* Left Column: Customer & Order Info */}
              <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-xl shadow-md">
  <h3 className="text-2xl font-semibold mb-4 text-gray-800">Customer Information</h3>
  <div className="space-y-3">
    <InfoItem icon={<FiUser />} label="Name" value={order.customerName} />
    <InfoItem icon={<FiMail />} label="Email" value={order.email} />
    <InfoItem icon={<FiPhone />} label="Phone" value={order.phone} />
    <InfoItem icon={<FiMapPin />} label="Address" value={order.address} />

          {/* Recipient Information */}
          {((order.recipientName && order.recipientName !== order.customerName) ||
            (order.customer?.recipientName && order.customer?.recipientName !== order.customer?.customerName)) && (
            <>
              <div className="mt-6 mb-3">
                <h4 className="text-lg font-semibold text-gray-800 border-b pb-2">Paying for Someone</h4>
              </div>
              <InfoItem 
                icon={<FiUser />} 
                label="Recipient Name" 
                value={order.customer?.recipientName || order.recipientName} 
              />
              {(order.customer?.recipientPhone || order.recipientPhone) && (
                <InfoItem 
                  icon={<FiPhone />} 
                  label="Recipient Phone" 
                  value={order.customer?.recipientPhone || order.recipientPhone} 
                />
              )}
                      </>
                    )}
                    {/* <InfoItem icon={<FiMail />} label="Email" value={order.email} />
                    <InfoItem icon={<FiPhone />} label="Phone" value={order.phone} />
                    <InfoItem icon={<FiMapPin />} label="Address" value={order.address} /> */}
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl shadow-md">
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">Delivery Details</h3>
                  <div className="space-y-3">
                    <InfoItem icon={<FiMapPin />} label="Branch" value={order.branchName} />
                    <InfoItem icon={<FiPackage />} label="Order Type" value={formattedOrderType} />
                    <InfoItem icon={<FiMapPin />} label="Geo. Location" value={getDeliveryLocation()} />
                    <InfoItem  label="Delivery Method" value={getDeliveryMethod()} />
                    <InfoItem label="Reference" value={order.paymentReference} />
                  </div>
                </div>

                {/* Payment Details Section */}
                <div className="bg-gray-50 p-6 rounded-xl shadow-md">
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">Payment Details</h3>
                  <div className="space-y-3">
                    {order.paymentDetails?.authorization && (
                      <>
                        <InfoItem 
                          icon={<FiCreditCard />} 
                          label="Card Brand" 
                          value={order.paymentDetails.authorization.brand?.toUpperCase() || 'N/A'} 
                        />
                        <InfoItem 
                          icon={<FiCreditCard />} 
                          label="Payment Channel" 
                          value={order.paymentDetails.channel?.toUpperCase() || 'N/A'} 
                        />
                        <InfoItem 
                          icon={<FiCreditCard />} 
                          label="Bank" 
                          value={order.paymentDetails.authorization.bank?.toUpperCase() || 'N/A'} 
                        />
                        <InfoItem 
                          icon={<FiCreditCard />} 
                          label="Card Type" 
                          value={order.paymentDetails.authorization.card_type?.toUpperCase() || 'N/A'} 
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Order Items & Summary */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-xl shadow-md">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-semibold text-gray-800">Order Items</h3>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {(order.items || []).map((item, index) => (
                      <div key={index} className="flex justify-between border-b pb-3 last:border-b-0">
                        <div>
                          <span className="font-medium text-gray-800">{item.name}</span>
                          {item.specifications && (
                            <span className="text-sm text-gray-500 block mt-1">
                              Note: {item.specifications}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-medium">{item.quantity} x {formatPrice(item.price)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl shadow-md">
                  <h3 className="text-2xl font-semibold mb-4 text-gray-800">Order Summary</h3>
                  <div className="space-y-2">
                    <SummaryItem label="Subtotal" value={formatPrice(totalPrice)} />
                    <SummaryItem label="Delivery Fee" value={formatPrice(deliveryPrice)} />
                    <SummaryItem label="Total" value={formatPrice(finalAmount)} isBold />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-500 mb-4">
                Order placed on: {order.createdAt ? formatDate(order.createdAt) : 'Date not available'}
              </div>
              <div className="flex flex-wrap gap-4">
                <ActionButton
                  onClick={handlePrintInvoice}
                  disabled={isLoading}
                  icon={<IoMdPrint />}
                  label="Print Invoice"
                  className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                />
                {order.status !== 'processing' && (
                  <ActionButton
                    onClick={() => handleStatusUpdate('processing')}
                    disabled={isLoading}
                    icon={<FiPackage />}
                    label="Processing"
                    className="bg-blue-500 text-white hover:bg-blue-600"
                  />
                )}
                {order.status !== 'out_for_delivery' && (
                  <ActionButton
                    onClick={() => handleStatusUpdate('out_for_delivery')}
                    disabled={isLoading}
                    icon={<FiTruck />}
                    label="Out for Delivery"
                    className="bg-purple-500 text-white hover:bg-purple-600"
                  />
                )}
                {order.status !== 'delivered' && (
                  <ActionButton
                    onClick={() => handleStatusUpdate('delivered')}
                    disabled={isLoading}
                    icon={<IoMdCheckmark />}
                    label="Delivered"
                    className="bg-indigo-500 text-white hover:bg-indigo-600"
                  />
                )}
                {order.status !== 'completed' && (
                  <ActionButton
                    onClick={() => onMarkAsCompleted(order.id)}
                    disabled={isLoading}
                    icon={<IoMdCheckmark />}
                    label="Mark as Completed"
                    className="bg-green-500 text-white hover:bg-green-600"
                  />
                )}
                <ActionButton
                  onClick={onClose}
                  disabled={isLoading}
                  label="Close"
                  className="bg-gray-200 text-gray-800 hover:bg-gray-300"
                />
              </div>
            </div>

            {/* Hidden Invoice Component */}
            <div className="hidden">
              <Invoice order={order} />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center">
    <span className="text-gray-500 mr-2">{icon}</span>
    <span className="font-medium text-gray-700 mr-2">{label}:</span>
    <span className="text-gray-900">{value}</span>
  </div>
);

const SummaryItem = ({ label, value, isBold = false }) => (
  <div className={`flex justify-between ${isBold ? 'font-bold text-lg border-t pt-2' : ''}`}>
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

const ActionButton = ({ onClick, disabled, icon, label, className }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg transition-colors flex items-center ${className} ${
      disabled ? 'opacity-50 cursor-not-allowed' : ''
    }`}
  >
    {icon && <span className="mr-2">{icon}</span>}
    {label}
  </button>
);

export default OrderDetailsModal;