import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBoZQr1B-9_OLHcsgxS31X6AX-enYxGs0M",
    authDomain: "by-coaching.firebaseapp.com",
    projectId: "by-coaching",
    storageBucket: "by-coaching.firebasestorage.app",
    messagingSenderId: "441372075701",
    appId: "1:441372075701:web:7abaeb4664333c6f7b40fc",
    measurementId: "G-2WS40FN9Q3"
  };

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);