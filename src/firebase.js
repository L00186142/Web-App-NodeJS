// firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCGVBt-1cj3kEz9EjfbbSMKLAlZUkE6txw",
  authDomain: "web-hosting-cloud-a8a14.firebaseapp.com",
  projectId: "web-hosting-cloud-a8a14",
  storageBucket: "web-hosting-cloud-a8a14.firebasestorage.app",
  messagingSenderId: "875833291292",
  appId: "1:875833291292:web:ee734267fdaa195c68a5d9",
  measurementId: "G-BV238RR5W8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
