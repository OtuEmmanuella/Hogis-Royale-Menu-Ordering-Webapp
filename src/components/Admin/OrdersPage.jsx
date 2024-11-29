import React, { useState, useEffect } from 'react';
import { db } from '../Firebase/FirebaseConfig';
import { collection, query, orderBy, limit, getDocs, where} from 'firebase/firestore';
import { Clock, User, CreditCard, Store, Truck } from 'lucide-react';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('all');

  const branches = {
    '1': 'Hogis Royale And Apartment',
    '2': 'Hogis Luxury Suites',
    '3': 'Hogis Exclusive Resorts'
  };

   // Enhanced status mapping function
   const mapPaymentStatusToOrderStatus = (status, paymentStatus) => {
    const statusMap = {
      'pending': {
        'paid': 'success',
        'failed': 'failed',
        'default': 'pending'
      },
      'processing': {
        'paid': 'completed',
        'failed': 'failed',
        'default': 'processing'
      }
    };

    // First, check if there's a direct mapping for the current base status
    const baseStatusMap = statusMap[status] || statusMap['pending'];
    
    // Return mapped status or default to the current status
    return baseStatusMap[paymentStatus] || baseStatusMap['default'];
  };

  const formatOrderData = (doc) => {
    try {
      const data = doc.data();
      const branchId = data.branchId?.toString() || 'unknown';

        // Determine the final order status
        const finalStatus = mapPaymentStatusToOrderStatus(
          data.status || 'pending', 
          data.paymentStatus || 'pending'
        );
      
      // Log the branch information for debugging
      console.log('Order branch info:', {
        orderId: doc.id,
        branchId: branchId,
        rawBranchId: data.branchId,
        branchName: branches[branchId]
      });

      return {
        id: doc.id,
        customerName: data.customer?.name || 'Guest User',
        email: data.customer?.email || 'N/A',
        phone: data.customer?.phone || 'N/A',
        total: parseFloat(data.totalAmount) || 0,
        createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
        status: finalStatus,
        paymentReference: data.paymentReference || 'N/A',
        branchId: branchId,
        branchName: branches[branchId] || 'Unknown Branch',
        items: data.items || [],
        deliveryOption: data.deliveryOption || 'N/A',
        deliveryPrice: data.deliveryPrice || 0,
        paymentDetails: data.paymentDetails || null
      };
    } catch (err) {
      console.error(`Error formatting order ${doc.id}:`, err);
      return null;
    }
  };

  const getStatusStyle = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersRef = collection(db, 'orders');
        let q = query(ordersRef, orderBy('createdAt', 'desc'), limit(50));
        
        if (selectedBranch !== 'all') {
          q = query(ordersRef, 
            where('branchId', '==', selectedBranch),
            orderBy('createdAt', 'desc'),
            limit(50)
          );
        }

        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs
          .map(formatOrderData)
          .filter(order => order !== null);
        
        // Log the processed orders for debugging
        console.log('Processed orders:', ordersData);
        
        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [selectedBranch]);


  const formatPrice = (price) => {
    return `₦${price.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg max-w-md">
            <h3 className="text-lg font-medium mb-2">Error Loading Orders</h3>
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <div className="flex items-center gap-4">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-4"
            >
              <option value="all">All Branches</option>
              {Object.entries(branches).map(([id, name]) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
            <span className="text-gray-500">
              Total Orders: {orders.length}
            </span>
          </div>
        </div>
        
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-600">No orders found.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-4">
            <ul className="divide-y divide-gray-200">
              {orders.map((order) => (
                <li key={order.id} className="hover:bg-gray-50 transition-colors">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        Order #{order.id}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(order.status)}`}>
                          {order.status}
                        </p>
                      </div>
                      {order.paymentDetails && (
                        <div className="mt-2 text-sm text-gray-500">
                          <p>Payment Method: {order.paymentDetails.channel || 'N/A'}</p>
                          <p>Payment Gateway Response: {order.paymentDetails.gateway_response || 'N/A'}</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          <User className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {order.customerName}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <Clock className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {order.createdAt.toLocaleString()}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <CreditCard className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        {formatPrice(order.total)}
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <p className="flex items-center text-sm text-gray-500">
                        <Store className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        <span className="font-medium mr-1">Branch:</span> 
                        {order.branchName}
                      </p>
                      <p className="flex items-center text-sm text-gray-500">
                        <Truck className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        <span className="font-medium mr-1">Delivery:</span> 
                        {order.deliveryOption}
                        {order.deliveryPrice > 0 && ` (${formatPrice(order.deliveryPrice)})`}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;