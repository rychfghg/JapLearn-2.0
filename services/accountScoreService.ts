import expoconfig from '../expoconfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPendingSubmissions, queueOfflineSubmission, syncOfflineSubmissions } from './offlineSync';

export type AccountScore = {
  id?: string;
  name: string;
  email: string;
  game: string;
  date: string;
  score: number;
  maxScore: number;
  correctAnswers: number;
  totalQuestions: number;
  completed: boolean;
  mode: string;
};

const bestKey = (email: string, game: string) => `japlearn:best-score:v1:${email}:${game.toUpperCase()}`;

const betterScore = (first: AccountScore | null, second: AccountScore | null): AccountScore | null => {
  if (!first) return second;
  if (!second) return first;
  return Number(first.score) >= Number(second.score) ? first : second;
};

export async function saveAccountScore(payload: AccountScore): Promise<AccountScore> {
  const email = payload.email.trim().toLowerCase();
  if (!email) throw new Error('A signed-in learner is required to save this score.');
  const normalized = { ...payload, email, game: payload.game.toUpperCase() };
  await queueOfflineSubmission(email, '/api/scores/high-score', normalized);
  const key = bestKey(email, normalized.game);
  const previousRaw = await AsyncStorage.getItem(key);
  const previous = previousRaw ? JSON.parse(previousRaw) as AccountScore : null;
  const best = betterScore(previous, normalized) || normalized;
  await AsyncStorage.setItem(key, JSON.stringify(best));
  void syncOfflineSubmissions(email);
  return best;
}

export async function getAccountHighScore(email: string, game: string): Promise<AccountScore | null> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return null;
  const key = bestKey(normalizedEmail, game);
  const raw = await AsyncStorage.getItem(key);
  let best = raw ? JSON.parse(raw) as AccountScore : null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(
      `${expoconfig.API_URL}/api/scores/high-score?email=${encodeURIComponent(normalizedEmail)}&game=${encodeURIComponent(game)}`,
      { signal: controller.signal },
    );
    if (response.ok && response.status !== 204) {
      best = betterScore(best, await response.json() as AccountScore);
      if (best) await AsyncStorage.setItem(key, JSON.stringify(best));
    }
  } catch { /* A saved personal best remains visible offline. */ }
  finally { clearTimeout(timeout); }
  const pending = await getPendingSubmissions(normalizedEmail);
  for (const entry of pending) {
    if (entry.path === '/api/scores/high-score' && String(entry.body.game).toUpperCase() === game.toUpperCase()) {
      best = betterScore(best, entry.body as AccountScore);
    }
  }
  return best;
}
