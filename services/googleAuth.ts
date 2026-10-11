import { NativeModules, Platform, TurboModuleRegistry } from 'react-native';

// OAuth client IDs are public identifiers (they ship inside every app and web page).
// The backend only accepts Google tokens issued for these IDs (GOOGLE_CLIENT_IDS on Render).
export const GOOGLE_WEB_CLIENT_ID = '727374168443-nmm7ppth5qsilhniu7p69tj6qbt09d92.apps.googleusercontent.com';
export const GOOGLE_ANDROID_CLIENT_ID = '727374168443-aeptq0v80j0c0bluuogcpgefj8qjpdtf.apps.googleusercontent.com';

/**
 * True when Google sign-in can run here. On the web it always can. On a phone it needs the
 * native Google Sign-In module, which only exists in APKs built after it was added; older
 * APKs that receive this code by OTA update simply hide the Google button instead of crashing.
 */
export const isGoogleSignInAvailable = () => {
  if (Platform.OS === 'web') return true;
  try {
    return !!(TurboModuleRegistry.get('RNGoogleSignin') || (NativeModules as any).RNGoogleSignin);
  } catch {
    return false;
  }
};

export class GoogleSignInCancelled extends Error {}

let configured = false;

/** Opens the Google account picker on the phone and returns the Google ID token. */
export async function getNativeGoogleIdToken(): Promise<string> {
  if (!isGoogleSignInAvailable()) throw new Error('Update JapLearn to the latest version to use Google sign-in.');
  // Required lazily so that older APKs without the native module never load it.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { GoogleSignin, statusCodes } = require('@react-native-google-signin/google-signin');
  if (!configured) {
    // The ID token's audience is the web client ID, which the backend verifies.
    GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID, scopes: ['profile', 'email'] });
    configured = true;
  }
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Always show the account picker so a shared phone can choose the right account.
    try { await GoogleSignin.signOut(); } catch {}
    const result = await GoogleSignin.signIn();
    if (result?.type === 'cancelled') throw new GoogleSignInCancelled('cancelled');
    const idToken = result?.data?.idToken ?? result?.idToken;
    if (!idToken) throw new Error('Google did not return a sign-in token. Please try again.');
    return idToken;
  } catch (error: any) {
    if (error instanceof GoogleSignInCancelled || error?.code === statusCodes?.SIGN_IN_CANCELLED) throw new GoogleSignInCancelled('cancelled');
    if (error?.code === statusCodes?.IN_PROGRESS) throw new Error('Google sign-in is already open.');
    if (error?.code === statusCodes?.PLAY_SERVICES_NOT_AVAILABLE) throw new Error('Google Play services are needed for Google sign-in on this phone.');
    throw error instanceof Error ? error : new Error('Google sign-in failed. Please try again.');
  }
}

// ---- Web: Google Identity Services ----------------------------------------------------------

let gsiLoading: Promise<any> | null = null;

/** Loads Google's official sign-in script once (web only). */
export function loadGoogleIdentity(): Promise<any> {
  const w = globalThis as any;
  if (w.google?.accounts?.id) return Promise.resolve(w.google);
  if (gsiLoading) return gsiLoading;
  gsiLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => (w.google?.accounts?.id ? resolve(w.google) : reject(new Error('Google sign-in could not load.')));
    script.onerror = () => { gsiLoading = null; reject(new Error('Google sign-in could not load. Check your connection.')); };
    document.head.appendChild(script);
  });
  return gsiLoading;
}

// ---- Hand-off from the sign-up screen to the login screen (kept in memory, never in the URL) ----

let pendingIdToken: string | null = null;
export const setPendingGoogleToken = (token: string) => { pendingIdToken = token; };
export const takePendingGoogleToken = () => { const token = pendingIdToken; pendingIdToken = null; return token; };
