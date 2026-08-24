import React, { useEffect, useRef } from 'react';
import {
  Animated,
  ImageResizeMode,
  ImageSourcePropType,
  ImageStyle,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';

type SmoothSpriteProps = {
  frames: readonly ImageSourcePropType[];
  activeIndex: number;
  style: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
  transitionDuration?: number;
};

export default function SmoothSprite({
  frames,
  activeIndex,
  style,
  imageStyle,
  resizeMode = 'contain',
  transitionDuration = 90,
}: SmoothSpriteProps) {
  const opacities = useRef(
    frames.map((_, index) => new Animated.Value(index === activeIndex ? 1 : 0)),
  ).current;

  useEffect(() => {
    opacities.forEach((opacity) => opacity.stopAnimation());

    Animated.parallel(
      opacities.map((opacity, index) =>
        Animated.timing(opacity, {
          toValue: index === activeIndex ? 1 : 0,
          duration: transitionDuration,
          useNativeDriver: true,
        }),
      ),
    ).start();

    return () => {
      opacities.forEach((opacity) => opacity.stopAnimation());
    };
  }, [activeIndex, opacities, transitionDuration]);

  return (
    <Animated.View pointerEvents="none" style={style}>
      {frames.map((source, index) => (
        <Animated.Image
          key={index}
          source={source}
          resizeMode={resizeMode}
          fadeDuration={0}
          style={[
            StyleSheet.absoluteFillObject,
            imageStyle,
            { opacity: opacities[index] },
          ]}
        />
      ))}
    </Animated.View>
  );
}
