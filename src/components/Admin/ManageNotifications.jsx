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
    <div className="manage-notifications">
      <ToastContainer />
      <h1>Manage Notifications</h1>
      <div className="notification-form">
        <input
          type="text"
          value={notificationTitle}
          onChange={(e) => setNotificationTitle(e.target.value)}
          placeholder="Enter notification title..."
        />
        <textarea
          value={notificationBody}
          onChange={(e) => setNotificationBody(e.target.value)}
          placeholder="Enter notification message..."
        ></textarea>
        <select
          value={notificationCategory}
          onChange={(e) => setNotificationCategory(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Job Alerts">Job Alerts</option>
          <option value="Promotions">Promotions</option>
          <option value="Events">Events</option>
        </select>
        <button onClick={sendNotification}>Send Notification</button>
      </div>
    </div>
  );
};

export default ManageNotifications;