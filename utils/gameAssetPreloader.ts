import { Image, ImageSourcePropType } from 'react-native';
import { Asset } from 'expo-asset';

const exerciseCoverAssets: ImageSourcePropType[] = [
  require('../assets/exercise-covers/quack-a-mole-official-v2.png'),
  require('../assets/exercise-covers/quackman-official-v2.png'),
  require('../assets/exercise-covers/quackslate-official-v2.png'),
  require('../assets/exercise-covers/quacksituate-official-v2.png'),
  require('../assets/exercise-covers/quackresponse-official-v3-dialogue.png'),
  require('../assets/idle.png'),
  require('../assets/hello.png'),
  require('../assets/talk.png'),
  require('../assets/thinking.png'),
  require('../assets/Surprised.png'),
];

const quackamoleAssets: ImageSourcePropType[] = [
  // Quack-a-Mole intentionally keeps its original PNG because its full-screen
  // scene and mole layers render more reliably with this source on every target.
  require('../assets/quackamole/quackamole-arena.png'),
  require('../assets/svg/Mole.png'),
  require('../assets/hello.png'),
  require('../assets/thinking.png'),
  require('../assets/talk.png'),
  require('../assets/hammer.png'),
  require('../assets/whack.png'),
];

const otherGameAssets: ImageSourcePropType[] = [
  require('../assets/quackman/quackman-sky-temple.png'),
  require('../assets/quackslate-twilight-workshop-v4.png'),
  require('../assets/quacksituate/quacksituate-loading-v2.png'),
  require('../assets/quacksituate/cards/recognition-mission.png'),
  require('../assets/quacksituate/cards/expression-match-mission.png'),
  require('../assets/quacksituate/cards/politeness-mission.png'),
  require('../assets/Angel.png'),
  require('../assets/Idle_TrapDoor.png'),
  require('../assets/quacktalk/quacktalk-practice-room-v1.png'),
  require('../assets/quacktalk/talk-with-sumi-lounge-v1.png'),
  require('../assets/quacktalk/guided-phrase-studio-v1.png'),
  require('../assets/img/Sumi_PoseB_WinterUni_Smile.png'),
  require('../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Smile.png'),
  require('../assets/img/Sumi_PoseB_WinterUni_Open.png'),
  require('../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Open.png'),
];

const bundledAudioAssets = [
  require('../assets/audio/sumi-welcome-ja.mp3'),
  require('../assets/audio/sumi-welcome-en.mp3'),
  require('../assets/audio/sumi-conversation-ja.mp3'),
  require('../assets/audio/sumi-conversation-en.mp3'),
  require('../assets/audio/sumi-guided-phrase-ja.mp3'),
  require('../assets/audio/sumi-guided-phrase-en.mp3'),
  require('../assets/audio/sfx/quiz.mp3'),
  require('../assets/audio/sfx/quackmanbg.mp3'),
  require('../assets/audio/sfx/quackmanselect.mp3'),
  require('../assets/audio/sfx/whack.mp3'),
  require('../assets/audio/sfx/correct.mp3'),
  require('../assets/audio/sfx/incorrect.mp3'),
  require('../assets/audio/sfx/correct_sfx.mp3'),
  require('../assets/audio/sfx/incorrect_sfx.mp3'),
  require('../assets/audio/politeness/npc-01.mp3'),
  require('../assets/audio/politeness/npc-02.mp3'),
  require('../assets/audio/politeness/npc-03.mp3'),
  require('../assets/audio/politeness/npc-04.mp3'),
  require('../assets/audio/politeness/npc-05.mp3'),
  require('../assets/audio/politeness/npc-06.mp3'),
  require('../assets/audio/politeness/npc-07.mp3'),
  require('../assets/audio/politeness/npc-08.mp3'),
  require('../assets/audio/politeness/npc-09.mp3'),
  require('../assets/audio/politeness/npc-10.mp3'),
  require('../assets/audio/politeness/npc-11.mp3'),
  require('../assets/audio/politeness/npc-12.mp3'),
  require('../assets/audio/politeness/npc-13.mp3'),
  require('../assets/audio/politeness/npc-14.mp3'),
  require('../assets/audio/politeness/npc-15.mp3'),
  require('../assets/audio/politeness/npc-16.mp3'),
  require('../assets/audio/politeness/npc-17.mp3'),
  require('../assets/audio/politeness/npc-18.mp3'),
  require('../assets/audio/politeness/npc-19.mp3'),
  require('../assets/audio/politeness/npc-20.mp3'),
  require('../assets/audio/politeness/npc-21.mp3'),
  require('../assets/audio/politeness/npc-22.mp3'),
  require('../assets/audio/politeness/npc-23.mp3'),
  require('../assets/audio/politeness/npc-24.mp3'),
  require('../assets/audio/politeness/npc-25.mp3'),
  require('../assets/audio/politeness/npc-26.mp3'),
  require('../assets/audio/politeness/npc-27.mp3'),
  require('../assets/audio/politeness/npc-28.mp3'),
  require('../assets/audio/politeness/npc-29.mp3'),
  require('../assets/audio/politeness/npc-30.mp3'),
];

const preloadImages = async (sources: ImageSourcePropType[]) => {
  // Asset.loadAsync persists bundled files for native builds. Image.prefetch
  // warms the browser image cache. Run both without tying either to navigation.
  await Promise.allSettled([
    Asset.loadAsync(sources as number[]),
    ...sources.map((source) => {
      const uri = Image.resolveAssetSource(source)?.uri;
      return uri ? Image.prefetch(uri) : Promise.resolve(false);
    }),
  ]);
};


const preloadAudio = async () => {
  await Asset.loadAsync(bundledAudioAssets);
};

let exerciseCoverPromise: Promise<void> | null = null;
let quackamoleAssetPromise: Promise<void> | null = null;
let gameAssetPromise: Promise<void> | null = null;

export const preloadExerciseCovers = () => {
  exerciseCoverPromise ??= preloadImages(exerciseCoverAssets);
  return exerciseCoverPromise;
};

export const preloadGameAssets = () => {
  // Give Quack-a-Mole priority so its loading scene, tutorial steps, and
  // animated moles are ready before the heavier backgrounds of other games.
  gameAssetPromise ??= Promise.all([
    preloadQuackamoleAssets(),
    preloadImages(otherGameAssets),
    preloadAudio(),
  ]).then(() => undefined);
  return gameAssetPromise;
};

export const preloadQuackamoleAssets = () => {
  quackamoleAssetPromise ??= preloadImages(quackamoleAssets);
  return quackamoleAssetPromise;
};

