import { Asset } from 'expo-asset';
import {
  Audio,
  AVPlaybackSource,
  AVPlaybackStatus,
  AVPlaybackStatusToSet,
  InterruptionModeAndroid,
  InterruptionModeIOS,
} from 'expo-av';

export const prepareGameAudio = async () => {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
};

export const loadBundledSound = async (
  source: AVPlaybackSource,
  initialStatus: AVPlaybackStatusToSet = {},
  onPlaybackStatusUpdate?: (status: AVPlaybackStatus) => void,
) => {
  let playableSource = source;

  if (typeof source === 'number') {
    const asset = Asset.fromModule(source);
    await asset.downloadAsync();

    if (asset.localUri) {
      playableSource = { uri: asset.localUri };
    }
  }

  await prepareGameAudio();

  return Audio.Sound.createAsync(
    playableSource,
    initialStatus,
    onPlaybackStatusUpdate,
  );
};

export const stopAndUnloadSound = async (
  sound: Audio.Sound | null | undefined,
) => {
  if (!sound) return;

  try {
    const status = await sound.getStatusAsync();

    if (status.isLoaded) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }
  } catch {
    // The sound may already have been released by a route transition.
  }
};
