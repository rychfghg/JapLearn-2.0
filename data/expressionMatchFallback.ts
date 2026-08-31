export type ExpressionMatchChoice = {
  japanese: string;
  romaji: string;
};

export type ExpressionMatchFallbackMoment = {
  id: string;
  level: number;
  setNumber: number;
  topic: string;
  location: string;
  sceneKey: string;
  imageUrl: string;
  imageAlt: string;
  secondaryImageUrl: string;
  secondaryImageAlt: string;
  audioUrl: string;
  scenario: string;
  secondaryScenario: string;
  hint: string;
  correctAnswer: string;
  explanation: string;
  choices: ExpressionMatchChoice[];
};

type FallbackSeed = readonly [
  japanese: string,
  romaji: string,
  situation: string,
  alternateSituation: string,
  hint: string,
];

const fallbackSeeds: readonly FallbackSeed[] = [
  ['おはようございます', 'Ohayou gozaimasu', 'You greet a teacher early in the morning.', 'You say goodbye to a classmate after school.', 'Think about the time of day and who you are greeting.'],
  ['こんにちは', 'Konnichiwa', 'You meet a neighbor during the afternoon.', 'Your family is about to begin dinner.', 'Use the usual daytime greeting.'],
  ['こんばんは', 'Konbanwa', 'You meet your host in the evening.', 'You arrive at school before morning class.', 'Notice whether the scene happens in the evening.'],
  ['ありがとうございます', 'Arigatou gozaimasu', 'A classmate returns the notebook you lost.', 'A traveler asks where the station is.', 'Choose the situation that calls for polite gratitude.'],
  ['すみません', 'Sumimasen', 'You accidentally bump into someone at the station.', 'Your friend wins a school competition.', 'This phrase can be used for a brief apology.'],
  ['さようなら', 'Sayounara', 'A student says goodbye to a teacher after class.', 'A guest enters a home for the first time.', 'Look for the farewell situation.'],
  ['いただきます', 'Itadakimasu', 'Everyone is ready to begin eating.', 'Everyone has just finished the meal.', 'This phrase is said before eating.'],
  ['ごちそうさまでした', 'Gochisousama deshita', 'You thank the host after finishing a meal.', 'You introduce yourself to a new class.', 'This phrase is said after eating.'],
  ['いってきます', 'Ittekimasu', 'You tell your family that you are leaving home.', 'You welcome someone who has returned home.', 'The speaker is the person leaving.'],
  ['いってらっしゃい', 'Itterasshai', 'You see a family member off at the door.', 'You return home and announce your arrival.', 'Say this to the person who is leaving.'],
  ['ただいま', 'Tadaima', 'You return home and greet your family.', 'You meet someone for the first time.', 'The speaker has just come home.'],
  ['おかえりなさい', 'Okaerinasai', 'You welcome a family member home.', 'You ask a shopkeeper for help.', 'Say this to the person who returned.'],
  ['はじめまして', 'Hajimemashite', 'You meet a new classmate for the first time.', 'You congratulate a friend on an award.', 'This belongs to a first meeting.'],
  ['よろしくおねがいします', 'Yoroshiku onegaishimasu', 'You politely finish introducing yourself to a new group.', 'You leave the office before your coworkers.', 'Use this to close an introduction politely.'],
  ['おめでとうございます', 'Omedetou gozaimasu', 'Your friend has won a competition.', 'Your friend is feeling sick.', 'Celebrate another person’s success.'],
  ['おつかれさまです', 'Otsukaresama desu', 'You greet a teammate after practice.', 'You enter someone’s home as a guest.', 'Acknowledge the person’s effort.'],
  ['おねがいします', 'Onegaishimasu', 'You politely ask a clerk for assistance.', 'You decline help because you are fine.', 'This phrase supports a polite request.'],
  ['だいじょうぶです', 'Daijoubu desu', 'Someone offers help, but you are okay.', 'You interrupt a teacher to ask a question.', 'Politely say that you are fine.'],
  ['しつれいします', 'Shitsurei shimasu', 'You enter the teacher’s office politely.', 'You welcome a friend home.', 'Use this when entering a formal space.'],
  ['またあした', 'Mata ashita', 'You will see your classmate again tomorrow.', 'You meet a manager for the first time.', 'The next meeting will be tomorrow.'],
];

const levelLabels = {
  1: { difficulty: 'Easy', topic: 'Everyday situations' },
  2: { difficulty: 'Medium', topic: 'Social situations' },
  3: { difficulty: 'Hard', topic: 'Formal communication' },
} as const;

export function createExpressionMatchFallback(
  requestedLevel: number,
): ExpressionMatchFallbackMoment[] {
  const level = requestedLevel === 3 ? 3 : requestedLevel === 2 ? 2 : 1;
  const label = levelLabels[level];

  return fallbackSeeds.map((seed, index) => {
    const next = fallbackSeeds[(index + level) % fallbackSeeds.length];

    return {
      id: `fallback-expression-${level}-${index + 1}`,
      level,
      setNumber: 1,
      topic: label.topic,
      location: `${label.difficulty} practice`,
      sceneKey: `fallback-expression-${level}-${index + 1}`,
      imageUrl: '',
      imageAlt: `Situation: ${seed[2]}`,
      secondaryImageUrl: '',
      secondaryImageAlt: `Situation: ${seed[3]}`,
      audioUrl: '',
      scenario: seed[2],
      secondaryScenario: seed[3],
      hint: seed[4],
      correctAnswer: seed[0],
      explanation: `${seed[0]} (${seed[1]}) fits the first situation more naturally.`,
      choices: [
        { japanese: seed[0], romaji: seed[1] },
        { japanese: next[0], romaji: next[1] },
      ],
    };
  });
}
