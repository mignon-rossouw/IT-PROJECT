// All firebase code will go here.

// --------- Firebase Initialization --------- //
  // Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import { getDatabase } from "firebase/database";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-storage.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
const storage = getStorage(app);

export const auth = getAuth(app);
export const db = getDatabase(app);
// ---------------------------------------- //