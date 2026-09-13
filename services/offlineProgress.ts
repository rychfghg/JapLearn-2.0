import AsyncStorage from '@react-native-async-storage/async-storage';
import expoconfig from '../expoconfig';
import { getPendingSubmissions, queueOfflineSubmission, syncOfflineSubmissions } from './offlineSync';

type Progress = Record<string, unknown>;
const keyFor = (email: string) => `japlearn:lesson-progress:v1:${email.trim().toLowerCase()}`;

export async function loadOfflineProgress(email: string): Promise<Progress> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return {};
  const key = keyFor(normalized);
  let saved: Progress = {};
  const raw = await AsyncStorage.getItem(key);
  if (raw) {
    try { saved = JSON.parse(raw) as Progress; } catch { /* Ignore malformed old cache. */ }
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    let response: Response;
    try {
      response = await fetch(`${expoconfig.API_URL}/api/progress/${encodeURIComponent(normalized)}`, { signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
    if (response.ok) {
      const remote = await response.json() as Progress;
      saved = { ...remote, ...Object.fromEntries(Object.entries(saved).filter(([field, value]) => value === true && remote[field] !== true)) };
    }
  } catch { /* The saved account snapshot remains available offline. */ }
  const pending = await getPendingSubmissions(normalized);
  for (const entry of pending) {
    if (entry.method !== 'PUT' || !entry.path.startsWith(`/api/progress/${encodeURIComponent(normalized)}/updateField?`)) continue;
    const match = entry.path.match(/[?&]field=([^&]+)/);
    if (match) saved[decodeURIComponent(match[1])] = true;
  }
  await AsyncStorage.setItem(key, JSON.stringify(saved));
  return saved;
}

export async function markOfflineProgress(email: string, field: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !/^[a-zA-Z0-9_]+$/.test(field)) throw new Error('Invalid progress update.');
  const key = keyFor(normalized);
  const raw = await AsyncStorage.getItem(key);
  const previous = raw ? JSON.parse(raw) as Progress : {};
  await queueOfflineSubmission(normalized,
    `/api/progress/${encodeURIComponent(normalized)}/updateField?field=${encodeURIComponent(field)}&value=true`,
    {}, 'PUT');
  await AsyncStorage.setItem(key, JSON.stringify({ ...previous, [field]: true }));
  void syncOfflineSubmissions(normalized);
}

/** Drop-in response shape for the existing lesson screens. */
export async function offlineProgressFetch(url: string, options?: RequestInit): Promise<Response> {
  const match = url.match(/\/api\/progress\/([^/?]+)(?:\/updateField)?/);
  if (!match) return fetch(url, options);
  const email = decodeURIComponent(match[1]);
  const method = (options?.method || 'GET').toUpperCase();
  if (method === 'GET') {
    const progress = await loadOfflineProgress(email);
    return new Response(JSON.stringify(progress), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  if (method === 'PUT' && url.includes('/updateField?') && url.includes('value=true')) {
    const field = url.match(/[?&]field=([^&]+)/)?.[1];
    if (!field) throw new Error('Missing progress field.');
    await markOfflineProgress(email, decodeURIComponent(field));
    return new Response(JSON.stringify({ success: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  return fetch(url, options);
}
