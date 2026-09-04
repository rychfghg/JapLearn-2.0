import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, ImageBackground, Modal, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import BackIcon from '../assets/svg/back-icon.svg';
import styles from '../styles/stylesQuackResponse';
import { AuthContext } from '../context/AuthContext';
import expoconfig from '../expoconfig';
import QuackSituateMissionLoader from '../components/QuackSituateMissionLoader';

const games = [
  { title:'Guided Response', displayTitle:'Reply Coach', subtitle:'Build the right reply', description:'Follow helpful cues and learn how natural Japanese responses are formed.', route:'/QuackResponseGuided', icon:'chatbubble-ellipses-outline', label:'GUIDED MODE', color:'#6E4BC6', tint:'#EEE8FC', mascot:require('../assets/talk.png'), locked:false },
  { title:'Timed Challenge', displayTitle:'Response Rush', subtitle:'Think fast, answer naturally', description:'Race the clock and strengthen your instinct for everyday Japanese replies.', route:'/QuackResponseTimed', icon:'timer-outline', label:'SPEED MODE', color:'#E58B2A', tint:'#FFF0DE', mascot:require('../assets/Surprised.png'), locked:true },
  { title:'Multi-Step', displayTitle:'Dialogue Relay', subtitle:'Keep the conversation moving', description:'Choose connected responses across a complete conversation sequence.', route:'/QuackResponseMultiStep', icon:'git-branch-outline', label:'CHAIN MODE', color:'#D84F83', tint:'#FCE7EF', mascot:require('../assets/thinking.png'), locked:true },
] as const;

// Layout constants for the winding "level map" trail. Purely visual — none
// of this affects unlock rules, routes, or backend calls below.
const MAP_NODE_SIZE = 72;
const MAP_NODE_SPACING = 200;
const MAP_TOP_PADDING = 30;
const MAP_TAIL_HEIGHT = 70;
const MAP_NODE_X_PATTERN = [30, 70, 38, 62, 32, 68] as const;
const MAP_LABEL_WIDTH = 158;

export default function QuackResponse() {
  const { user } = useContext(AuthContext);
  const { skipLoading } = useLocalSearchParams<{skipLoading?:string}>();
  const [progress,setProgress]=useState(0);
  const [loaded,setLoaded]=useState(skipLoading==='1');
  const [launching,setLaunching]=useState<(typeof games)[number]|null>(null);
  const [guideVisible,setGuideVisible]=useState(false);
  const [unlockedStages,setUnlockedStages]=useState(1);
  const [mapWidth,setMapWidth]=useState(0);
  const pulse=useRef(new Animated.Value(1)).current;
  const shine=useRef(new Animated.Value(-1)).current;

  const mapHeight = MAP_TOP_PADDING + (games.length - 1) * MAP_NODE_SPACING + MAP_NODE_SIZE + MAP_TAIL_HEIGHT;

  const nodeCenters = useMemo(() => games.map((_, index) => ({
    x: (MAP_NODE_X_PATTERN[index % MAP_NODE_X_PATTERN.length] / 100) * mapWidth,
    y: MAP_TOP_PADDING + index * MAP_NODE_SPACING + MAP_NODE_SIZE / 2,
  })), [mapWidth]);

  const trailPathD = useMemo(() => {
    if (!mapWidth) return '';
    const points = [...nodeCenters, { x: mapWidth / 2, y: mapHeight - 6 }];
    return points.reduce((d, point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      const prev = points[index - 1];
      const midY = (prev.y + point.y) / 2;
      return `${d} C ${prev.x} ${midY}, ${point.x} ${midY}, ${point.x} ${point.y}`;
    }, '');
  }, [nodeCenters, mapWidth, mapHeight]);

  useEffect(()=>{
    if(skipLoading==='1'){setLoaded(true);return;}
    const timer=setInterval(()=>setProgress(value=>{if(value>=100){clearInterval(timer);setLoaded(true);return 100;}return value+10;}),110);
    Animated.loop(Animated.sequence([Animated.timing(pulse,{toValue:1.07,duration:800,useNativeDriver:true}),Animated.timing(pulse,{toValue:1,duration:800,useNativeDriver:true})])).start();
    Animated.loop(Animated.timing(shine,{toValue:1,duration:1450,useNativeDriver:true})).start();
    return()=>clearInterval(timer);
  },[skipLoading]);

  useEffect(() => {
    if (!user?.email) return;
    let active = true;
    fetch(`${expoconfig.API_URL}/api/reply-coach/progress?email=${encodeURIComponent(user.email)}`)
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((summary) => {
        if (active && Number(summary?.bestScore ?? 0) >= 60) setUnlockedStages(2);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [user?.email]);

  const launch=(game:(typeof games)[number], locked = game.locked)=>{
    if(launching||locked)return;
    setLaunching(game);
  };

  if(!loaded)return <View style={styles.premiumLoading}><View style={styles.loadOrbOne}/><View style={styles.loadOrbTwo}/><View style={styles.loadCard}><View style={styles.loadContent}><View style={styles.loadBrand}><Ionicons name="book-outline" size={15} color="#7542BA"/><Text style={styles.loadBrandText}>QUACKRESPONSE · STORY TRAIL</Text></View><View style={styles.storyboardStage}><View style={[styles.storyboardFrame,styles.storyboardFrameLeft]}><Ionicons name="location-outline" size={24} color="#65A936"/><Text style={styles.storyboardFrameText}>SCENE</Text></View><Animated.View style={[styles.storyboardHero,{transform:[{scale:pulse}]}]}><Text style={styles.storyboardKanji}>応</Text><Ionicons name="chatbubbles" size={36} color="#FFF"/></Animated.View><View style={[styles.storyboardFrame,styles.storyboardFrameRight]}><Ionicons name="people-outline" size={24} color="#D88727"/><Text style={styles.storyboardFrameText}>CAST</Text></View><Animated.View style={[styles.storyboardSweep,{transform:[{translateX:shine.interpolate({inputRange:[-1,1],outputRange:[-150,150]})},{rotate:'-12deg'}]}]}/></View><Text style={styles.loadJapanese}>会話の旅を始めよう</Text><Text style={styles.loadKicker}>YOUR STORY IS TAKING SHAPE</Text><Text style={styles.loadTitle}>Preparing the Response Trail</Text><Text style={styles.loadCopy}>Arranging your scenes, companions, and conversation choices.</Text><View style={styles.loadStatus}><Text style={styles.loadStatusText}>{progress<40?'SETTING THE SCENE':progress<80?'GATHERING THE CAST':'OPENING THE TRAIL'}</Text><Text style={styles.loadValue}>{progress}%</Text></View><View style={styles.loadTrack}><View style={[styles.loadFill,{width:`${progress}%`}]}/></View><View style={styles.loadFooter}><Ionicons name="bookmark-outline" size={13} color="#7542BA"/><Text style={styles.loadFooterText}>{progress<50?'Building your chapter route':progress<90?'Almost ready':'Trail ready'}</Text></View></View></View></View>;

  if(launching)return <QuackSituateMissionLoader action={launching.label} color={launching.color} description={launching.description} icon={launching.icon} mascot={launching.mascot} mode="enter" title={launching.displayTitle} variant="story" onComplete={()=>{const route=launching.route;router.push(route);setTimeout(()=>setLaunching(null),350);}} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require('../assets/img/LessonJourneyBackground.png')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.mapBackgroundWash} />

        <ScrollView
          contentContainerStyle={styles.mapScroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.mapTopBar}>
            <Pressable
              onPress={() => router.push('/Exercises')}
              style={styles.menuBack}
            >
              <BackIcon width={18} height={18} fill="#47295A" />
            </Pressable>

            <View style={styles.mapBrand}>
              <Text style={styles.mapBrandEyebrow}>QUACKRESPONSE</Text>
              <View style={styles.mapBrandRow}>
                <Ionicons name="map-outline" size={16} color="#6E4BC6" />
                <Text style={styles.mapBrandTitle}>Response Trail</Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="How QuackResponse works"
              onPress={() => setGuideVisible(true)}
              style={({ pressed }) => [
                styles.mapMissionCount,
                pressed && styles.mapGuideButtonPressed,
              ]}
            >
              <Ionicons name="book-outline" size={22} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.responseTrailLead}>
            <Text style={styles.responseTrailLeadKicker}>SHAPE YOUR RESPONSE INSTINCT</Text>
            <Text style={styles.responseTrailLeadText}>Follow each conversation chapter and learn to reply naturally as the story becomes more challenging.</Text>
          </View>

          <View
            style={[styles.responseRoute,{height:mapHeight}]}
            onLayout={(event)=>setMapWidth(event.nativeEvent.layout.width)}
          >
            {mapWidth>0&&(
              <Svg
                width={mapWidth}
                height={mapHeight}
                viewBox={`0 0 ${mapWidth} ${mapHeight}`}
                style={styles.mapTrailSvg}
                pointerEvents="none"
              >
                <Path
                  d={trailPathD}
                  stroke="#C7B4DD"
                  strokeWidth={6}
                  strokeDasharray="3, 20"
                  strokeLinecap="round"
                  fill="none"
                />
              </Svg>
            )}

            {games.map((game,index)=>{
              const locked=index>=unlockedStages;
              const current=!locked&&index===unlockedStages-1;
              const xPercent=MAP_NODE_X_PATTERN[index%MAP_NODE_X_PATTERN.length];
              return (
                <View
                  key={game.title}
                  style={[
                    styles.mapNodeWrap,
                    {left:`${xPercent}%`,top:MAP_TOP_PADDING+index*MAP_NODE_SPACING,marginLeft:-(MAP_LABEL_WIDTH/2)},
                  ]}
                >
                  {current&&(
                    <Animated.View
                      style={[
                        styles.mapCurrentFlag,
                        {backgroundColor:game.color,transform:[{translateY:pulse.interpolate({inputRange:[1,1.07],outputRange:[0,-6]})}]},
                      ]}
                    >
                      <Ionicons name="flag" size={12} color="#FFFFFF" />
                      <Text style={styles.mapCurrentFlagText}>START HERE</Text>
                    </Animated.View>
                  )}

                  <Pressable
                    disabled={locked}
                    onPress={()=>launch(game,locked)}
                    style={({pressed})=>[
                      styles.mapNode,
                      {borderColor:locked?'#CFC7D2':game.color,backgroundColor:locked?'#EDE9EF':game.tint},
                      pressed&&!locked&&styles.mapNodePressed,
                    ]}
                  >
                    <Image source={game.mascot} style={[styles.mapNodeMascot,locked&&styles.mapNodeMascotLocked]} resizeMode="contain" />
                    <View style={[styles.mapNodeBadge,{backgroundColor:locked?'#9B929E':game.color}]}>
                      {locked?(
                        <Ionicons name="lock-closed" size={12} color="#FFFFFF" />
                      ):(
                        <Text style={styles.mapNodeBadgeText}>0{index+1}</Text>
                      )}
                    </View>
                  </Pressable>

                  <View style={styles.mapNodeLabel}>
                    <Text style={[styles.mapNodeLabelKicker,{color:locked?'#938A96':game.color}]}>
                      {locked?'LOCKED':index===0&&unlockedStages>1?'PLAY AGAIN':`CHAPTER 0${index+1}`}
                    </Text>
                    <Text style={[styles.mapNodeLabelTitle,locked&&styles.responseMuted]}>{game.displayTitle}</Text>
                    <Text style={styles.mapNodeLabelSubtitle}>
                      {locked?'Earn at least 60% in the previous chapter to unlock.':game.subtitle}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <View style={styles.responseDestination}>
            <View style={styles.responseDestinationSeal}><Ionicons name="ribbon-outline" size={23} color="#FFFFFF"/></View>
            <View style={styles.responseDestinationCopy}><Text style={styles.responseDestinationKicker}>TRAIL GOAL</Text><Text style={styles.responseDestinationTitle}>Speak with confidence</Text><Text style={styles.responseDestinationText}>Complete every chapter and make natural replies part of your instinct.</Text></View>
          </View>
        </ScrollView>
      </ImageBackground>

      <Modal
        visible={guideVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setGuideVisible(false)}
      >
        <View style={styles.guideOverlay}>
          <Pressable style={styles.guideDismissArea} onPress={() => setGuideVisible(false)} />
          <View style={styles.guideCard}>
            <View style={styles.guideTopRow}>
              <View style={styles.guideIcon}>
                <Ionicons name="book-outline" size={23} color="#6E4BC6" />
              </View>
              <Pressable onPress={() => setGuideVisible(false)} style={styles.guideClose}>
                <Ionicons name="close" size={20} color="#5C4865" />
              </Pressable>
            </View>

            <Text style={styles.guideKicker}>QUACKRESPONSE GUIDE</Text>
            <Text style={styles.guideTitle}>Build natural Japanese replies</Text>
            <Text style={styles.guideText}>
              Follow the mission map in order. Each activity develops a different response skill.
            </Text>

            <View style={styles.guideSteps}>
              <View style={styles.guideStep}>
                <View style={[styles.guideStepNumber, { backgroundColor: '#6E4BC6' }]}>
                  <Text style={styles.guideStepNumberText}>1</Text>
                </View>
                <View style={styles.guideStepCopy}>
                  <Text style={styles.guideStepTitle}>Guided Response</Text>
                  <Text style={styles.guideStepText}>Learn how a natural reply is formed with helpful cues.</Text>
                </View>
              </View>
              <View style={styles.guideStep}>
                <View style={[styles.guideStepNumber, styles.guideStepNumberLocked]}>
                  <Ionicons name="lock-closed" size={13} color="#FFFFFF" />
                </View>
                <View style={styles.guideStepCopy}>
                  <Text style={styles.guideStepTitle}>Locked missions</Text>
                  <Text style={styles.guideStepText}>Timed and multi-step challenges will open through progression later.</Text>
                </View>
              </View>
            </View>

            <Pressable onPress={() => setGuideVisible(false)} style={styles.guideButton}>
              <Text style={styles.guideButtonText}>VIEW MISSION MAP</Text>
              <Ionicons name="arrow-forward" size={17} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
