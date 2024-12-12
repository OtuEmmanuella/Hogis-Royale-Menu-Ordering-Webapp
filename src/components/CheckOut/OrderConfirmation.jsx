import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../Firebase/FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { CheckCircle, ArrowLeft, Bell } from 'lucide-react';
import { IoMdDownload } from 'react-icons/io';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [formattedOrderType, setFormattedOrderType] = useState('Unknown Type');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        if (orderDoc.exists()) {
          const orderData = { id: orderDoc.id, ...orderDoc.data() };
          setOrder(orderData);

          // Extract and format orderType
          if (orderData.paymentDetails?.metadata?.orderType) {
            setFormattedOrderType(formatOrderType(orderData.paymentDetails.metadata.orderType));
          } else {
            setFormattedOrderType('Unknown Type');
          }
        } else {
          setError('Order not found');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setError(error.message);
      }
      setLoading(false);
    };

    fetchOrder();
  }, [orderId]);

  const formatOrderType = (orderType) => {
    return orderType.replace(/_/g, ' ').toUpperCase(); // Example formatting logic
  };

  const downloadInvoice = async () => {
    if (!order || downloadingInvoice) return;

    setDownloadingInvoice(true);

    try {
      // Target the entire content container
      const input = document.getElementById('full-order-content');

      // Temporarily modify styles to ensure full content is captured
      const originalStyles = {
        width: input.style.width,
        padding: input.style.padding,
        backgroundColor: input.style.backgroundColor,
        overflowX: input.style.overflowX
      };

      // Adjust styles for PDF generation
      input.style.width = '210mm';
      input.style.maxWidth = 'none';
      input.style.padding = '20px';
      input.style.backgroundColor = 'white';
      input.style.overflowX = 'visible';

      // Generate high-quality canvas
      const canvas = await html2canvas(input, {
        scale: 3, // Increased scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
        removeContainer: true,
        letterRendering: true
      });

      // Restore original styles
      Object.keys(originalStyles).forEach(key => {
        input.style[key] = originalStyles[key];
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calculate image dimensions to fit PDF
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
      
      // Save PDF
      pdf.save(`Order_Confirmation_${order.id}.pdf`);
    } catch (error) {
      console.error('Error generating invoice:', error);
      alert('Failed to generate invoice. Please try again.');
    } finally {
      setDownloadingInvoice(false);
    }
  };

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
    <div className="min-h-screen bg-gray-50 py-8 sm:px-6 lg:px-8 text-sm">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
          <div id="full-order-content" className="p-1">
            <div className="text-center mb-8">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Order Confirmed!</h2>
              <p className="mt-2 text-2x text-gray-600">
                Thank you for your order. Your order ID is <b>#{order.id}</b>
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <div className="flex items-center">
                <Bell className="h-6 w-6 text-blue-500 mr-3" />
                <p className="text-blue-700 font-medium">
                  You'll be receiving a notification with your order details
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
              <dl className="mt-4 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Payment Channel</dt>
                  <dd className="text-sm text-gray-900 col-span-2">
                    {order.paymentDetails?.channel || 'Not Available'}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                  <dd className="text-sm text-gray-900 col-span-2">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {order.status}
                    </span>
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Payment Reference</dt>
                  <dd className="text-sm text-gray-900 col-span-2">
                    {order.paymentDetails?.reference || 'N/A'}
                  </dd>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <dt className="text-sm font-medium text-gray-500">Order Type</dt>
                  <dd className="text-sm text-gray-900 col-span-2">
                    {formattedOrderType}
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
                      ₦{(parseInt(item.price) * item.quantity).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900">Total Amount</h3>
              <p className="text-2xl font-bold text-green-600">
                ₦{order.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                to="/menu"
                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 text-sm font-medium text-white transition-all duration-300 ease-in-out transform bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-md hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:scale-105"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                <span>Return to Menu</span>
              </Link>
              <Link
                to="/order-history"
                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 text-sm font-medium text-white transition-all duration-300 ease-in-out transform bg-gradient-to-r from-blue-500 to-teal-400 rounded-lg shadow-md hover:from-blue-600 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:scale-105"
              >
                <span>Track your Order</span>
              </Link>
              <button 
                onClick={downloadInvoice}
                disabled={downloadingInvoice}
                className="w-full sm:w-auto flex items-center justify-center px-6 py-3 text-sm font-medium text-white transition-all duration-300 ease-in-out transform bg-gradient-to-r from-green-500 to-emerald-400 rounded-lg shadow-md hover:from-green-600 hover:to-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 hover:scale-105"
              >
                {downloadingInvoice ? 'Generating...' : (
                  <>
                    <IoMdDownload className="mr-2 h-5 w-5" />
                    <span>Download Invoice</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;