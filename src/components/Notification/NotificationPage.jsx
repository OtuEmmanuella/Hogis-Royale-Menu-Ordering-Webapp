import React, { useState, useEffect } from 'react';
import { auth, db } from '../Firebase/FirebaseConfig';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import { BiCheckDouble, BiTrash, BiDotsVerticalRounded } from 'react-icons/bi';
import { BsBellFill, BsPinAngle } from 'react-icons/bs';
import './NotificationPage.css';

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categoryCount, setCategoryCount] = useState({
    All: 0,
    'Job Alerts': 0,
    Promotions: 0,
    Events: 0,
  });
  const [showKebabMenu, setShowKebabMenu] = useState({});
  const [pinnedNotifications, setPinnedNotifications] = useState([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const q = query(
          collection(db, `users/${user.uid}/notifications`),
          orderBy('timestamp', 'desc')
        );

        const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
          const notificationList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            title: doc.data().title,
            body: doc.data().body,
            category: doc.data().category,
            read: doc.data().read,
            pinToTop: doc.data().pinToTop || false,
            timestamp: doc.data().timestamp,
          }));
          setNotifications(notificationList);
          updateCategoryCount(notificationList);
          handleFilteredNotifications(notificationList, selectedCategory);
        });

        return () => unsubscribeSnapshot();
      }
    });

    return () => unsubscribe();
  }, [selectedCategory]);

  const updateCategoryCount = (notifications) => {
    const count = {
      All: notifications.length,
      'Job Alerts': 0,
      Promotions: 0,
      Events: 0,
    };

    notifications.forEach((notification) => {
      switch (notification.category) {
        case 'Job Alerts':
          count['Job Alerts']++;
          break;
        case 'Promotions':
          count.Promotions++;
          break;
        case 'Events':
          count.Events++;
          break;
      }
    });

    setCategoryCount(count);
  };

  const handleFilteredNotifications = (notifications, category = 'All') => {
    let filtered = notifications;
    if (category !== 'All') {
      filtered = notifications.filter((notification) => notification.category === category);
    }

    const pinnedNotifications = filtered.filter((n) => n.pinToTop);
    const unpinnedNotifications = filtered.filter((n) => !pinnedNotifications.includes(n));

    setFilteredNotifications([...pinnedNotifications, ...unpinnedNotifications]);
    setPinnedNotifications(pinnedNotifications);
  };

  const markAsRead = async (notificationId, notification) => {
    const user = auth.currentUser;
    if (user) {
      const notificationRef = doc(db, `users/${user.uid}/notifications`, notificationId);
      await updateDoc(notificationRef, { read: true });
      toast.success('Notification marked as read!');

      if (window.Notification && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.body,
          icon: '/Hogis.jpg',
        });
      }
    }
  };

  const deleteNotification = async (notificationId) => {
    const user = auth.currentUser;
    if (user) {
      const notificationRef = doc(db, `users/${user.uid}/notifications`, notificationId);
      await deleteDoc(notificationRef);
      toast.success('Notification deleted!');
    }
  };

  const scheduleReminder = async (notificationId, notification) => {
    const user = auth.currentUser;
    if (user) {
      try {
        if (window.Notification && Notification.permission === 'granted') {
          new Notification(`Reminder: ${notification.title}`, {
            body: notification.body,
            icon: '/Hogis.jpg',
            tag: notificationId,
          });
        } else if (Notification.permission !== 'denied') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            new Notification(`Reminder: ${notification.title}`, {
              body: notification.body,
              icon: '/Hogis.jpg',
              tag: notificationId,
            });
          }
        }
      } catch (error) {
        console.error('Error scheduling notification:', error);
        toast.error('Error scheduling reminder');
      }
    }
  };

  const pinNotificationToTop = async (notificationId, notification) => {
    const user = auth.currentUser;
    if (user) {
      const notificationRef = doc(db, `users/${user.uid}/notifications`, notificationId);
      await updateDoc(notificationRef, { pinToTop: true });
      handleFilteredNotifications(notifications, selectedCategory);
      toast.success('Notification pinned to the top!');
    }
  };

  const unpinNotificationFromTop = async (notificationId) => {
    const user = auth.currentUser;
    if (user) {
      const notificationRef = doc(db, `users/${user.uid}/notifications`, notificationId);
      await updateDoc(notificationRef, { pinToTop: false });
      handleFilteredNotifications(notifications, selectedCategory);
      toast.success('Notification unpinned from the top!');
    }
  };

  const toggleKebabMenu = (notificationId) => {
    setShowKebabMenu((prevState) => ({
      ...prevState,
      [notificationId]: !prevState[notificationId],
    }));
  };

  const handleKebabMenuOption = (notificationId, notification) => {
    if (notification.pinToTop) {
      unpinNotificationFromTop(notificationId);
    } else {
      pinNotificationToTop(notificationId, notification);
    }
    toggleKebabMenu(notificationId);
  };

  const handleNotificationClick = (notificationId, notification) => {
    if (!notification.read) {
      markAsRead(notificationId, notification);
    }
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notificationTime = timestamp.toDate();
    const diffInDays = Math.floor((now - notificationTime) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return notificationTime.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
      });
    }
  };

  return (
    <div className="notification-page">
      <h1 className="not-title">
        Notifications
        <div className="kebab-menu">
          <BiDotsVerticalRounded className="kebab-icon" />
          {showKebabMenu.global && (
            <div className="kebab-menu-options">
              {/* Add global kebab menu options here */}
            </div>
          )}
        </div>
      </h1>
      <div className="notification-controls">
        <div className="notification-options">
          <div
            className={`option ${selectedCategory === 'All' ? 'selected' : ''}`}
            onClick={() => {
              setSelectedCategory('All');
              handleFilteredNotifications(notifications, 'All');
            }}
          >
            <span>All</span>
            <span className="count">{categoryCount.All}</span>
          </div>
          <div
            className={`option ${selectedCategory === 'Job Alerts' ? 'selected' : ''}`}
            onClick={() => {
              setSelectedCategory('Job Alerts');
              handleFilteredNotifications(notifications, 'Job Alerts');
            }}
          >
            <span>Job Alerts</span>
            <span className="count">{categoryCount['Job Alerts']}</span>
          </div>
          <div
            className={`option ${selectedCategory === 'Promotions' ? 'selected' : ''}`}
            onClick={() => {
              setSelectedCategory('Promotions');
              handleFilteredNotifications(notifications, 'Promotions');
            }}
          >
            <span>Promotions</span>
            <span className="count">{categoryCount.Promotions}</span>
          </div>
          <div
            className={`option ${selectedCategory === 'Events' ? 'selected' : ''}`}
            onClick={() => {
              setSelectedCategory('Events');
              handleFilteredNotifications(notifications, 'Events');
            }}
          >
            <span>Events</span>
            <span className="count">{categoryCount.Events}</span>
          </div>
        </div>
      </div>
      <div className="notification-list">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              onDoubleClick={() => handleNotificationClick(notification.id, notification)}
            >
              <div className="notification-header">
                <img src="/Hogis.jpg" alt="User Avatar" className="user-avatar" />
                <h3 className="notification-title">{notification.title}</h3>
                {notification.read && <BiCheckDouble className="read-icon" />}
                {notification.pinToTop && <BsPinAngle className="pinned-icon" />}
                <div className="kebab-menu">
                  <BiDotsVerticalRounded
                    className="kebab-icon"
                    onClick={() => toggleKebabMenu(notification.id)}
                  />
                  {showKebabMenu[notification.id] && (
                    <div className="kebab-menu-options">
                      <div
                        className="kebab-option"
                        onClick={() => {
                          deleteNotification(notification.id);
                          toggleKebabMenu(notification.id);
                        }}
                      >
                        <BiTrash className="kebab-icon" />
                        <span>Delete</span>
                      </div>
                      <div
                        className="kebab-option"
                        onClick={() => {
                          scheduleReminder(notification.id, notification);
                          toggleKebabMenu(notification.id);
                        }}
                      >
                        <BsBellFill className="kebab-icon" />
                        <span>Set Reminder</span>
                      </div>
                      <div
                        className="kebab-option"
                        onClick={() => handleKebabMenuOption(notification.id, notification)}
                      >
                        <BsPinAngle className="kebab-icon" />
                        <span>{notification.pinToTop ? 'Unpin from Top' : 'Pin to Top'}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <p className="notification-body">{notification.body}</p>
              <span className="notification-time">{formatTimestamp(notification.timestamp)}</span>
            </div>
          ))
        ) : (
          <p className="no-notifications">No notifications in this category.</p>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default NotificationPage;