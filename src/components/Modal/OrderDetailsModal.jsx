import React from 'react';
import { IoMdClose, IoMdCheckmark } from 'react-icons/io';

const OrderDetailsModal = ({ isOpen, onClose, onMarkAsCompleted, order }) => {
  if (!isOpen || !order) return null;

  const formatPrice = (price) => {
    return `₦${Number(price || 0).toLocaleString('en-NG', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    })}`;
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate total and subtotal
  const totalPrice = (order.items || []).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryPrice = order.deliveryPrice || 0;
  const finalAmount = totalPrice + deliveryPrice;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Order Details</h2>
            <p className="text-sm text-gray-500 mt-1">Order #{order.id}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <IoMdClose className="h-8 w-8" />
          </button>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-8 p-6 overflow-y-auto">
          {/* Left Column: Customer & Order Info */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Customer Information</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="font-medium w-24">Name:</span>
                  <span>{order.customerName}</span>
                </div>
                {order.recipientName && order.recipientName !== order.customerName && (
                  <div className="flex items-center">
                    <span className="font-medium w-24">Recipient:</span>
                    <span>{order.recipientName}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <span className="font-medium w-24">Email:</span>
                  <span>{order.email}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-24">Phone:</span>
                  <span>{order.phone}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-24">Address:</span>
                  <span>{order.address}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-24">City:</span>
                  <span>{order.city}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Delivery Details</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="font-medium w-24">Branch:</span>
                  <span>{order.branchName}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-24">Option:</span>
                  <span>{order.deliveryOption}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium w-24">Reference:</span>
                  <span>{order.paymentReference}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Order Items & Summary */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Order Items</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <div className="space-y-4">
                {(order.items || []).map((item, index) => (
                  <div key={index} className="flex justify-between border-b pb-2 last:border-b-0">
                    <div>
                      <span className="font-medium">{item.name}</span>
                      {item.specifications && (
                        <span className="text-sm text-gray-500 block">
                          Note: {item.specifications}
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span>{item.quantity} x {formatPrice(item.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>{formatPrice(deliveryPrice)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>{formatPrice(finalAmount)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Order placed on: {order.createdAt.toLocaleString()}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
            {order.status !== 'completed' && (
              <button
                onClick={() => onMarkAsCompleted(order.id)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
              >
                <IoMdCheckmark className="mr-2" />
                Mark as Completed
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;