importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "AIzaSyDkchm_HbughOYINcdvjOM1D7dSxp4z86o",
  authDomain: "gashifamily.firebaseapp.com",
  projectId: "gashifamily",
  storageBucket: "gashifamily.firebasestorage.app",
  messagingSenderId: "799907764373",
  appId: "1:799907764373:web:924055a4a18a19505c639c"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('Njoftim në prapavijë: ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon-192.png'
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});
