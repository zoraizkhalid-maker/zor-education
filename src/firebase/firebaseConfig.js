import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCLpDpzerQ_LNsRih57YRgQASoxc7hPkpQ",
    authDomain: "zor-education-app.firebaseapp.com",
    projectId: "zor-education-app",
    storageBucket: "zor-education-app.firebasestorage.app",
    messagingSenderId: "733330453592",
    appId: "1:733330453592:web:a19454b12ce03368bdc62d",
    measurementId: "G-ZL7FY4MCM5"
  };

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const storage = getStorage(app);

export { auth, db, storage };