// // // import Constants from 'expo-constants';

// // // const { manifest } = Constants;
// // // let localhost = 'http://localhost:8080'; // Default to localhost

// // // if (manifest && manifest.debuggerHost) {
// // //     localhost = `http://${manifest.debuggerHost.split(':').shift()}:8080`;
// // // }

// // // const ipProvided = 'http://192.168.1.14:8080'; // Your provided IP address

// // // // Function to determine the API URL
// // // const getApiUrl = () => {
// // //     // Add any custom logic to choose between IP or localhost
// // //     const useProvidedIp = true; // Set this condition as needed

// // //     return useProvidedIp ? ipProvided : localhost;
// // // };

// // // const expoconfig = {
// // //     API_URL: getApiUrl(),
// // // };

// // // export default expoconfig;



// // -----------------------

// const devApiUrl = 'http://localhost:8080'; // Local backend for development
// const prodApiUrl = 'https://japlearn-in-citu-2024-e4fcab57ba52.herokuapp.com'; // Heroku backend for production

// // Check environment
// const isDev = process.env.NODE_ENV === 'development';

// const expoconfig = {
//     API_URL: isDev ? devApiUrl : prodApiUrl,
// };

// export default expoconfig;

// const expoconfig = {
 //   API_URL: 'https://japlearn-in-citu-2024-e4fcab57ba52.herokuapp.com', // Deployed backend URL
//};

// export default expoconfig;


import Constants from 'expo-constants';
import { Platform } from 'react-native';

const LOCAL_BACKEND_PORT = 8080;

const ANDROID_EMULATOR_URL = `http://10.0.2.2:${LOCAL_BACKEND_PORT}`;

const LAN_IP_URL = `http://192.168.192.36:${LOCAL_BACKEND_PORT}`;

const getApiUrl = () => {
  if (__DEV__) {
    if (Platform.OS === 'android' && !Constants.expoConfig?.hostUri) {
      return ANDROID_EMULATOR_URL;
    }

    const hostUri = Constants.expoConfig?.hostUri;

    if (hostUri) {
      const host = hostUri.split(':')[0];
      return `http://${host}:${LOCAL_BACKEND_PORT}`;
    }

    return LAN_IP_URL;
  }

  return LAN_IP_URL;
};

const expoconfig = {
  API_URL: getApiUrl(),
};

export default expoconfig;