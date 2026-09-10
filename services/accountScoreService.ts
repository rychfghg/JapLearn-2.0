import expoconfig from '../expoconfig';

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

const pause = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export async function saveAccountScore(payload: AccountScore): Promise<AccountScore> {
  const email = payload.email.trim().toLowerCase();
  if (!email) throw new Error('A signed-in learner is required to save this score.');

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(`${expoconfig.API_URL}/api/scores/high-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, email }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message || `Score save failed (${response.status}).`);
      return body as AccountScore;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Score save failed.');
      if (attempt < 2) await pause(500 * (attempt + 1));
    }
  }
  throw lastError || new Error('Score save failed.');
}

export async function getAccountHighScore(email: string, game: string): Promise<AccountScore | null> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return null;
  const response = await fetch(
    `${expoconfig.API_URL}/api/scores/high-score?email=${encodeURIComponent(normalizedEmail)}&game=${encodeURIComponent(game)}`,
  );
  if (response.status === 204) return null;
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.message || `Score load failed (${response.status}).`);
  return body as AccountScore;
}
