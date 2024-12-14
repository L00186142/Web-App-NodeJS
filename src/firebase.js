import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCGVBt-1cj3kEz9EjfbbSMKLAlZUkE6txw",
  authDomain: "cloud-messaging-bb47e.firebaseapp.com",
  projectId: "cloud-messaging-bb47e",
  storageBucket: "cloud-messaging-bb47e.appspot.com",
  messagingSenderId: "875833291292",
  appId: "1:875833291292:web:ee734267fdaa195c68a5d9",
  measurementId: "G-BV238RR5W8"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
