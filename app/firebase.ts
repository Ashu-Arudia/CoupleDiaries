import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";

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
      updatedAt: new Date().toISOString(),
    };

    // Using a simpler approach for Firestore
    await firestore()
      .collection('users')
      .doc(uid)
      .set(userData);

    console.log("User data saved successfully to Firestore for UID:", uid);
    return true;
  } catch (error: any) {
    console.error("Error setting name and age:", error.message);
    // Don't throw the error, just return false
    return false;
  }
}

export async function setDetails(
  uid: string,
  name: string,
  age: number,
  partner_name: string,
  partner_email: string,
  date: string,
  selectedGender: any,
  profileImageURL?: string
) {
  try {
    const userData: {
      name: string;
      age: number;
      partner_name: string;
      partner_email: string;
      date: string;
      selectedGender: any;
      updatedAt: string;
      profileImageURL?: string;
    } = {
      name: name,
      age: age,
      partner_name: partner_name,
      partner_email: partner_email,
      date: date,
      selectedGender: selectedGender,
      updatedAt: new Date().toISOString(),
    };

    // Add profile image URL if provided
    if (profileImageURL) {
      userData.profileImageURL = profileImageURL;
    }

    // Using a simpler approach for Firestore
    await firestore().collection("users").doc(uid).set(userData);

    console.log("User data saved successfully to Firestore for UID:", uid);
    return true;
  } catch (error: any) {
    console.error("Error setting name and age:", error.message);
    // Don't throw the error, just return false
    return false;
  }
}

export async function getUserData(userId: string) {
  try {
    // Get the user document using React Native Firebase
    const userDoc = await firestore()
      .collection('users')
      .doc(userId)
      .get();

    if (userDoc.exists) {
      const userData = userDoc.data();

      // Return an object with methods to access specific user data fields
      return {
        // Method to get all user data
        getAllData: () => userData,

        // Methods to get specific fields
        getUsername: () => userData?.name || null,
        getAge: () => userData?.age || null,
        getDate: () => userData?.date || userData?.createdAt || userData?.joinDate || null,
        getPartner_name: () => userData?.partner_name || null,
        getPartner_email: () => userData?.partner_email || null,
        getProfileImageURL: () => userData?.profileImageURL || null
      };
    } else {
      console.log("No such user!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
}

export async function uploadProfileImage(
  uid: string,
  uri: string
): Promise<string | null> {
  try {
    // Create a reference to the file in Firebase Storage
    const filename = `profile_images/${uid}/${Date.now()}.jpg`;
    const storageRef = storage().ref(filename);

    // Upload the file
    await storageRef.putFile(uri);

    // Get the download URL
    const downloadURL = await storageRef.getDownloadURL();

    // Update the user document with the profile image URL
    await firestore().collection('users').doc(uid).update({
      profileImageURL: downloadURL,
      updatedAt: new Date().toISOString(),
    });

    console.log("Profile image uploaded successfully:", downloadURL);
    return downloadURL;
  } catch (error: any) {
    console.error("Error uploading profile image:", error.message);
    return null;
  }
}

// Export the auth instance and other services
export { auth, firestore, storage };
