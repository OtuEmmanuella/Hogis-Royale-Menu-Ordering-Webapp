import React, { useState, useEffect } from 'react';
import { db } from '../Firebase/FirebaseConfig';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import OrderDetailsModal from '../Modal/OrderDetailsModal';
import OrderFilters from '../filters/OrderFilters';
import { filterOrders } from '../../utils/orderFilters';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);

  const branches = {
    '1': 'Hogis Royale And Apartment',
    '2': 'Hogis Luxury Suites',
    '3': 'Hogis Exclusive Resorts'
  };

  const formatOrderData = (doc) => {
    try {
      const data = doc.data();
      const branchId = data.branchId?.toString() || 'unknown';

      const customerInfo = {
        name: data.customer?.customerName || data.customer?.name || data.paymentDetails?.customer?.first_name || 'Guest User',
        email: data.customer?.email || data.paymentDetails?.customer?.email || 'N/A',
        phone: data.customer?.phone || data.paymentDetails?.customer?.phone || 'N/A',
        address: data.customer?.address || data.paymentDetails?.metadata?.address || 'N/A',
        city: data.customer?.city || data.paymentDetails?.metadata?.city || 'N/A',
        recipientName: data.customer?.recipientName || data.customer?.customerName || data.customer?.name || data.paymentDetails?.customer?.first_name || 'Guest User'
      };

      return {
        id: doc.id,
        customerName: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: customerInfo.address,
        city: customerInfo.city,
        recipientName: customerInfo.recipientName,
        total: parseFloat(data.totalAmount) || 0,
        createdAt: data.createdAt?.toDate() || new Date(),
        status: data.status || 'pending',
        paymentReference: data.paymentReference || 'N/A',
        branchId: branchId,
        branchName: branches[branchId] || 'Unknown Branch',
        items: data.items || [],
        deliveryOption: data.deliveryOption || 'N/A',
        deliveryPrice: data.deliveryPrice || 0,
        paymentDetails: data.paymentDetails || null,
        customer: data.customer || {}
      };
    } catch (err) {
      console.error(`Error formatting order ${doc.id}:`, err);
      return null;
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersRef = collection(db, 'orders');
        const querySnapshot = await getDocs(ordersRef);
        const ordersData = querySnapshot.docs
          .map(formatOrderData)
          .filter(order => order !== null)
          .sort((a, b) => b.createdAt - a.createdAt);
        
        setOrders(ordersData);
        setFilteredOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  useEffect(() => {
    const filtered = filterOrders(orders, {
      branch: selectedBranch,
      searchTerm,
      dateRange
    });
    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [orders, selectedBranch, searchTerm, dateRange]);

  const getStatusStyle = (status) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      success: 'bg-green-100 text-green-800',
      processing: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      paid: 'bg-green-100 text-green-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const formatPrice = (price) => {
    return `₦${price.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date()
      });

      // Update both orders and filteredOrders
      const updateOrderStatus = (orderList) => 
        orderList.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        );

      setOrders(updateOrderStatus);
      setFilteredOrders(updateOrderStatus);

      // Update the selectedOrder if it's the one being modified
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleMarkAsCompleted = async (orderId) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: 'completed',
        updatedAt: new Date()
      });

      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: 'completed' } : order
      ));

      handleCloseModal();
    } catch (error) {
      console.error("Error marking order as completed:", error);
    }
  };

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < Math.ceil(filteredOrders.length / ordersPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
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
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Orders</h1>
            <span className="text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
              Total Orders: {filteredOrders.length}
            </span>
          </div>
          
          <OrderFilters
            branches={branches}
            selectedBranch={selectedBranch}
            setSelectedBranch={setSelectedBranch}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
        </div>
        
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No orders found matching your filters.</p>
            <button 
              onClick={() => {
                setSelectedBranch('all');
                setSearchTerm('');
                setDateRange({ start: '', end: '' });
              }}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {currentOrders.map((order) => (
                  <li key={order.id} className="hover:bg-gray-50 transition-colors">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            Order #{order.id}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {order.branchName}
                          </p>
                        </div>
                       
                        <div className="ml-2 flex-shrink-0 flex items-center space-x-2">
                          <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(order.status)}`}>
                            {order.status}
                          </p>
                          <button
                            onClick={() => handleViewDetails(order)}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            {order.customerName}
                          </p>
                         
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {order.createdAt.toLocaleString()}
                          </p>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                            <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                          </svg>
                          {formatPrice(order.total)}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pagination controls */}
            <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
                    currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={nextPage}
                  disabled={currentPage === Math.ceil(filteredOrders.length / ordersPerPage)}
                  className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 ${
                    currentPage === Math.ceil(filteredOrders.length / ordersPerPage) ? 'opacity-50 cursor-not-allowed': 'hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstOrder + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastOrder, filteredOrders.length)}
                    </span>{' '}
                    of <span className="font-medium">{filteredOrders.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                        currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    {[...Array(Math.ceil(filteredOrders.length / ordersPerPage)).keys()].map((number) => (
                      <button
                        key={number + 1}
                        onClick={() => paginate(number + 1)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          currentPage === number + 1
                            ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                        }`}
                      >
                        {number + 1}
                      </button>
                    ))}
                    <button
                      onClick={nextPage}
                      disabled={currentPage === Math.ceil(filteredOrders.length / ordersPerPage)}
                      className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                        currentPage === Math.ceil(filteredOrders.length / ordersPerPage) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onMarkAsCompleted={handleMarkAsCompleted}
        onUpdateStatus={handleStatusUpdate}
        order={selectedOrder}
      />
    </div>
  );
};

export default OrdersPage;

