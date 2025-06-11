// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDhSz3qCD1XL6tqb1httM0p4lnEQ9aEbyk",
    authDomain: "bakery-toshankanwar-website.firebaseapp.com",
    projectId: "bakery-toshankanwar-website",
    storageBucket: "bakery-toshankanwar-website.firebasestorage.app",
    messagingSenderId: "492744979011",
    appId: "1:492744979011:web:daaea7b4b746f5ce84daf6"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);