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
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{order.id}</div>
                        <div className="text-sm text-gray-500">{order.branchName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.createdAt.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatPrice(order.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
                currentPage === Math.ceil(filteredOrders.length / ordersPerPage) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
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
                {[...Array(Math.ceil(filteredOrders.length / ordersPerPage)).keys()].map((number) => {
                  const pageNumber = number + 1;
                  const isCurrentPage = currentPage === pageNumber;
                  const isNearCurrentPage = Math.abs(currentPage - pageNumber) <= 2;
                  const isFirstPage = pageNumber === 1;
                  const isLastPage = pageNumber === Math.ceil(filteredOrders.length / ordersPerPage);

                  if (isCurrentPage || isNearCurrentPage || isFirstPage || isLastPage) {
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => paginate(pageNumber)}
                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                          isCurrentPage
                            ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    (pageNumber === currentPage - 3 && currentPage > 4) ||
                    (pageNumber === currentPage + 3 && currentPage < Math.ceil(filteredOrders.length / ordersPerPage) - 3)
                  ) {
                    return (
                      <span key={pageNumber} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
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

