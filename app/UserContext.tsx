import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, getUserData } from './firebase';

// Define the shape of our user data
type UserData = {
  uid: string | null;
  username: string | null;
  age: number | null;
  partner_name: string | null;
  partner_email: string | null;
  date: string | null;
  isLoading: boolean;
  error: string | null;
};

// Create context with default values
const UserContext = createContext<{
  userData: UserData;
  refreshUserData: () => Promise<void>;
}>({
  userData: {
    uid: null,
    username: null,
    age: null,
    partner_name: null,
    partner_email: null,
    date: null,
    isLoading: true,
    error: null,
  },
  refreshUserData: async () => {},
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

  return (
    <UserContext.Provider value={{ userData, refreshUserData }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = () => useContext(UserContext);