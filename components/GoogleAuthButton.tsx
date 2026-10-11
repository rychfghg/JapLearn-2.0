import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { GOOGLE_WEB_CLIENT_ID, GoogleSignInCancelled, getNativeGoogleIdToken, isGoogleSignInAvailable, loadGoogleIdentity } from '../services/googleAuth';

const uiFont = Platform.select({ android: 'sans-serif', ios: 'System', web: 'Inter, system-ui, sans-serif' });

/** The four-colour Google "G" mark. */
export function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <Path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <Path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <Path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </Svg>
  );
}

type Props = {
  label?: string;
  /** Called with a Google ID token after the learner picks their Google account. */
  onToken: (idToken: string) => void | Promise<void>;
  onError?: (message: string) => void;
  busy?: boolean;
  mode?: 'signin' | 'signup';
};

/**
 * "or" divider plus Google sign-in. Phone: JapLearn-styled button that opens the Google account
 * picker. Web: Google's official button (required by Google to issue the token in a browser).
 * Hidden entirely on older APKs that do not include the native Google Sign-In module.
 */
export default function GoogleAuthButton({ label = 'Continue with Google', onToken, onError, busy, mode = 'signin' }: Props) {
  const [working, setWorking] = useState(false);
  if (!isGoogleSignInAvailable()) return null;

  const press = async () => {
    if (working || busy) return;
    setWorking(true);
    try {
      await onToken(await getNativeGoogleIdToken());
    } catch (error) {
      if (!(error instanceof GoogleSignInCancelled)) onError?.(error instanceof Error ? error.message : 'Google sign-in failed. Please try again.');
    } finally {
      setWorking(false);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.or}>or</Text>
        <View style={styles.line} />
      </View>
      {Platform.OS === 'web'
        ? <GoogleWebButton mode={mode} onToken={onToken} onError={onError} />
        : <Pressable onPress={() => void press()} disabled={working || busy} accessibilityRole="button" accessibilityLabel={label}
            style={({ pressed }) => [styles.button, pressed && styles.pressed, (working || busy) && styles.disabled]}>
            {working || busy ? <ActivityIndicator size="small" color="#7B2CBF" /> : <View style={styles.iconBadge}><GoogleIcon size={20} /></View>}
            <Text style={styles.text}>{working || busy ? 'Signing in…' : label}</Text>
          </Pressable>}
    </View>
  );
}

let webButtonCount = 0;

/** Renders Google's official "Sign in with Google" button on the web. */
function GoogleWebButton({ mode, onToken, onError }: Pick<Props, 'mode' | 'onToken' | 'onError'>) {
  const id = useRef(`google-button-${++webButtonCount}`).current;
  const tokenRef = useRef(onToken);
  const errorRef = useRef(onError);
  tokenRef.current = onToken;
  errorRef.current = onError;
  const { width } = useWindowDimensions();
  const [failed, setFailed] = useState('');

  useEffect(() => {
    let live = true;
    loadGoogleIdentity().then((google) => {
      if (!live) return;
      google.accounts.id.initialize({
        client_id: GOOGLE_WEB_CLIENT_ID,
        callback: (response: { credential?: string }) => {
          if (response?.credential) void tokenRef.current(response.credential);
          else errorRef.current?.('Google sign-in was not completed. Please try again.');
        },
        ux_mode: 'popup',
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      const host = document.getElementById(id);
      if (!host) return;
      host.innerHTML = '';
      google.accounts.id.renderButton(host, {
        type: 'standard', theme: 'outline', size: 'large', shape: 'pill', logo_alignment: 'center',
        text: mode === 'signup' ? 'signup_with' : 'signin_with',
        width: Math.max(220, Math.min(400, Math.round(width - 64))),
      });
    }).catch((error) => { if (live) setFailed(error instanceof Error ? error.message : 'Google sign-in could not load.'); });
    return () => { live = false; };
  }, [id, mode, width]);

  return (
    <View style={styles.webHost}>
      <View nativeID={id} style={styles.webButton} />
      {!!failed && <Text style={styles.webError}>{failed}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%', marginTop: 14 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  line: { flex: 1, height: 1, backgroundColor: '#E6DDEA' },
  or: { fontFamily: uiFont, fontSize: 12, fontWeight: '500', letterSpacing: 0.4, color: '#9A8FA0', textTransform: 'uppercase' },
  button: {
    width: '100%', height: 54, borderRadius: 15, borderWidth: 1, borderColor: '#E3D8EA', backgroundColor: '#FFFFFF',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    shadowColor: '#29232D', shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1,
  },
  pressed: { backgroundColor: '#F7F2FA', transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.7 },
  iconBadge: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  text: { fontFamily: uiFont, fontSize: 15, fontWeight: '500', color: '#29232D' },
  webHost: { width: '100%', alignItems: 'center', minHeight: 44 },
  webButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  webError: { fontFamily: uiFont, fontSize: 12, color: '#B23D6B', marginTop: 8, textAlign: 'center' },
});
