import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDEQpWbeu1UPuVAMVLnL-TfhM73xjmwZxQ",
  authDomain: "gb-fit-d5776.firebaseapp.com",
  projectId: "gb-fit-d5776",
  storageBucket: "gb-fit-d5776.firebasestorage.app",
  messagingSenderId: "404812500391",
  appId: "1:404812500391:web:03874bca891f6a2c9a3a82",
  measurementId: "G-T3TNBS0DH7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);