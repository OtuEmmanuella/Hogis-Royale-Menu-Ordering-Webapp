import React, { useState, useEffect } from 'react';
import { db } from '../Firebase/FirebaseConfig';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { formatDistanceToNow, format } from 'date-fns';

const CustomerInquiriesPage = () => {
  const [inquiries, setInquiries] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch customer inquiries
        const inquiriesRef = collection(db, 'customerInquiries');
        const inquiriesQuery = query(inquiriesRef, orderBy('createdAt', 'desc'), limit(50));
        const inquiriesSnapshot = await getDocs(inquiriesQuery);
        const inquiriesData = inquiriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInquiries(inquiriesData);

        // Fetch feedbacks
        const feedbacksRef = collection(db, 'feedbacks');
        const feedbacksQuery = query(feedbacksRef, orderBy('createdAt', 'desc'), limit(50));
        const feedbacksSnapshot = await getDocs(feedbacksQuery);
        const feedbacksData = feedbacksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFeedbacks(feedbacksData);

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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Customer Feedback and Inquiries</h1>
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading data...</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {[...inquiries, ...feedbacks].sort((a, b) => b.createdAt - a.createdAt).map((item) => (
                <li key={item.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {item.subject || 'Feedback'}
                      </p>
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
        )}
      </div>
    </div>
  );
};

export default CustomerInquiriesPage;