import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, ImageBackground, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BackIcon from '../assets/svg/back-icon.svg';
import styles from '../styles/stylesQuackResponse';

const games = [
  { title:'Guided Response', subtitle:'Build the right reply', description:'Follow helpful cues and learn how natural Japanese responses are formed.', route:'/QuackResponseGuided', icon:'chatbubble-ellipses-outline', label:'GUIDED MODE', color:'#6E4BC6', tint:'#EEE8FC', mascot:require('../assets/talk.png'), locked:false },
  { title:'Timed Challenge', subtitle:'Think fast, answer naturally', description:'Race the clock and strengthen your instinct for everyday Japanese replies.', route:'/QuackResponseTimed', icon:'timer-outline', label:'SPEED MODE', color:'#E58B2A', tint:'#FFF0DE', mascot:require('../assets/Surprised.png'), locked:true },
  { title:'Multi-Step', subtitle:'Keep the conversation moving', description:'Choose connected responses across a complete conversation sequence.', route:'/QuackResponseMultiStep', icon:'git-branch-outline', label:'CHAIN MODE', color:'#D84F83', tint:'#FCE7EF', mascot:require('../assets/thinking.png'), locked:true },
] as const;

export default function QuackResponse() {
  const { skipLoading } = useLocalSearchParams<{skipLoading?:string}>();
  const [progress,setProgress]=useState(0);
  const [loaded,setLoaded]=useState(skipLoading==='1');
  const [launching,setLaunching]=useState<(typeof games)[number]|null>(null);
  const [launchProgress,setLaunchProgress]=useState(0);
  const pulse=useRef(new Animated.Value(1)).current;
  const shine=useRef(new Animated.Value(-1)).current;

  useEffect(()=>{
    if(skipLoading==='1'){setLoaded(true);return;}
    const timer=setInterval(()=>setProgress(value=>{if(value>=100){clearInterval(timer);setLoaded(true);return 100;}return value+10;}),110);
    Animated.loop(Animated.sequence([Animated.timing(pulse,{toValue:1.07,duration:800,useNativeDriver:true}),Animated.timing(pulse,{toValue:1,duration:800,useNativeDriver:true})])).start();
    Animated.loop(Animated.timing(shine,{toValue:1,duration:1450,useNativeDriver:true})).start();
    return()=>clearInterval(timer);
  },[skipLoading]);

  const launch=(game:(typeof games)[number])=>{
    if(launching||game.locked)return;
    setLaunching(game);setLaunchProgress(8);let value=8;
    const timer=setInterval(()=>{value=Math.min(value+12,100);setLaunchProgress(value);if(value>=100){clearInterval(timer);router.push(game.route);setTimeout(()=>{setLaunching(null);setLaunchProgress(0);},350);}},55);
  };

  if(!loaded)return <View style={styles.premiumLoading}><View style={styles.loadOrbOne}/><View style={styles.loadOrbTwo}/><View style={styles.loadCard}><View style={styles.loadContent}><View style={styles.loadBrand}><Ionicons name="chatbubbles-outline" size={15} color="#7542BA"/><Text style={styles.loadBrandText}>AHIRU RESPONSE PRACTICE</Text></View><View style={styles.responseBadgeStage}><Animated.View style={[styles.responseBadgeGlow,{transform:[{scale:pulse}]}]}/><View style={styles.responseBadgeOuter}><View style={styles.responseBadgeInner}><Text style={styles.responseBadgeCharacter}>応</Text><Ionicons name="chatbubbles" size={38} color="#FFF"/></View></View><Animated.View style={[styles.responseBadgeSweep,{transform:[{translateX:shine.interpolate({inputRange:[-1,1],outputRange:[-110,110]})},{rotate:'-18deg'}]}]}/><Text style={styles.responseSparkleOne}>✦</Text><Text style={styles.responseSparkleTwo}>✧</Text></View><Text style={styles.loadJapanese}>会話で学ぶ</Text><Text style={styles.loadKicker}>NATURAL JAPANESE REPLIES</Text><Text style={styles.loadTitle}>Preparing response practice</Text><Text style={styles.loadCopy}>Setting up your guided, timed, and conversation activities.</Text><View style={styles.loadStatus}><Text style={styles.loadStatusText}>GETTING THINGS READY</Text><Text style={styles.loadValue}>{progress}%</Text></View><View style={styles.loadTrack}><View style={[styles.loadFill,{width:`${progress}%`}]}/></View><View style={styles.loadSteps}><View style={[styles.loadStep,progress>=25&&styles.loadStepActive]}/><View style={[styles.loadStep,progress>=50&&styles.loadStepActive]}/><View style={[styles.loadStep,progress>=75&&styles.loadStepActive]}/><View style={[styles.loadStep,progress>=100&&styles.loadStepActive]}/></View><View style={styles.loadFooter}><Ionicons name="sparkles" size={13} color="#7542BA"/><Text style={styles.loadFooterText}>{progress<50?'Preparing your practice':progress<90?'Almost ready':'Ready to begin'}</Text></View></View></View></View>;

  if(launching)return <View style={[styles.gameLoading,{backgroundColor:launching.tint}]}><View style={[styles.gameLoadOrb,styles.gameLoadOrbTop,{backgroundColor:launching.color}]}/><View style={[styles.gameLoadOrb,styles.gameLoadOrbBottom,{backgroundColor:launching.color}]}/><View style={styles.gameLoadCard}><View style={[styles.gameLoadBadge,{backgroundColor:launching.tint}]}><Ionicons name={launching.icon} size={16} color={launching.color}/><Text style={[styles.gameLoadBadgeText,{color:launching.color}]}>{launching.label}</Text></View><View style={styles.gameBadgeStage}><Animated.View style={[styles.gameBadgeGlow,{backgroundColor:`${launching.color}24`,transform:[{scale:pulse}]}]}/><View style={[styles.gameBadgeOuter,{borderColor:`${launching.color}50`}]}><View style={[styles.gameBadgeInner,{backgroundColor:launching.color}]}><Text style={styles.gameBadgeCharacter}>{launching.title==='Guided Response'?'導':launching.title==='Timed Challenge'?'速':'会'}</Text><Ionicons name={launching.icon} size={28} color="#FFF"/></View></View><Animated.View style={[styles.gameBadgeSweep,{transform:[{translateX:shine.interpolate({inputRange:[-1,1],outputRange:[-110,110]})},{rotate:'-18deg'}]}]}/><Image source={launching.mascot} style={styles.gameBadgeMascot} resizeMode="contain"/><Text style={[styles.gameBadgeSparkle,{color:launching.color}]}>✦</Text></View><Text style={styles.gameLoadKicker}>YOUR NEXT PRACTICE</Text><Text style={styles.gameLoadTitle}>{launching.title}</Text><Text style={styles.gameLoadCopy}>{launching.description}</Text><View style={styles.gameLoadStatus}><Text style={styles.gameLoadStatusText}>{launchProgress<45?'Preparing your mission':launchProgress<85?'Setting the challenge':'Mission ready!'}</Text><Text style={[styles.gameLoadValue,{color:launching.color}]}>{launchProgress}%</Text></View><View style={styles.gameLoadTrack}><View style={[styles.gameLoadFill,{width:`${launchProgress}%`,backgroundColor:launching.color}]}/></View><View style={styles.gameLoadNote}><Ionicons name="sparkles" size={14} color={launching.color}/><Text style={styles.gameLoadNoteText}>{launchProgress<45?'Preparing the activity':launchProgress<90?'Loading your challenge':'Ready to start'}</Text></View></View></View>;

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

            <View style={styles.mapMissionCount}>
              <Ionicons name="flag" size={17} color="#FFFFFF" />
              <Text style={styles.mapMissionCountText}>3</Text>
            </View>
          </View>

          <View style={styles.questBoard}>
            <View style={styles.questBoardPatternOne} />
            <View style={styles.questBoardPatternTwo} />
            <View style={styles.questBoardCopy}>
              <Text style={styles.questBoardKicker}>RESPONSE QUEST</Text>
              <Text style={styles.questBoardTitle}>Choose your next reply mission</Text>
              <Text style={styles.questBoardText}>
                Begin with guided practice. Each completed stage opens a harder response challenge.
              </Text>
            </View>
            <View style={styles.questProgressMedallion}>
              <Text style={styles.questProgressValue}>1</Text>
              <View style={styles.questProgressDivider} />
              <Text style={styles.questProgressTotal}>3</Text>
            </View>
          </View>

          <View style={styles.mapSectionHeading}>
            <View>
              <Text style={styles.mapSectionKicker}>MISSION MAP</Text>
              <Text style={styles.mapSectionTitle}>Follow the response trail</Text>
            </View>
            <View style={styles.mapReadyPill}>
              <Ionicons name="sparkles" size={12} color="#6E4BC6" />
              <Text style={styles.mapReadyText}>1 AVAILABLE</Text>
            </View>
          </View>

          <View style={styles.mapTrail}>
            <View style={styles.mapTrailLine} />

            {games.map((game, index) => (
              <View key={game.title} style={styles.mapNodeRow}>
                <View style={styles.mapCheckpointColumn}>
                  <View
                    style={[
                      styles.mapCheckpoint,
                      { backgroundColor: game.locked ? '#B8AFBC' : game.color },
                    ]}
                  >
                    {game.locked ? (
                      <Ionicons name="lock-closed" size={19} color="#FFFFFF" />
                    ) : (
                      <Ionicons name="flag" size={20} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.mapCheckpointLabel}>0{index + 1}</Text>
                </View>

                <Pressable
                  disabled={game.locked}
                  onPress={() => launch(game)}
                  style={({ pressed }) => [
                    styles.mapMissionCard,
                    game.locked && styles.mapMissionCardLocked,
                    pressed && styles.mapMissionCardPressed,
                  ]}
                >
                  <View style={[styles.mapMissionColorRail, { backgroundColor: game.color }]} />
                  <View style={[styles.mapMissionArt, { backgroundColor: game.tint }]}>
                    <View style={[styles.mapArtRingLarge, { borderColor: `${game.color}28` }]} />
                    <View style={[styles.mapArtRingSmall, { backgroundColor: `${game.color}18` }]} />
                    <Text style={[styles.mapArtCharacter, { color: `${game.color}1F` }]}>
                      {index === 0 ? '答' : index === 1 ? '速' : '会'}
                    </Text>
                    <Image
                      source={game.mascot}
                      style={[styles.mapMissionMascot, game.locked && styles.mapMissionMascotLocked]}
                      resizeMode="contain"
                    />
                    <View style={[styles.mapStageBadge, { backgroundColor: game.color }]}>
                      <Text style={styles.mapStageBadgeText}>STAGE {index + 1}</Text>
                    </View>
                  </View>

                  <View style={styles.mapMissionContent}>
                    <View style={styles.mapMissionHeaderRow}>
                      <View style={[styles.mapModeIcon, { backgroundColor: game.tint }]}>
                        <Ionicons name={game.icon} size={17} color={game.color} />
                      </View>
                      <Text style={[styles.mapModeText, { color: game.color }]}>{game.label}</Text>
                      {game.locked && (
                        <View style={styles.mapLockedPill}>
                          <Ionicons name="lock-closed" size={10} color="#756B79" />
                          <Text style={styles.mapLockedPillText}>LOCKED</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.mapMissionTitle}>{game.title}</Text>
                    <Text style={styles.mapMissionSubtitle}>{game.subtitle}</Text>
                    <Text style={styles.mapMissionDescription}>{game.description}</Text>

                    <View style={styles.mapMissionFooter}>
                      <View style={styles.mapMissionActionCopy}>
                        <Text style={[styles.mapStartText, { color: game.locked ? '#8D8491' : game.color }]}>
                          {game.locked ? 'FINISH THE PREVIOUS STAGE' : 'BEGIN GUIDED MISSION'}
                        </Text>
                        <Text style={styles.mapUnlockHint}>
                          {game.locked ? 'This trail is not available yet' : 'Practice at your own pace'}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.mapStartButton,
                          { backgroundColor: game.locked ? '#B8AFBC' : game.color },
                        ]}
                      >
                        <Ionicons
                          name={game.locked ? 'lock-closed' : 'play'}
                          size={17}
                          color="#FFFFFF"
                        />
                      </View>
                    </View>
                  </View>
                </Pressable>
              </View>
            ))}

            <View style={styles.mapFinishRow}>
              <View style={styles.mapFinishCheckpoint}>
                <Ionicons name="trophy" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.mapFinish}>
                <View style={styles.mapFinishIcon}>
                  <Ionicons name="sparkles" size={18} color="#D88727" />
                </View>
                <View>
                  <Text style={styles.mapFinishKicker}>TRAIL GOAL</Text>
                  <Text style={styles.mapFinishText}>Speak with confidence</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}
