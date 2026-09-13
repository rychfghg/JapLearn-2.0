import { Platform } from 'react-native';

const rgba = (hex, opacity) => {
  const value = hex.replace('#', '');
  const number = Number.parseInt(value.length === 3
    ? value.split('').map((part) => part + part).join('')
    : value, 16);
  return `rgba(${(number >> 16) & 255}, ${(number >> 8) & 255}, ${number & 255}, ${opacity})`;
};

/** Match the soft web shadow without Android elevation's dark square halo. */
export const platformShadow = (color, opacity, blur, y, elevation = 2) => {
  if (Platform.OS === 'android') {
    // React Native 0.76's boxShadow works on Android 9+ with New Architecture.
    // Older Android versions retain only a very small elevation fallback.
    return Number(Platform.Version) >= 28
      ? { boxShadow: [{ offsetX: 0, offsetY: y, blurRadius: blur, spreadDistance: 0, color: rgba(color, opacity) }] }
      : { elevation: Math.min(2, elevation), shadowColor: color };
  }
  return { shadowColor: color, shadowOpacity: opacity, shadowRadius: blur,
    shadowOffset: { width: 0, height: y } };
};
