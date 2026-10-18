import expressionAudio from '../services/expressionMatchAudio';
import {hasMeaningfulText,canScoreExpression,isCaptionOnlyMoment,expressionCheckpoint,replaceExpressionQuestions,expressionRunMatches,ExpressionQuestionResult} from '../services/expressionMatchContext';
import expressionImages from '../services/expressionMatchImages';
import expressionMedia from '../data/expressionMatchMedia.json';
import {expressionTargetOrder} from '../services/expressionMatchTargets';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Audio } from 'expo-av';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Animated,
  Image,
  ImageSourcePropType,
  Modal,
  PanResponder,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import QuackSituateExit from '../components/QuackSituateExit';
import expoconfig from '../expoconfig';
import { loadBundledSound, stopAndUnloadSound } from '../utils/nativeAudio';
import { loadOfflineContent, queueOfflineSubmission, syncOfflineSubmissions } from '../services/offlineSync';
import { resolveOfflineMediaUri, useOfflineMediaUri } from '../services/offlineMedia';

type Choice = {
  japanese: string;
  romaji: string;
};

type Moment = {
  id: string;
  level: number;
  setNumber: number;
  topic: string;
  location: string;
  sceneKey: string;
  bundledMediaKey?:string;
  imageUrl?: string;
  imageAlt?: string;
  secondaryImageUrl?: string;
  secondaryImageAlt?: string;
  audioUrl?: string;
  scenario: string;
  secondaryScenario?: string;
  hint: string;
  correctAnswer: string;
  explanation: string;
  choices: Choice[];
};

type TargetPosition = 'top' | 'bottom';

const mediaUrl = (url?: string) => {
  if (!url) return '';
  return url.startsWith('http') ? url : `${expoconfig.API_URL}${url}`;
};

// Generic wave/bow art is not a scenario illustration and must not identify correctness.
const isGenericGesture=(url?:string)=>/gesture-(wave|bow)\.png(?:[?#]|$)/i.test(url??'');
function TargetPicture({source,scenario,captionOnly,onReady}:{source?:ImageSourcePropType;scenario:string;captionOnly:boolean;onReady:(ready:boolean)=>void}){
  const [failed,setFailed]=useState(false);
  const [retry,setRetry]=useState(0);
  const sourceKey=JSON.stringify(source);
  useLayoutEffect(()=>{setFailed(false);onReady(captionOnly);},[sourceKey,captionOnly,onReady]);
  return <View style={styles.targetArtwork}>{!captionOnly&&source&&!failed?<Image key={retry} source={source} accessibilityLabel={scenario} style={styles.targetImage} resizeMode="contain" onLoad={()=>onReady(true)} onError={()=>{onReady(false);setFailed(true);}}/>:<View accessibilityLabel={scenario} style={{flex:1,alignItems:'center',justifyContent:'center',gap:6,padding:10}}><Ionicons name={captionOnly?'reader-outline':'image-outline'} size={28} color="#C5B5E9"/><Text style={{fontSize:11,color:'#EEE7FB',textAlign:'center'}}>{captionOnly?'CONTEXT CHECK · Read the situation below':'Picture unavailable. Caption practice is unscored until both pictures load.'}</Text>{!captionOnly&&!!source&&<Pressable accessibilityRole="button" accessibilityLabel="Retry scene picture" onPress={event=>{event.stopPropagation();onReady(false);setRetry(n=>n+1);setFailed(false);}}><Text style={{color:'#FFFFFF',padding:8}}>Retry picture</Text></Pressable>}</View>}</View>;
}

const getAnswer = (moment: Moment): Choice => {
  const answer=moment.choices?.find(choice=>choice.japanese===moment.correctAnswer);
  const authored=expressionMedia.find(row=>row.level===moment.level&&row.japanese===moment.correctAnswer);
  return {japanese:moment.correctAnswer,romaji:hasMeaningfulText(answer?.romaji)?answer!.romaji:authored?.romaji||moment.correctAnswer};
};

function DraggablePhrase({
  label,
  japanese,
  disabled,
  onDrop,
}: {
  label: string;
  japanese:string;
  disabled: boolean;
  onDrop: (position: TargetPosition) => void;
}) {
  const position = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;

  const reset = useCallback(() => {
    Animated.parallel([
      Animated.spring(position, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, [position, scale]);

  const responder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return !disabled && Math.abs(gesture.dy) > 4;
      },
      onPanResponderGrant: () => {
        Animated.spring(scale, {
          toValue: 1.08,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: position.x, dy: position.y }],
        { useNativeDriver: false },
      ),
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy < -70) {
          onDrop('top');
        } else if (gesture.dy > 70) {
          onDrop('bottom');
        }

        reset();
      },
      onPanResponderTerminate: reset,
    });
  }, [disabled, onDrop, position, reset, scale]);

  return (
    <Animated.View
      {...responder.panHandlers}
      style={[
        styles.draggablePhrase,
        {
          transform: [
            { translateX: position.x },
            { translateY: position.y },
            { scale },
          ],
        },
      ]}
    >
      <View style={{flexShrink:1,paddingVertical:7}}><Text style={styles.draggableText}>{japanese}</Text><Text style={{fontSize:11,color:'#E2D8FF',textAlign:'center',marginTop:3}}>{label}</Text></View>
      <Ionicons name="apps" size={16} color="#E2D8FF" />
    </Animated.View>
  );
}

export default function QuackSituateMatching() {
  const params = useLocalSearchParams<{ level?: string; set?: string }>();
  const level = Math.min(3, Math.max(1, Number(params.level) || 1));
  const setNumber = 1; // The Expression Match trail uses the authored first set only.

  const [moments, setMoments] = useState<Moment[]>([]);
  const [momentIndex, setMomentIndex] = useState(0);
  const [runRevision,setRunRevision]=useState(0);
  const targetOrder=useMemo(()=>expressionTargetOrder(moments.length),[moments,runRevision]);
  const correctPosition=targetOrder[momentIndex]??'top';
  const [audioError,setAudioError]=useState('');
  const [audioPlaying,setAudioPlaying]=useState(false);
  const choiceLock=useRef(false);
  const pictureReadiness=useRef({key:'',top:false,bottom:false});
  const questionResults=useRef<ExpressionQuestionResult[]>([]);
  const checkpointQueue=useRef<Promise<void>>(Promise.resolve());
  const questionSupport=useRef({hintUsed:false,audioReplays:0});
  const [checkpointNotice,setCheckpointNotice]=useState('');
  const audioGeneration=useRef(0);
  const audioFocused=useRef(true);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showExit, setShowExit] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [attemptStored, setAttemptStored] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [showStart,setShowStart]=useState(true);
  const [showPause,setShowPause]=useState(false);
  const [showRestart,setShowRestart]=useState(false);
  const [showTechnical,setShowTechnical]=useState(false);
  const blocked=showStart||showPause||showRestart||showExit||showHelp||showResult||showTechnical;
  const captionOnly=isCaptionOnlyMoment(momentIndex);

  const music = useRef<Audio.Sound | null>(null);
  const momentAudio = useRef<Audio.Sound | null>(null);
  const correctSound = useRef<Audio.Sound | null>(null);
  const incorrectSound = useRef<Audio.Sound | null>(null);

  // Keep the final loaded moment mounted while the results modal is visible.
  // A checkpoint index must never replace valid content with the empty screen.
  const current = moments.length > 0
    ? moments[Math.min(momentIndex, moments.length - 1)]
    : undefined;
  const pictureKey=`${runRevision}:${momentIndex}:${current?.id}`;
  const markTopReady=useCallback((ready:boolean)=>{
    if(pictureReadiness.current.key!==pictureKey)pictureReadiness.current={key:pictureKey,top:false,bottom:false};
    pictureReadiness.current.top=ready;
  },[pictureKey]);
  const markBottomReady=useCallback((ready:boolean)=>{
    if(pictureReadiness.current.key!==pictureKey)pictureReadiness.current={key:pictureKey,top:false,bottom:false};
    pictureReadiness.current.bottom=ready;
  },[pictureKey]);
  const authoredMedia=expressionMedia.find(row=>row.japanese===current?.correctAnswer&&row.scenario===current?.scenario&&row.secondaryScenario===current?.secondaryScenario);
  const bundledMediaKey=current?.bundledMediaKey??authoredMedia?.key;
  const correctBundledImage=bundledMediaKey?expressionImages[bundledMediaKey]?.scene:undefined;
  const alternativeBundledImage=bundledMediaKey?expressionImages[bundledMediaKey]?.alternative:undefined;
  // Authored pictures and speech remain bundled for first-use offline play.
  const correctImageUri = useOfflineMediaUri(correctBundledImage||isGenericGesture(current?.imageUrl) ? undefined : current?.imageUrl);
  const alternativeImageUri = useOfflineMediaUri(alternativeBundledImage||isGenericGesture(current?.secondaryImageUrl) ? undefined : current?.secondaryImageUrl);
  const currentAnswer = current ? getAnswer(current) : null;
  const phraseAudio=current?expressionAudio[current.correctAnswer]:undefined;
  const hasPhraseAudio=!!phraseAudio||!!current?.audioUrl;
  const answeredCount = correctCount + mistakes;
  const accuracy = answeredCount > 0 ? correctCount / answeredCount : 0;
  const stars = answeredCount === 0
    ? 0
    : accuracy >= 0.9
      ? 3
      : accuracy >= 0.7
        ? 2
        : 1;
  const score = correctCount * 10;
  const runGameType = `EXPRESSION_MATCH_LEVEL_${level}`;

  const getUser = useCallback(async () => {
    const stored = await AsyncStorage.getItem('user');
    return stored ? JSON.parse(stored) : {};
  }, []);

  const saveRun = useCallback(async (
    questionIndex: number,
    savedCorrectCount: number,
    savedMistakes: number,
  ) => {
    const records=questionResults.current.map(row=>({...row}));
    const questionIds=moments.map(m=>m.id);
    const snapshot={expressionMatchVersion:4,questionResults:records,questionIndex,correctCount:savedCorrectCount,mistakes:savedMistakes,questionIds,savedAt:Date.now()};
    const task=checkpointQueue.current.catch(()=>undefined).then(async()=>{
    try {
      const user = await getUser();
      if (!user.email) return;
      await AsyncStorage.setItem(`expressionRun:${user.email.trim().toLowerCase()}:${runGameType}`,
        JSON.stringify(snapshot));
      const controller=new AbortController();
      const timeout=setTimeout(()=>controller.abort(),6000);
      try{
      await fetch(`${expoconfig.API_URL}/api/situational/runs/current`, {
        method: 'PUT',
        signal:controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          gameType: runGameType,
          expressionMatchVersion:4,
          questionIds,
          questionResults:records,
          questionIndex,
          correctCount: savedCorrectCount,
          easyMistakes: savedMistakes,
          hardMistakes: level === 3 ? savedMistakes : 0,
          hintsUsed: 0,
        }),
      });
      }finally{clearTimeout(timeout);}
    } catch {}
    });
    checkpointQueue.current=task;await task;
  }, [getUser, level, runGameType,moments]);

  const stopAudio = useCallback(async (unload = false) => {
    audioGeneration.current++;
    const sounds = [
      music.current,
      momentAudio.current,
      correctSound.current,
      incorrectSound.current,
    ];

    await Promise.all(
      sounds.map(async sound => {
        if (!sound) return;

        try {
          await sound.stopAsync();
          if (unload) await sound.unloadAsync();
        } catch {}
      }),
    );

    if (unload) {
      music.current = null;
      momentAudio.current = null;
      correctSound.current = null;
      incorrectSound.current = null;
    }
  }, []);

  useEffect(()=>{
    if(blocked){setAudioPlaying(false);void stopAudio();}
    else void music.current?.playAsync().catch(()=>undefined);
  },[blocked,stopAudio]);
  useEffect(()=>{
    const subscription=AppState.addEventListener('change',state=>{if(state!=='active'){setShowPause(true);void stopAudio();}});
    return()=>subscription.remove();
  },[stopAudio]);

  useFocusEffect(
    useCallback(() => {
      audioFocused.current=true;
      return () => {
        audioFocused.current=false;
        void stopAudio(true);
      };
    }, [stopAudio]),
  );

  useEffect(() => {
    let active = true;

    void (async () => {
      try {
        const all = await loadOfflineContent<Moment[]>('/api/situational/questions?gameType=EXPRESSION_MATCH');
        const replacements:Moment[]=expressionMedia.filter(row=>row.level===level).map((row,index)=>({
          id:`canonical:${row.key}`,level,setNumber:1,topic:'Expression Match',location:'Expression Match',sceneKey:row.key,bundledMediaKey:row.key,
          scenario:row.scenario,secondaryScenario:row.secondaryScenario,hint:row.hint,
          correctAnswer:row.japanese,choices:[{japanese:row.japanese,romaji:row.romaji}],
          explanation:`This expression fits “${row.scenario}”. ${row.hint}`,
        }));
        const published = replaceExpressionQuestions(all,level,replacements);
        let selected = published;

        if (active) setMoments(selected);

        const user = await getUser();
        if (user.email && selected.length > 0) {
          const runKey = `expressionRun:${user.email.trim().toLowerCase()}:${runGameType}`;
          const localRaw = await AsyncStorage.getItem(runKey);
          const localRun = localRaw ? JSON.parse(localRaw) : null;
          let run: any = localRun;
          try {
            const runResponse = await fetch(
              `${expoconfig.API_URL}/api/situational/runs/current?email=${encodeURIComponent(user.email)}&gameType=${encodeURIComponent(runGameType)}`,
            );
            if (runResponse.ok && runResponse.status !== 204) {
              const remoteRun = await runResponse.json();
              if (!localRun || new Date(remoteRun.updatedAt || 0).getTime() > Number(localRun.savedAt || 0)) run = remoteRun;
            }
          } catch { /* The on-device checkpoint remains available offline. */ }
          // 204 means there is no unfinished checkpoint. It has no JSON body
          // and is the normal state for a fresh game or replay.
          if (active && run) {
            const expectedIds=selected.map(m=>m.id);
            if(!expressionRunMatches(run,expectedIds)){
              run=null;questionResults.current=[];
              setCheckpointNotice('The question list has been cleaned up. This level starts fresh; completed results are unchanged.');
              await AsyncStorage.removeItem(runKey);
            }
          }
          if (active && run) {
            questionResults.current=run.questionResults;
            const savedQuestionIndex = Math.max(0, Number(run.questionIndex) || 0);
            const resumeIndex = Math.min(savedQuestionIndex, selected.length - 1);
            const resumedCorrect=questionResults.current.filter(row=>row.outcome==='CORRECT').length;
            if (savedQuestionIndex >= selected.length) {
              // Restore final feedback/results after a shutdown before completion was stored.
              setMomentIndex(selected.length-1);setCorrectCount(resumedCorrect);
              setMistakes(questionResults.current.filter(row=>row.outcome==='INCORRECT').length);
              setShowStart(false);setShowResult(true);
            } else {
              setMomentIndex(resumeIndex);
              setCorrectCount(resumedCorrect);
              setMistakes(Math.max(0, savedQuestionIndex - resumedCorrect));
            }
          }
        }

        const loaded = await Promise.all([
          loadBundledSound(
            require('../assets/audio/sfx/quiz.mp3'),
            {
              isLooping: true,
              volume: 0.08,
              shouldPlay: false,
            },
          ),
          loadBundledSound(require('../assets/audio/sfx/correct_sfx.mp3')),
          loadBundledSound(require('../assets/audio/sfx/incorrect_sfx.mp3')),
        ]);

        music.current = loaded[0].sound;
        correctSound.current = loaded[1].sound;
        incorrectSound.current = loaded[2].sound;
      } catch {
        if (active) setAudioError('Some audio could not load. The questions remain available.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
      void stopAudio(true);
    };
  }, [getUser, level, runGameType, setNumber, stopAudio]);

  useEffect(()=>{
    questionSupport.current={hintUsed:false,audioReplays:0};
    audioGeneration.current++;setAudioPlaying(false);setAudioError('');
    const previous=momentAudio.current;momentAudio.current=null;void stopAndUnloadSound(previous);
    setShowHint(false);setLocked(false);choiceLock.current=false;
    return()=>{audioGeneration.current++;const stale=momentAudio.current;momentAudio.current=null;void stopAndUnloadSound(stale);};
  },[current?.id,runRevision]);

  const playMomentAudio=async()=>{
    if(!current||!hasPhraseAudio||locked||blocked)return;
    questionSupport.current.audioReplays++;
    const generation=++audioGeneration.current;
    setAudioError('');setAudioPlaying(false);
    const previous=momentAudio.current;momentAudio.current=null;
    await stopAndUnloadSound(previous);
    try{
      const source=phraseAudio??{uri:await resolveOfflineMediaUri(current.audioUrl)};
      if(generation!==audioGeneration.current||!audioFocused.current)return;
      const loaded=await loadBundledSound(source,{shouldPlay:false,volume:1},status=>{
        if(generation!==audioGeneration.current)return;
        if(!status.isLoaded&&status.error){setAudioPlaying(false);setAudioError('Audio could not play. Tap the speaker to retry.');}
        if(status.isLoaded&&status.didJustFinish)setAudioPlaying(false);
      });
      if(generation!==audioGeneration.current||!audioFocused.current){void stopAndUnloadSound(loaded.sound);return;}
      momentAudio.current=loaded.sound;await loaded.sound.playAsync();
      if(generation===audioGeneration.current)setAudioPlaying(true);
    }catch{if(generation===audioGeneration.current){setAudioPlaying(false);setAudioError('Audio could not play. Tap the speaker to retry.');}}
  };

  const choose = useCallback(async (position: TargetPosition) => {
    if (!current || locked || choiceLock.current || blocked) return;
    const ready=pictureReadiness.current;
    const record=(outcome:ExpressionQuestionResult['outcome'])=>{
      if(outcome==='TECHNICAL_INTERRUPTION'&&questionResults.current.some(row=>row.questionId===current.id&&row.outcome===outcome))return false;
      questionResults.current.push({questionId:current.id,expression:current.correctAnswer,questionIndex:momentIndex,
        mode:captionOnly?'CAPTION_ONLY':'PICTURE',outcome,selectedPosition:position,correctPosition,
        selectedScenario:position===correctPosition?current.scenario:current.secondaryScenario!,
        correctScenario:current.scenario,alternativeScenario:current.secondaryScenario!,
        ...questionSupport.current,recordedAt:new Date().toISOString()});
      return true;
    };
    if(!canScoreExpression(captionOnly,ready.key===pictureKey&&ready.top,ready.key===pictureKey&&ready.bottom)){
      const added=record('TECHNICAL_INTERRUPTION');setShowTechnical(true);
      if(added)void saveRun(momentIndex,correctCount,mistakes);return; // Evidence only; never a scored answer.
    }
    choiceLock.current=true;

    setLocked(true);audioGeneration.current++;setAudioPlaying(false);const previous=momentAudio.current;momentAudio.current=null;void stopAndUnloadSound(previous);

    const isCorrect = position === correctPosition;
    record(isCorrect?'CORRECT':'INCORRECT');
    const nextCorrectCount = correctCount + (isCorrect ? 1 : 0);
    const nextMistakes = mistakes + (isCorrect ? 0 : 1);
    const nextQuestionIndex = momentIndex + 1;
    const checkpoint=saveRun(nextQuestionIndex,nextCorrectCount,nextMistakes);

    if (isCorrect) {
      setCorrectCount(nextCorrectCount);
      setFeedback('correct');
      await correctSound.current?.replayAsync().catch(()=>undefined);
    } else {
      setMistakes(nextMistakes);
      setFeedback('incorrect');
      await incorrectSound.current?.replayAsync().catch(()=>undefined);
    }

    await checkpoint;
  }, [correctCount, correctPosition, current, locked, mistakes, momentIndex, saveRun,blocked,captionOnly,pictureKey]);

  const continueAfterFeedback = () => {
    setFeedback(null);

    if (momentIndex + 1 >= moments.length) {
      setShowResult(true);
      return;
    }

    setMomentIndex(index => index + 1);
  };

  const storeCompletedAttempt = async () => {
    await checkpointQueue.current;
    const user = await getUser();

    await queueOfflineSubmission(user.email, '/api/situational/attempts', {
        email: user.email,
        name: [user.fname, user.lname].filter(Boolean).join(' '),
        gameType: 'EXPRESSION_MATCH',
        difficulty: level === 3 ? 'HARD' : level === 2 ? 'INTERMEDIATE' : 'STARTER',
        level,
        setNumber,
        topic: moments[0]?.topic,
        score,
        maxScore: moments.length * 10,
        totalQuestions: moments.length,
        correctAnswers: correctCount,
        questionResults:questionResults.current,
        hintsUsed:questionResults.current.filter(row=>row.outcome!=='TECHNICAL_INTERRUPTION'&&row.hintUsed).length,
        stars,
        completed: true,
      });
    void syncOfflineSubmissions(user.email);

    await fetch(
      `${expoconfig.API_URL}/api/situational/runs/current?email=${encodeURIComponent(user.email)}&gameType=${encodeURIComponent(runGameType)}`,
      { method: 'DELETE' },
    ).catch(() => undefined);
    await AsyncStorage.removeItem(`expressionRun:${user.email.trim().toLowerCase()}:${runGameType}`);
    setAttemptStored(true);
  };

  const ensureCompletedAttempt = async () => {
    if (!attemptStored) await storeCompletedAttempt();
  };

  useEffect(() => {
    if (!showResult || attemptStored || saving) return;
    setSaving(true);
    void storeCompletedAttempt()
      .catch(() => {})
      .finally(() => setSaving(false));
  }, [attemptStored, showResult]);

  const saveAndLeave = async () => {
    setSaving(true);

    try {
      await ensureCompletedAttempt();
      await stopAudio(true);
      setIsExiting(true);
    } finally {
      setSaving(false);
    }
  };

  const replay = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await ensureCompletedAttempt();
      setMomentIndex(0);
      questionResults.current=[];
      setCorrectCount(0);
      setMistakes(0);
      setFeedback(null);
      setShowHint(false);
      setLocked(false);
      choiceLock.current=false;
      setShowResult(false);
      setAttemptStored(false);
      setRunRevision(run=>run+1);
      setShowStart(true);
      setShowTechnical(false);
      await saveRun(0,0,0);
    } finally {
      setSaving(false);
    }
  };

  const confirmExit = async () => {
    if(saving)return;
    setSaving(true);
    if(correctCount+mistakes>=moments.length)await ensureCompletedAttempt();
    else await saveRun(expressionCheckpoint(momentIndex,locked), correctCount, mistakes);
    await stopAudio(true);
    setShowExit(false);
    setIsExiting(true);
    setSaving(false);
  };

  const restartGame=async()=>{
    if(saving)return;
    setSaving(true);
    try{
      await stopAudio();
      questionResults.current=[];
      await saveRun(0,0,0);
      setMomentIndex(0);setCorrectCount(0);setMistakes(0);setFeedback(null);
      setLocked(false);choiceLock.current=false;setShowHint(false);setShowHelp(false);
      setShowExit(false);setShowPause(false);setShowRestart(false);setShowResult(false);
      setAttemptStored(false);setRunRevision(n=>n+1);setShowStart(true);
      setShowTechnical(false);
    }finally{setSaving(false);}
  };

  const scoreSummary=<View style={styles.scoreSummary}><Ionicons name="star" size={16} color="#E7AD30"/><Text style={styles.scoreSummaryText}>Level {level} · {score}/{moments.length*10} points · {correctCount}/{moments.length} matched</Text></View>;

  if (isExiting) {
    return (
      <QuackSituateExit
        color="#7652E8"
        icon="hand-left-outline"
        title="Expression Match saved"
        subtitle="Your latest situation-matching result is ready in QuackProgress."
        status="RETURNING TO CHALLENGES"
        onComplete={() => router.replace('/QuackSituateMatchingLevels')}
      />
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color="#7652E8" />
        <Text style={styles.loadingText}>Preparing situation pairs…</Text>
      </SafeAreaView>
    );
  }

  if (moments.length === 0 || !current || !currentAnswer) {
    return (
      <SafeAreaView style={styles.loading}>
        <Ionicons name="images-outline" size={38} color="#7652E8" />
        <Text style={styles.emptyTitle}>This challenge is being prepared</Text>
        <Text style={styles.emptyText}>
          Publish at least one complete Expression Match moment for this difficulty in Admin.
        </Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.replace('/QuackSituateMatchingLevels')}
        >
          <Text style={styles.primaryButtonText}>RETURN TO CHALLENGES</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const correctImage = correctBundledImage ?? (correctImageUri ? { uri: correctImageUri } : undefined);
  const alternativeImage = alternativeBundledImage ?? (alternativeImageUri ? { uri: alternativeImageUri } : undefined);
  const topTarget = correctPosition === 'top'
    ? { image: correctImage, scenario: current.scenario }
    : { image: alternativeImage, scenario: current.secondaryScenario || 'A different gesture and situation.' };
  const bottomTarget = correctPosition === 'bottom'
    ? { image: correctImage, scenario: current.scenario }
    : { image: alternativeImage, scenario: current.secondaryScenario || 'A different gesture and situation.' };
  const feedbackReason = (hasMeaningfulText(current.explanation)&&!/fits the first (scene|situation)/i.test(current.explanation)?current.explanation.trim():'')
    || `This expression naturally matches “${current.scenario}” because its tone and meaning fit that social moment.`;
  const feedbackExample = `In this situation—${current.scenario}—say 「${current.correctAnswer}」 (${currentAnswer.romaji}).`;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.stage}>
        <View style={styles.topBar}>
          <Pressable style={styles.roundButton} onPress={() => setShowExit(true)}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </Pressable>

          <View style={styles.progressArea}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${((momentIndex + 1) / moments.length) * 100}%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {momentIndex + 1}/{moments.length}
            </Text>
          </View>

          <Text style={styles.progressText}>{score}/{moments.length*10} pts</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Pause and game options" style={styles.roundButton} onPress={()=>setShowPause(true)}><Ionicons name="ellipsis-horizontal" size={22} color="#FFFFFF"/></Pressable>
        </View>

        <View style={styles.instructionArea}>
          <Text style={styles.kicker}>
            {level === 1 ? 'EASY' : level === 2 ? 'MEDIUM' : 'HARD'} · {hasMeaningfulText(current.location)?current.location:hasMeaningfulText(current.topic)?current.topic:'Expression Match'}
          </Text>
          <Text style={styles.instruction}>
            Match the phrase to the best-fitting situation
          </Text>
        </View>

        <Pressable accessibilityRole="button" accessibilityLabel={`Match phrase to: ${topTarget.scenario}`} disabled={locked||blocked} onPress={()=>void choose('top')} style={styles.targetCard}>
          <TargetPicture key={`${pictureKey}-top-${correctPosition}`} source={topTarget.image} scenario={topTarget.scenario} captionOnly={captionOnly} onReady={markTopReady}/>
          <View style={styles.targetLabel}>
            <Text style={styles.targetScenario}>{topTarget.scenario}</Text>
          </View>
        </Pressable>

        <View style={styles.dragZone}>
          <DraggablePhrase
            key={current.id}
            label={currentAnswer.romaji}
            japanese={current.correctAnswer}
            disabled={locked||blocked}
            onDrop={choose}
          />

          <Pressable
            disabled={!hasPhraseAudio||locked||blocked}
            style={[
              styles.audioButton,
              !hasPhraseAudio && styles.audioButtonDisabled,
            ]}
            accessibilityLabel="Listen to the Japanese phrase"
            onPress={playMomentAudio}
          >
            <Ionicons
              name={hasPhraseAudio ? audioPlaying?'volume-high':'volume-medium-outline' : 'volume-mute'}
              size={23}
              color="#FFFFFF"
            />
          </Pressable>
        </View>

        {!!audioError&&<Text accessibilityRole="alert" style={{fontSize:11,color:'#FFF0CB',textAlign:'center',paddingHorizontal:12}}>{audioError}</Text>}
        <Pressable accessibilityRole="button" accessibilityLabel={`Match phrase to: ${bottomTarget.scenario}`} disabled={locked||blocked} onPress={()=>void choose('bottom')} style={styles.targetCard}>
          <TargetPicture key={`${pictureKey}-bottom-${correctPosition}`} source={bottomTarget.image} scenario={bottomTarget.scenario} captionOnly={captionOnly} onReady={markBottomReady}/>
          <View style={styles.targetLabel}>
            <Text style={styles.targetScenario}>{bottomTarget.scenario}</Text>
          </View>
        </Pressable>

        <View style={styles.footerControls}>
          <Pressable
            style={styles.hintButton}
            onPress={() => {questionSupport.current.hintUsed=true;setShowHint(value => !value);}}
          >
            <Ionicons name="bulb-outline" size={19} color="#7652E8" />
            <Text style={styles.hintButtonText}>Hint</Text>
          </Pressable>

          <Text style={styles.dragInstruction}>DRAG UP OR DOWN</Text>

          <Pressable style={styles.helpButton} onPress={() => setShowHelp(true)}>
            <Ionicons name="information-circle-outline" size={22} color="#7652E8" />
          </Pressable>
        </View>

        {showHint ? (
          <View style={styles.hintCard}>
            <Text style={styles.hintText}>{authoredMedia?.hint||(hasMeaningfulText(current.hint)?current.hint:`Compare who is speaking and the purpose of the phrase. Look for: ${current.scenario}`)}</Text>
          </View>
        ) : null}
      </View>

      <Modal visible={feedback !== null&&!blocked} transparent animationType="fade">
        <View style={styles.modalShade}>
          <View style={[styles.feedbackCard, styles.learningFeedbackCard]}>
            <ScrollView
              style={styles.feedbackScroll}
              contentContainerStyle={styles.feedbackScrollContent}
              showsVerticalScrollIndicator={false}
            >
            {scoreSummary}
            <View style={[
              styles.feedbackStatusBar,
              feedback === 'correct' ? styles.feedbackStatusCorrect : styles.feedbackStatusIncorrect,
            ]}>
              <View style={[
                styles.feedbackStatusIcon,
                feedback === 'correct' ? styles.correctIcon : styles.incorrectIcon,
              ]}>
                <Ionicons
                  name={feedback === 'correct' ? 'checkmark' : 'close'}
                  size={22}
                  color="#FFFFFF"
                />
              </View>
              <View style={styles.feedbackStatusCopy}>
                <Text style={[
                  styles.feedbackStatusKicker,
                  { color: feedback === 'correct' ? '#4A9628' : '#C94F59' },
                ]}>
                  {feedback === 'correct' ? 'NATURAL MATCH' : 'LET’S REVIEW THIS MATCH'}
                </Text>
                <Text style={styles.feedbackStatusTitle}>
                  {feedback === 'correct'
                    ? 'Yes—this fits the situation.'
                    : 'The phrase belongs with the other picture.'}
                </Text>
              </View>
            </View>

            <View style={styles.answerSpotlight}>
              <Text style={styles.answerSpotlightLabel}>NATURAL PHRASE</Text>
              <Text style={styles.answerJapanese}>{current.correctAnswer}</Text>
              <Text style={styles.answerRomaji}>{currentAnswer.romaji}</Text>
            </View>

            <View style={styles.learningSection}>
              <View style={styles.learningSectionHeading}>
                <View style={styles.whyIcon}><Ionicons name="bulb-outline" size={17} color="#7652E8" /></View>
                <Text style={styles.learningSectionTitle}>Why it fits</Text>
              </View>
              <Text style={styles.learningSectionText}>{feedbackReason}</Text>
            </View>

            <View style={[styles.learningSection, styles.exampleSection]}>
              <View style={styles.learningSectionHeading}>
                <View style={styles.exampleIcon}><Ionicons name="chatbubble-ellipses-outline" size={16} color="#4E922F" /></View>
                <Text style={styles.learningSectionTitle}>Example in context</Text>
              </View>
              <Text style={styles.exampleText}>{feedbackExample}</Text>
            </View>

            <Pressable style={styles.primaryButton} onPress={continueAfterFeedback}>
              <Text style={styles.primaryButtonText}>
                CONTINUE TO NEXT MOMENT
              </Text>
              <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
            </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showHelp} transparent animationType="fade">
        <View style={styles.modalShade}>
          <View style={styles.feedbackCard}>
            <ScrollView style={{width:'100%'}} contentContainerStyle={{alignItems:'center'}}>
            {scoreSummary}
            <View style={styles.feedbackIcon}>
              <Ionicons name="hand-left-outline" size={29} color="#FFFFFF" />
            </View>
            <Text style={styles.feedbackKicker}>HOW TO PLAY</Text>
            <Text style={styles.feedbackTitle}>One phrase. Two situations.</Text>
            <Text style={styles.feedbackText}>
              Look at both pictures and read their captions, listen to the phrase, then drag it up or down. You can also tap a situation to answer. If a picture fails, use the captions for unscored practice and retry the picture before submitting a scored answer.
            </Text>
            <Pressable style={styles.primaryButton} onPress={() => setShowHelp(false)}>
              <Text style={styles.primaryButtonText}>CONTINUE</Text>
            </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showResult&&!showPause} transparent animationType="fade">
        <View style={styles.modalShade}>
          <View style={styles.feedbackCard}>
            <ScrollView style={{width:'100%'}} contentContainerStyle={{alignItems:'center'}}>
            {scoreSummary}
            <View style={[styles.feedbackIcon, styles.correctIcon]}>
              <Ionicons name="trophy" size={30} color="#FFFFFF" />
            </View>
            <Text style={styles.feedbackKicker}>EXPRESSION MATCH COMPLETE</Text>
            <Text style={styles.feedbackTitle}>{score}/{moments.length*10} points</Text>
            <View style={styles.resultStars}>
              {[1, 2, 3].map(star => (
                <Ionicons
                  key={star}
                  name={star <= stars ? 'star' : 'star-outline'}
                  size={31}
                  color="#F4B52E"
                />
              ))}
            </View>
            <Text style={styles.feedbackText}>
              {correctCount} of {moments.length} situations matched. Your stars and score are stored for QuackProgress and teacher reports.
            </Text>
            <Text style={styles.feedbackText}>Every question includes two scene pictures and context captions. This supported practice score alone does not prove independent mastery; try unfamiliar situations with your instructor too.</Text>
            {(['PICTURE','CAPTION_ONLY'] as const).map(mode=>{
              const records=questionResults.current.filter(row=>row.mode===mode&&row.outcome!=='TECHNICAL_INTERRUPTION');
              if(!records.length)return null;
              return <Text key={mode} style={styles.feedbackText}>{mode==='PICTURE'?'Picture questions':'Caption-only questions'}: {records.filter(row=>row.outcome==='CORRECT').length}/{records.length} correct</Text>;
            })}
            <Text style={styles.feedbackText}>Technical interruptions: {questionResults.current.filter(row=>row.outcome==='TECHNICAL_INTERRUPTION').length} · excluded from wrong answers.</Text>
            <Pressable
              disabled={saving}
              style={styles.primaryButton}
              onPress={replay}
            >
              <Text style={styles.primaryButtonText}>
                {saving ? 'SAVING…' : 'PLAY AGAIN'}
              </Text>
              <Ionicons name="refresh" size={19} color="#FFFFFF" />
            </Pressable>
            <Pressable
              disabled={saving}
              style={styles.resultReturnButton}
              onPress={saveAndLeave}
            >
              <Text style={styles.resultReturnText}>
                RETURN TO SITUATION TRAIL
              </Text>
            </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showExit} transparent animationType="fade">
        <View style={styles.modalShade}>
          <View style={styles.feedbackCard}>
            <ScrollView style={{width:'100%'}} contentContainerStyle={{alignItems:'center'}}>
            {scoreSummary}
            <View style={styles.feedbackIcon}>
              <Ionicons name="arrow-back" size={29} color="#FFFFFF" />
            </View>
            <Text style={styles.feedbackKicker}>LEAVE THIS JOURNEY?</Text>
            <Text style={styles.feedbackTitle}>Save your place</Text>
            <Text style={styles.feedbackText}>
              Save this level’s current position and score to continue later. A local checkpoint is kept if the connection is unavailable.
            </Text>
            <View style={styles.exitRow}>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => setShowExit(false)}
              >
                <Text style={styles.secondaryButtonText}>KEEP PLAYING</Text>
              </Pressable>
              <Pressable style={styles.primaryButtonSmall} onPress={confirmExit}>
                <Text style={styles.primaryButtonText}>LEAVE</Text>
              </Pressable>
            </View>
            <Pressable style={styles.resultReturnButton} onPress={()=>{setShowExit(false);setShowRestart(true);}}><Text style={styles.resultReturnText}>RESTART LEVEL</Text></Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Modal visible={showTechnical&&!showPause&&!showExit} transparent animationType="fade" onRequestClose={()=>setShowTechnical(false)}><View style={styles.modalShade}><View style={styles.feedbackCard}><ScrollView style={{width:'100%'}} contentContainerStyle={{alignItems:'center'}}>
        {scoreSummary}<Ionicons name="image-outline" size={30} color="#7652E8"/><Text style={styles.feedbackTitle}>Picture not ready</Text><Text style={styles.feedbackText}>No answer or mistake was recorded. Read the captions for practice, then retry any missing picture. A scored answer is available only after both pictures load.</Text>
        <Pressable style={styles.primaryButton} onPress={()=>setShowTechnical(false)}><Text style={styles.primaryButtonText}>BACK TO PICTURES</Text></Pressable>
        <Pressable style={styles.resultReturnButton} onPress={()=>{setShowTechnical(false);setShowExit(true);}}><Text style={styles.resultReturnText}>SAVE AND RETURN</Text></Pressable>
      </ScrollView></View></View></Modal>
      <Modal visible={showStart&&!showPause} transparent animationType="fade" onRequestClose={()=>setShowPause(true)}>
        <View style={styles.modalShade}><View style={styles.feedbackCard}><ScrollView contentContainerStyle={{alignItems:'center'}}>
          {scoreSummary}<Text style={styles.feedbackKicker}>EXPRESSION MATCH · LEVEL {level}</Text>
          <Text style={styles.feedbackTitle}>{momentIndex>0?'Continue your level':'One phrase. Two contexts.'}</Text>
          {!!checkpointNotice&&<Text style={styles.feedbackText}>{checkpointNotice}</Text>}
          <Text style={styles.feedbackText}>Look at both scene pictures and read who is speaking and what is happening in their captions. Listen to the phrase, then drag it up or down—or tap the matching situation. There is no timer. Use the situation and relationship to choose, not just a familiar picture.</Text>
          <Text style={styles.feedbackText}>10 points per correct match. {moments.length} questions · {moments.length*10} possible points. Use the three-dot menu to pause, save and leave, or restart.</Text>
          <Pressable style={styles.primaryButton} onPress={()=>setShowStart(false)}><Text style={styles.primaryButtonText}>{momentIndex>0?'CONTINUE LEVEL':'START LEVEL'}</Text></Pressable>
          {momentIndex>0&&<Pressable style={styles.resultReturnButton} onPress={()=>{setShowStart(false);setShowRestart(true);}}><Text style={styles.resultReturnText}>START OVER</Text></Pressable>}
        </ScrollView></View></View>
      </Modal>
      <Modal visible={showPause} transparent animationType="fade" onRequestClose={()=>setShowPause(false)}><View style={styles.modalShade}><View style={styles.feedbackCard}><ScrollView contentContainerStyle={{alignItems:'center'}}>
        {scoreSummary}<Text style={styles.feedbackTitle}>Game paused</Text><Text style={styles.feedbackText}>Your answers stay in place. Resume when you are ready.</Text>
        <Pressable style={styles.primaryButton} onPress={()=>setShowPause(false)}><Text style={styles.primaryButtonText}>RESUME</Text></Pressable>
        <Pressable style={styles.primaryButton} onPress={()=>{setShowPause(false);setShowStart(false);setShowRestart(true);}}><Text style={styles.primaryButtonText}>RESTART LEVEL</Text></Pressable>
        <Pressable style={styles.resultReturnButton} onPress={()=>void confirmExit()}><Text style={styles.resultReturnText}>SAVE AND RETURN</Text></Pressable>
      </ScrollView></View></View></Modal>
      <Modal visible={showRestart} transparent animationType="fade" onRequestClose={()=>setShowRestart(false)}><View style={styles.modalShade}><View style={styles.feedbackCard}><ScrollView contentContainerStyle={{alignItems:'center'}}>
        {scoreSummary}<Text style={styles.feedbackTitle}>Restart this level?</Text><Text style={styles.feedbackText}>This unfinished run will start at question 1 with zero points and newly shuffled answer positions. Previously completed results stay saved.</Text>
        <Pressable disabled={saving} style={styles.primaryButton} onPress={()=>void restartGame()}><Text style={styles.primaryButtonText}>{saving?'RESTARTING…':'RESTART'}</Text></Pressable>
        <Pressable disabled={saving} style={styles.resultReturnButton} onPress={()=>setShowRestart(false)}><Text style={styles.resultReturnText}>KEEP PLAYING</Text></Pressable>
      </ScrollView></View></View></Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#2D176C' },
  stage: { flex: 1, backgroundColor: '#4C28C8', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, padding: 28, backgroundColor: '#F8F4FF' },
  loadingText: { fontFamily: 'Jua', fontSize: 17, color: '#4A2A58' },
  resultReturnButton: { marginTop: 11, minHeight: 46, alignItems: 'center', justifyContent: 'center' },
  resultReturnText: { color: '#7652E8', fontSize: 11, fontWeight: '900', letterSpacing: 0.7 },
  emptyTitle: { fontFamily: 'Jua', fontSize: 25, color: '#432750', textAlign: 'center' },
  emptyText: { fontSize: 14, lineHeight: 21, color: '#7B6D82', textAlign: 'center', maxWidth: 380 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 50 },
  roundButton: { width: 46, height: 46, borderRadius: 17, backgroundColor: 'rgba(42,21,103,.72)', alignItems: 'center', justifyContent: 'center' },
  progressArea: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTrack: { flex: 1, height: 7, borderRadius: 7, backgroundColor: 'rgba(255,255,255,.22)', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 7, backgroundColor: '#FFD65A' },
  progressText: { fontFamily: 'Jua', fontSize: 12, color: '#FFFFFF' },
  stars: { flexDirection: 'row', gap: 1 },
  scoreSummary:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:7,marginBottom:12,padding:9,borderRadius:12,backgroundColor:'#F1EBFC',width:'100%'},
  scoreSummaryText:{flexShrink:1,fontSize:11,fontWeight:'700',color:'#563963',textAlign:'center'},
  instructionArea: { alignItems: 'center', marginTop: 5, marginBottom: 7 },
  kicker: { fontSize: 9, fontWeight: '900', letterSpacing: 1.2, color: '#D9CFFF' },
  instruction: { fontFamily: 'Jua', fontSize: 18, color: '#FFFFFF', textAlign: 'center', marginTop: 2 },
  targetCard: { flex: 1, minHeight: 120, maxHeight: 245, padding: 8, borderRadius: 26, overflow: 'hidden', borderWidth: 1.5, borderColor: 'rgba(255,255,255,.38)', backgroundColor: 'rgba(255,255,255,.10)', shadowColor: '#170B41', shadowOpacity: 0.28, shadowRadius: 13, elevation: 6 },
  targetArtwork: { flex: 1, minHeight: 0, width: '100%' },
  targetImage: { width: '100%', height: '100%' },
  targetLabel: { alignSelf: 'stretch', minHeight: 36, marginTop: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 13, justifyContent: 'center', backgroundColor: 'rgba(56,29,124,.82)', borderWidth: 1, borderColor: 'rgba(255,255,255,.22)' },
  targetScenario: { fontSize: 11, lineHeight: 14, color: '#FFFFFF', textAlign: 'center' },
  dragZone: { minHeight: 74, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 13, zIndex: 10 },
  draggablePhrase: { minWidth: 145, maxWidth: '70%', minHeight: 48, paddingHorizontal: 18, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,.32)', backgroundColor: '#6C45D8', flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', shadowColor: '#180C40', shadowOpacity: 0.35, shadowRadius: 10, elevation: 8 },
  draggableText: { flexShrink: 1, fontFamily: 'Jua', fontSize: 17, color: '#FFFFFF', textAlign: 'center' },
  audioButton: { width: 47, height: 47, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#7652E8', shadowColor: '#190D42', shadowOpacity: 0.25, shadowRadius: 8, elevation: 5 },
  audioButtonDisabled: { backgroundColor: '#806FAF', opacity: 0.72 },
  footerControls: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  hintButton: { minWidth: 78, minHeight: 39, paddingHorizontal: 12, borderRadius: 14, backgroundColor: '#FFFFFF', flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center' },
  hintButtonText: { fontSize: 11, fontWeight: '900', color: '#7652E8' },
  dragInstruction: { fontSize: 9, fontWeight: '900', letterSpacing: 1.1, color: '#D8CCFF' },
  helpButton: { width: 39, height: 39, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  hintCard: { position: 'absolute', left: 20, right: 20, bottom: 58, padding: 12, borderRadius: 16, backgroundColor: '#FFF6D9', zIndex: 20 },
  hintText: { fontSize: 12, lineHeight: 17, color: '#705522', textAlign: 'center' },
  modalShade: { flex: 1, backgroundColor: 'rgba(25,12,55,.66)', alignItems: 'center', justifyContent: 'center', padding: 22 },
  feedbackCard: { width: '100%', maxWidth: 430, maxHeight:'92%', borderRadius: 29, backgroundColor: '#FFFDF9', padding: 24, alignItems: 'center', shadowColor: '#190D31', shadowOpacity: 0.28, shadowRadius: 22, elevation: 10 },
  learningFeedbackCard: { padding: 18, alignItems: 'stretch', maxHeight: '92%' },
  feedbackScroll: { width: '100%' },
  feedbackScrollContent: { paddingBottom: 2 },
  feedbackStatusBar: { width: '100%', minHeight: 72, borderRadius: 21, padding: 13, flexDirection: 'row', alignItems: 'center', borderWidth: 1 },
  feedbackStatusCorrect: { backgroundColor: '#F0F9EA', borderColor: '#CEE8BE' },
  feedbackStatusIncorrect: { backgroundColor: '#FFF0F1', borderColor: '#F2C9CD' },
  feedbackStatusIcon: { width: 43, height: 43, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  feedbackStatusCopy: { flex: 1, marginLeft: 12 },
  feedbackStatusKicker: { fontSize: 8.5, fontWeight: '900', letterSpacing: 1 },
  feedbackStatusTitle: { marginTop: 2, fontFamily: 'Jua', fontSize: 17, lineHeight: 21, color: '#432750' },
  answerSpotlight: { marginTop: 12, width: '100%', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center', backgroundColor: '#F3EDFF', borderWidth: 1, borderColor: '#E0D3FA' },
  answerSpotlightLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 1.1, color: '#7652E8' },
  answerJapanese: { marginTop: 4, fontFamily: 'Jua', fontSize: 24, lineHeight: 30, color: '#432750', textAlign: 'center' },
  answerRomaji: { marginTop: 1, fontSize: 12, color: '#766486', textAlign: 'center' },
  learningSection: { width: '100%', marginTop: 10, borderRadius: 18, padding: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EDE5F0' },
  exampleSection: { backgroundColor: '#F5FAF1', borderColor: '#DCEAD2' },
  learningSectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  whyIcon: { width: 29, height: 29, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EEE7FC' },
  exampleIcon: { width: 29, height: 29, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E6F3DD' },
  learningSectionTitle: { fontFamily: 'Jua', fontSize: 15, color: '#432750' },
  learningSectionText: { marginTop: 7, fontSize: 12.5, lineHeight: 18, color: '#6F6274' },
  exampleText: { marginTop: 7, fontSize: 12.5, lineHeight: 18, color: '#52634A' },
  feedbackIcon: { width: 60, height: 60, borderRadius: 20, backgroundColor: '#7652E8', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  correctIcon: { backgroundColor: '#62B53A' },
  incorrectIcon: { backgroundColor: '#E06B70' },
  feedbackKicker: { fontSize: 10, fontWeight: '900', letterSpacing: 1.3, color: '#62A936', textAlign: 'center' },
  feedbackTitle: { fontFamily: 'Jua', fontSize: 25, lineHeight: 31, color: '#432750', textAlign: 'center', marginTop: 5 },
  feedbackText: { marginTop: 10, fontSize: 14, lineHeight: 21, color: '#76697B', textAlign: 'center' },
  primaryButton: { width: '100%', minHeight: 54, borderRadius: 18, backgroundColor: '#7652E8', marginTop: 21, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  primaryButtonSmall: { flex: 1, minHeight: 50, borderRadius: 16, backgroundColor: '#7652E8', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900', letterSpacing: 0.7, textAlign: 'center' },
  secondaryButton: { flex: 1, minHeight: 50, borderRadius: 16, backgroundColor: '#F0EAF5', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  secondaryButtonText: { color: '#563963', fontSize: 11, fontWeight: '900', textAlign: 'center' },
  exitRow: { width: '100%', flexDirection: 'row', gap: 10, marginTop: 21 },
  resultStars: { flexDirection: 'row', gap: 6, marginTop: 12 },
});
