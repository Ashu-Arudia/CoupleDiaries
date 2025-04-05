import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// ... import other web SDK modules if needed

// Your Firebase project configuration (get this from the Firebase console)
const firebaseConfig = {
  apiKey: "AIzaSyDoYzKQBmFPZxNB1M19WmjQSltephXXzZY",
  authDomain: "couplediaries.firebaseapp.com",
  projectId: "couplediaries",
  storageBucket: "couplediaries.appspot.com",
  messagingSenderId: "507930487102",
  appId: "1:507930487102:web:3b4928fa4fde02cf43246f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the app instance and other services if needed
export { app };
export const auth = getAuth(app);
export const db = getFirestore(app);
