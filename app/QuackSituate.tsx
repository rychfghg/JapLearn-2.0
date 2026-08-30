import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, ImageBackground, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BackIcon from '../assets/svg/back-icon.svg';
import QuackSituateMissionLoader from '../components/QuackSituateMissionLoader';
import styles from '../styles/stylesQuackSituate';

const missions = [
  { title: 'Ahiru Rescue', subtitle: 'Phrase or Plank!', description: 'Choose natural Japanese before the pirate pushes Ahiru off the plank.', objective: 'Save Ahiru with the right phrase', difficulty: 'RESCUE', route: '/QuackSituateRecognition', icon: 'boat-outline', action: 'PIRATE QUEST', color: '#65A936', tint: '#EAF5E3', character: '救', image: require('../assets/quacksituate/pirate-rescue/pirate-ship-deck.png') },
  { title: 'Expression Match', subtitle: 'Connect phrase to scene', description: 'Match useful Japanese expressions with the situation where they belong.', objective: 'Connect each scene and phrase', difficulty: 'MATCH', route: '/QuackSituateMatchingLevels', icon: 'git-compare-outline', action: 'MATCH GAME', color: '#D88727', tint: '#FFF0DC', character: '合', image: require('../assets/quacksituate/cards/expression-match-mission.png') },
  { title: 'Politeness', subtitle: 'Choose the right tone', description: 'Decide which level of politeness fits the person and the moment.', objective: 'Read the relationship and tone', difficulty: 'SOCIAL', route: '/QuackSituateFormalLevels', icon: 'people-outline', action: 'TONE QUEST', color: '#8423D9', tint: '#F0E4FA', character: '礼', image: require('../assets/quacksituate/cards/politeness-mission.png') },
] as const;

const POLITENESS_LEVEL_ROUTE = '/QuackSituateFormalLevels' as const;
const rescuePlank = require('../assets/quacksituate/pirate-rescue/plank-prop.png');
const rescuePirate = require('../assets/quacksituate/pirate-rescue/pirate-push.png');
const rescueAhiru = require('../assets/quacksituate/pirate-rescue/tied-ahiru-help.png');

export default function QuackSituate() {
  const { skipLoading } = useLocalSearchParams<{ skipLoading?: string }>();
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(skipLoading === '1');
  const [launchingMission, setLaunchingMission] = useState<(typeof missions)[number] | null>(null);
  const [showFieldNote, setShowFieldNote] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rescueMotion = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(500),
      Animated.timing(rescueMotion, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.timing(rescueMotion, { toValue: 0, duration: 320, useNativeDriver: true }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [rescueMotion]);

  useEffect(() => {
    if (skipLoading === '1') {
      setLoaded(true);
      return;
    }
    const interval = setInterval(() => setProgress((previous) => {
      if (previous >= 100) { clearInterval(interval); setLoaded(true); return 100; }
      return previous + 10;
    }), 110);
    Animated.loop(Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.08, duration: 850, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 850, useNativeDriver: true }),
    ])).start();
    return () => clearInterval(interval);
  }, [skipLoading]);

  const launchMission = (mission: (typeof missions)[number]) => {
    if (launchingMission) return;
    setLaunchingMission(mission);
  };

  const openLaunchingMission = () => {
    if (!launchingMission) return;

    const destination = launchingMission.title === 'Politeness'
      ? POLITENESS_LEVEL_ROUTE
      : launchingMission.route;

    router.navigate(destination);
    setLaunchingMission(null);
  };

  if (!loaded) return <View style={styles.situateLoadingScreen}>
    <Image
      source={require('../assets/quacksituate/quacksituate-loading-v2.png')}
      style={styles.situateLoadingBackground}
      resizeMode="cover"
    />
    <View style={styles.situateLoadingShade} />
    <Pressable onPress={() => router.replace('/Exercises')} style={styles.situateLoadingBack}>
      <Ionicons name="arrow-back" size={23} color="#432653" />
    </Pressable>
    <View style={styles.situateLoadingContent}>
      <View style={styles.situateLoadingBadge}>
        <Ionicons name="map-outline" size={14} color="#7140C6" />
        <Text style={styles.situateLoadingBadgeText}>JAPLEARN SITUATION QUEST</Text>
      </View>
      <Animated.View style={[styles.situateLoadingPortal, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.situateLoadingHalo} />
        <Image source={require('../assets/Idle_TrapDoor.png')} style={styles.situateLoadingMascot} resizeMode="contain" />
      </Animated.View>
      <Text style={styles.situateLoadingTitle}>QUACKSITUATE</Text>
      <Text style={styles.situateLoadingSubtitle}>Preparing your real-life Japanese journey...</Text>
      <View style={styles.situateLoadingTrack}>
        <View style={[styles.situateLoadingFill, { width: `${progress}%` }]} />
      </View>
      <Text style={styles.situateLoadingStatus}>{progress < 100 ? `PREPARING SCENES - ${progress}%` : 'READY TO EXPLORE'}</Text>
    </View>
  </View>;

  if (launchingMission) {
    const missionIndex = missions.findIndex((mission) => mission.title === launchingMission.title);
    const mascot = missionIndex === 0 ? require('../assets/hello.png') : missionIndex === 1 ? require('../assets/thinking.png') : require('../assets/talk.png');
    return (
      <QuackSituateMissionLoader
        action={launchingMission.action}
        color={launchingMission.color}
        description={launchingMission.description}
        icon={launchingMission.icon}
        mascot={mascot}
        mode="enter"
        title={launchingMission.title}
        onComplete={openLaunchingMission}
      />
    );
  }

  return <SafeAreaView style={[styles.safeArea,styles.safeAreaLight]}><View style={styles.questScreen}>
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View pointerEvents="none" style={styles.questScrollBackdrop}>
        <View style={styles.questScreenCircle}/>
        <View style={styles.questScreenCircleSmall}/>
        <View style={styles.questScrollWaveOne}/>
        <View style={styles.questScrollWaveTwo}/>
      </View>
      <View style={[styles.questCover,styles.questCoverSpacing]}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.push('/Exercises')} style={({ pressed }) => [styles.backButton, styles.questBackButton, pressed && styles.pressed]}><View style={styles.questBackInner}><BackIcon width={18} height={18} fill="#462A5E" /></View></Pressable>
          <View style={styles.questBrand}><Text style={styles.questBrandOverline}>QUACKSITUATE</Text></View>
          <View style={styles.questCounter}><Ionicons name="flag" size={16} color="#8423D9" /><Text style={styles.questCounterText}>3</Text></View>
        </View>
      </View>

      <View style={styles.questSectionHeading}><View><Text style={styles.questSectionKicker}>MISSION SELECT</Text><Text style={styles.questSectionTitle}>Choose your challenge</Text><Text style={styles.questSectionSubtitle}>Each game trains a different real-world communication skill.</Text></View><View style={styles.questReadyPill}><Ionicons name="game-controller" size={14} color="#65A936"/><Text style={styles.questReadyText}>3 READY</Text></View></View>

      <View style={styles.questMissionList}>
        {missions.map((mission, index) => (
          <Pressable
            key={mission.title}
            onPress={() => launchMission(mission)}
            style={({ pressed }) => [
              styles.questMissionCard,
              pressed && styles.questMissionPressed,
            ]}
          >
            <ImageBackground
              source={mission.image}
              style={styles.questMissionBackground}
              imageStyle={styles.questMissionImage}
              resizeMode="cover"
            >
              {index === 0 && (
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '58%',
                    zIndex: 1,
                  }}
                >
                  <Image
                    source={rescuePlank}
                    resizeMode="contain"
                    style={{
                      position: 'absolute',
                      right: -30,
                      bottom: -1,
                      width: '116%',
                      height: '44%',
                      transform: [{ rotate: '-2deg' }],
                    }}
                  />
                  <Image
                    source={rescuePirate}
                    resizeMode="contain"
                    style={{
                      position: 'absolute',
                      left: -12,
                      bottom: 36,
                      width: '62%',
                      height: '72%',
                    }}
                  />
                  <Animated.Image
                    source={rescueAhiru}
                    resizeMode="contain"
                    style={{
                      position: 'absolute',
                      right: 2,
                      bottom: 30,
                      width: '54%',
                      height: '64%',
                      transform: [
                        {
                          translateX: rescueMotion.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 5],
                          }),
                        },
                        {
                          rotate: rescueMotion.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['-1deg', '2deg'],
                          }),
                        },
                      ],
                    }}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 5,
                      borderRadius: 999,
                      backgroundColor: 'rgba(30,12,39,.78)',
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,.5)',
                    }}
                  >
                    <Text style={{ color: '#FFE36D', fontSize: 7, fontWeight: '900', letterSpacing: .8 }}>
                      PHRASE OR PLANK!
                    </Text>
                  </View>
                  <View
                    style={{
                      position: 'absolute',
                      right: 8,
                      bottom: 13,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 4,
                      paddingHorizontal: 7,
                      paddingVertical: 4,
                      borderRadius: 999,
                      backgroundColor: 'rgba(193,47,75,.92)',
                    }}
                  >
                    <Ionicons name="warning" size={10} color="#FFFFFF" />
                    <Text style={{ color: '#FFFFFF', fontSize: 6, fontWeight: '900', letterSpacing: .7 }}>
                      SAVE AHIRU
                    </Text>
                  </View>
                </View>
              )}
              <View style={styles.questMissionCover}>
                <View style={styles.questMissionShade} />

                <View style={styles.questMissionTop}>
                  <View style={styles.questMissionBadge}>
                    <View
                      style={[
                        styles.questMissionBadgeIcon,
                        { backgroundColor: mission.tint },
                      ]}
                    >
                      <Ionicons
                        name={mission.icon}
                        size={14}
                        color={mission.color}
                      />
                    </View>
                    <Text
                      style={[
                        styles.questMissionBadgeText,
                        { color: mission.color },
                      ]}
                    >
                      {mission.action}
                    </Text>
                  </View>

                  <View style={styles.questMissionNumber}>
                    <Text style={styles.questMissionNumberSmall}>MISSION</Text>
                    <Text style={styles.questMissionNumberText}>0{index + 1}</Text>
                  </View>
                </View>

                <View style={styles.questMissionCopy}>
                  <View
                    style={[
                      styles.questDifficulty,
                      { borderColor: `${mission.color}88` },
                    ]}
                  >
                    <View
                      style={[
                        styles.questDifficultyDot,
                        { backgroundColor: mission.color },
                      ]}
                    />
                    <Text style={styles.questDifficultyText}>
                      {mission.difficulty}
                    </Text>
                  </View>

                  <Text style={styles.questMissionTitle}>{mission.title}</Text>
                  <Text style={styles.questMissionSubtitle}>{mission.subtitle}</Text>
                  <Text style={styles.questMissionDescription}>
                    {mission.description}
                  </Text>

                  <View style={styles.questMissionFooter}>
                    <View style={styles.questObjective}>
                      <Ionicons
                        name="navigate-circle-outline"
                        size={15}
                        color="#FFFFFF"
                      />
                      <Text style={styles.questObjectiveText}>
                        {mission.objective}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.questPlayButton,
                        { backgroundColor: mission.color },
                      ]}
                    >
                      <Text style={styles.questPlayText}>PLAY</Text>
                      <View style={styles.questPlayIcon}>
                        <Ionicons
                          name="play"
                          size={12}
                          color={mission.color}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </ImageBackground>
          </Pressable>
        ))}
      </View>

      {showFieldNote && <View style={styles.questTip}><View style={styles.questTipIcon}><Ionicons name="bulb-outline" size={20} color="#D88727"/></View><View style={styles.questTipCopy}><Text style={styles.questTipTitle}>Ahiru's field note</Text><Text style={styles.questTipText}>The best expression depends on the place, relationship, and level of formality.</Text></View><Pressable onPress={()=>setShowFieldNote(false)} accessibilityLabel="Dismiss Ahiru's field note" style={({pressed})=>[styles.questTipClose,pressed&&styles.pressed]}><Ionicons name="close" size={17} color="#8B611D"/></Pressable></View>}

    </ScrollView>
  </View></SafeAreaView>;
}

