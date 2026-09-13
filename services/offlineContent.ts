import AsyncStorage from '@react-native-async-storage/async-storage';
import { loadOfflineContent } from './offlineSync';
import { prefetchContentMedia } from './offlineMedia';

const PUBLIC_GAME_CONTENT = [
  '/api/quackmancontent',
  '/api/quackamolecontent',
  '/api/quackslate/question-bank/system?limit=10',
  '/api/situational/questions?gameType=POLITENESS',
  '/api/situational/questions?gameType=EXPRESSION_MATCH',
  '/api/situational/questions?gameType=RECOGNITION&activeOnly=true',
  '/api/reply-coach/chapters',
];

export async function primeOfflineContent(): Promise<void> {
  const classCode = await AsyncStorage.getItem('classCode');
  const paths = classCode
    ? [...PUBLIC_GAME_CONTENT, `/api/lesson/getLessonByClass/${encodeURIComponent(classCode)}`]
    : PUBLIC_GAME_CONTENT;
  await Promise.allSettled(paths.map(async (path) => {
    const content = await loadOfflineContent(path);
    await prefetchContentMedia(content);
  }));
}
