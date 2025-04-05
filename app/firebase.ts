import firestore from "@react-native-firebase/firestore";
// import { initializeApp } from "firebase/app";
import auth from "@react-native-firebase/auth";
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

export async function setUserNameAndAge(
  uid: string,
  name: string,
  age: number
) {
  try {
    const userData = {
      name: name,
      age: age,
      createdAt: firestore.FieldValue.serverTimestamp(), // Optional: track when data was added
    };

    await firestore()
      .collection("users")
      .doc(uid)
      .set(userData, { merge: true }); // merge: true to avoid overwriting other data
    console.log("Name and age added to Firestore for UID:", uid);
  } catch (error: any) {
    console.error("Error setting name and age:", error.message);
    throw error;
  }
}

// Initialize Firebase
// const app = initializeApp(firebaseConfig);

// Export the app instance and other services if needed
// export { app };
// export const auth = getAuth(app);
export { auth, firestore };
