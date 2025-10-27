// firebase-config.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { getFunctions } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js';

const firebaseConfig = {
  apiKey: "AIzaSyA6ocGvYKnwjc-xmW4j6he-CuTr4je3gko",
  authDomain: "fund-my-future-47844.firebaseapp.com",
  databaseURL: "https://fund-my-future-47844-default-rtdb.firebaseio.com",
  projectId: "fund-my-future-47844",
  storageBucket: "fund-my-future-47844.firebasestorage.app",
  messagingSenderId: "581912293895",
  appId: "1:581912293895:web:03468061fae2124ac770a2",
  measurementId: "G-LFC0R1GBE1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);


//export { auth, db, storage, functions };