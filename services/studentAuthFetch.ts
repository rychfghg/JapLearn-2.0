import AsyncStorage from '@react-native-async-storage/async-storage';
import expoconfig from '../expoconfig';

/**
 * Attaches the signed-in student's session token (X-Student-Token) to the routes that
 * change a student's own progress, so the backend can confirm the request really comes
 * from that student. Installed once at startup; every screen and the offline sync queue
 * go through global fetch, so none of them need their own change.
 */
// Every request to the JapLearn backend carries the student's own token, so the
// server can confirm a student only reads/writes their own learning data.
// It is never sent to any other site.
const isJapLearnApi = (url: string) =>
  url.startsWith(String(expoconfig.API_URL).replace(/\/+$/, '') + '/api/');

async function storedStudentToken(): Promise<string | null> {
  try {
    const raw = await AsyncStorage.getItem('user');
    if (!raw) return null;
    const user = JSON.parse(raw);
    return user?.role === 'student' && typeof user.portalSessionToken === 'string' && user.portalSessionToken
      ? user.portalSessionToken
      : null;
  } catch {
    return null;
  }
}

let installed = false;

export function installStudentAuthFetch() {
  if (installed || typeof globalThis.fetch !== 'function') return;
  installed = true;
  const baseFetch = globalThis.fetch.bind(globalThis);

  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (!isJapLearnApi(url)) return baseFetch(input, init);

    const headers = new Headers(init?.headers || (typeof input === 'object' && 'headers' in input ? input.headers : undefined));
    if (!headers.has('X-Student-Token')) {
      const token = await storedStudentToken();
      if (token) headers.set('X-Student-Token', token);
    }
    return baseFetch(input, { ...init, headers });
  }) as typeof fetch;
}
