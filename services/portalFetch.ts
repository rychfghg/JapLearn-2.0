import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Adds the signed-in teacher/admin portal token to management requests.
 * Student gameplay requests continue using the normal fetch API unchanged.
 */
export async function portalFetch(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  let token = '';

  try {
    const stored = JSON.parse((await AsyncStorage.getItem('user')) || 'null');
    token = typeof stored?.portalSessionToken === 'string'
      ? stored.portalSessionToken.trim()
      : '';
  } catch {
    // The backend will return 401 if a management screen has no valid session.
  }

  const headers = new Headers(init.headers);
  if (token) headers.set('X-Portal-Token', token);

  return fetch(input, { ...init, headers });
}
