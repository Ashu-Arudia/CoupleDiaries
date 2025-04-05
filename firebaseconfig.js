// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// Replace with your actual config from Firebase console
const firebaseConfig = {
  apiKey: "AIzaSyDoYzKQBmFPZxNB1M19WmjQSltephXXzZY",
  authDomain: "couplediaries.firebaseapp.com",
  projectId: "couplediaries",
  storageBucket: "couplediaries.firebasestorage.app",
  messagingSenderId: "507930487102",
  appId: "1:507930487102:web:3b4928fa4fde02cf43246f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
