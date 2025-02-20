// config/firebase.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// تكوين Firebase الخاص بمشروعك
const firebaseConfig = {
  apiKey: "AIzaSyBwEayv-FY2T8Qyzu_Levo6PBzi_quM5ws",
  authDomain: "e-schoolbus-ece93.firebaseapp.com",
  projectId: "e-schoolbus-ece93",
  storageBucket: "e-schoolbus-ece93.firebasestorage.app",
  messagingSenderId: "303329698584",
  appId: "1:303329698584:web:2540615b1e98507a18f46d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Authentication
const auth = getAuth(app);

// Initialize Messaging
const messaging = getMessaging(app);

// تصدير Firestore وAuthentication وMessaging
export { db, auth, messaging };