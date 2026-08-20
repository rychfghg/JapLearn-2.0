import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, ImageBackground, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BackIcon from '../assets/svg/back-icon.svg';
import styles from '../styles/stylesQuackSituate';

const missions = [
  { title: 'Recognition', subtitle: 'Pick the best phrase', description: 'Read the situation and choose the Japanese expression that feels natural.', objective: 'Choose what you would say', difficulty: 'STARTER', route: '/QuackSituateRecognition', icon: 'eye-outline', action: 'QUICK CHOICE', color: '#65A936', tint: '#EAF5E3', character: '見', image: require('../assets/quacksituate/cards/recognition-mission.webp') },
  { title: 'Expression Match', subtitle: 'Connect phrase to scene', description: 'Match useful Japanese expressions with the situation where they belong.', objective: 'Connect each scene and phrase', difficulty: 'MATCH', route: '/QuackSituateMatching', icon: 'git-compare-outline', action: 'MATCH GAME', color: '#D88727', tint: '#FFF0DC', character: '合', image: require('../assets/quacksituate/cards/expression-match-mission.webp') },
  { title: 'Politeness', subtitle: 'Choose the right tone', description: 'Decide which level of politeness fits the person and the moment.', objective: 'Read the relationship and tone', difficulty: 'SOCIAL', route: '/QuackSituateFormal', icon: 'people-outline', action: 'TONE QUEST', color: '#8423D9', tint: '#F0E4FA', character: '礼', image: require('../assets/quacksituate/cards/politeness-mission.webp') },
] as const;

export default function QuackSituate() {
  const { skipLoading } = useLocalSearchParams<{ skipLoading?: string }>();
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(skipLoading === '1');
  const [launchingMission, setLaunchingMission] = useState<(typeof missions)[number] | null>(null);
  const [launchProgress, setLaunchProgress] = useState(0);
  const [showFieldNote, setShowFieldNote] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shineAnim = useRef(new Animated.Value(-1)).current;

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
    Animated.loop(Animated.timing(shineAnim, { toValue: 1, duration: 1450, useNativeDriver: true })).start();
    return () => clearInterval(interval);
  }, [skipLoading]);

  const launchMission = (mission: (typeof missions)[number]) => {
    if (launchingMission) return;
    setLaunchingMission(mission);
    setLaunchProgress(8);
    let currentProgress = 8;
    const interval = setInterval(() => {
      currentProgress = Math.min(currentProgress + 12, 100);
      setLaunchProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        router.push(mission.route);
        setTimeout(() => {
          setLaunchingMission(null);
          setLaunchProgress(0);
        }, 350);
      }
    }, 55);
  };

  if (!loaded) return <View style={styles.situateLoadingScreen}>
    <Image
      source={require('../assets/quacksituate/quacksituate-loading-v2.webp')}
      style={styles.situateLoadingBackground}
      resizeMode="stretch"
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
    return <View style={[styles.missionLoadingScreen, { backgroundColor: launchingMission.tint }]}>
      <View style={[styles.missionLoadingOrb, styles.missionLoadingOrbTop, { backgroundColor: launchingMission.color }]} /><View style={[styles.missionLoadingOrb, styles.missionLoadingOrbBottom, { backgroundColor: launchingMission.color }]} />
      <View style={styles.missionLoadingCard}>
        <View style={[styles.missionLoadingBadge, { backgroundColor: launchingMission.tint }]}><Ionicons name={launchingMission.icon} size={16} color={launchingMission.color} /><Text style={[styles.missionLoadingBadgeText, { color: launchingMission.color }]}>{launchingMission.action}</Text></View>
        <View style={styles.missionBadgeStage}><Animated.View style={[styles.missionBadgeGlow,{backgroundColor:`${launchingMission.color}24`,transform:[{scale:pulseAnim}]}]}/><View style={[styles.missionBadgeOuter,{borderColor:`${launchingMission.color}50`}]}><View style={[styles.missionBadgeInner,{backgroundColor:launchingMission.color}]}><Text style={styles.missionBadgeCharacter}>{launchingMission.character}</Text><Ionicons name={launchingMission.icon} size={28} color="#FFF"/></View></View><Animated.View style={[styles.missionBadgeSweep,{transform:[{translateX:shineAnim.interpolate({inputRange:[-1,1],outputRange:[-110,110]})},{rotate:'-18deg'}]}]}/><Image source={mascot} style={styles.missionBadgeMascot} resizeMode="contain"/><Text style={[styles.missionBadgeSparkle,{color:launchingMission.color}]}>✦</Text></View>
        <Text style={styles.missionLoadingKicker}>YOUR NEXT PRACTICE</Text><Text style={styles.missionLoadingTitle}>{launchingMission.title}</Text><Text style={styles.missionLoadingDescription}>{launchingMission.description}</Text>
        <View style={styles.missionLoadingStatus}><Text style={styles.missionLoadingStatusText}>{launchProgress < 45 ? 'Preparing your mission' : launchProgress < 85 ? 'Setting the challenge' : 'Mission ready!'}</Text><Text style={[styles.missionLoadingPercent, { color: launchingMission.color }]}>{launchProgress}%</Text></View>
        <View style={styles.missionLoadingTrack}><View style={[styles.missionLoadingFill, { width: `${launchProgress}%`, backgroundColor: launchingMission.color }]} /></View>
        <View style={styles.missionLoadingHint}><Ionicons name="sparkles" size={14} color={launchingMission.color} /><Text style={styles.missionLoadingHintText}>{launchProgress<45?'Preparing the activity':launchProgress<90?'Loading your challenge':'Ready to start'}</Text></View>
      </View>
    </View>;
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

      <View style={styles.questMissionList}>{missions.map((mission, index) => <Pressable key={mission.title} onPress={() => launchMission(mission)} style={({ pressed }) => [styles.questMissionCard,pressed&&styles.questMissionPressed]}><View style={styles.questMissionBackground}><Image source={mission.image} style={styles.questMissionFullImage} resizeMode="stretch"/><View style={styles.questMissionShade}/><View style={styles.questMissionTop}><View style={styles.questMissionBadge}><View style={[styles.questMissionBadgeIcon,{backgroundColor:mission.tint}]}><Ionicons name={mission.icon} size={14} color={mission.color}/></View><Text style={[styles.questMissionBadgeText,{color:mission.color}]}>{mission.action}</Text></View><View style={styles.questMissionNumber}><Text style={styles.questMissionNumberSmall}>MISSION</Text><Text style={styles.questMissionNumberText}>0{index+1}</Text></View></View><View style={styles.questMissionCopy}><View style={[styles.questDifficulty,{borderColor:`${mission.color}88`}]}><View style={[styles.questDifficultyDot,{backgroundColor:mission.color}]}/><Text style={styles.questDifficultyText}>{mission.difficulty}</Text></View><Text style={styles.questMissionTitle}>{mission.title}</Text><Text style={styles.questMissionSubtitle}>{mission.subtitle}</Text><Text style={styles.questMissionDescription}>{mission.description}</Text><View style={styles.questMissionFooter}><View style={styles.questObjective}><Ionicons name="navigate-circle-outline" size={15} color="#FFFFFF"/><Text style={styles.questObjectiveText}>{mission.objective}</Text></View><View style={[styles.questPlayButton,{backgroundColor:mission.color}]}><Text style={styles.questPlayText}>PLAY</Text><View style={styles.questPlayIcon}><Ionicons name="play" size={12} color={mission.color}/></View></View></View></View></View></Pressable>)}</View>

      {showFieldNote && <View style={styles.questTip}><View style={styles.questTipIcon}><Ionicons name="bulb-outline" size={20} color="#D88727"/></View><View style={styles.questTipCopy}><Text style={styles.questTipTitle}>Ahiru's field note</Text><Text style={styles.questTipText}>The best expression depends on the place, relationship, and level of formality.</Text></View><Pressable onPress={()=>setShowFieldNote(false)} accessibilityLabel="Dismiss Ahiru's field note" style={({pressed})=>[styles.questTipClose,pressed&&styles.pressed]}><Ionicons name="close" size={17} color="#8B611D"/></Pressable></View>}

    </ScrollView>
  </View></SafeAreaView>;
}
