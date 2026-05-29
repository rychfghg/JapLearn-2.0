import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  userId: string;
  email: string;
  fname: string;
  lname: string;
  role: string;
}

interface AuthContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  authLoading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  setUser: () => {},
  login: async () => {},
  logout: async () => {},
  authLoading: true,
});

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('user');

        if (userDataString) {
          const userData: User = JSON.parse(userDataString);
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        await AsyncStorage.removeItem('user');
      } finally {
        setAuthLoading(false);
      }
    };

    loadUserData();
  }, []);

  const login = async (userData: User) => {
    setUser(userData);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('classCode');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };