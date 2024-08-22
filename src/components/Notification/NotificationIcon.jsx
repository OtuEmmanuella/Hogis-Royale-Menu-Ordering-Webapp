// components/Notification/NotificationIcon.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import { auth, db, initializeFirebaseMessaging } from '../Firebase/FirebaseConfig';
import { onMessage, getToken, getMessaging } from 'firebase/messaging';
import { collection, addDoc, serverTimestamp, onSnapshot, query, where } from 'firebase/firestore';
import { motion } from 'framer-motion';
import './NotificationIcon.css';

const NotificationIcon = () => {
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      console.log('Auth state changed:', currentUser ? currentUser.uid : 'No user');
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const setupMessaging = async () => {
      if (user) {
        try {
          const supported = await initializeFirebaseMessaging();
          if (supported) {
            const messaging = getMessaging();

            if ('Notification' in window) {
              const permission = await Notification.requestPermission();
              if (permission === 'granted') {
                console.log('Notification permission granted.');
                const token = await getToken(messaging, { vapidKey: "BAaJSYaSnFBejdhv7h4w1lhED2LgK3k908rTe4sEMs6vb7aNqgTuWD7PFE7nGqgx6ZF3PxyY7CKQ-jgkUluBSxM" });
                console.log('FCM Token:', token);

                onMessage(messaging, (payload) => {
                  console.log('Received foreground message:', payload);
                  setHasNewNotifications(true);

                  console.log('Attempting to add notification to Firestore');
                  addDoc(collection(db, `users/${user.uid}/notifications`), {
                    title: payload.notification.title,
                    body: payload.notification.body,
                    timestamp: serverTimestamp(),
                    read: false,
                  }).then((docRef) => {
                    console.log('Notification added to Firestore with ID:', docRef.id);
                  }).catch((error) => {
                    console.error('Error adding notification to Firestore:', error);
                  });
                });

                const q = query(collection(db, `users/${user.uid}/notifications`), where('read', '==', false));
                onSnapshot(q, (querySnapshot) => {
                  setHasNewNotifications(querySnapshot.size > 0);
                });
              } else {
                console.log('Unable to get permission to notify.');
              }
            } else {
              console.log('This browser does not support desktop notification');
            }
          }
        } catch (error) {
          console.error('Error setting up messaging:', error);
        }
      }
    };

    setupMessaging();
  }, [user]);

  const handleClick = () => {
    console.log('Notification icon clicked');
    setHasNewNotifications(false);
    navigate('/notifications');
  };

  const shakeVariants = {
    shake: {
      x: [-5, 5, -5, 5, 0],
      transition: {
        x: {
          duration: 0.5,
          ease: 'easeInOut',
          times: [0, 0.25, 0.5, 0.75, 1],
        },
      },
    },
  };

  return (
    <motion.div
      className="notification-icon"
      onClick={handleClick}
      animate={hasNewNotifications ? 'shake' : ''}
      variants={shakeVariants}
    >
      {hasNewNotifications && <div className="notification-badge">New</div>}
      <FaBell />
    </motion.div>
  );
};

export default NotificationIcon;