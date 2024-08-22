import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './Routes/router';
import { generateToken, messaging, initializeFirebaseMessaging, auth } from './components/Firebase/FirebaseConfig';
import { onMessage } from 'firebase/messaging';
import { onAuthStateChanged } from 'firebase/auth';

const App = () => {
  const [fcmToken, setFcmToken] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        initializeFCM();
      } else {
        setFcmToken(null);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  const initializeFCM = async () => {
    try {
      const supported = await initializeFirebaseMessaging();
      if (supported) {
        const token = await generateToken();
        if (token) {
          console.log("Token generated:", token);
          setFcmToken(token);
          // TODO: Send this token to your server
          // await sendTokenToServer(token);
        }
      } else {
        console.log("Your browser does not support notifications.");
      }
    } catch (error) {
      console.error("Error generating token:", error);
    }
  };

  useEffect(() => {
    if (user && messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Received foreground message:', payload);
        // TODO: Handle the message in the UI (e.g., show a custom notification)
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [user, messaging]);

  // Function to update the token if it changes
  const updateToken = async () => {
    if (user) {
      const newToken = await generateToken();
      if (newToken && newToken !== fcmToken) {
        setFcmToken(newToken);
        // TODO: Update token on your server
        // await updateTokenOnServer(newToken);
      }
    }
  };

  return (
    <Router>
      <div className="App">
        <AppRoutes />
      </div>
    </Router>
  );
};

export default App;