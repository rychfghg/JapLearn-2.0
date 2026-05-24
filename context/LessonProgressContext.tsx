import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext'; // Import AuthContext

const LessonProgressContext = createContext();

export const LessonProgressProvider = ({ children }) => {
  const [completedLessons, setCompletedLessons] = useState({
    basics1: false,
    basics2: false,
    basics3: false,
    katakana1: false,
    katakana2: false,
    katakana3: false,
    katakanaMenu: false,
    vocab1: false,
    vocab2: false,
    sentence: false,
  });

  const { user } = useContext(AuthContext); // Access user from AuthContext

  // Load progress from AsyncStorage for the specific user on mount
  useEffect(() => {
    const loadProgress = async () => {
      if (user) { // Ensure user exists before proceeding
        const key = `completedLessons_${user.email}`; // User-specific key
        try {
          const savedProgress = await AsyncStorage.getItem(key);
          if (savedProgress) {
            const parsedProgress = JSON.parse(savedProgress);
            setCompletedLessons(parsedProgress);
            console.log(`Loaded Progress for ${user.email}:`, parsedProgress);
          } else {
            const defaultProgress = {
              basics1: false,
              basics2: false,
              basics3: false,
              katakana1: false,
              katakana2: false,
              katakana3: false,
              katakanaMenu: false,
              vocab1: false,
              vocab2: false,
              sentence: false,
            };
            await AsyncStorage.setItem(key, JSON.stringify(defaultProgress));
            setCompletedLessons(defaultProgress);
          }
        } catch (error) {
          console.error(`Failed to load progress for ${user.email}:`, error);
        }
      }
    };

    loadProgress();
  }, [user]);

  const saveProgress = async (updatedProgress) => {
    if (user) {
      const key = `completedLessons_${user.email}`;
      try {
        await AsyncStorage.setItem(key, JSON.stringify(updatedProgress));
        console.log(`Progress saved for ${user.email}:`, updatedProgress);
      } catch (error) {
        console.error(`Failed to save progress for ${user.email}:`, error);
      }
    }
  };

  const updateCompletedLessons = (newProgress) => {
    const updatedProgress = { ...completedLessons, ...newProgress };
    setCompletedLessons(updatedProgress);
    saveProgress(updatedProgress); // Save changes
  };

  const reloadProgress = async () => {
    if (user) {
      const key = `completedLessons_${user.email}`;
      try {
        const savedProgress = await AsyncStorage.getItem(key);
        if (savedProgress) {
          const parsedProgress = JSON.parse(savedProgress);
          setCompletedLessons(parsedProgress);
          console.log(`Reloaded Progress for ${user.email}:`, parsedProgress);
        }
      } catch (error) {
        console.error(`Failed to reload progress for ${user.email}:`, error);
      }
    }
  };

  const resetProgress = async () => {
    const initialProgress = {
      basics1: false,
      basics2: false,
      basics3: false,
      katakana1: false,
      katakana2: false,
      katakana3: false,
      katakanaMenu: false,
      vocab1: false,
      vocab2: false,
      sentence: false, // Ensure Katakana fields are also reset
    };
    if (user) {
      const key = `completedLessons_${user.email}`;
      try {
        await AsyncStorage.setItem(key, JSON.stringify(initialProgress));
        setCompletedLessons(initialProgress); // Reset the state
        console.log(`Progress reset for ${user.email}:`, initialProgress);
      } catch (error) {
        console.error(`Failed to reset progress for ${user.email}:`, error);
      }
    }
  };

  return (
    <LessonProgressContext.Provider
      value={{
        completedLessons,
        setCompletedLessons: updateCompletedLessons,
        resetProgress,
        reloadProgress,
      }}
    >
      {children}
    </LessonProgressContext.Provider>
  );
};


// Hook to access the LessonProgress context
export const useLessonProgress = () => useContext(LessonProgressContext);
