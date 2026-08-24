export const SUMI_VOICE_PROFILE = {
  profileId: 'sumi-bilingual-young-adult-v1',
  displayName: 'Sumi',
  persona: 'Warm, encouraging Japanese speaking coach in her early twenties',
  generation: {
    japanese: {
      locale: 'ja-JP',
      voiceId: 'ja-JP-NanamiNeural',
      rate: '-3%',
    },
    english: {
      locale: 'en-US',
      voiceId: 'en-US-JennyNeural',
      rate: '-3%',
    },
  },
  clips: {
    conversation: {
      ja: require('../assets/audio/sumi-conversation-ja.mp3'),
      en: require('../assets/audio/sumi-conversation-en.mp3'),
    },
    speaking: {
      ja: require('../assets/audio/sumi-guided-phrase-ja.mp3'),
      en: require('../assets/audio/sumi-guided-phrase-en.mp3'),
    },
  },
} as const;

export type SumiRoom = keyof typeof SUMI_VOICE_PROFILE.clips;
export type SumiLanguage = keyof typeof SUMI_VOICE_PROFILE.clips.conversation;
