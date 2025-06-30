import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCyQ0_Ica1uD_mKiBy38aqmdGtEM7t9b1M",
  authDomain: "moodmirror-d4487.firebaseapp.com",
  projectId: "moodmirror-d4487",
  storageBucket: "moodmirror-d4487.appspot.com",
  messagingSenderId: "52218327172",
  appId: "1:52218327172:web:5e92f06b9e3f4cdec152d1",
  measurementId: "G-NZJWFB5JKL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); 