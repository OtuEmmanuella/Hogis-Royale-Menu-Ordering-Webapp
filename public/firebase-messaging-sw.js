importScripts('https://www.gstatic.com/firebasejs/10.12.3/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.3/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyCBGR8OTOvTsR6_nzodtEbUgjAkLTFIDxs",
  authDomain: "hogis-royale-menu.firebaseapp.com",
  projectId: "hogis-royale-menu",
  storageBucket: "hogis-royale-menu.appspot.com",
  messagingSenderId: "896400163877",
  appId: "1:896400163877:web:155f9d7aaefebd82b2ebcc",
  measurementId: "G-VFC1W71M3T"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/Hogis.jpg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});