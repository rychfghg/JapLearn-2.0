import React, { useState, useEffect, useContext } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, Platform, AppState } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { AuthContext, AuthProvider } from '../context/AuthContext';
import { ClassCodeProvider } from '../context/ClassCodeContext';
import { LessonProgressProvider, useLessonProgress } from '../context/LessonProgressContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncOfflineSubmissions } from '../services/offlineSync';
import { primeOfflineContent } from '../services/offlineContent';
import StudentBottomNav from '../components/StudentBottomNav';
// import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';


const STARTUP_TIMEOUT_MS = 12000;

SplashScreen.preventAutoHideAsync().catch(() => {
  // The splash may already be hidden during fast refresh.
});

const getFonts = async () => {
  if (Platform.OS !== 'web') {
    return;
  }

  const loadBundledFonts = Font.loadAsync({
    Jua: require('../assets/fonts/Jua.ttf'),
    ...Ionicons.font,
    ...FontAwesome.font,
  });

  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('Bundled fonts took too long to initialize.'));
    }, STARTUP_TIMEOUT_MS);
  });

  await Promise.race([loadBundledFonts, timeout]);
};


const routeAccessConfig: Record<string, string[]> = {
  student: [
    'Menu', 'ResetButton', 'Quackamole', 'Quackslate', 'QuackslateWait', 'QuackslateMenu', 'NewMenu', 'Words1', 'KanaMenu', 'HiraganaMenu', 'KatakanaMenu', 'HiraganaSet1',
    'HiraganaSet2', 'HiraganaSet3', 'KatakanaSet1', 'KatakanaSet2', 'KatakanaSet3', 'Quackman',
    'Profile', 'Lessons', 'LessonKanaGame', 'LearnMenu', 'TeacherLesson', 'Exercises', 'Content3', 'Game3', 'CharacterExercise1',
    'CharacterExercise2', 'CharacterExercise3', 'CharacterExercise4', 'CharacterExercise5', 'CharacterExercise6', 'WordsMenu', 
    'Words2', 'Words3', 'WordsPractice', 'QuackSituate', 'QuackSituate',
'QuackSituateRecognition',
'QuackSituateMatching',
'QuackSituateMatchingLevels',
'QuackSituateFormal',
'QuackSituateFormalLevels',
'QuackSituateFeedback',
'QuackTalk', 'QuackTalkConversation',
'QuackResponse', 'QuackResponseGuided', 'QuackResponseTimed', 'QuackResponseMultiStep', 'QuackTalkSpeech', 'QuackTalkFeedback', 'QuackProgress', 'QuackProgressProgression',
'QuackProgressAnalytics', 'PrivacyPolicyPage',


  ],
  teacher: [
    'TeacherHome', 'TeacherStudents', 'TeacherProfile', 'PrivacyPolicyPage', 'TermsOfServicePage',
    'TeacherDashboard', 'QuackmanContent', 'ProfileTeacher', 'ClassDashboard', 'QuackmanLevels', 'QuackmanEdit', 'QuackslateHost', 'QuackslateLevels',
    'QuackslateEdit', 'PendingApproval', 'QuackamoleLevels', 'QuackamoleEdit', 'QuackamoleContent', 'LessonPageEdit', 'LessonContentEdit',
    'TeacherCommunicationPerformance', 'TeacherAssignCommunication', 'TeacherCommunicationReports',
  ],
};

const defaultRouteByRole: Record<string, string> = {
  student: '/Menu',
  teacher: '/TeacherHome',
};

const publicRoutes = [
  '',
  'Login',
  'Signup',
  'ResetPassword',
  'ConfirmEmail',
  'PrivacyPolicyPage',
  'TermsOfServicePage',
];

const authenticatedEntryRoutes = ['', 'Login', 'Signup'];

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
  const { user, authLoading } = useContext(AuthContext);
  const router = useRouter();
  // const [isDrawerOpen, setDrawerOpen] = useState(false);
  const segments = useSegments();

  useEffect(() => {
    if (!user?.email || user.role?.toLowerCase() !== 'student') return;
    const sync = () => {
      void syncOfflineSubmissions(user.email);
      void primeOfflineContent();
    };
    sync();
    const appListener = AppState.addEventListener('change', (state) => {
      if (state === 'active') sync();
    });
    const timer = setInterval(() => void syncOfflineSubmissions(user.email), 20000);
    if (Platform.OS === 'web' && typeof window !== 'undefined') window.addEventListener('online', sync);
    return () => {
      appListener.remove();
      clearInterval(timer);
      if (Platform.OS === 'web' && typeof window !== 'undefined') window.removeEventListener('online', sync);
    };
  }, [user?.email, user?.role]);

  useEffect(() => {
    let cancelled = false;

    const loadResources = async () => {
      try {
        await getFonts();
      } catch (error) {
        console.warn('JapLearn font initialization fallback:', error);
      } finally {
        if (!cancelled) {
          setFontsLoaded(true);
          setIsMounted(true);
          await SplashScreen.hideAsync().catch(() => undefined);
        }
      }
    };

    loadResources();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById('root');
    const previousHtmlOverflow = html.style.overflow;
    const previousHtmlHeight = html.style.height;
    const previousHtmlWidth = html.style.width;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyHeight = body.style.height;
    const previousBodyWidth = body.style.width;
    const previousBodyMargin = body.style.margin;
    const previousBodyOverscroll = body.style.overscrollBehavior;
    const previousRootWidth = root?.style.width;
    const previousRootMaxWidth = root?.style.maxWidth;
    const previousRootHeight = root?.style.height;
    const previousRootMargin = root?.style.margin;

    html.style.height = '100%';
    html.style.width = '100%';
    html.style.overflow = 'hidden';
    body.style.height = '100%';
    body.style.width = '100%';
    body.style.margin = '0';
    body.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';
    if (root) {
      root.style.width = '100%';
      root.style.maxWidth = 'none';
      root.style.height = '100%';
      root.style.margin = '0';
    }

    return () => {
      html.style.overflow = previousHtmlOverflow;
      html.style.height = previousHtmlHeight;
      html.style.width = previousHtmlWidth;
      body.style.overflow = previousBodyOverflow;
      body.style.height = previousBodyHeight;
      body.style.width = previousBodyWidth;
      body.style.margin = previousBodyMargin;
      body.style.overscrollBehavior = previousBodyOverscroll;
      if (root) {
        root.style.width = previousRootWidth || '';
        root.style.maxWidth = previousRootMaxWidth || '';
        root.style.height = previousRootHeight || '';
        root.style.margin = previousRootMargin || '';
      }
    };
  }, []);

  useEffect(() => {
  if (authLoading || !isMounted || !fontLoaded) return;

  const currentSegment = segments.length > 0 ? segments[0] : '';

  console.log("Current segment:", currentSegment, "User:", user);

  if (user && authenticatedEntryRoutes.includes(currentSegment)) {
    const normalizedRole = String(user.role || '').toLowerCase();

    if (normalizedRole === 'student') {
      router.replace('/Menu');
      return;
    }

    router.replace(defaultRouteByRole[normalizedRole] || '/Login');
    return;
  }

  if (
    !user &&
    !publicRoutes.includes(currentSegment) &&
    (
      routeAccessConfig.student.includes(currentSegment) ||
      routeAccessConfig.teacher.includes(currentSegment)
    )
  ) {
    router.replace('/Login');
    return;
  }

  if (user && currentSegment && !publicRoutes.includes(currentSegment)) {
    const normalizedRole = String(user.role || '').toLowerCase();
    const allowedRoutes = routeAccessConfig[normalizedRole] || [];
    const defaultRoute = defaultRouteByRole[normalizedRole] || '/Login';

    if (!allowedRoutes.includes(currentSegment)) {
      if (currentSegment !== defaultRoute.slice(1)) {
        router.replace(defaultRoute);
      }
    }
  }
}, [authLoading, isMounted, fontLoaded, user, segments]);

  if (!fontLoaded || !isMounted) {
    return null;
  }

  const studentTabByRoute = {
    Menu: 'home',
    LearnMenu: 'learn',
    QuackTalk: 'talk',
    Exercises: 'play',
    Profile: 'profile',
  } as const;
  const currentTab = studentTabByRoute[segments[0] as keyof typeof studentTabByRoute];
  const showStudentNav = user?.role?.toLowerCase() === 'student' && !!currentTab;

  return (
    <GestureHandlerRootView style={styles.root}>

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" />
        <Stack.Screen name="Signup" />
        <Stack.Screen name="ResetPassword" />
        <Stack.Screen name="ConfirmEmail" />
        <Stack.Screen name="Menu" options={{ animation: 'fade', animationDuration: 180 }} />
        <Stack.Screen name="Profile" options={{ animation: 'fade', animationDuration: 180 }} />
        <Stack.Screen name="TeacherHome" options={{ animation: 'fade', animationDuration: 180 }} />
        <Stack.Screen name="TeacherStudents" options={{ animation: 'fade', animationDuration: 180 }} />
        <Stack.Screen name="TeacherProfile" options={{ animation: 'fade', animationDuration: 180 }} />
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
        <Stack.Screen name="TermsOfServicePage" />
        <Stack.Screen name="LearnMenu" options={{ animation: 'fade', animationDuration: 180 }} />
        <Stack.Screen name="Exercises" options={{ animation: 'fade', animationDuration: 180 }} />
        <Stack.Screen name="Lessons" />
        <Stack.Screen name="TeacherLesson" />
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
        <Stack.Screen name="Words3" />
        <Stack.Screen name="WordsPractice" />
        <Stack.Screen name="QuackSituate" />

        <Stack.Screen name="QuackSituateRecognition" />
        <Stack.Screen name="QuackSituateMatching" />
        <Stack.Screen name="QuackSituateMatchingLevels" />
        <Stack.Screen name="QuackSituateFormal" />
        <Stack.Screen name="QuackSituateFormalLevels" />
        <Stack.Screen name="QuackSituateFeedback" />
        <Stack.Screen name="QuackTalk" options={{ animation: 'fade', animationDuration: 180 }} />
        <Stack.Screen name="QuackTalkConversation" /> 
        <Stack.Screen name="QuackTalkSpeech" /> 
        <Stack.Screen name="QuackTalkFeedback" />
        <Stack.Screen name="QuackProgress" />  
        <Stack.Screen name="QuackProgressProgression" />
        <Stack.Screen name="QuackProgressAnalytics" />
        <Stack.Screen name="TeacherCommunicationPerformance" />
        <Stack.Screen name="TeacherAssignCommunication" />
        <Stack.Screen name="TeacherCommunicationReports" />
      </Stack>
      {showStudentNav && <StudentBottomNav active={currentTab} />}
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    overflow: 'hidden',
  },

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
