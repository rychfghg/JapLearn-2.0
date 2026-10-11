const lessons = [
  { key: 'hiragana1', title: 'Hiragana Basics 1', route: '/HiraganaMenu' },
  { key: 'hiragana2', title: 'Hiragana Basics 2', route: '/HiraganaSet2' },
  { key: 'hiragana3', title: 'Hiragana Basics 3', route: '/HiraganaSet3' },
  { key: 'katakana1', title: 'Katakana Basics 1', route: '/KatakanaMenu' },
  { key: 'katakana2', title: 'Katakana Basics 2', route: '/KatakanaSet2' },
  { key: 'katakana3', title: 'Katakana Basics 3', route: '/KatakanaSet3' },
  { key: 'vocab1', title: 'People & Relationships', route: '/Words1' },
  { key: 'vocab2', title: 'School & Professions', route: '/Words2' },
  { key: 'vocab3', title: 'Everyday Places & Objects', route: '/Words3' },
  { key: 'sentence', title: 'Japanese Grammar', route: '/Content3' },
] as const;

export function getHomeContinuation(progress: Record<string, unknown> | null) {
  // A failed refresh must not turn an established learner into a beginner.
  if (progress === null) return { label: 'Continue learning', title: 'Your learning path', action: 'Open lessons', route: '/LearnMenu', icon: 'book-outline' as const };
  const next = lessons.find(lesson => progress[lesson.key] !== true);
  if (!next) return { label: 'Keep practicing', title: 'Lessons complete!', action: 'Play games', route: '/Exercises', icon: 'game-controller-outline' as const };
  const started = lessons.some(lesson => progress[lesson.key] === true);
  return { label: started ? 'Continue learning' : 'Start learning', title: next.title, action: started ? 'Continue' : 'Begin', route: next.route, icon: 'book-outline' as const };
}
