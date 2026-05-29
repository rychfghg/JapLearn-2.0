import React, { useState, useEffect, useContext } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Font from 'expo-font';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { AuthContext, AuthProvider } from '../context/AuthContext';
import { ClassCodeProvider } from '../context/ClassCodeContext';
import { LessonProgressProvider, useLessonProgress } from '../context/LessonProgressContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';


const getFonts = async () => {
  try {
    await Font.loadAsync({ 'Jua': require('../assets/fonts/Jua.ttf') });
    console.log('Jua font loaded successfully');
  } catch (error) {
    console.error('Error loading Jua font:', error);
  }
};


const routeAccessConfig = {
  student: [
    'Menu', 'ResetButton','ResetPassword', 'Quackamole', 'Quackslate', 'QuackslateWait', 'QuackslateMenu', 'NewMenu', 'Words1', 'KanaMenu', 'HiraganaMenu', 'KatakanaMenu', 'HiraganaSet1',
    'HiraganaSet2', 'HiraganaSet3', 'KatakanaSet1', 'KatakanaSet2', 'KatakanaSet3', 'Quackman', 'StartMenu',
    'Profile', 'Lessons', 'LessonKanaGame', 'LearnMenu', 'Exercises', 'Content3', 'Game3', 'CharacterExercise1',
    'CharacterExercise2', 'CharacterExercise3', 'CharacterExercise4', 'CharacterExercise5', 'CharacterExercise6', 'WordsMenu', 
    'Words2', 'WordsPractice', 'QuackSituate', 'QuackSituate',
'QuackSituateRecognition',
'QuackSituateMatching',
'QuackSituateFormal',
'QuackSituateFeedback',
'QuackTalk', 'QuackTalkConversation',
'QuackResponse', 'QuackResponseGuided', 'QuackResponseTimed', 'QuackResponseMultiStep', 'QuackTalkSpeech', 'QuackTalkFeedback'

  ],
  teacher: [
    'TeacherDashboard', 'QuackmanContent', 'ProfileTeacher', 'ClassDashboard', 'QuackmanLevels', 'QuackmanEdit', 'QuackslateHost', 'QuackslateLevels',
    'QuackslateEdit', 'PendingApproval', 'QuackamoleLevels', 'QuackamoleEdit', 'QuackamoleContent', 'LessonPageEdit', 'LessonContentEdit',
  ],
};

const defaultRouteByRole = {
  student: '/Menu',
  teacher: '/TeacherDashboard',
};

// const Drawer = createDrawerNavigator();

// function CustomDrawerContent(props) {
//   return (
//     <DrawerContentScrollView {...props}>
//       <DrawerItemList {...props} />
//       <DrawerItem label="Home" onPress={() => props.navigation.navigate('Home')} />
//       <DrawerItem label="Next Page" onPress={() => { /* Handle next page */ }} />
//       <DrawerItem label="Previous Page" onPress={() => { /* Handle previous page */ }} />
//     </DrawerContentScrollView>
//   );
// }

const RootLayout = () => {
  const [fontLoaded, setFontsLoaded] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
const { user, setUser, authLoading } = useContext(AuthContext);
  const router = useRouter();
  // const [isDrawerOpen, setDrawerOpen] = useState(false);
  const segments = useSegments();

  useEffect(() => {
    const loadResources = async () => {
      try {
        await Promise.all([getFonts(), checkUserAuth()]);
      } catch (error) {
        console.error('Error loading resources', error);
      } finally {
        setFontsLoaded(true);
        setIsMounted(true);
      }
    };

    const checkUserAuth = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };

    loadResources();
  }, []);

  useEffect(() => {
  if (authLoading || !isMounted || !fontLoaded) return;

  const currentSegment = segments.length > 0 ? segments[0] : '';

  console.log("Current segment:", currentSegment, "User:", user);

  if (
    !user &&
    (
      routeAccessConfig.student.includes(currentSegment) ||
      routeAccessConfig.teacher.includes(currentSegment)
    )
  ) {
    router.replace('/Login');
    return;
  }

  if (user) {
    const allowedRoutes = routeAccessConfig[user.role] || [];
    const defaultRoute = defaultRouteByRole[user.role] || '/Login';

    if (!allowedRoutes.includes(currentSegment)) {
      if (currentSegment !== defaultRoute.slice(1)) {
        router.replace(defaultRoute);
      }
    }
  }
}, [authLoading, isMounted, fontLoaded, user, segments]);

  if (!fontLoaded || !isMounted) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <GestureHandlerRootView>
      
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" />
        <Stack.Screen name="Signup" />
        <Stack.Screen name="Menu" />
        <Stack.Screen name="StartMenu" />
        <Stack.Screen name="Profile" />
        <Stack.Screen name="TeacherDashboard" />
        <Stack.Screen name="ProfileTeacher" />
        <Stack.Screen name="QuackamoleEdit" />
        <Stack.Screen name="QuackamoleLevels" />
        <Stack.Screen name="QuackmanLevels" />
        <Stack.Screen name="QuackmanEdit" />
        <Stack.Screen name="QuackslateEdit" />
        <Stack.Screen name="QuackslateLevels" />
        <Stack.Screen name="ClassDashboard" />
        <Stack.Screen name="PrivacyPolicyPage" />
        <Stack.Screen name="LearnMenu" />
        <Stack.Screen name="Exercises" />
        <Stack.Screen name="Lessons" />
        <Stack.Screen name="LessonKanaGame" />
        <Stack.Screen name="LessonPageEdit" />
        <Stack.Screen name="LessonContentEdit" />
        <Stack.Screen name="CharacterExercise1" />
        <Stack.Screen name="CharacterExercise2" />
        <Stack.Screen name="CharacterExercise3" />
        <Stack.Screen name="CharacterExercise4" />
        <Stack.Screen name="CharacterExercise5" />
        <Stack.Screen name="CharacterExercise6" />
        <Stack.Screen name="HiraganaMenu" />
        <Stack.Screen name="HiraganaSet1" />
        <Stack.Screen name="HiraganaSet2" />
        <Stack.Screen name="HiraganaSet3" />
        <Stack.Screen name="WordsMenu" />
        <Stack.Screen name="Words1" />
        <Stack.Screen name="Words2" />
        <Stack.Screen name="WordsPractice" />
        <Stack.Screen name="QuackSituate" />

<Stack.Screen name="QuackSituateRecognition" />
<Stack.Screen name="QuackSituateMatching" />
<Stack.Screen name="QuackSituateFormal" />
<Stack.Screen name="QuackSituateFeedback" />
<Stack.Screen name="QuackTalk" />
<Stack.Screen name="QuackTalkConversation" /> 
<Stack.Screen name="QuackTalkSpeech" /> 
<Stack.Screen name="QuackTalkFeedback" /> 
      </Stack>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  whiteScreen: {
    flex: 1,
    backgroundColor: 'white',
  },
});

const RootLayoutWithProvider = () => (
  <AuthProvider>
    <ClassCodeProvider>
      <LessonProgressProvider>
        <RootLayout />
      </LessonProgressProvider>
    </ClassCodeProvider>
  </AuthProvider>
);

export default RootLayoutWithProvider;
