import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCoVgz4HymIox-nAUoifboUdomVNNR9LuU",
  authDomain: "stats-and-strength.firebaseapp.com",
  projectId: "stats-and-strength",
  storageBucket: "stats-and-strength.firebasestorage.app",
  messagingSenderId: "393030090934",
  appId: "1:393030090934:web:fb3d018bda375c5f91e617",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
