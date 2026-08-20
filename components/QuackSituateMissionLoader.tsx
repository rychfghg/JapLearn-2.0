import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Props = {
  action: string;
  color: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  mascot: number;
  mode: 'enter' | 'exit';
  title: string;
  onComplete: () => void;
};

const getTint = (color: string) => {
  if (color === '#65A936') return '#EAF5E3';
  if (color === '#D88727') return '#FFF0DC';
  return '#F0E4FA';
};

export default function QuackSituateMissionLoader({
  action,
  color,
  description,
  icon,
  mascot,
  mode,
  title,
  onComplete,
}: Props) {
  const [progress, setProgress] = useState(8);
  const pulse = useRef(new Animated.Value(1)).current;
  const tint = getTint(color);

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    pulseAnimation.start();

    const interval = setInterval(() => {
      setProgress((current) => Math.min(100, current + 12));
    }, 70);

    const completion = setTimeout(onComplete, 850);

    return () => {
      pulseAnimation.stop();
      clearInterval(interval);
      clearTimeout(completion);
    };
  }, [onComplete, pulse]);

  const status = mode === 'enter'
    ? progress < 45
      ? 'Preparing your mission'
      : progress < 85
        ? 'Setting the challenge'
        : 'Mission ready!'
    : progress < 45
      ? 'Closing your mission'
      : progress < 85
        ? 'Saving the activity state'
        : 'Returning to the mission map';

  return (
    <View style={[styles.screen, { backgroundColor: tint }]}>
      <View style={[styles.orb, styles.orbTop, { backgroundColor: color }]} />
      <View style={[styles.orb, styles.orbBottom, { backgroundColor: color }]} />

      <View style={styles.card}>
        <View style={[styles.badge, { backgroundColor: tint }]}>
          <Ionicons name={icon} size={16} color={color} />
          <Text style={[styles.badgeText, { color }]}>{action}</Text>
        </View>

        <Animated.View
          style={[
            styles.stage,
            {
              transform: [{ scale: pulse }],
            },
          ]}
        >
          <View
            style={[
              styles.glow,
              {
                backgroundColor: `${color}20`,
                borderColor: `${color}50`,
              },
            ]}
          />
          <View style={[styles.emblem, { backgroundColor: color }]}>
            <Ionicons name={icon} size={34} color="#FFFFFF" />
          </View>
          <Image source={mascot} style={styles.mascot} resizeMode="contain" />
        </Animated.View>

        <Text style={styles.kicker}>
          {mode === 'enter' ? 'YOUR NEXT PRACTICE' : 'MISSION WRAPPED UP'}
        </Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <View style={styles.statusRow}>
          <Text style={styles.statusText}>{status}</Text>
          <Text style={[styles.percent, { color }]}>{progress}%</Text>
        </View>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                width: `${progress}%`,
                backgroundColor: color,
              },
            ]}
          />
        </View>

        <View style={[styles.hint, { backgroundColor: tint }]}>
          <Ionicons name="sparkles" size={14} color={color} />
          <Text style={styles.hintText}>{status}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    width: 270,
    height: 270,
    borderRadius: 135,
    opacity: 0.09,
  },
  orbTop: {
    top: -90,
    right: -75,
  },
  orbBottom: {
    bottom: -110,
    left: -85,
  },
  card: {
    width: '100%',
    maxWidth: 430,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    padding: 25,
    alignItems: 'center',
    shadowColor: '#432750',
    shadowOpacity: 0.15,
    shadowRadius: 22,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    elevation: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.15,
  },
  stage: {
    width: 210,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  glow: {
    position: 'absolute',
    width: 158,
    height: 158,
    borderRadius: 79,
    borderWidth: 2,
  },
  emblem: {
    width: 90,
    height: 90,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascot: {
    position: 'absolute',
    right: 2,
    bottom: 0,
    width: 92,
    height: 98,
  },
  kicker: {
    color: '#65A936',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.25,
  },
  title: {
    color: '#432750',
    fontFamily: 'Jua',
    fontSize: 32,
    textAlign: 'center',
    marginTop: 5,
  },
  description: {
    color: '#817384',
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 7,
  },
  statusRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 23,
  },
  statusText: {
    color: '#756778',
    fontSize: 9,
    fontWeight: '800',
  },
  percent: {
    fontSize: 11,
    fontWeight: '900',
  },
  track: {
    width: '100%',
    height: 10,
    borderRadius: 8,
    backgroundColor: '#ECE5EE',
    overflow: 'hidden',
    marginTop: 8,
  },
  fill: {
    height: '100%',
    borderRadius: 8,
  },
  hint: {
    width: '100%',
    minHeight: 42,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  hintText: {
    color: '#675A6A',
    fontSize: 10,
    fontWeight: '700',
  },
});
