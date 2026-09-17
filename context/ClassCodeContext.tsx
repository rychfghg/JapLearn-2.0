import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppState, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from './AuthContext';
import expoconfig from '../expoconfig';

const ClassCodeContext = createContext();

export const ClassCodeProvider = ({ children }) => {
    const [classCode, setClassCodeState] = useState('');
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const loadClassCode = async () => {
            try {
                const storedClassCode = await AsyncStorage.getItem('classCode');
                setClassCodeState(storedClassCode || '');
            } catch {
                setClassCodeState('');
            }
        };

        loadClassCode();
    }, []);

    const setClassCode = async (code) => {
        const safeCode = code || '';
        setClassCodeState(safeCode);
        await AsyncStorage.setItem('classCode', safeCode);
    };

    const refreshClassCode = useCallback(async () => {
        if (!user?.email || user.role?.toLowerCase() !== 'student') return;
        try {
            const response = await fetch(`${expoconfig.API_URL}/api/students/getStudentByEmail?email=${encodeURIComponent(user.email)}`);
            if (!response.ok) return;
            const student = await response.json();
            const latestCode = String(student?.classCode || '').trim();
            if (latestCode === classCode) return;
            setClassCodeState(latestCode);
            await AsyncStorage.setItem('classCode', latestCode);
        } catch {
            // Preserve the last synced class while offline.
        }
    }, [classCode, user?.email, user?.role]);

    useEffect(() => {
        if (!user?.email || user.role?.toLowerCase() !== 'student') return;
        void refreshClassCode();
        const listener = AppState.addEventListener('change', state => {
            if (state === 'active') void refreshClassCode();
        });
        const timer = setInterval(() => {
            if (AppState.currentState !== 'active') return;
            if (Platform.OS === 'web' && typeof document !== 'undefined' && document.visibilityState !== 'visible') return;
            void refreshClassCode();
        }, 20000);
        return () => { listener.remove(); clearInterval(timer); };
    }, [refreshClassCode, user?.email, user?.role]);

    return (
        <ClassCodeContext.Provider value={{ classCode, setClassCode, refreshClassCode }}>
            {children}
        </ClassCodeContext.Provider>
    );
};

export const useClassCode = () => {
    return useContext(ClassCodeContext);
};



// import React, { createContext, useContext, useState, useEffect } from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { AuthContext } from './AuthContext'; // Import AuthContext

// const LessonProgressContext = createContext();

// export const LessonProgressProvider = ({ children }) => {
//   const [completedLessons, setCompletedLessons] = useState({
//     basics1: false,
//     basics2: false,
//     basics3: false,
//   });

//   const { user } = useContext(AuthContext); // Use useContext to access the user

//   // Load progress from AsyncStorage on mount or when the user changes
//   useEffect(() => {
//     const loadProgress = async () => {
//       if (user) {
//         const key = `completedLessons_${user.email}`;
//         try {
//           const savedProgress = await AsyncStorage.getItem(key);
//           if (savedProgress) {
//             setCompletedLessons(JSON.parse(savedProgress));
//             console.log('Loaded Progress:', JSON.parse(savedProgress));
//           } else {
//             const defaultProgress = { basics1: false, basics2: false, basics3: false };
//             await AsyncStorage.setItem(key, JSON.stringify(defaultProgress));
//             setCompletedLessons(defaultProgress);
//           }
//         } catch (error) {
//           console.error('Failed to load progress', error);
//         }
//       }
//     };

//     loadProgress();
//   }, [user]);

//   // Save progress to AsyncStorage
//   const saveProgress = async (updatedProgress) => {
//     if (user) {
//       const key = `completedLessons_${user.email}`;
//       try {
//         await AsyncStorage.setItem(key, JSON.stringify(updatedProgress));
//         console.log(`Progress saved for ${user.email}:`, updatedProgress);
//       } catch (error) {
//         console.error('Failed to save progress', error);
//       }
//     }
//   };

//   // Function to update progress and save it
//   const updateCompletedLessons = (newProgress) => {
//     setCompletedLessons((prev) => {
//       const updatedProgress = { ...prev, ...newProgress };
//       saveProgress(updatedProgress);
//       return updatedProgress;
//     });
//   };

//   // Reload progress to ensure consistency
//   useEffect(() => {
//     const reloadProgress = async () => {
//       if (user) {
//         const key = `completedLessons_${user.email}`;
//         try {
//           const savedProgress = await AsyncStorage.getItem(key);
//           if (savedProgress) {
//             console.log('Reloaded Progress:', JSON.parse(savedProgress));
//             setCompletedLessons(JSON.parse(savedProgress));
//           }
//         } catch (error) {
//           console.error('Failed to reload progress', error);
//         }
//       }
//     };

//     reloadProgress();
//   }, [setCompletedLessons, user]);

//   return (
//     <LessonProgressContext.Provider value={{ completedLessons, setCompletedLessons: updateCompletedLessons }}>
//       {children}
//     </LessonProgressContext.Provider>
//   );
// };

// export const useLessonProgress = () => useContext(LessonProgressContext);
