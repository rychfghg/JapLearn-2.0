import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, ImageBackground, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BackIcon from '../assets/svg/back-icon.svg';
import styles from '../styles/stylesQuackResponse';

const games = [
  { title:'Guided Response', subtitle:'Build the right reply', description:'Follow helpful cues and learn how natural Japanese responses are formed.', route:'/QuackResponseGuided', icon:'chatbubble-ellipses-outline', label:'GUIDED MODE', color:'#6E4BC6', tint:'#EEE8FC', mascot:require('../assets/talk.png') },
  { title:'Timed Challenge', subtitle:'Think fast, answer naturally', description:'Race the clock and strengthen your instinct for everyday Japanese replies.', route:'/QuackResponseTimed', icon:'timer-outline', label:'SPEED MODE', color:'#E58B2A', tint:'#FFF0DE', mascot:require('../assets/Surprised.png') },
  { title:'Multi-Step', subtitle:'Keep the conversation moving', description:'Choose connected responses across a complete conversation sequence.', route:'/QuackResponseMultiStep', icon:'git-branch-outline', label:'CHAIN MODE', color:'#D84F83', tint:'#FCE7EF', mascot:require('../assets/thinking.png') },
] as const;

export default function QuackResponse() {
  const { skipLoading } = useLocalSearchParams<{skipLoading?:string}>();
  const [progress,setProgress]=useState(0);
  const [loaded,setLoaded]=useState(skipLoading==='1');
  const [launching,setLaunching]=useState<(typeof games)[number]|null>(null);
  const [launchProgress,setLaunchProgress]=useState(0);
  const [sampleFrame,setSampleFrame]=useState(0);
  const pulse=useRef(new Animated.Value(1)).current;
  const shine=useRef(new Animated.Value(-1)).current;

  useEffect(()=>{
    if(skipLoading==='1'){setLoaded(true);return;}
    const timer=setInterval(()=>setProgress(value=>{if(value>=100){clearInterval(timer);setLoaded(true);return 100;}return value+10;}),110);
    Animated.loop(Animated.sequence([Animated.timing(pulse,{toValue:1.07,duration:800,useNativeDriver:true}),Animated.timing(pulse,{toValue:1,duration:800,useNativeDriver:true})])).start();
    Animated.loop(Animated.timing(shine,{toValue:1,duration:1450,useNativeDriver:true})).start();
    return()=>clearInterval(timer);
  },[skipLoading]);

  useEffect(()=>{
    const frameTimer=setInterval(()=>setSampleFrame(frame=>(frame+1)%4),620);
    return()=>clearInterval(frameTimer);
  },[]);

  const launch=(game:(typeof games)[number])=>{
    if(launching)return;
    setLaunching(game);setLaunchProgress(8);let value=8;
    const timer=setInterval(()=>{value=Math.min(value+12,100);setLaunchProgress(value);if(value>=100){clearInterval(timer);router.push(game.route);setTimeout(()=>{setLaunching(null);setLaunchProgress(0);},350);}},55);
  };

  if(!loaded)return <View style={styles.premiumLoading}><View style={styles.loadOrbOne}/><View style={styles.loadOrbTwo}/><View style={styles.loadCard}><View style={styles.loadContent}><View style={styles.loadBrand}><Ionicons name="chatbubbles-outline" size={15} color="#7542BA"/><Text style={styles.loadBrandText}>AHIRU RESPONSE PRACTICE</Text></View><View style={styles.responseBadgeStage}><Animated.View style={[styles.responseBadgeGlow,{transform:[{scale:pulse}]}]}/><View style={styles.responseBadgeOuter}><View style={styles.responseBadgeInner}><Text style={styles.responseBadgeCharacter}>応</Text><Ionicons name="chatbubbles" size={38} color="#FFF"/></View></View><Animated.View style={[styles.responseBadgeSweep,{transform:[{translateX:shine.interpolate({inputRange:[-1,1],outputRange:[-110,110]})},{rotate:'-18deg'}]}]}/><Text style={styles.responseSparkleOne}>✦</Text><Text style={styles.responseSparkleTwo}>✧</Text></View><Text style={styles.loadJapanese}>会話で学ぶ</Text><Text style={styles.loadKicker}>NATURAL JAPANESE REPLIES</Text><Text style={styles.loadTitle}>Preparing response practice</Text><Text style={styles.loadCopy}>Setting up your guided, timed, and conversation activities.</Text><View style={styles.loadStatus}><Text style={styles.loadStatusText}>GETTING THINGS READY</Text><Text style={styles.loadValue}>{progress}%</Text></View><View style={styles.loadTrack}><View style={[styles.loadFill,{width:`${progress}%`}]}/></View><View style={styles.loadSteps}><View style={[styles.loadStep,progress>=25&&styles.loadStepActive]}/><View style={[styles.loadStep,progress>=50&&styles.loadStepActive]}/><View style={[styles.loadStep,progress>=75&&styles.loadStepActive]}/><View style={[styles.loadStep,progress>=100&&styles.loadStepActive]}/></View><View style={styles.loadFooter}><Ionicons name="sparkles" size={13} color="#7542BA"/><Text style={styles.loadFooterText}>{progress<50?'Preparing your practice':progress<90?'Almost ready':'Ready to begin'}</Text></View></View></View></View>;

  if(launching)return <View style={[styles.gameLoading,{backgroundColor:launching.tint}]}><View style={[styles.gameLoadOrb,styles.gameLoadOrbTop,{backgroundColor:launching.color}]}/><View style={[styles.gameLoadOrb,styles.gameLoadOrbBottom,{backgroundColor:launching.color}]}/><View style={styles.gameLoadCard}><View style={[styles.gameLoadBadge,{backgroundColor:launching.tint}]}><Ionicons name={launching.icon} size={16} color={launching.color}/><Text style={[styles.gameLoadBadgeText,{color:launching.color}]}>{launching.label}</Text></View><View style={styles.gameBadgeStage}><Animated.View style={[styles.gameBadgeGlow,{backgroundColor:`${launching.color}24`,transform:[{scale:pulse}]}]}/><View style={[styles.gameBadgeOuter,{borderColor:`${launching.color}50`}]}><View style={[styles.gameBadgeInner,{backgroundColor:launching.color}]}><Text style={styles.gameBadgeCharacter}>{launching.title==='Guided Response'?'導':launching.title==='Timed Challenge'?'速':'会'}</Text><Ionicons name={launching.icon} size={28} color="#FFF"/></View></View><Animated.View style={[styles.gameBadgeSweep,{transform:[{translateX:shine.interpolate({inputRange:[-1,1],outputRange:[-110,110]})},{rotate:'-18deg'}]}]}/><Image source={launching.mascot} style={styles.gameBadgeMascot} resizeMode="contain"/><Text style={[styles.gameBadgeSparkle,{color:launching.color}]}>✦</Text></View><Text style={styles.gameLoadKicker}>YOUR NEXT PRACTICE</Text><Text style={styles.gameLoadTitle}>{launching.title}</Text><Text style={styles.gameLoadCopy}>{launching.description}</Text><View style={styles.gameLoadStatus}><Text style={styles.gameLoadStatusText}>{launchProgress<45?'Preparing your mission':launchProgress<85?'Setting the challenge':'Mission ready!'}</Text><Text style={[styles.gameLoadValue,{color:launching.color}]}>{launchProgress}%</Text></View><View style={styles.gameLoadTrack}><View style={[styles.gameLoadFill,{width:`${launchProgress}%`,backgroundColor:launching.color}]}/></View><View style={styles.gameLoadNote}><Ionicons name="sparkles" size={14} color={launching.color}/><Text style={styles.gameLoadNoteText}>{launchProgress<45?'Preparing the activity':launchProgress<90?'Loading your challenge':'Ready to start'}</Text></View></View></View>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={require('../assets/forest2.png')}
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

            <View style={styles.mapMissionCount}>
              <Ionicons name="flag" size={17} color="#FFFFFF" />
              <Text style={styles.mapMissionCountText}>3</Text>
            </View>
          </View>

          <View style={styles.mapHero}>
            <View style={styles.mapHeroCloudOne} />
            <View style={styles.mapHeroCloudTwo} />
            <View style={styles.mapHeroCopy}>
              <Text style={styles.mapHeroKicker}>会話の道 · CONVERSATION PATH</Text>
              <Text style={styles.mapHeroTitle}>Choose your next response mission.</Text>
              <Text style={styles.mapHeroText}>
                Build confidence one checkpoint at a time—from guided replies to complete conversations.
              </Text>
            </View>

            <View style={styles.mapHeroMascotStage}>
              <View style={styles.mapHeroHalo} />
              <Image
                source={sampleFrame === 1
                  ? require('../assets/hello.png')
                  : require('../assets/idle.png')}
                style={styles.mapHeroMascot}
                resizeMode="contain"
              />
              <View style={styles.mapHeroBubble}>
                <Text style={styles.mapHeroBubbleText}>いこう!</Text>
              </View>
            </View>
          </View>

          <View style={styles.mapSectionHeading}>
            <View>
              <Text style={styles.mapSectionKicker}>YOUR JOURNEY</Text>
              <Text style={styles.mapSectionTitle}>Three response checkpoints</Text>
            </View>
            <View style={styles.mapReadyPill}>
              <View style={styles.mapReadyDot} />
              <Text style={styles.mapReadyText}>ALL READY</Text>
            </View>
          </View>

          <View style={styles.mapTrail}>
            <View style={styles.mapTrailLine} />

            {games.map((game, index) => (
              <View
                key={game.title}
                style={[
                  styles.mapNodeRow,
                  index % 2 === 1 && styles.mapNodeRowRight,
                ]}
              >
                <View
                  style={[
                    styles.mapCheckpoint,
                    { backgroundColor: game.color },
                  ]}
                >
                  <Text style={styles.mapCheckpointNumber}>0{index + 1}</Text>
                </View>

                <Pressable
                  onPress={() => launch(game)}
                  style={({ pressed }) => [
                    styles.mapMissionCard,
                    index % 2 === 1 && styles.mapMissionCardRight,
                    pressed && styles.mapMissionCardPressed,
                  ]}
                >
                  <View
                    style={[
                      styles.mapMissionAccent,
                      { backgroundColor: game.color },
                    ]}
                  />
                  <View
                    style={[
                      styles.mapMissionLandscape,
                      { backgroundColor: game.tint },
                    ]}
                  >
                    <View
                      style={[
                        styles.mapLandscapeSun,
                        { backgroundColor: `${game.color}22` },
                      ]}
                    />
                    <View
                      style={[
                        styles.mapLandscapeHillBack,
                        { backgroundColor: `${game.color}18` },
                      ]}
                    />
                    <View
                      style={[
                        styles.mapLandscapeHillFront,
                        { backgroundColor: `${game.color}2B` },
                      ]}
                    />
                    <Image
                      source={game.mascot}
                      style={styles.mapMissionMascot}
                      resizeMode="contain"
                    />
                    <View style={styles.mapModePill}>
                      <Ionicons name={game.icon} size={13} color={game.color} />
                      <Text style={[styles.mapModeText, { color: game.color }]}>
                        {game.label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.mapMissionContent}>
                    <Text style={styles.mapMissionStep}>CHECKPOINT {index + 1}</Text>
                    <Text style={styles.mapMissionTitle}>{game.title}</Text>
                    <Text style={styles.mapMissionSubtitle}>{game.subtitle}</Text>
                    <Text style={styles.mapMissionDescription}>{game.description}</Text>

                    <View style={styles.mapMissionFooter}>
                      <Text style={[styles.mapStartText, { color: game.color }]}>START MISSION</Text>
                      <View
                        style={[
                          styles.mapStartButton,
                          { backgroundColor: game.color },
                        ]}
                      >
                        <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                      </View>
                    </View>
                  </View>
                </Pressable>
              </View>
            ))}

            <View style={styles.mapFinish}>
              <Ionicons name="trophy" size={21} color="#D88727" />
              <View>
                <Text style={styles.mapFinishKicker}>TRAIL GOAL</Text>
                <Text style={styles.mapFinishText}>Speak with confidence</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}
