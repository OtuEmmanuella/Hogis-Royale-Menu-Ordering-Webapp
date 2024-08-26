import React, { useState, useEffect } from 'react';
import { db } from '../Firebase/FirebaseConfig';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ManageNotifications = () => {
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationBody, setNotificationBody] = useState('');
  const [notificationCategory, setNotificationCategory] = useState('All');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      setUsers(userSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchUsers();
  }, []);

  const sendNotification = async () => {
    if (!notificationTitle.trim() || !notificationBody.trim()) {
      toast.error('Please enter both a title and a message');
      return;
    }

    try {
      const notification = {
        title: notificationTitle,
        body: notificationBody,
        category: notificationCategory,
        timestamp: new Date(),
        read: false,
      };

      for (const user of users) {
        const userNotificationsRef = collection(db, 'users', user.id, 'notifications');
        await addDoc(userNotificationsRef, notification);
      }

      toast.success('Notification sent successfully!');
      setNotificationTitle('');
      setNotificationBody('');
      setNotificationCategory('All');
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification');
    }
  };

  return (
    <div className="manage-notifications bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <ToastContainer />
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Manage Notifications</h1>
        </div>
        <div className="p-6 sm:p-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Notification Title
              </label>
              <input
                id="title"
                type="text"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
                placeholder="Enter notification title..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-1">
                Notification Message
              </label>
              <textarea
                id="body"
                value={notificationBody}
                onChange={(e) => setNotificationBody(e.target.value)}
                placeholder="Enter notification message..."
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                value={notificationCategory}
                onChange={(e) => setNotificationCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="All">All</option>
                <option value="Job Alerts">Job Alerts</option>
                <option value="Promotions">Promotions</option>
                <option value="Events">Events</option>
              </select>
            </div>
            <div>
              <button
                onClick={sendNotification}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300"
              >
                Send Notification
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageNotifications;