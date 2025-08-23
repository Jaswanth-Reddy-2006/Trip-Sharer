// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAnNxep-lF0sB3wLqV6BcNDzH98tT5r0Dk",
  authDomain: "trip-sharer.firebaseapp.com",
  projectId: "trip-sharer",
  storageBucket: "trip-sharer.firebasestorage.app",
  messagingSenderId: "200181421819",
  appId: "1:200181421819:web:12e370cfff5bc03a61825e",
  measurementId: "G-C0W3LME8YC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export { db, auth, googleProvider, facebookProvider };





