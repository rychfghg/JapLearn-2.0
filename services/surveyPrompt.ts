import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

/**
 * Decides when the capstone survey pop-up appears on the student home screen.
 *
 * It appears once per "visit":
 *   - right after a student signs in, or
 *   - when the app is opened again after SESSION_GAP_MS without use.
 * Going back to Home during the same visit never shows it again.
 */
export const SURVEY_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLSe70qixAnIIiZ5nIxIqlWnnmy1eeThVtM2l3fbt2DqgFkHYhw/viewform';

/** How long the app must go unused before the pop-up may appear again. */
const SESSION_GAP_MS = 3 * 60 * 60 * 1000; // 3 hours

const PENDING_KEY = 'surveyPrompt:pendingAfterLogin';
const LAST_ACTIVE_KEY = 'surveyPrompt:lastActiveAt';

// Remember the moment the app is left, so a later return can be measured.
let listening = false;
function trackActivity() {
  if (listening) return;
  listening = true;
  AppState.addEventListener('change', (state) => {
    if (state === 'background' || state === 'inactive') {
      void AsyncStorage.setItem(LAST_ACTIVE_KEY, String(Date.now())).catch(() => undefined);
    }
  });
}
trackActivity();

// In-memory flag + listeners so a Home screen that is already mounted still reacts.
let pendingInMemory = false;
const listeners = new Set<() => void>();

/** Lets the home screen hear about a sign-in that happens while it is mounted. */
export function onSurveyPending(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

/** Called after a successful student sign-in. */
export async function markSurveyAfterLogin() {
  pendingInMemory = true;
  try {
    await AsyncStorage.setItem(PENDING_KEY, '1');
  } catch {
    // The in-memory flag still covers this session.
  }
  listeners.forEach((listener) => listener());
}

/**
 * Returns true when the pop-up should show now, and records this visit so
 * returning to Home later in the same visit does not show it again.
 */
export async function claimSurveyPrompt(): Promise<boolean> {
  if (pendingInMemory) {
    pendingInMemory = false;
    await AsyncStorage.multiSet([[LAST_ACTIVE_KEY, String(Date.now())]]).catch(() => undefined);
    await AsyncStorage.removeItem(PENDING_KEY).catch(() => undefined);
    return true;
  }
  try {
    const [pending, lastActiveRaw] = await Promise.all([
      AsyncStorage.getItem(PENDING_KEY),
      AsyncStorage.getItem(LAST_ACTIVE_KEY),
    ]);
    const now = Date.now();
    const lastActive = Number(lastActiveRaw);
    // No record yet = first visit since this feature shipped (already signed-in users): show once.
    const returnedAfterBreak = !lastActiveRaw || !Number.isFinite(lastActive) || now - lastActive >= SESSION_GAP_MS;
    const show = pending === '1' || returnedAfterBreak;

    // This visit is now "active", whether or not the pop-up shows.
    await AsyncStorage.multiSet([[LAST_ACTIVE_KEY, String(now)]]);
    if (pending) await AsyncStorage.removeItem(PENDING_KEY);

    return show;
  } catch {
    return false;
  }
}
