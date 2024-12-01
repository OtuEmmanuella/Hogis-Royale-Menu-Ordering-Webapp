import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../Firebase/FirebaseConfig';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { formatDistanceToNow, format } from 'date-fns';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const CustomerInquiriesPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const inquiriesRef = collection(db, 'customerInquiries');
        const feedbacksRef = collection(db, 'feedbacks');
        const inquiriesQuery = query(inquiriesRef, orderBy('createdAt', 'desc'));
        const feedbacksQuery = query(feedbacksRef, orderBy('createdAt', 'desc'));

        const [inquiriesSnapshot, feedbacksSnapshot] = await Promise.all([
          getDocs(inquiriesQuery),
          getDocs(feedbacksQuery)
        ]);

        const inquiriesData = inquiriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'inquiry' }));
        const feedbacksData = feedbacksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'feedback' }));

        setData([...inquiriesData, ...feedbacksData].sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate()));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("An error occurred while fetching data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const renderStatus = (status) => {
    const statusClasses = {
      resolved: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      default: 'bg-red-100 text-red-800'
    };
    return `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[status] || statusClasses.default}`;
  };

  const renderRating = (rating) => {
    const emojis = ['☹️', '😐', '🙂', '😊', '😄'];
    return emojis[rating - 1] || '❓';
  };

  const formatDate = (date) => {
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    let relativeTime;
    if (diffInDays === 0) {
      relativeTime = 'Today';
    } else if (diffInDays === 1) {
      relativeTime = 'Yesterday';
    } else {
      relativeTime = formatDistanceToNow(date, { addSuffix: true });
    }

    const timeString = date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });

    const fullDate = format(date, 'MMMM d, yyyy');

    return `${relativeTime} (${fullDate}) at ${timeString}`;
  };

  const paginatedData = useMemo(() => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return data.slice(indexOfFirstItem, indexOfLastItem);
  }, [data, currentPage, itemsPerPage]);

  const pageNumbers = useMemo(() => {
    const totalPages = Math.ceil(data.length / itemsPerPage);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [data.length, itemsPerPage]);

  const dataInsights = useMemo(() => {
    const totalFeedbacks = data.filter(item => item.type === 'feedback').length;
    const totalInquiries = data.filter(item => item.type === 'inquiry').length;
    const feedbacksByBranch = data.reduce((acc, item) => {
      if (item.type === 'feedback' && item.branch) {
        acc[item.branch] = (acc[item.branch] || 0) + 1;
      }
      return acc;
    }, {});
    const averageRating = data.reduce((sum, item) => sum + (item.rating || 0), 0) / totalFeedbacks;

    return {
      totalFeedbacks,
      totalInquiries,
      feedbacksByBranch,
      averageRating: averageRating.toFixed(2)
    };
  }, [data]);

  const pieChartData = useMemo(() => ({
    labels: ['Inquiries', 'Feedbacks'],
    datasets: [
      {
        data: [dataInsights.totalInquiries, dataInsights.totalFeedbacks],
        backgroundColor: ['rgba(54, 162, 235, 0.8)', 'rgba(255, 99, 132, 0.8)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1,
      },
    ],
  }), [dataInsights]);

  const barChartData = useMemo(() => ({
    labels: Object.keys(dataInsights.feedbacksByBranch),
    datasets: [
      {
        label: 'Feedbacks per Branch',
        data: Object.values(dataInsights.feedbacksByBranch),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  }), [dataInsights]);

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Customer Feedback Insights',
      },
    },
    
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Customer Feedback and Inquiries</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Customer Feedback and Inquiries Dashboard</h1>
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading data...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">Total Feedbacks</h2>
                <p className="text-3xl font-bold text-blue-600">{dataInsights.totalFeedbacks}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">Total Inquiries</h2>
                <p className="text-3xl font-bold text-green-600">{dataInsights.totalInquiries}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">Average Rating</h2>
                <p className="text-3xl font-bold text-yellow-600">{dataInsights.averageRating}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">Total Interactions</h2>
                <p className="text-3xl font-bold text-purple-600">{data.length}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Data Distribution</h2>
                <div className="w-full h-64">
                  <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Feedbacks per Branch</h2>
                <div className="w-full h-64">
                  <Bar data={barChartData} options={barChartOptions} />
                </div>
              </div>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <ul className="divide-y divide-gray-200">
                {paginatedData.map((item) => (
                  <li key={item.id} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <p className="text-sm font-medium text-indigo-600 truncate">
                            {item.subject || 'Feedback'}
                          </p>
                          {item.branch && (
                            <p className="text-xs text-gray-500 mt-1">
                              Branch: {item.branch}
                            </p>
                          )}
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          {item.status ? (
                            <p className={renderStatus(item.status)}>{item.status}</p>
                          ) : (
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Feedback
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 sm:flex sm:justify-between">
                        <div className="sm:flex flex-col">
                          <p className="flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                            {item.customerName || item.name}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                            </svg>
                            {item.email}
                          </p>
                          <p className="mt-2 flex items-center text-sm text-gray-500">
                            <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {formatDate(item.createdAt.toDate())}
                          </p>
                        </div>
                        {item.rating && (
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            Rating: {renderRating(item.rating)} ({item.rating}/5)
                          </p>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-gray-500">{item.message || item.comment}</p>
                      {item.suggestions && (
                        <p className="mt-1 text-sm text-gray-500">
                          Suggestions: {item.suggestions.join(', ')}
                        </p>
                      )}
                      {item.photoURLs && item.photoURLs.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {item.photoURLs.map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`Feedback ${index + 1}`}
                              className="max-w-full h-auto rounded-lg shadow-md"
                              style={{ maxHeight: '200px', maxWidth: '200px' }}
                              onError={(e) => {
                                console.error("Image failed to load:", e.target.src);
                                e.target.src = "https://via.placeholder.com/200x150?text=Image+Not+Found";
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 flex justify-center">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                {pageNumbers.map((number) => (
                  <button
                    key={number}
                    onClick={() => setCurrentPage(number)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === number
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </nav>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CustomerInquiriesPage;

