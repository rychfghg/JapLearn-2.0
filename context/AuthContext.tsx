import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  userId: string;
  email: string;
  fname: string;
  lname: string;
  role: string;
}

const isStoredUser = (value: unknown): value is User => {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<User>;

  return Boolean(
    candidate.userId &&
    candidate.email &&
    candidate.role,
  );
};

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
          const userData: unknown = JSON.parse(userDataString);

          if (isStoredUser(userData)) {
            setUser(userData);
          } else {
            await AsyncStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setAuthLoading(false);
      }
    };

    loadUserData();
  }, []);

  const login = async (userData: User) => {
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
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
