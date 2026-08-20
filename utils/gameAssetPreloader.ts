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
  gameAssetPromise ??= preloadQuackamoleAssets().then(() => preloadImages(otherGameAssets));
  return gameAssetPromise;
};

export const preloadQuackamoleAssets = () => {
  quackamoleAssetPromise ??= preloadImages(quackamoleAssets);
  return quackamoleAssetPromise;
};
