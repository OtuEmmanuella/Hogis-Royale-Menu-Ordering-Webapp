import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from 'firebase/storage';
import { getAuth } from "firebase/auth";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

let messaging;

export const initializeFirebaseMessaging = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      const supported = await isSupported();
      if (supported) {
        messaging = getMessaging(app);
        console.log('Firebase Messaging initialized');
        return true;
      } else {
        console.warn("This browser doesn't support Firebase Cloud Messaging.");
        return false;
      }
    } catch (err) {
      console.error('Failed to register service worker:', err);
      return false;
    }
  } else {
    console.warn("This browser doesn't support service workers.");
    return false;
  }
};

export const generateToken = async () => {
  if (!messaging) {
    console.warn("Messaging is not supported on this browser.");
    return null;
  }
  try {
    console.log('Requesting notification permission...');
    const permission = await Notification.requestPermission();
    console.log('Permission:', permission);
    if (permission === 'granted') {
      console.log('Permission granted, getting token...');
      const currentToken = await getToken(messaging, { vapidKey: "BAaJSYaSnFBejdhv7h4w1lhED2LgK3k908rTe4sEMs6vb7aNqgTuWD7PFE7nGqgx6ZF3PxyY7CKQ-jgkUluBSxM" });
      if (currentToken) {
        console.log('FCM token:', currentToken);
        return currentToken;
      } else {
        console.log('No registration token available. Request permission to generate one.');
        return null;
      }
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) {
      console.warn("Messaging is not supported on this browser.");
      return resolve(null);
    }
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });

export { app, storage, db, auth, analytics, messaging };