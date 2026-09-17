import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import expoconfig from '../expoconfig';

interface User {
  userId: string;
  email: string;
  fname: string;
  lname: string;
  role: string;
  portalSessionToken?: string;
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
  refreshUser: () => Promise<void>;
  authLoading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  setUser: () => {},
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
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

  const refreshUser = useCallback(async () => {
    if (!user?.email || user.role?.toLowerCase() !== 'student') return;

    try {
      const response = await fetch(
        `${expoconfig.API_URL}/api/students/getStudentByEmail?email=${encodeURIComponent(user.email)}`,
        { headers: { Accept: 'application/json' } },
      );

      if (!response.ok) return;
      const latest = await response.json();
      const nextFirstName = String(latest?.fname ?? latest?.firstName ?? '').trim();
      const nextLastName = String(latest?.lname ?? latest?.lastName ?? '').trim();

      if (!nextFirstName && !nextLastName) return;
      if (nextFirstName === user.fname && nextLastName === user.lname) return;

      const updatedUser: User = {
        ...user,
        fname: nextFirstName || user.fname,
        lname: nextLastName || user.lname,
      };

      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      // Keep the last known account details while offline and retry on the next sync.
      console.warn('Unable to refresh the student profile.', error);
    }
  }, [user]);

  useEffect(() => {
    if (!user?.email || user.role?.toLowerCase() !== 'student') return;

    void refreshUser();
    const appListener = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refreshUser();
    });
    const timer = setInterval(() => {
      if (AppState.currentState !== 'active') return;
      if (Platform.OS === 'web' && typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
      void refreshUser();
    }, 12000);

    const handleVisible = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') void refreshUser();
    };
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisible);
    }

    return () => {
      appListener.remove();
      clearInterval(timer);
      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisible);
      }
    };
  }, [refreshUser, user?.email, user?.role]);

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('classCode');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, refreshUser, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
