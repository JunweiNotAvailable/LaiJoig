import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyAk37eJazK7lfNxYdgqvtfPcdMCi1bC-oM",
  authDomain: "laijoig.firebaseapp.com",
  projectId: "laijoig",
  storageBucket: "laijoig.appspot.com",
  messagingSenderId: "111412659441",
  appId: "1:111412659441:web:47bbc638a6ffde90f1d550"
};

export const app = initializeApp(firebaseConfig);

export const firestore = getFirestore(app);