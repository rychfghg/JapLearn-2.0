import 'react-native';

declare module 'react-native' {
  interface TextProps {
    /** Forwarded by React Native Web to improve Japanese screen-reader pronunciation. */
    lang?: string;
  }
}
