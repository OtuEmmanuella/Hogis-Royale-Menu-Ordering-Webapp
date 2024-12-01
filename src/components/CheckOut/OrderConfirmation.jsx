import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../Firebase/FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { CheckCircle, ArrowLeft, Bell } from 'lucide-react';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        if (orderDoc.exists()) {
          setOrder({ id: orderDoc.id, ...orderDoc.data() });
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Order not found</h2>
          <Link to="/menu" className="mt-4 text-indigo-600 hover:text-indigo-500">
            Return to Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
          <div className="text-center mb-8">
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
            <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Order Confirmed!</h2>
            <p className="mt-2 text-lg text-gray-600">
              Thank you for your order. Your order number is #{order.id}
            </p>
          </div>

          {/* New notification section */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
            <div className="flex items-center">
              <Bell className="h-6 w-6 text-blue-500 mr-3" />
              <p className="text-blue-700 font-medium">
                You'll be receiving a notification with your order details
              </p>
            </div>
          </div>

          {/* Existing order details */}
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-medium text-gray-900">Order Details</h3>
            <dl className="mt-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Order Status</dt>
                <dd className="text-sm text-gray-900 col-span-2">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {order.status}
                  </span>
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Delivery Address</dt>
                <dd className="text-sm text-gray-900 col-span-2">
                  {order.customer.address}, {order.customer.city}
                </dd>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                <dd className="text-sm text-gray-900 col-span-2">
                  ₦{order.totalAmount.toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>

          <div className="border-t border-gray-200 pt-8 mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
            <ul className="divide-y divide-gray-200">
              {order.items.map((item, index) => (
                <li key={index} className="py-4 flex justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex justify-center space-x-4">
            <Link
              to="/menu"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;