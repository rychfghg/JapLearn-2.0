import AsyncStorage from '@react-native-async-storage/async-storage';
import expoconfig from '../expoconfig';

type PendingSubmission = {
  id: string;
  email: string;
  path: string;
  method: 'POST' | 'PUT';
  body: Record<string, unknown>;
  createdAt: string;
};

const QUEUE_KEY = 'japlearn:offline-submissions:v1';
const contentKey = (path: string) => `japlearn:offline-content:v1:${path}`;
const accountKey = (email: string, path: string) => `japlearn:offline-account:v1:${email.trim().toLowerCase()}:${path}`;
let storageOperation: Promise<unknown> = Promise.resolve();
let syncing = false;

const locked = <T>(operation: () => Promise<T>): Promise<T> => {
  const result = storageOperation.then(operation, operation);
  storageOperation = result.then(() => undefined, () => undefined);
  return result;
};

const readQueue = async (): Promise<PendingSubmission[]> => {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  try {
    const entries: unknown = JSON.parse(raw);
    return Array.isArray(entries) ? entries.filter((entry): entry is PendingSubmission =>
      Boolean(entry && typeof entry === 'object' && typeof entry.id === 'string' && typeof entry.email === 'string' && typeof entry.path === 'string')) : [];
  } catch {
    return [];
  }
};

const requestWithTimeout = async (path: string, options?: RequestInit): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    return await fetch(`${expoconfig.API_URL}${path}`, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
};

/** Cache only published game/lesson content, never another learner's private data. */
export async function loadOfflineContent<T>(path: string): Promise<T> {
  const saved = await AsyncStorage.getItem(contentKey(path));
  if (saved !== null) {
    try {
      const cached = JSON.parse(saved) as T;
      void requestWithTimeout(path).then(async (response) => {
        if (response.ok && response.status !== 204) {
          await AsyncStorage.setItem(contentKey(path), JSON.stringify(await response.json()));
        }
      }).catch(() => undefined);
      return cached;
    } catch { /* A damaged cache is replaced by the network copy below. */ }
  }
  try {
    const response = await requestWithTimeout(path);
    if (!response.ok) throw new Error(`Content unavailable (${response.status}).`);
    const content = await response.json() as T;
    await AsyncStorage.setItem(contentKey(path), JSON.stringify(content)).catch(() => undefined);
    return content;
  } catch (error) {
    const cached = await AsyncStorage.getItem(contentKey(path));
    if (cached !== null) return JSON.parse(cached) as T;
    throw error;
  }
}

/** The account key prevents one learner's cached progress appearing for another. */
export async function loadOfflineAccountJson<T>(email: string, path: string): Promise<T> {
  const key = accountKey(email, path);
  try {
    const response = await requestWithTimeout(path);
    if (!response.ok || response.status === 204) throw new Error(`Progress unavailable (${response.status}).`);
    const data = await response.json() as T;
    await AsyncStorage.setItem(key, JSON.stringify(data)).catch(() => undefined);
    return data;
  } catch (error) {
    const cached = await AsyncStorage.getItem(key);
    if (cached !== null) return JSON.parse(cached) as T;
    throw error;
  }
}

export async function queueOfflineSubmission(
  email: string,
  path: string,
  body: Record<string, unknown>,
  method: 'POST' | 'PUT' = 'POST',
): Promise<string> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) throw new Error('Sign in before saving progress.');
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const entry: PendingSubmission = {
    id, email: normalizedEmail, path, method,
    body: { ...body, email: normalizedEmail, clientAttemptId: id },
    createdAt: new Date().toISOString(),
  };
  await locked(async () => {
    const queue = await readQueue();
    queue.push(entry);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  });
  return id;
}

/** Retains failed entries. Replays only the currently signed-in learner's records. */
export async function syncOfflineSubmissions(email: string): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || syncing) return;
  syncing = true;
  try {
    const queue = await locked(readQueue);
    for (const entry of queue) {
      if (entry.email !== normalizedEmail) continue;
      try {
        const response = await requestWithTimeout(entry.path, {
          method: entry.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entry.body),
        });
        if (!response.ok) {
          // A validation failure needs a fix, but must not silently erase earned scores.
          if (response.status >= 500) break;
          continue;
        }
        await locked(async () => {
          const current = await readQueue();
          await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(current.filter((item) => item.id !== entry.id)));
        });
      } catch {
        break;
      }
    }
  } finally {
    syncing = false;
  }
}

export async function getPendingSubmissions(email: string): Promise<PendingSubmission[]> {
  const normalizedEmail = email.trim().toLowerCase();
  return locked(async () => (await readQueue()).filter((entry) => entry.email === normalizedEmail));
}
