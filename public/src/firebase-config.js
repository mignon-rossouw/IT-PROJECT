// firebase-config.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';

// Your web app's Firebase configuration
// Get these values from Firebase Console > Project Settings
const firebaseConfig = {
  apiKey: "AIzaSyDriwBWl4ZmjtYtLHDQTL7wXU8YCjohYQU",
  authDomain: "fund-my-future-d3697.firebaseapp.com",
  databaseURL: "https://fund-my-future-d3697-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "fund-my-future-d3697",
  storageBucket: "fund-my-future-d3697.firebasestorage.app",
  messagingSenderId: "148513429651",
  appId: "1:148513429651:web:5f930f9950076a8eeed566",
  measurementId: "G-W96VT1X1WZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;