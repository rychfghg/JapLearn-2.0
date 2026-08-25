import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';

export default function useLessonResume(lessonId: string, email?: string) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const hydrated = useRef(false);
  const storageKey = `japlearn:lesson-resume:${email || 'guest'}:${lessonId}`;

  useEffect(() => {
    let active = true;
    hydrated.current = false;

    AsyncStorage.getItem(storageKey)
      .then((savedIndex) => {
        if (!active) return;

        const parsedIndex = Number(savedIndex);
        if (Number.isInteger(parsedIndex) && parsedIndex >= 0) {
          setCurrentIndex(parsedIndex);
        }
      })
      .finally(() => {
        if (active) hydrated.current = true;
      });

    return () => {
      active = false;
    };
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(storageKey, String(currentIndex)).catch(() => undefined);
  }, [currentIndex, storageKey]);

  return [currentIndex, setCurrentIndex] as const;
}
