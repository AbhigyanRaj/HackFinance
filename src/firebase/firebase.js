import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCEBht9JJrcNG2gi2BW6hiSXeRGGXikcE",
  authDomain: "pocketbank-e686e.firebaseapp.com",
  projectId: "pocketbank-e686e",
  storageBucket: "pocketbank-e686e.appspot.com",  // Fixed the storageBucket issue
  messagingSenderId: "511231714913",
  appId: "1:511231714913:web:cdbb0cbabbe05c6f78ec20",
  measurementId: "G-GK2JGXCQGS"
};

// Initialize Firebase (Prevent re-initialization)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
