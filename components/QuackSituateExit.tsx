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
  title: string;
  subtitle: string;
  status: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  onComplete: () => void;
};

const tintForColor = (color: string) => {
  if (color === '#65A936') return '#EAF5E3';
  if (color === '#D88727') return '#FFF0DC';
  return '#F0E4FA';
};

export default function QuackSituateExit({
  title,
  subtitle,
  status,
  color,
  icon,
  onComplete,
}: Props) {
  const [progress, setProgress] = useState(8);
  const pulse = useRef(new Animated.Value(1)).current;
  const tint = tintForColor(color);

  useEffect(() => {
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );

    pulseAnimation.start();

    const tick = setInterval(() => {
      setProgress((value) => Math.min(100, value + 8));
    }, 80);

    const done = setTimeout(onComplete, 1150);

    return () => {
      pulseAnimation.stop();
      clearInterval(tick);
      clearTimeout(done);
    };
  }, [onComplete, pulse]);

  return (
    <View style={[styles.screen, { backgroundColor: tint }]}>
      <View style={[styles.orb, styles.orbTop, { backgroundColor: color }]} />
      <View style={[styles.orb, styles.orbBottom, { backgroundColor: color }]} />

      <View style={styles.card}>
        <View style={[styles.badge, { backgroundColor: tint }]}>
          <Ionicons name={icon} size={16} color={color} />
          <Text style={[styles.badgeText, { color }]}>MISSION COMPLETE</Text>
        </View>

        <Animated.View
          style={[
            styles.emblemStage,
            {
              transform: [{ scale: pulse }],
            },
          ]}
        >
          <View
            style={[
              styles.emblemGlow,
              {
                backgroundColor: `${color}20`,
                borderColor: `${color}50`,
              },
            ]}
          />
          <View style={[styles.emblem, { backgroundColor: color }]}>
            <Ionicons name={icon} size={38} color="#FFFFFF" />
          </View>
          <Image
            source={require('../assets/hello.png')}
            style={styles.mascot}
            resizeMode="contain"
          />
        </Animated.View>

        <Text style={styles.kicker}>SEE YOU NEXT MISSION</Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>

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

        <View style={[styles.note, { backgroundColor: tint }]}>
          <Ionicons name="sparkles" size={15} color={color} />
          <Text style={styles.noteText}>
            {progress < 100
              ? 'Closing this activity safely'
              : 'Returning to your mission map'}
          </Text>
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
    width: 260,
    height: 260,
    borderRadius: 130,
    opacity: 0.09,
  },
  orbTop: {
    top: -90,
    right: -75,
  },
  orbBottom: {
    bottom: -110,
    left: -80,
  },
  card: {
    width: '100%',
    maxWidth: 430,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 27,
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
    letterSpacing: 1.2,
  },
  emblemStage: {
    width: 205,
    height: 190,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 13,
  },
  emblemGlow: {
    position: 'absolute',
    width: 155,
    height: 155,
    borderRadius: 78,
    borderWidth: 2,
  },
  emblem: {
    width: 92,
    height: 92,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascot: {
    position: 'absolute',
    right: 3,
    bottom: 0,
    width: 88,
    height: 94,
  },
  kicker: {
    color: '#65A936',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.4,
  },
  title: {
    color: '#432750',
    fontFamily: 'Jua',
    fontSize: 31,
    lineHeight: 37,
    textAlign: 'center',
    marginTop: 5,
  },
  subtitle: {
    color: '#817384',
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 6,
  },
  statusRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 23,
  },
  statusText: {
    flex: 1,
    color: '#756778',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.7,
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
  note: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 15,
    padding: 12,
    marginTop: 17,
  },
  noteText: {
    color: '#685A6B',
    fontSize: 10,
    fontWeight: '700',
  },
});
