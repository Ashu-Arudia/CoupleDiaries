import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, getUserData, updateUserProfile } from './firebase';

// Define the shape of our user data
type UserData = {
  uid: string | null;
  username: string | null;
  age: number | null;
  partner_name: string | null;
  partner_email: string | null;
  date: string | null;
  profileImageURL: string | null;
  isLoading: boolean;
  error: string | null;
};

// Create context with default values
const UserContext = createContext<{
  userData: UserData;
  refreshUserData: () => Promise<void>;
  updateUserData: (data: Partial<UserData>) => Promise<void>;
}>({
  userData: {
    uid: null,
    username: null,
    age: null,
    partner_name: null,
    partner_email: null,
    date: null,
    profileImageURL: null,
    isLoading: true,
    error: null,
  },
  refreshUserData: async () => {},
  updateUserData: async () => {},
});

// Provider component
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userData, setUserData] = useState<UserData>({
    uid: null,
    username: null,
    age: null,
    partner_name: null,
    partner_email: null,
    date: null,
    profileImageURL: null,
    isLoading: true,
    error: null,
  });

  const fetchUserData = async () => {
    try {
      setUserData(prev => ({ ...prev, isLoading: true, error: null }));
      const user = auth().currentUser;

      if (!user) {
        setUserData(prev => ({
          ...prev,
          uid: null,
          isLoading: false
        }));
        return;
      }

      const userDoc = await getUserData(user.uid);

      if (userDoc) {
        setUserData({
          uid: user.uid,
          username: userDoc.getUsername(),
          age: userDoc.getAge(),
          partner_name: userDoc.getPartner_name() || 'Partner',
          partner_email: userDoc.getPartner_email(),
          date: userDoc.getDate(),
          profileImageURL: userDoc.getProfileImageURL() || null,
          isLoading: false,
          error: null,
        });
      } else {
        setUserData(prev => ({
          ...prev,
          uid: user.uid,
          isLoading: false,
          error: 'No user data found'
        }));
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load user data'
      }));
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        fetchUserData();
      } else {
        setUserData({
          uid: null,
          username: null,
          age: null,
          partner_name: null,
          partner_email: null,
          date: null,
          profileImageURL: null,
          isLoading: false,
          error: null,
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Function to manually refresh user data
  const refreshUserData = async () => {
    await fetchUserData();
  };

  // Function to update user data in Firestore
  const updateUserData = async (data: Partial<UserData>) => {
    try {
      const user = auth().currentUser;
      if (!user) {
        throw new Error('No user is signed in');
      }

      // Update the user profile in Firestore
      await updateUserProfile(user.uid, data);

      // Refresh the user data to reflect changes
      await refreshUserData();
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  };

  return (
    <UserContext.Provider value={{ userData, refreshUserData, updateUserData }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = () => useContext(UserContext);