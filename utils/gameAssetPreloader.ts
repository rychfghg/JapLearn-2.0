import { Image, ImageSourcePropType } from 'react-native';

const exerciseCoverAssets: ImageSourcePropType[] = [
  require('../assets/exercise-covers/quack-a-mole-official-v2.webp'),
  require('../assets/exercise-covers/quackman-official-v2.webp'),
  require('../assets/exercise-covers/quackslate-official-v2.webp'),
  require('../assets/exercise-covers/quacksituate-official-v2.webp'),
  require('../assets/exercise-covers/quackresponse-official-v3-dialogue.webp'),
  require('../assets/idle.png'),
  require('../assets/hello.png'),
  require('../assets/talk.png'),
  require('../assets/thinking.png'),
  require('../assets/Surprised.png'),
];

const gameAssets: ImageSourcePropType[] = [
  // Quack-a-Mole intentionally keeps its original PNG because its full-screen
  // scene and mole layers render more reliably with this source on every target.
  require('../assets/quackamole/quackamole-arena.png'),
  require('../assets/svg/Mole.png'),
  require('../assets/quackman/quackman-sky-temple.webp'),
  require('../assets/quackslate-twilight-workshop-v4.webp'),
  require('../assets/quacksituate/quacksituate-loading-v2.webp'),
  require('../assets/quacksituate/cards/recognition-mission.webp'),
  require('../assets/quacksituate/cards/expression-match-mission.webp'),
  require('../assets/quacksituate/cards/politeness-mission.webp'),
  require('../assets/hammer.png'),
  require('../assets/Angel.png'),
  require('../assets/Idle_TrapDoor.png'),
];

const preloadImages = async (sources: ImageSourcePropType[]) => {
  await Promise.allSettled(
    sources.map((source) => {
      const uri = Image.resolveAssetSource(source)?.uri;
      return uri ? Image.prefetch(uri) : Promise.resolve(false);
    }),
  );
};

let exerciseCoverPromise: Promise<void> | null = null;
let gameAssetPromise: Promise<void> | null = null;

export const preloadExerciseCovers = () => {
  exerciseCoverPromise ??= preloadImages(exerciseCoverAssets);
  return exerciseCoverPromise;
};

export const preloadGameAssets = () => {
  gameAssetPromise ??= preloadImages(gameAssets);
  return gameAssetPromise;
};
