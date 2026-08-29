import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import BackIcon from '../assets/svg/back-icon.svg';
import styles from '../styles/stylesQuackTalk';
import StudentBottomNav from '../components/StudentBottomNav';
import { AuthContext } from '../context/AuthContext';
import { loadBundledSound } from '../utils/nativeAudio';

import sumiSmile from '../assets/img/Sumi_PoseB_WinterUni_Smile.png';
import sumiOpen from '../assets/img/Sumi_PoseB_WinterUni_Open.png';
import sumiEyesClosedOpen from '../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Open.png';

export default function QuackTalk(){
  const { user }=useContext(AuthContext);
  const firstName=user?.fname?.trim()||'learner';
  const [choicesVisible,setChoicesVisible]=useState(false);
  const [language,setLanguage]=useState<'ja'|'en'>('ja');
  const [playbackSpeed,setPlaybackSpeed]=useState<1|1.5|2>(1);
  const [speedMenuVisible,setSpeedMenuVisible]=useState(false);
  const [speaking,setSpeaking]=useState(false);
  const [speechFrame,setSpeechFrame]=useState(0);
  const activeSound=useRef<Audio.Sound|null>(null);
  const playbackSession=useRef(0);
  const startingPlayback=useRef(false);

  const japaneseGreeting='こんにちは。一緒に日本語を話す練習をしましょう。会話の質問に答えるか、発音を練習できます。';
  const englishGreeting="Hello. Let's practice speaking Japanese together. You can answer my guided questions or practice pronouncing a phrase.";

  const stopSumiImmediately=useCallback(()=>{
    playbackSession.current+=1;
    startingPlayback.current=false;
    setSpeaking(false);
    const sound=activeSound.current;
    activeSound.current=null;
    if(sound){sound.setOnPlaybackStatusUpdate(null);sound.stopAsync().catch(()=>{}).finally(()=>sound.unloadAsync().catch(()=>{}));}
  },[]);

  const speakGreeting=async(selectedLanguage:'ja'|'en'=language)=>{
    if(speaking||startingPlayback.current)return;
    startingPlayback.current=true;
    const session=++playbackSession.current;
    if(activeSound.current){const previousSound=activeSound.current;activeSound.current=null;previousSound.setOnPlaybackStatusUpdate(null);await previousSound.stopAsync().catch(()=>{});await previousSound.unloadAsync().catch(()=>{});}
    setChoicesVisible(false);
    setLanguage(selectedLanguage);
    setSpeaking(true);
    try{
      const source=selectedLanguage==='ja'?require('../assets/audio/sumi-welcome-ja.mp3'):require('../assets/audio/sumi-welcome-en.mp3');
      const {sound}=await loadBundledSound(
        source,
        {
          shouldPlay:true,
          volume:1,
          rate:playbackSpeed,
          shouldCorrectPitch:true,
        },
      );
      if(session!==playbackSession.current){await sound.unloadAsync().catch(()=>{});return;}
      activeSound.current=sound;
      sound.setOnPlaybackStatusUpdate(status=>{
        if(status.isLoaded&&status.didJustFinish&&session===playbackSession.current){sound.setOnPlaybackStatusUpdate(null);setSpeaking(false);setChoicesVisible(true);sound.unloadAsync().catch(()=>{});if(activeSound.current===sound)activeSound.current=null;}
      });
    }catch(error){
      console.warn('Bundled Sumi voice could not play.',error);
      setSpeaking(false);setChoicesVisible(true);
    }finally{
      startingPlayback.current=false;
    }
  };

  useEffect(()=>{
    const welcomeTimer=setTimeout(()=>speakGreeting('ja'),500);
    return()=>{clearTimeout(welcomeTimer);playbackSession.current+=1;if(activeSound.current){activeSound.current.setOnPlaybackStatusUpdate(null);activeSound.current.unloadAsync().catch(()=>{});activeSound.current=null;}};
  },[]);

  useFocusEffect(useCallback(()=>()=>stopSumiImmediately(),[stopSumiImmediately]));

  useEffect(()=>{
    if(!speaking){setSpeechFrame(0);return;}
    const frameTimer=setInterval(()=>setSpeechFrame(frame=>(frame+1)%4),280);
    return()=>clearInterval(frameTimer);
  },[speaking]);

  const sumiSprite=!speaking
    ? sumiSmile
    : speechFrame===1
      ? sumiOpen
      : speechFrame===3
        ? sumiEyesClosedOpen
        : sumiSmile;
  const spokenDialogue=language==='ja'?japaneseGreeting:englishGreeting;
  const playbackSpeeds=[1,1.5,2] as const;

  const changePlaybackSpeed=async(speed:1|1.5|2)=>{
    setPlaybackSpeed(speed);
    setSpeedMenuVisible(false);

    if(activeSound.current){
      await activeSound.current
        .setRateAsync(speed,true)
        .catch(error=>console.warn('Unable to change Sumi voice speed.',error));
    }
  };

  const leaveFor=(route:'/Exercises'|'/QuackTalkFeedback'|'/QuackTalkConversation'|'/QuackTalkSpeech')=>{stopSumiImmediately();setChoicesVisible(false);router.push(route);};
  const openPractice=(route:'/QuackTalkConversation'|'/QuackTalkSpeech')=>leaveFor(route);

  return <SafeAreaView style={styles.safeArea}><ImageBackground source={require('../assets/quacktalk/quacktalk-practice-room-v1.png')} style={styles.background} imageStyle={styles.backgroundImage} resizeMode="cover"><View style={styles.sceneShade}/>
    <View style={styles.topBar}><Pressable onPress={()=>leaveFor('/Exercises')} style={styles.backButton}><BackIcon width={18} height={18} fill="#47295A"/></Pressable><View style={styles.brand}><Ionicons name="mic-outline" size={16} color="#7552C8"/><View><Text style={styles.brandEyebrow}>SUMI'S SPEAKING ROOM</Text><Text style={styles.brandTitle}>QuackTalk Interview</Text></View></View><Pressable onPress={()=>leaveFor('/QuackTalkFeedback')} style={styles.feedbackButton}><Ionicons name="analytics-outline" size={18} color="#7552C8"/><Text style={styles.feedbackButtonText}>Feedback</Text></Pressable></View>

    <View style={styles.interviewStage}><View style={styles.windowGlow}/><View style={styles.coachNameTag}><View style={styles.coachOnline}/><Text style={styles.coachName}>SUMI · COACHING {firstName.toUpperCase()}</Text></View><Image source={sumiSprite} style={styles.sumiInterview} resizeMode="contain" fadeDuration={0}/><View style={styles.deskShadow}/>
      {speaking&&<View style={styles.sceneDialogue}><View style={styles.sceneDialogueTail}/><View style={styles.sceneDialogueTop}><Ionicons name="volume-high" size={14} color="#7552C8"/><Text style={styles.sceneSpeaker}>SUMI</Text><View style={styles.speakingBars}>{[10,17,13].map((height,index)=><View key={index} style={[styles.speakingBar,{height}]}/>)}</View></View><Text style={styles.sceneDialogueText}>{spokenDialogue}</Text></View>}
      <View style={styles.liveIndicator}><View style={[styles.liveDot,speaking&&styles.liveDotSpeaking]}/><Text style={styles.liveText}>{speaking?'SUMI IS SPEAKING':'VOICE SESSION READY'}</Text></View>
      <View style={styles.sceneActions}>
        <View style={styles.languageControlGroup}>
          <Pressable
            onPress={()=>{
              setSpeedMenuVisible(false);
              void speakGreeting('ja');
            }}
            disabled={speaking}
            style={[
              styles.languageReplay,
              language==='ja'&&styles.languageReplayActive,
            ]}
          >
            <Text
              style={[
                styles.languageReplayText,
                language==='ja'&&styles.languageReplayTextActive,
              ]}
            >
              日本語
            </Text>
          </Pressable>

          <Pressable
            onPress={()=>{
              setSpeedMenuVisible(false);
              void speakGreeting('en');
            }}
            disabled={speaking}
            style={[
              styles.languageReplay,
              language==='en'&&styles.languageReplayActive,
            ]}
          >
            <Text
              style={[
                styles.languageReplayText,
                language==='en'&&styles.languageReplayTextActive,
              ]}
            >
              English
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={()=>{
            setSpeedMenuVisible(false);
            void speakGreeting(language);
          }}
          disabled={speaking}
          style={styles.replayCircle}
        >
          <Ionicons name="refresh" size={17} color="#7552C8" />
        </Pressable>

        <Pressable
          onPress={()=>setSpeedMenuVisible(current=>!current)}
          style={[
            styles.speedCircle,
            speedMenuVisible&&styles.speedCircleActive,
          ]}
        >
          <Ionicons
            name="speedometer-outline"
            size={17}
            color={speedMenuVisible?'#FFFFFF':'#7552C8'}
          />
        </Pressable>

        {speedMenuVisible&&(
          <View style={styles.speedPopup}>
            <View style={styles.speedPopupHeader}>
              <Ionicons name="volume-medium-outline" size={13} color="#7552C8" />
              <Text style={styles.speedPopupLabel}>VOICE SPEED</Text>
            </View>

            <View style={styles.speedPopupOptions}>
              {playbackSpeeds.map(speed=>(
                <Pressable
                  key={speed}
                  onPress={()=>void changePlaybackSpeed(speed)}
                  style={[
                    styles.speedPopupOption,
                    playbackSpeed===speed&&styles.speedPopupOptionActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.speedPopupOptionText,
                      playbackSpeed===speed&&styles.speedPopupOptionTextActive,
                    ]}
                  >
                    {speed.toFixed(1)}×
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>

    <Modal
      visible={choicesVisible}
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      navigationBarTranslucent
      hardwareAccelerated
      onRequestClose={() => setChoicesVisible(false)}
    >
      <View style={styles.modalShade}>
        <View style={styles.choiceSheet}>
          <View style={styles.sheetHandle} />
          <Pressable onPress={() => setChoicesVisible(false)} style={styles.closeButton}>
            <Ionicons name="close" size={19} color="#7C7182" />
          </Pressable>
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.choiceSheetContent}
          >
            <View style={styles.choiceHeader}>
              <View style={styles.choiceAvatar}>
                <Ionicons name="sparkles" size={27} color="#7552C8" />
              </View>
              <View style={styles.choiceHeaderCopy}>
                <Text style={styles.choiceEyebrow}>SUMI IS READY</Text>
                <Text style={styles.choiceHeading}>Choose your practice</Text>
              </View>
            </View>
            <Pressable
              onPress={() => openPractice('/QuackTalkConversation')}
              style={styles.primaryChoice}
            >
              <View style={styles.choiceIconPrimary}>
                <Ionicons name="chatbubbles" size={23} color="#FFF" />
              </View>
              <View style={styles.choiceCopy}>
                <Text style={styles.primaryChoiceTitle}>Guided conversation with Sumi</Text>
                <Text style={styles.primaryChoiceText}>
                  Enter Sumi's conversation room. Questions and AI listening are coming soon.
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#FFF" />
            </Pressable>
            <Pressable
              onPress={() => openPractice('/QuackTalkSpeech')}
              style={styles.secondaryChoice}
            >
              <View style={styles.choiceIconSecondary}>
                <Ionicons name="mic" size={23} color="#D84F83" />
              </View>
              <View style={styles.choiceCopy}>
                <Text style={styles.secondaryChoiceTitle}>Open speaking practice</Text>
                <Text style={styles.secondaryChoiceText}>
                  Test your microphone in Sumi's studio. Guided phrases and feedback are coming soon.
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#D84F83" />
            </Pressable>
            <Pressable
              onPress={() => {
                setChoicesVisible(false);
                speakGreeting(language);
              }}
              style={styles.hearAgain}
            >
              <Ionicons name="volume-medium-outline" size={15} color="#7552C8" />
              <Text style={styles.hearAgainText}>Hear Sumi again</Text>
            </Pressable>
          </ScrollView>
        </View>
      </View>
    </Modal>
    <StudentBottomNav active="talk" />
  </ImageBackground></SafeAreaView>;
}
