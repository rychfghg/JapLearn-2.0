import ResponsePauseMenu from '../components/ResponsePauseMenu';
import ResponseScore from '../components/ResponseScore';
import ResponseFeedbackHeader from '../components/ResponseFeedbackHeader';
import ResponseGameInstructions from '../components/ResponseGameInstructions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Audio } from 'expo-av';
import { router } from 'expo-router';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import expoconfig from '../expoconfig';
import { shuffleOptions as shuffle } from '../services/shuffleOptions';
import styles from '../styles/stylesQuackResponseGuided';
import { SafeAreaView } from 'react-native-safe-area-context';
import QuackSituateExit from '../components/QuackSituateExit';
import replyCoachAudio from './replyCoachAudio';
import voiceManifest from '../assets/audio/reply-coach/manifest.json';
import voiceVariants from './replyCoachVoiceVariants';
import { matchingRecordedLine } from '../services/replyCoachAudioMatch';
import { replyCoachLayout } from '../services/replyCoachLayout';
import { getCoachContext, getCoachExample, getCoachPartner, getCoachExplanation } from '../services/replyCoachPractice';

// Reply Coach-only treatment: shared game styles and story behavior stay unchanged.
const coachUI=StyleSheet.create({
  dialogueWrap:{position:'absolute',top:12,left:16,right:16,maxWidth:680,alignSelf:'center',marginHorizontal:'auto'},
  dialogueCard:{borderRadius:22,backgroundColor:'rgba(255,255,255,.98)',padding:16,borderWidth:1,borderColor:'#EADFF1',shadowColor:'#30133D',shadowOpacity:.12,shadowRadius:14,shadowOffset:{width:0,height:4},elevation:5},
  bubble:{position:'absolute',top:10,borderRadius:22,backgroundColor:'rgba(255,255,255,.98)',padding:14,borderWidth:1,borderColor:'#EADFF1',shadowColor:'#30133D',shadowOpacity:.12,shadowRadius:14,shadowOffset:{width:0,height:4},elevation:5},
  lineHeader:{flexDirection:'row',alignItems:'center',gap:7,marginBottom:4},
  speakerDot:{width:8,height:8,borderRadius:4,backgroundColor:'#65B83A'},
  speaker:{flex:1,fontFamily:'Jua',fontSize:13,color:'#512B65',textTransform:'uppercase',letterSpacing:.8},
  replay:{minHeight:30,paddingHorizontal:11,borderRadius:999,backgroundColor:'#F4ECFA',borderWidth:1,borderColor:'#E6D6F2',flexDirection:'row',alignItems:'center',gap:4},
  replayText:{fontSize:12,fontWeight:'600',color:'#71449A'},japanese:{color:'#351A4A'},
  romaji:{fontSize:12.5,lineHeight:17,color:'#8423D9',marginTop:2},
  task:{color:'#584260',fontSize:12,lineHeight:17,marginVertical:6},
  choice:{borderWidth:1,borderColor:'#E6D9EB',borderRadius:16,shadowOpacity:.04},
  contextCard:{borderLeftWidth:3,borderLeftColor:'#9A45E5'},
  contextMeta:{flexDirection:'row',alignItems:'center',gap:8,marginBottom:8,paddingBottom:8,borderBottomWidth:1,borderBottomColor:'#EEE4F4'},
  contextItem:{flex:1,minWidth:0,flexDirection:'row',alignItems:'center',gap:5},
  contextLabel:{flex:1,minWidth:0,fontFamily:'Jua',fontSize:11,lineHeight:15,color:'#69477B'},
  contextDivider:{width:1,alignSelf:'stretch',backgroundColor:'#DFD0E9',marginVertical:1},
  goal:{fontSize:13,lineHeight:19,fontWeight:'600',color:'#4A3258'},
  panelHeading:{marginBottom:10,flexWrap:'nowrap'},
  headingIcon:{width:30,height:30,borderRadius:10,backgroundColor:'#8423D9',alignItems:'center',justifyContent:'center',marginRight:8},
  headingTitle:{fontFamily:'Jua',fontSize:13,lineHeight:17,color:'#351A4A'},
  tools:{flexDirection:'row',alignItems:'center',gap:6},
  panelReplay:{width:36,height:36,borderRadius:12,backgroundColor:'#F1E5FA',borderWidth:1,borderColor:'#E6D6F2',alignItems:'center',justifyContent:'center'},
  choiceContent:{flexGrow:1,paddingBottom:2},
  balancedChoices:{flexGrow:1,justifyContent:'space-between',alignContent:'space-between'},
});
import ReplyCoachReadiness from '../components/ReplyCoachReadiness';

type Evaluation = 'BEST' | 'ACCEPTABLE' | 'AWKWARD' | 'IMPOLITE' | 'RUDE';
type ChoiceOption = {
  id: string;
  text: string;
  japanese: string;
  romaji: string;
  evaluation: Evaluation;
  points: number;
  explanation: string;
  culturalNote: string;
  reactionText: string;
  reactionCharacterKey: string;
  reactionExpressionKey: string;
  nextNodeId: string;
  audioUrl?: string;
};
type StoryNode = {
  id: string;
  type: 'NARRATION' | 'DIALOGUE' | 'CHOICE' | 'REACTION' | 'CULTURAL_NOTE' | 'ENDING';
  title?: string;
  text?: string;
  japanese?: string;
  romaji?: string;
  speaker?: string;
  characterKey?: string;
  expressionKey?: string;
  secondaryCharacterKey?: string;
  secondaryExpressionKey?: string;
  backgroundKey?: string;
  audioUrl?: string;
  bgmUrl?: string;
  bgmEnabled?: boolean;
  bgmVolume?: number;
  bgmFadeMs?: number;
  hint?: string;
  hintPenalty?: number;
  characterPosition?: CharacterPosition;
  secondaryCharacterPosition?: CharacterPosition;
  spritesVisible?: boolean;
  tapToContinue?: boolean;
  shuffleChoices?: boolean;
  nextNodeId?: string;
  choices?: ChoiceOption[];
};
type Chapter = {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  learningObjectives: string[];
  startNodeId: string;
  order: number;
  bgmUrl?: string;
  bgmEnabled?: boolean;
  bgmVolume?: number;
  bgmFadeMs?: number;
  nodes: StoryNode[];
};
type CharacterPosition = 'LEFT' | 'CENTER_LEFT' | 'CENTER' | 'CENTER_RIGHT' | 'RIGHT';
type AnswerRecord = {
  helpTypes?: string[];
  supported?: boolean;
  nodeId: string;
  prompt: string;
  selectedText: string;
  selectedJapanese: string;
  bestResponse: string;
  evaluation: Evaluation;
  points: number;
  explanation: string;
  culturalNote: string;
};
type Attempt = {
  supportUsage?: Record<string, string[]>;
  id: string;
  chapterId: string;
  chapterTitle: string;
  attemptNumber: number;
  currentNodeId: string;
  status: 'IN_PROGRESS' | 'COMPLETED';
  score: number;
  maximumScore: number;
  finalPercentage: number;
  bestCount: number;
  acceptableCount: number;
  awkwardCount: number;
  impoliteCount: number;
  rudeCount: number;
  answers: AnswerRecord[];
};

const backgrounds: Record<string, any> = {
  station: require('../assets/img/background/city a s1st2 day.png'),
  'station-night': require('../assets/img/background/city a s1st2 nightlights.png'),
  train: require('../assets/img/background/train_scene day.png'),
  temple: require('../assets/img/background/park s1 day2.png'),
  shop: require('../assets/img/background/city a s3st2 day.png'),
  restaurant: require('../assets/img/background/kitchen dining day.png'),
  hallway: require('../assets/img/background/school a hallway st2 day.png'),
  home: require('../assets/img/background/apartment a living room day.png'),
  neighborhood: require('../assets/img/background/outskirts road a day2.png'),
};

const sprites: Record<string, Record<string, any>> = {
  SUMI: {
    NEUTRAL: require('../assets/img/Sumi_PoseB_WinterUni_Smile.png'),
    SPEAKING: require('../assets/img/Sumi_PoseB_WinterUni_Open.png'),
    SPEAKING_BLUSH: require('../assets/img/Sumi_PoseB_WinterUni_Open_Blush.png'),
    BLINK: require('../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Smile.png'),
    BLINK_BLUSH: require('../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Smile_Blush.png'),
    SPEAKING_BLINK: require('../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Open.png'),
    SPEAKING_BLINK_BLUSH: require('../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Open_Blush.png'),
    SMILE: require('../assets/img/Sumi_PoseB_WinterUni_Smile_Blush.png'),
    CORRECT: require('../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Smile.png'),
    WRONG: require('../assets/img/Sumi_PoseB_WinterUni_Frown.png'),
    HAPPY: require('../assets/img/Sumi_PoseB_WinterUni_Smile_Blush.png'),
    SURPRISED: require('../assets/img/Sumi_PoseB_WinterUni_Open_Blush.png'),
    CONFUSED: require('../assets/img/Sumi_PoseB_WinterUni_Frown_Blush.png'),
    WORRIED: require('../assets/img/Sumi_PoseB_WinterUni_Frown.png'),
    SAD: require('../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Frown.png'),
    EMBARRASSED: require('../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Smile_Blush.png'),
    ANNOYED: require('../assets/img/Sumi_PoseB_WinterUni_Frown_Blush.png'),
    ANGRY: require('../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Frown_Blush.png'),
    SERIOUS: require('../assets/img/Sumi_PoseB_WinterUni_Frown.png'),
  },
  HARU: {
    NEUTRAL: require('../assets/img/Sprite Male Dark Hair Neu01.png'),
    SPEAKING: require('../assets/img/Sprite Male Dark Hair Smi02.png'),
    EYE_SQUINT: require('../assets/img/Sprite Male Dark Hair Sly01.png'),
    SPEAKING_EYE_SQUINT: require('../assets/img/Sprite Male Dark Hair Sly02.png'),
    SMILE: require('../assets/img/Sprite Male Dark Hair Smi01.png'),
    CORRECT: require('../assets/img/Sprite Male Dark Hair Smi01.png'),
    WRONG: require('../assets/img/Sprite Male Dark Hair Sad01.png'),
    HAPPY: require('../assets/img/Sprite Male Dark Hair Smi01.png'),
    SURPRISED: require('../assets/img/Sprite Male Dark Hair Apo01.png'),
    CONFUSED: require('../assets/img/Sprite Male Dark Hair Con01.png'),
    WORRIED: require('../assets/img/Sprite Male Dark Hair Sad01.png'),
    SAD: require('../assets/img/Sprite Male Dark Hair Sad01.png'),
    EMBARRASSED: require('../assets/img/Sprite Male Dark Hair Sly01.png'),
    ANNOYED: require('../assets/img/Sprite Male Dark Hair Ann01.png'),
    ANGRY: require('../assets/img/Sprite Male Dark Hair Ang01.png'),
    SERIOUS: require('../assets/img/Sprite Male Dark Hair Neu01.png'),
  },
};

const bundledBgm: Record<string, any> = {
  calm: require('../assets/audio/sfx/quiz.mp3'),
  busy: require('../assets/audio/sfx/quackmanbg.mp3'),
  ending: require('../assets/audio/sfx/quiz.mp3'),
};

const evaluationTheme: Record<Evaluation, { label: string; color: string; icon: any }> = {
  BEST: { label: 'Best response', color: '#62B83C', icon: 'checkmark-circle' },
  ACCEPTABLE: { label: 'Acceptable', color: '#5086D8', icon: 'thumbs-up' },
  AWKWARD: { label: 'Awkward', color: '#D89525', icon: 'help-circle' },
  IMPOLITE: { label: 'Impolite', color: '#D4635D', icon: 'alert-circle' },
  RUDE: { label: 'Rude / offensive', color: '#B83B55', icon: 'close-circle' },
};

const positionStyleFor = (position?: CharacterPosition, fallback?: any) => {
  switch (position) {
    case 'LEFT': return styles.spriteLeft;
    case 'CENTER_LEFT': return styles.spriteCenterLeft;
    case 'CENTER': return styles.spriteCenter;
    case 'CENTER_RIGHT': return styles.spriteCenterRight;
    case 'RIGHT': return styles.spriteRight;
    default: return fallback ?? styles.spriteCenter;
  }
};

const choicePositionStyleFor = (position?: CharacterPosition, fallback?: any) => {
  switch (position) {
    case 'LEFT': return styles.choicePositionLeft;
    case 'CENTER_LEFT': return styles.choicePositionCenterLeft;
    case 'CENTER': return styles.choicePositionCenter;
    case 'CENTER_RIGHT': return styles.choicePositionCenterRight;
    case 'RIGHT': return styles.choicePositionRight;
    default: return fallback ?? styles.choicePositionCenter;
  }
};

type SpriteActorProps = {
  characterKey: string;
  expressionKey?: string;
  positionStyle: any;
  speaking: boolean;
};

function SpriteActor({
  characterKey,
  expressionKey = 'NEUTRAL',
  positionStyle,
  speaking,
}: SpriteActorProps) {
  const mouthOpacity = useRef(new Animated.Value(0)).current;
  const blinkOpacity = useRef(new Animated.Value(0)).current;
  const bodyScale = useRef(new Animated.Value(1)).current;
  const neutralSource = sprites[characterKey]?.NEUTRAL;
  const expressionSource = sprites[characterKey]?.[expressionKey === 'SPEAKING' ? 'NEUTRAL' : expressionKey] ?? neutralSource;
  const sumiBlush = characterKey === 'SUMI' && ['SMILE', 'HAPPY', 'EMBARRASSED', 'SURPRISED'].includes(expressionKey);
  const sumiSmile = characterKey === 'SUMI' && ['NEUTRAL', 'SMILE', 'HAPPY', 'CORRECT', 'EMBARRASSED', 'SURPRISED'].includes(expressionKey);
  const mouthSource = characterKey === 'SUMI'
    ? sprites.SUMI[sumiBlush ? 'SPEAKING_BLUSH' : 'SPEAKING']
    : sprites.HARU.SPEAKING;
  const blinkSource = characterKey === 'HARU'
    ? sprites.HARU.EYE_SQUINT
    : sumiSmile ? sprites.SUMI[sumiBlush ? 'BLINK_BLUSH' : 'BLINK'] : null;
  const speakingBlinkSource = characterKey === 'HARU'
    ? sprites.HARU.SPEAKING_EYE_SQUINT
    : sumiSmile ? sprites.SUMI[sumiBlush ? 'SPEAKING_BLINK_BLUSH' : 'SPEAKING_BLINK'] : null;

  useEffect(() => {
    mouthOpacity.setValue(0);
    blinkOpacity.setValue(0);
    const mouthLoop = speaking ? Animated.loop(
      Animated.sequence([
        Animated.timing(mouthOpacity, { toValue: 1, duration: 85, useNativeDriver: true }),
        Animated.delay(150),
        Animated.timing(mouthOpacity, { toValue: 0, duration: 85, useNativeDriver: true }),
        Animated.delay(180),
      ]),
    ) : null;
    const blinkLoop = blinkSource ? Animated.loop(
      Animated.sequence([
        Animated.delay(2100),
        Animated.timing(blinkOpacity, { toValue: 1, duration: 70, useNativeDriver: true }),
        Animated.delay(90),
        Animated.timing(blinkOpacity, { toValue: 0, duration: 90, useNativeDriver: true }),
      ]),
    ) : null;

    const breathingLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bodyScale, {
          toValue: 1.008,
          duration: 1300,
          useNativeDriver: true,
        }),
        Animated.timing(bodyScale, {
          toValue: 1,
          duration: 1300,
          useNativeDriver: true,
        }),
      ]),
    );

    mouthLoop?.start();
    blinkLoop?.start();
    breathingLoop.start();

    return () => {
      mouthLoop?.stop();
      blinkLoop?.stop();
      breathingLoop.stop();
    };
  }, [characterKey, expressionKey, speaking]);

  return (
    <Animated.View
      style={[
        styles.spriteActor,
        positionStyle,
        { transform: [{ scale: bodyScale }] },
      ]}
    >
      <Image
        source={expressionSource}
        style={styles.spriteLayer}
        resizeMode="contain"
        fadeDuration={0}
      />
      <Animated.Image
        source={mouthSource}
        style={[styles.spriteLayer, { opacity: mouthOpacity }]}
        resizeMode="contain"
        fadeDuration={0}
      />
      {blinkSource && (
        <Animated.Image
          source={speaking ? speakingBlinkSource : blinkSource}
          style={[styles.spriteLayer, { opacity: blinkOpacity }]}
          resizeMode="contain"
          fadeDuration={0}
        />
      )}
    </Animated.View>
  );
}

export default function ReplyCoachStory() {
  const { user } = useContext(AuthContext);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [nodeId, setNodeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [paused,setPaused]=useState(false);
  const [replayLines,setReplayLines]=useState<StoryNode[]>([]);
  const [replayIndex,setReplayIndex]=useState<number|null>(null);
  const [replayRun,setReplayRun]=useState(0);
  const [instructionsVisible,setInstructionsVisible]=useState(true);
  const [error, setError] = useState('');
  const [selectedChoice, setSelectedChoice] = useState<ChoiceOption | null>(null);
  const [correctionVisible, setCorrectionVisible] = useState(false);
  const [exitVisible, setExitVisible] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [typedNarration, setTypedNarration] = useState('');
  const [narrationFinished, setNarrationFinished] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [previewChoiceId, setPreviewChoiceId] = useState('');
  const [activeChoiceId, setActiveChoiceId] = useState('');
  const [activeVoiceId, setActiveVoiceId] = useState('');
  const [showMeaning, setShowMeaning] = useState(false);
  const [listenVisible, setListenVisible] = useState(false);
  const [listenLine, setListenLine] = useState<StoryNode | null>(null);
  const [audioError, setAudioError] = useState('');
  const [exampleVisible, setExampleVisible] = useState(false);
  const [readinessVisible, setReadinessVisible] = useState(false);
  const [exampleAnswer, setExampleAnswer] = useState<number | null>(null);
  const [exampleCorrectIndex, setExampleCorrectIndex] = useState(0);
  const exampleHelp = useRef(new Set<string>());
  const supportUsage = useRef<Record<string, string[]>>({});
  const voiceFinish = useRef<(() => void) | null>(null);
  const { height: windowHeight } = useWindowDimensions();
  const [stageSize, setStageSize] = useState({ width: 360, height: 560 });
  const fade = useRef(new Animated.Value(0)).current;
  const backgroundMusic = useRef<Audio.Sound | null>(null);
  const backgroundMusicKey = useRef('');
  const musicGeneration = useRef(0);
  const voiceSound = useRef<Audio.Sound | null>(null);
  const voiceGeneration = useRef(0);
  const choiceLock = useRef(false);

  const nodes = useMemo(
    () => new Map((chapter?.nodes ?? []).map((node) => [node.id, node])),
    [chapter],
  );
  const currentNode = replayIndex!==null ? replayLines[replayIndex] : nodes.get(nodeId);
  const choiceOrder = useMemo(() => {
    const choices = nodes.get(nodeId)?.choices ?? [];
    return shuffle(choices);
  }, [attempt?.id,nodeId,nodes]);
  const fitted = replyCoachLayout(stageSize.width, stageSize.height, choiceOrder);
  const panelHeight = fitted.panelHeight;
  const progress = chapter
    ? Math.min(1, (attempt?.answers.length ?? 0) / Math.max(1, chapter.nodes.filter((node) => node.type === 'CHOICE').length))
    : 0;
  const studentName = user?.fname?.trim() || 'friend';
  const latestAnswer = attempt?.answers?.[attempt.answers.length - 1];
  const selectedRomaji = (answer?: AnswerRecord) => answer ? nodes.get(answer.nodeId)?.choices?.find(choice => choice.japanese === answer.selectedJapanese)?.romaji : '';
  const bestReply = (answer: AnswerRecord) => nodes.get(answer.nodeId)?.choices?.find(choice => choice.evaluation === 'BEST');
  const decisionId = replayIndex!==null ? nodeId : currentNode?.type === 'CHOICE' ? currentNode.id
    : currentNode?.type === 'REACTION' ? latestAnswer?.nodeId ?? ''
    : (chapter?.nodes ?? []).find(node => node.type === 'CHOICE'
      && getCoachContext(chapter?.nodes ?? [], node.id).dialogue.some(line => line.id === currentNode?.id))?.id ?? '';
  const context = useMemo(() => getCoachContext(chapter?.nodes ?? [], decisionId), [chapter, decisionId]);
  const example = getCoachExample(chapter?.title ?? '', latestAnswer?.nodeId ?? '');

  const markSupport = (helpType: string) => {
    if (!attempt || !decisionId || attempt.answers.some(answer => answer.nodeId === decisionId)) return;
    const existing = supportUsage.current[decisionId] ?? [];
    if (existing.includes(helpType)) return;
    supportUsage.current[decisionId] = [...existing, helpType];
    void AsyncStorage.setItem(`replyCoachSupport:${user?.email}:${attempt.id}`, JSON.stringify(supportUsage.current)).catch(() => undefined);
    // Save on use so closing/reopening a chapter cannot turn a supported answer into an independent one.
    void requestJson(`/api/reply-coach/attempts/${attempt.id}/progress`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supportNodeId: decisionId, helpType }),
    }).catch(() => undefined); // The answer request also carries the union as a fallback.
  };

  const stopVoice = async () => {
    voiceGeneration.current += 1;
    voiceFinish.current?.();
    voiceFinish.current = null;
    const sound = voiceSound.current;
    voiceSound.current = null;
    setActiveVoiceId('');
    if (sound) {
      await sound.stopAsync().catch(() => undefined);
      await sound.unloadAsync().catch(() => undefined);
    }
  };

  const leaveStory = () => {
    if (exiting) return;
    setExitVisible(false);
    setExiting(true);
  };

  useEffect(() => {
    void loadStory();
  }, [user?.email]);

  useEffect(() => () => {
    voiceFinish.current?.();
    musicGeneration.current += 1;
    const sound = backgroundMusic.current;
    backgroundMusic.current = null;
    backgroundMusicKey.current = '';
    if (sound) void sound.stopAsync().finally(() => sound.unloadAsync());
    voiceGeneration.current += 1;
    const voice = voiceSound.current;
    voiceSound.current = null;
    if (voice) void voice.stopAsync().finally(() => voice.unloadAsync());
  }, []);

  const playVoice = async (assetId: string, japanese: string, character: string, remoteUrl?: string) => {
    voiceFinish.current?.();
    voiceFinish.current = null;
    const generation = ++voiceGeneration.current;
    setActiveVoiceId('');
    const previous = voiceSound.current;
    voiceSound.current = null;
    if (previous) {
      await previous.stopAsync().catch(() => undefined);
      await previous.unloadAsync().catch(() => undefined);
    }
    const matched = matchingRecordedLine(voiceManifest, assetId, japanese, character);
    const variant = voiceVariants.find(line => line.text.trim() === japanese.trim() && line.character === character.toUpperCase());
    const bundled = variant?.asset ?? (matched ? replyCoachAudio[matched.id] : null);
    const source = bundled ?? (remoteUrl
      ? { uri: remoteUrl.startsWith('/api/') ? `${expoconfig.API_URL}${remoteUrl}` : remoteUrl }
      : null);
    if (generation !== voiceGeneration.current) return;
    if (!source) throw new Error('Audio is unavailable for this line. You can still read it.');
    const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: true, volume: 1 });
    if (generation !== voiceGeneration.current) {
      await sound.unloadAsync();
      return;
    }
    voiceSound.current = sound;
    setActiveVoiceId(assetId);
    await new Promise<void>((resolve) => {
      voiceFinish.current = resolve;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded || status.didJustFinish) resolve();
      });
    });
    if (generation === voiceGeneration.current) voiceFinish.current = null;
    if (voiceSound.current === sound) voiceSound.current = null;
    if (generation === voiceGeneration.current) setActiveVoiceId('');
    await sound.unloadAsync().catch(() => undefined);
  };

  const replayLine = (line: StoryNode) => {
    markSupport('replay');
    setAudioError('');
    void playVoice(line.id, line.japanese ?? '', line.characterKey ?? 'SUMI', line.audioUrl).catch(() => setAudioError('Matching audio is unavailable. The displayed line remains available to read.'));
  };

  const reenactConversation=()=>{
    markSupport('replay');markSupport('dialogueReview');
    const lines=context.dialogue;
    if(!lines.length){setAudioError('No earlier exchange is available for this reply.');return;}
    void stopVoice();setListenVisible(false);setShowMeaning(false);setReplayLines(lines);setReplayIndex(0);setReplayRun(run=>run+1);
  };
  useEffect(()=>{if(paused){void stopVoice();musicGeneration.current++;void backgroundMusic.current?.pauseAsync().catch(()=>undefined);}},[paused]);
  useEffect(() => {
    if (paused || instructionsVisible || !currentNode || currentNode.type === 'CHOICE' || !currentNode.japanese) return;
    let live=true;
    void playVoice(currentNode.id,currentNode.japanese,currentNode.characterKey??'SUMI',currentNode.audioUrl)
      .then(()=>{if(live&&replayIndex!==null)setReplayIndex(replayIndex+1<replayLines.length?replayIndex+1:null);})
      .catch(()=>{if(live)setAudioError('Matching audio is unavailable. Read the displayed line and tap to continue.');});
    return()=>{live=false;void stopVoice();};
  },[currentNode?.id,instructionsVisible,paused,replayIndex,replayRun]);

  useEffect(() => {
    if (paused || instructionsVisible || !chapter || !currentNode) return;
    const enabled = currentNode.bgmEnabled ?? chapter.bgmEnabled ?? true;
    const configuredUrl = currentNode.bgmUrl || chapter.bgmUrl || 'bundled:calm';
    const targetVolume = Math.max(0, Math.min(0.35, currentNode.bgmVolume ?? chapter.bgmVolume ?? 0.1));
    const fadeMs = Math.max(0, currentNode.bgmFadeMs ?? chapter.bgmFadeMs ?? 700);
    const resolvedUrl = configuredUrl.startsWith('/api/')
      ? `${expoconfig.API_URL}${configuredUrl}`
      : configuredUrl;
    const trackKey = enabled ? resolvedUrl : 'disabled';
    const generation = ++musicGeneration.current;

    const fadeVolume = async (sound: Audio.Sound, from: number, to: number) => {
      const steps = fadeMs === 0 ? 1 : 8;
      for (let step = 1; step <= steps; step += 1) {
        if (generation !== musicGeneration.current) return;
        const volume = from + ((to - from) * step) / steps;
        await sound.setVolumeAsync(volume).catch(() => undefined);
        if (fadeMs > 0) await new Promise((resolve) => setTimeout(resolve, fadeMs / steps));
      }
    };

    const syncMusic = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
          shouldDuckAndroid: true,
        });

        if (backgroundMusicKey.current === trackKey && backgroundMusic.current) {
          await backgroundMusic.current.setVolumeAsync(targetVolume);
          const status = await backgroundMusic.current.getStatusAsync();
          if (status.isLoaded && !status.isPlaying) await backgroundMusic.current.playAsync();
          return;
        }

        const previous = backgroundMusic.current;
        backgroundMusic.current = null;
        backgroundMusicKey.current = '';
        if (previous) {
          await fadeVolume(previous, targetVolume, 0);
          await previous.stopAsync().catch(() => undefined);
          await previous.unloadAsync().catch(() => undefined);
        }
        if (!enabled || generation !== musicGeneration.current) return;

        const source = resolvedUrl.startsWith('bundled:')
          ? bundledBgm[resolvedUrl.slice('bundled:'.length)] ?? bundledBgm.calm
          : { uri: resolvedUrl };
        const { sound } = await Audio.Sound.createAsync(source, {
          isLooping: true,
          volume: fadeMs > 0 ? 0 : targetVolume,
          shouldPlay: true,
        });
        if (generation !== musicGeneration.current) {
          await sound.unloadAsync();
          return;
        }
        backgroundMusic.current = sound;
        backgroundMusicKey.current = trackKey;
        if (fadeMs > 0) await fadeVolume(sound, 0, targetVolume);
      } catch {
        // A failed remote scene track falls back on the next interaction without blocking play.
      }
    };

    void syncMusic();
  }, [chapter?.id, currentNode?.id, currentNode?.bgmUrl, currentNode?.bgmEnabled,instructionsVisible,paused]);

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [nodeId]);

  useEffect(() => {
    if (paused || instructionsVisible || !currentNode || (currentNode.type !== 'NARRATION' && currentNode.type !== 'CULTURAL_NOTE')) {
      setTypedNarration('');
      setNarrationFinished(false);
      return;
    }

    const fullText = currentNode.text ?? '';
    let cursor = 0;
    setTypedNarration('');
    setNarrationFinished(false);
    const timer = setInterval(() => {
      cursor = Math.min(cursor + 2, fullText.length);
      setTypedNarration(fullText.slice(0, cursor));
      if (cursor >= fullText.length) {
        clearInterval(timer);
        setNarrationFinished(true);
      }
    }, 24);

    return () => clearInterval(timer);
  }, [currentNode?.id,instructionsVisible,paused]);

  useEffect(() => {
    setHintVisible(false);
    setHintUsed(false);
    setShowMeaning(false);
    setListenVisible(false);
    setListenLine(null);
    setAudioError('');
  }, [currentNode?.id]);

  const requestJson = async (path: string, options?: RequestInit) => {
    const response = await fetch(`${expoconfig.API_URL}${path}`, options);
    if (!response.ok) throw new Error(`Reply Coach returned ${response.status}.`);
    return response.json();
  };

  const loadStory = async (forceNew = false) => {
    if(forceNew){setLoading(true);setInstructionsVisible(true);}
    if(forceNew){await stopVoice();setReplayIndex(null);setReplayLines([]);setCorrectionVisible(false);setSelectedChoice(null);setListenVisible(false);setExampleVisible(false);setReadinessVisible(false);setReviewVisible(false);setHintVisible(false);setResultsVisible(false);choiceLock.current=false;}
    setLoading(true);
    setError('');
    try {
      const chapters = (await requestJson('/api/reply-coach/chapters')) as Chapter[];
      if (!chapters.length) throw new Error('No published Reply Coach chapter is available yet.');
      // "A Day of First Impressions" holds the readiness check that unlocks Response Rush and Dialogue Relay.
      const selectedChapter = chapters.find(item => item.title === 'A Day of First Impressions') ?? chapters[0];
      const history = forceNew ? [] : await requestJson(`/api/reply-coach/attempts?email=${encodeURIComponent(user?.email ?? '')}`) as Attempt[];
      const existing = history.find(item => item.chapterId === selectedChapter.id && item.status === 'IN_PROGRESS')
        ?? history.find(item => item.chapterId === selectedChapter.id && item.status === 'COMPLETED');
      const newAttempt = existing ?? (await requestJson('/api/reply-coach/attempts/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          name: `${user?.fname ?? ''} ${user?.lname ?? ''}`.trim(),
          chapterId: selectedChapter.id,
          restart: String(forceNew),
        }),
      })) as Attempt;
      setChapter(selectedChapter);
      setAttempt(newAttempt);
      let localSupport: Record<string, string[]> = {};
      try {
        localSupport = JSON.parse(await AsyncStorage.getItem(`replyCoachSupport:${user?.email}:${newAttempt.id}`) || '{}');
      } catch { /* The server remains authoritative when the local cache is unavailable. */ }
      const combined = { ...(newAttempt.supportUsage ?? {}) };
      for (const [id, help] of Object.entries(localSupport || {})) {
        if (Array.isArray(help)) combined[id] = [...new Set([...(combined[id] ?? []), ...help])];
      }
      supportUsage.current = combined;
      setNodeId(newAttempt.currentNodeId || selectedChapter.startNodeId);
      setInstructionsVisible(newAttempt.status !== 'COMPLETED');
      setResultsVisible(newAttempt.status === 'COMPLETED');
      await AsyncStorage.setItem('replyCoachLastAttempt', newAttempt.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Reply Coach could not load.');
    } finally {
      setLoading(false);
    }
  };

  const moveTo = async (next?: string) => {
    if(paused)return;
    if(replayIndex!==null){await stopVoice();setReplayIndex(replayIndex+1<replayLines.length?replayIndex+1:null);return;}
    if (!next || !attempt) return;
    await stopVoice();
    if (backgroundMusic.current) void backgroundMusic.current.playAsync().catch(() => undefined);
    setSelectedChoice(null);
    setNodeId(next);
    setAttempt((current) => current ? { ...current, currentNodeId: next } : current);
    try {
      await requestJson(`/api/reply-coach/attempts/${attempt.id}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentNodeId: next }),
      });
    } catch {
      // The on-device state remains playable; the next interaction retries persistence.
    }
  };

  const choose = async (choice: ChoiceOption) => {
    if (!attempt || !currentNode || saving || choiceLock.current) return;
    setError('');
    choiceLock.current = true;
    if (backgroundMusic.current) void backgroundMusic.current.playAsync().catch(() => undefined);
    setActiveChoiceId(choice.id);
    setSaving(true);
    try {
      setPreviewChoiceId(choice.id);
      await playVoice(`choice-${choice.id}`, choice.japanese, 'SUMI', choice.audioUrl).catch(() => undefined);
      setPreviewChoiceId('');
      const response = await requestJson(`/api/reply-coach/attempts/${attempt.id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodeId: currentNode.id,
          choiceId: choice.id,
          hintUsed: String(hintUsed),
          helpTypes: (supportUsage.current[currentNode.id] ?? []).join(','),
          supportTrackingVersion: '1',
        }),
      });
      setAttempt(response.attempt);
      setSelectedChoice(response.choice);
      setNodeId(response.choice.nextNodeId);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Your response could not be saved.');
    } finally {
      setPreviewChoiceId('');
      setActiveChoiceId('');
      setSaving(false);
      choiceLock.current = false;
    }
  };

  const finish = async () => {
    if (!attempt || saving) return;
    setSaving(true);
    try {
      const completed = await requestJson(`/api/reply-coach/attempts/${attempt.id}/complete`, {
        method: 'POST',
      });
      setAttempt(completed);
      setResultsVisible(true);
      await AsyncStorage.removeItem('replyCoachLastAttempt');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Results could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const saveExample = async (index: number) => {
    if (!attempt || !example || saving || exampleAnswer !== null) return;
    setSaving(true); setError('');
    try {
      const saved = await requestJson('/api/reply-coach/readiness', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'practice', attemptId: attempt.id, email: user?.email,
          questionId: `practice-${Number(latestAnswer?.nodeId.replace('decision-', ''))}`,
          selectedJapanese: example[index === exampleCorrectIndex ? 1 : 4],
          helpTypes: [...exampleHelp.current].join(',') }),
      });
      setExampleAnswer(saved.correct ? exampleCorrectIndex : 1 - exampleCorrectIndex);
    } catch { setError('Practice could not be saved. Please try your answer again.'); }
    finally { setSaving(false); }
  };

  const continueAfterCorrection = async () => {
    await stopVoice();
    if (example && !exampleVisible) {
      exampleHelp.current = new Set(showMeaning ? ['meaning'] : []);
      setExampleCorrectIndex(Math.random() < 0.5 ? 0 : 1);
      setExampleAnswer(null);
      setExampleVisible(true);
      return;
    }
    setExampleVisible(false);
    setCorrectionVisible(false);
    await moveTo(currentNode?.nextNodeId);
  };

  const advanceNarration = () => {
    if (!narrationFinished) {
      setTypedNarration(currentNode?.text ?? '');
      setNarrationFinished(true);
      return;
    }
    void moveTo(currentNode?.nextNodeId);
  };

  const background = backgrounds[currentNode?.backgroundKey ?? 'station'] ?? backgrounds.station;
  const displayedCharacter = currentNode?.characterKey || currentNode?.secondaryCharacterKey;
  const displayedExpression = currentNode?.characterKey
    ? currentNode.expressionKey
    : currentNode?.secondaryExpressionKey;
  const displayedSprite = displayedCharacter
    ? sprites[displayedCharacter]?.[displayedExpression ?? 'NEUTRAL']
    : null;
  const primaryChoiceCharacter = currentNode?.characterKey;
  const secondaryChoiceCharacter = currentNode?.secondaryCharacterKey
    || (primaryChoiceCharacter === 'SUMI' ? 'HARU' : 'SUMI');
  const isNarration = currentNode?.type === 'NARRATION' || currentNode?.type === 'CULTURAL_NOTE';
  const isReaction = currentNode?.type === 'REACTION';
  const reactionEvaluation = selectedChoice?.evaluation ?? latestAnswer?.evaluation;
  const reactionExplanation = getCoachExplanation(latestAnswer);
  const reactionCulture = selectedChoice?.culturalNote ?? latestAnswer?.culturalNote;

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#8423D9" />
      </View>
    );
  }

  if (exiting) {
    return (
      <QuackSituateExit
        color="#8423D9"
        icon="bookmark-outline"
        title="Reply Coach paused"
        subtitle="Your chapter progress is saved and ready whenever you return."
        status="SAVING YOUR PLACE"
        onComplete={() => router.replace({ pathname: '/QuackResponse', params: { skipLoading: '1' } })}
      />
    );
  }

  if (!chapter || !attempt || !currentNode) {
    return (
      <View style={styles.loadingScreen}>
        <Ionicons name="cloud-offline-outline" size={44} color="#8423D9" />
        <Text style={styles.loadingTitle}>Reply Coach is resting</Text>
        <Text style={styles.loadingText}>{error || 'The story could not be opened.'}</Text>
        <Pressable style={styles.primaryButton} onPress={() => loadStory()}>
          <Text style={styles.primaryButtonText}>Try again</Text>
        </Pressable>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.textButton}>Return to mission map</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ImageBackground
      source={background}
      style={styles.background}
      imageStyle={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.backgroundShade} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => setExitVisible(true)}>
            <Ionicons name="arrow-back" size={24} color="#351A4A" />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.headerEyebrow}>REPLY COACH · CHAPTER {chapter.order ?? 1}</Text>
            <Text style={[styles.headerTitle,{fontSize:17,lineHeight:21}]} numberOfLines={2}>{chapter.title}</Text>
          </View>
          <Pressable disabled={saving} accessibilityLabel="Pause and game options" style={styles.iconButton} onPress={() => setPaused(true)}>
            <Ionicons name="ellipsis-horizontal" size={23} color="#8423D9" />
          </Pressable>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.max(2, progress * 100)}%` }]} />
        </View>

        <Animated.View onLayout={({ nativeEvent }) => setStageSize({ width: nativeEvent.layout.width, height: nativeEvent.layout.height })} style={[styles.storyStage, { opacity: fade }]}>
          {currentNode.spritesVisible !== false && !isNarration && (
            <View style={styles.spriteStage} pointerEvents="none">
              {currentNode.type === 'CHOICE' ? (
                <>
                  {secondaryChoiceCharacter && sprites[secondaryChoiceCharacter] && (
                    <SpriteActor
                      characterKey={secondaryChoiceCharacter}
                      expressionKey={currentNode.secondaryExpressionKey}
                      positionStyle={choicePositionStyleFor(currentNode.secondaryCharacterPosition, styles.choiceSpriteLeft)}
                      speaking={context.dialogue.some(line => line.characterKey === secondaryChoiceCharacter && line.id === activeVoiceId)}
                    />
                  )}
                  {primaryChoiceCharacter && sprites[primaryChoiceCharacter] && (
                    <SpriteActor
                      characterKey={primaryChoiceCharacter}
                      expressionKey={currentNode.expressionKey}
                      positionStyle={choicePositionStyleFor(currentNode.characterPosition, styles.choiceSpriteRight)}
                      speaking={context.dialogue.some(line => line.characterKey === primaryChoiceCharacter && line.id === activeVoiceId)}
                    />
                  )}
                </>
              ) : displayedCharacter && displayedSprite ? (
                <SpriteActor
                  characterKey={displayedCharacter}
                  expressionKey={displayedExpression}
                  positionStyle={positionStyleFor(
                    currentNode.characterPosition,
                    displayedCharacter === 'HARU' ? styles.soloSpriteLeft : styles.soloSpriteRight,
                  )}
                  speaking={activeVoiceId === currentNode.id}
                />
              ) : null}
            </View>
          )}
          {currentNode.spritesVisible && !isNarration && currentNode.type !== 'CHOICE' && (
            <View style={styles.stageForeground} pointerEvents="none">
              <View style={styles.stageForegroundLine} />
              <Text style={styles.stageForegroundText}>REPLY COACH STORY</Text>
            </View>
          )}

          {isNarration ? (
            <Pressable style={styles.narrationWrap} onPress={advanceNarration}>
              <View style={styles.narrationCard}>
                <View style={styles.narrationLocation}>
                  <Ionicons name="location-outline" size={15} color="#B9F28E" />
                  <Text style={styles.narrationLocationText}>{currentNode.title}</Text>
                </View>
                <View style={styles.narrationRule} />
                <Text style={styles.narrationEyebrow}>
                  {currentNode.type === 'CULTURAL_NOTE' ? 'A MOMENT TO REMEMBER' : 'YOUR STORY CONTINUES'}
                </Text>
                <Text style={styles.narrationText} maxFontSizeMultiplier={1.08}>
                  {typedNarration}
                </Text>
                <View style={styles.continueRow}>
                  <Text style={styles.continueText}>Tap to continue</Text>
                  <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
                </View>
              </View>
            </Pressable>
          ) : currentNode.type === 'CHOICE' ? (
            <>
            <View style={[coachUI.bubble,coachUI.contextCard,{width:Math.min(560,stageSize.width*0.94),left:(stageSize.width-Math.min(560,stageSize.width*0.94))/2,maxHeight:Math.max(0,stageSize.height-panelHeight-20),paddingVertical:10,paddingHorizontal:12,borderRadius:20}]}>
              <ScrollView style={{flexShrink:1,minHeight:0}} keyboardShouldPersistTaps="handled">
              <View style={coachUI.contextMeta}>
                <View style={coachUI.contextItem}>
                  <Ionicons name="location-outline" size={15} color="#8423D9"/>
                  <Text style={coachUI.contextLabel}>{context.scene?.title || currentNode.backgroundKey}</Text>
                </View>
                <View style={coachUI.contextDivider}/>
                <View style={coachUI.contextItem}>
                  <Ionicons name="people-outline" size={15} color="#8423D9"/>
                  <Text style={coachUI.contextLabel}>{getCoachPartner(chapter.title, decisionId) || context.dialogue[0]?.speaker || 'Conversation partner'}</Text>
                </View>
              </View>
                <Text style={coachUI.goal}>{currentNode.text}</Text>
              </ScrollView>
            </View>
            <View style={[styles.decisionPanel, { height: panelHeight }]}>
              <ScrollView key={currentNode.id} style={{flex:1,minHeight:0}} contentContainerStyle={coachUI.choiceContent} keyboardShouldPersistTaps="handled">
              <View style={styles.drawerHandle} />
              <View style={[styles.decisionHeading,coachUI.panelHeading]}>
                <View style={coachUI.headingIcon}><Ionicons name="chatbubbles-outline" size={18} color="#FFFFFF"/></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.decisionEyebrow}>YOUR TURN</Text>
                  <Text style={coachUI.headingTitle}>Choose your reply</Text>
                </View>
                <View style={coachUI.tools}>
                  <Pressable disabled={saving} accessibilityRole="button" accessibilityLabel="Watch Sumi and Haru repeat the conversation" style={coachUI.panelReplay} onPress={reenactConversation}><Ionicons name="volume-medium-outline" size={18} color="#8423D9"/></Pressable>
                  <Pressable accessibilityRole="button" accessibilityLabel="Show a hint for this reply" style={styles.hintButton} onPress={()=>{markSupport('hint');setHintUsed(true);setHintVisible(true);}}><Ionicons name="bulb-outline" size={16} color="#D58A1E"/><Text style={styles.hintButtonText}>Hint</Text></Pressable>
                </View>
              </View>
              {Boolean(audioError) && <Text accessibilityRole="alert" style={styles.coachNotice}>{audioError}</Text>}
              {Boolean(error) && <Text accessibilityRole="alert" style={styles.coachNotice}>{error} Please try your reply again.</Text>}
              <View style={[styles.choiceList,coachUI.balancedChoices, { flexDirection: 'row', flexWrap: 'wrap', gap: fitted.columns === 2 ? 8 : 0 }]}>
                {choiceOrder.map((choice, index) => (
                  <Pressable
                    key={choice.id}
                    disabled={saving}
                    style={({ pressed }) => [
                      styles.choiceButton,
                      coachUI.choice,
                      { width: fitted.columns === 2 ? '48.5%' : '100%' },
                      activeChoiceId === choice.id && styles.choiceSelected,
                      pressed && styles.choicePressed,
                    ]}
                    onPress={() => choose(choice)}
                  >
                    <View style={[styles.choiceLetter, activeChoiceId === choice.id && styles.choiceLetterSelected]}>
                      <Text style={[styles.choiceLetterText, activeChoiceId === choice.id && styles.choiceLetterTextSelected]}>
                        {activeChoiceId === choice.id ? '✓' : String.fromCharCode(65 + index)}
                      </Text>
                    </View>
                    <View style={styles.choiceCopy}>
                      <Text style={[styles.choiceJapanese, { fontSize: fitted.japaneseSize, lineHeight: fitted.japaneseSize + 4 }]}>{choice.japanese}</Text>
                      <Text style={[styles.choiceRomaji, { fontSize: fitted.romajiSize, lineHeight: fitted.romajiSize + 4 }]}>{choice.romaji}</Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Play ${choice.romaji}`}
                      disabled={saving}
                      style={[styles.choiceAudioButton, previewChoiceId === choice.id && styles.choiceAudioButtonActive]}
                      onPress={(event) => {
                        event.stopPropagation();
                        markSupport('choiceAudio');
                        setPreviewChoiceId(choice.id);
                        void playVoice(`choice-${choice.id}`, choice.japanese, 'SUMI', choice.audioUrl)
                          .catch(() => setAudioError('Audio could not play. Try again or read the choice.'))
                          .finally(() => setPreviewChoiceId(''));
                      }}
                    >
                      <Ionicons
                        name={previewChoiceId === choice.id ? 'volume-high' : 'volume-medium-outline'}
                        size={18}
                        color={previewChoiceId === choice.id ? '#FFFFFF' : '#8423D9'}
                      />
                    </Pressable>
                    <Ionicons name="chevron-forward" size={19} color="#A58CAF" />
                  </Pressable>
                ))}
              </View>
              </ScrollView>
            </View>
            </>
          ) : currentNode.type === 'ENDING' ? (
            <ScrollView style={{flex:1,minHeight:0}} contentContainerStyle={{flexGrow:1,justifyContent:'center'}}>
            <View style={styles.endingCard}>
              <Ionicons name="ribbon-outline" size={48} color="#8423D9" />
              <Text style={styles.endingEyebrow}>JOURNEY COMPLETE</Text>
              <Text style={styles.endingTitle}>{currentNode.title}</Text>
              <Text style={styles.endingText}>{currentNode.text}</Text>
              <Pressable style={styles.primaryButton} onPress={finish} disabled={saving}>
                <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'View my results'}</Text>
              </Pressable>
            </View>
            </ScrollView>
          ) : (
            <Pressable
              style={[
                coachUI.dialogueWrap, {maxHeight:'90%'},
              ]}
              onPress={() => isReaction ? setCorrectionVisible(true) : moveTo(currentNode.nextNodeId)}
            >
              <View style={[coachUI.dialogueCard,{flexShrink:1,minHeight:0}]}>
                <ScrollView style={{flexShrink:1,minHeight:0}} keyboardShouldPersistTaps="handled">
                <View
                  style={[
                    styles.speechTail,
                    displayedCharacter === 'HARU' ? styles.speechTailLeft : styles.speechTailRight,
                  ]}
                />
                <View style={styles.speakerRow}>
                  <View style={styles.speakerDot} />
                  <Text style={styles.speakerName}>{currentNode.speaker || currentNode.title}</Text>
                </View>
                {Boolean(currentNode.japanese) && (
                  <Text
                    style={[styles.dialogueJapanese, { fontFamily: undefined, fontSize: fitted.short ? 16 : 19, lineHeight: fitted.short ? 22 : 26 }]}
                    maxFontSizeMultiplier={1.1}
                  >
                    {currentNode.japanese}
                  </Text>
                )}
                {Boolean(currentNode.romaji) && (
                  <Text style={coachUI.romaji} maxFontSizeMultiplier={1.05}>
                    {currentNode.romaji}
                  </Text>
                )}
                {showMeaning && Boolean(currentNode.text) && <Text style={styles.coachMeaning}>{currentNode.text}</Text>}
                <View style={styles.coachTools}>
                  <Pressable accessibilityRole="button" accessibilityLabel="Replay the conversation" style={styles.coachTool} onPress={event => { event.stopPropagation(); reenactConversation(); }}><Ionicons name="volume-medium-outline" size={15} color="#8423D9" /><Text style={styles.coachToolText}>Replay</Text></Pressable>
                  <Pressable accessibilityRole="button" accessibilityLabel={showMeaning ? 'Hide meaning' : 'Show meaning'} style={[styles.coachTool, showMeaning && styles.coachToolActive]} onPress={event => { event.stopPropagation(); if (!showMeaning) markSupport('meaning'); setShowMeaning(value => !value); }}><Ionicons name={showMeaning ? 'eye-off-outline' : 'language-outline'} size={15} color={showMeaning ? '#FFFFFF' : '#8423D9'} /><Text style={[styles.coachToolText, showMeaning && styles.coachToolTextActive]}>{showMeaning ? 'Hide meaning' : 'Meaning'}</Text></Pressable>
                </View>
                {Boolean(audioError) && <Text style={styles.coachNotice}>{audioError}</Text>}
                <View style={styles.continueRowDark}>
                  <Text style={styles.continueTextDark}>Tap to continue</Text>
                  <Ionicons name="chevron-forward" size={18} color="#8423D9" />
                </View>
                </ScrollView>
              </View>
            </Pressable>
          )}
        </Animated.View>
      </SafeAreaView>

      <ResponsePauseMenu visible={paused&&!reviewVisible} onResume={()=>setPaused(false)} onReview={()=>setReviewVisible(true)} onRestart={()=>{setPaused(false);void loadStory(true);}}/>
      <ResponseGameInstructions visible={instructionsVisible} title="Reply Coach" steps={[
        'Read the setting and goal, then listen to Sumi and Haru. There is no timer.',
        'Choose a reply and read why it fits or needs improvement. Japanese and Romaji stay visible.',
        'Use Replay to watch Sumi and Haru re-enact the exchange before returning to your reply. Hint and meaning support remain available and are recorded separately.',
        'Practice the same skill with a different example. Your saved conversation is kept; starting does not restart it.'
      ]} onStart={()=>setInstructionsVisible(false)} onLeave={()=>router.replace({pathname:'/QuackResponse',params:{skipLoading:'1'}})}/>
      <Modal visible={listenVisible} transparent animationType="fade" onRequestClose={() => { void stopVoice(); setListenVisible(false); }}>
        <View style={styles.modalBackdrop}>
          <View style={styles.listenCard}>
            <View style={styles.listenHeader}>
              <Text style={styles.listenTitle}>Listen again</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Close" style={styles.listenClose} onPress={() => { void stopVoice(); setListenVisible(false); }}><Ionicons name="close" size={18} color="#71449A" /></Pressable>
            </View>
            <ScrollView style={{ alignSelf: 'stretch' }}>
              {!listenLine && <><Text style={styles.hintText}>{context.scene?.title} · Your answer is not submitted.</Text>
              <Text style={styles.coachContextText}>Partner: {getCoachPartner(chapter.title, decisionId) || context.dialogue[0]?.speaker}</Text>
              <Text style={styles.coachContextText}>Goal: {currentNode.text}</Text>
              <Text style={styles.coachContextText}>{context.scene?.text}</Text></>}
              <View style={styles.coachTools}><Pressable accessibilityRole="button" style={[styles.coachTool, showMeaning && styles.coachToolActive]} onPress={() => { if (!showMeaning) markSupport('meaning'); setShowMeaning(value => !value); }}><Ionicons name={showMeaning ? 'eye-off-outline' : 'language-outline'} size={15} color={showMeaning ? '#FFFFFF' : '#8423D9'} /><Text style={[styles.coachToolText, showMeaning && styles.coachToolTextActive]}>{showMeaning ? 'Hide meaning' : 'Show meaning'}</Text></Pressable></View>
              {(listenLine ? [listenLine] : context.dialogue).map(line => <View key={line.id} style={styles.coachLine}>
                <View style={styles.coachLineBody}>
                  <Text style={styles.coachLineSpeaker}>{line.speaker || line.title}</Text>
                  <Text style={styles.coachLineJapanese}>{line.japanese || line.text}</Text>
                  {Boolean(line.romaji) && <Text style={styles.coachLineRomaji}>{line.romaji}</Text>}
                  {showMeaning && <Text style={styles.coachMeaning}>{line.text}</Text>}
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel="Replay line" style={styles.coachLinePlay} onPress={() => replayLine(line)}><Ionicons name="volume-medium" size={18} color="#8423D9" /></Pressable>
              </View>)}
              {!listenLine && !context.dialogue.length && <Text style={styles.hintText}>No earlier spoken line is available for this decision. Review the setting and goal instead.</Text>}
              {Boolean(audioError) && <Text style={styles.coachNotice}>{audioError}</Text>}
            </ScrollView>
            <Pressable style={[styles.primaryButton, { minHeight: 46 }]} onPress={() => { void stopVoice(); setListenVisible(false); }}><Text style={styles.primaryButtonText}>Back to my reply</Text></Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={exitVisible} transparent animationType="fade" onRequestClose={() => setExitVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.exitCard}>
            <Ionicons name="bookmark-outline" size={38} color="#8423D9" />
            <Text style={styles.exitTitle}>Save your place?</Text>
            <Text style={styles.exitText}>Your story progress is already saved. You can continue from this exact moment later.</Text>
            <Pressable style={styles.primaryButton} onPress={leaveStory}>
              <Text style={styles.primaryButtonText}>Bookmark and return</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => setExitVisible(false)}>
              <Text style={styles.secondaryButtonText}>Continue playing</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={hintVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setHintVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.hintCard}>
            <View style={styles.hintIcon}>
              <Ionicons name="bulb-outline" size={30} color="#D58A1E" />
            </View>
            <Text style={styles.hintEyebrow}>CONVERSATION CLUE</Text>
            <Text style={styles.hintTitle}>A clue for this reply</Text>
            <Text style={styles.hintText}>
              {currentNode.hint || 'Think about who is speaking, where the conversation happens, and how polite the reply should be.'}
            </Text>
            {Boolean(currentNode.hintPenalty) && (
              <Text style={styles.hintPenalty}>Using this hint adjusts the decision score by {currentNode.hintPenalty} point.</Text>
            )}
            <Pressable style={styles.primaryButton} onPress={() => setHintVisible(false)}>
              <Text style={styles.primaryButtonText}>Return to the scene</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        visible={correctionVisible}
        transparent
        animationType="fade"
        onRequestClose={() => undefined}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.feedbackCard}>
            <ScrollView style={{ alignSelf: 'stretch' }} contentContainerStyle={{ alignItems: 'center' }}>
            {exampleVisible && example ? <>
              <Text style={styles.hintTitle}>Try a new situation</Text>
              <Text style={styles.coachNotice}>Saved practice · does not change your first answer or readiness result</Text>
              {Boolean(error) && <Text accessibilityRole="alert" style={styles.coachNotice}>{error}</Text>}
              <Text style={styles.hintText}>{example[0]}</Text>
              <View style={styles.coachTools}>
                <Pressable disabled={saving || exampleAnswer !== null} style={[styles.coachTool, showMeaning && styles.coachToolActive]} onPress={() => { if (!showMeaning) exampleHelp.current.add('meaning'); setShowMeaning(value => !value); }}><Ionicons name={showMeaning ? 'eye-off-outline' : 'language-outline'} size={15} color={showMeaning ? '#FFFFFF' : '#8423D9'} /><Text style={[styles.coachToolText, showMeaning && styles.coachToolTextActive]}>{showMeaning ? 'Hide meaning' : 'Meaning'}</Text></Pressable>
              </View>
              {[0, 1].map(index => {
                const correct = index === exampleCorrectIndex;
                return <Pressable key={index} disabled={saving || exampleAnswer !== null} style={[styles.coachExample, exampleAnswer === index && styles.choiceSelected]} onPress={() => saveExample(index)}>
                  <Text style={styles.choiceJapanese}>{example[correct ? 1 : 4]}</Text>
                  <Text style={styles.choiceRomaji}>{example[correct ? 2 : 5]}</Text>
                  {showMeaning && <Text style={styles.coachMeaning}>{example[correct ? 3 : 6]}</Text>}
                </Pressable>;
              })}
              {exampleAnswer !== null && <View style={styles.explanationBox}><Text style={styles.explanationLabel}>{exampleAnswer === exampleCorrectIndex ? 'THAT FITS' : 'COMPARE THE CONTEXT'}</Text><Text style={styles.explanationText}>{example[7]}</Text><Text style={styles.explanationText}>A fitting reply: {example[1]}</Text></View>}
            </> : <>
            {reactionEvaluation && (
              <>
                <ResponseFeedbackHeader label={evaluationTheme[reactionEvaluation].label} icon={evaluationTheme[reactionEvaluation].icon} color={evaluationTheme[reactionEvaluation].color} total={attempt.score} maximum={attempt.maximumScore}/>
              </>
            )}
            <Text style={styles.feedbackReaction}>
              {reactionEvaluation === 'BEST'
                ? 'That response fits this moment naturally.'
                : reactionEvaluation === 'ACCEPTABLE'
                  ? 'Your reply also works in this situation.'
                  : reactionEvaluation === 'AWKWARD'
                    ? 'Let’s adjust this reply so it fits the situation.'
                    : 'Let’s review how this reply may be understood.'}
            </Text>
            {latestAnswer && (
              <View style={styles.answerComparison}>
                <View style={styles.answerComparisonColumn}>
                  <Text style={styles.answerComparisonLabel}>YOUR REPLY</Text>
                  <Text style={styles.answerComparisonValue}>{latestAnswer.selectedJapanese}</Text>
                  <Text style={styles.choiceRomaji}>{selectedRomaji(latestAnswer)}</Text>
                </View>
                {latestAnswer.evaluation !== 'BEST' && (
                  <View style={styles.answerComparisonColumn}>
                    <Text style={styles.answerComparisonLabel}>BEST REPLY</Text>
                    <Text style={styles.answerComparisonValue}>{bestReply(latestAnswer)?.japanese || latestAnswer.bestResponse.split(' · ')[0]}</Text>
                    <Text style={styles.choiceRomaji}>{bestReply(latestAnswer)?.romaji || latestAnswer.bestResponse.split(' · ')[1]}</Text>
                  </View>
                )}
              </View>
            )}
            <View style={styles.explanationBox}>
              <Text style={styles.explanationLabel}>
                {reactionEvaluation === 'BEST' ? 'WHY THIS WORKS' : 'WHY THIS NEEDS ADJUSTMENT'}
              </Text>
              <Text style={styles.explanationText}>{reactionExplanation}</Text>
            </View>
            {Boolean(reactionCulture) && !reactionExplanation.includes(reactionCulture || '') && (
              <View style={styles.cultureBox}>
                <Ionicons name="leaf-outline" size={19} color="#5CAA38" />
                <Text style={styles.cultureText}>{reactionCulture}</Text>
              </View>
            )}
            </>}
            </ScrollView>
            <Pressable style={[styles.primaryButton, exampleVisible && exampleAnswer === null && { opacity: 0.5 }]} disabled={saving || (exampleVisible && exampleAnswer === null)} onPress={continueAfterCorrection}>
              <Text style={styles.primaryButtonText}>{example && !exampleVisible ? 'Try a different example' : 'Continue the story'}</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={resultsVisible} transparent animationType="slide" onRequestClose={() => undefined}>
        <View style={styles.resultsPage}>
          <SafeAreaView style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.resultsContent}>
              <View style={styles.resultMedal}>
                <Ionicons name="ribbon" size={46} color="#FFFFFF" />
              </View>
              <Text style={styles.resultsEyebrow}>REPLY COACH COMPLETE</Text>
              <Text style={styles.resultsTitle}>{chapter.title}</Text>
              <Text style={styles.resultsScore}>{attempt.finalPercentage}%</Text>
              <ResponseScore total={attempt.score} totalMaximum={attempt.maximumScore}/>
              <Text style={styles.coachNotice}>Practice score · not an independent mastery score</Text>
              <Text style={styles.coachNotice}>{attempt.answers.filter(answer => answer.supported === false).length} independent · {attempt.answers.filter(answer => answer.supported === true).length} supported · {attempt.answers.filter(answer => answer.supported == null).length} not fully tracked</Text>
              <Text style={styles.resultsRating}>
                {attempt.finalPercentage >= 90 ? 'Excellent cultural awareness' : attempt.finalPercentage >= 75 ? 'Good — keep refining your replies' : 'Review recommended'}
              </Text>
              <View style={styles.resultGrid}>
                {[
                  ['Best', attempt.bestCount, '#62B83C'],
                  ['Acceptable', attempt.acceptableCount, '#5086D8'],
                  ['Awkward', attempt.awkwardCount, '#D89525'],
                  ['Impolite / rude', attempt.impoliteCount + attempt.rudeCount, '#D4635D'],
                ].map(([label, value, color]) => (
                  <View key={String(label)} style={styles.resultTile}>
                    <View style={[styles.resultDot, { backgroundColor: String(color) }]} />
                    <Text style={styles.resultValue}>{String(value)}</Text>
                    <Text style={styles.resultLabel}>{String(label)}</Text>
                  </View>
                ))}
              </View>
              <Pressable style={styles.primaryButton} onPress={() => setReviewVisible(true)}>
                <Ionicons name="reader-outline" size={19} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Review my decisions</Text>
              </Pressable>
              {chapter.title === 'A Day of First Impressions' && <Pressable style={styles.primaryButton} onPress={() => { setResultsVisible(false); setReadinessVisible(true); }}><Ionicons name="checkmark-done-outline" size={20} color="#FFFFFF" /><Text style={styles.primaryButtonText}>Check my readiness</Text></Pressable>}
              <Pressable style={styles.secondaryButton} disabled={saving} onPress={()=>void loadStory(true)}><Ionicons name="refresh-outline" size={19} color="#8423D9"/><Text style={styles.secondaryButtonText}>Play again</Text></Pressable>
              <Pressable style={styles.textButtonWrap} onPress={() => router.replace('/QuackResponse')}>
                <Text style={styles.textButton}>Return to Reply Coach</Text>
              </Pressable>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

      <Modal visible={reviewVisible} animationType="slide" onRequestClose={() => setReviewVisible(false)}>
        <SafeAreaView style={styles.reviewPage}>
          <View style={styles.reviewHeader}>
            <Pressable style={styles.iconButton} onPress={() => setReviewVisible(false)}>
              <Ionicons name="arrow-back" size={23} color="#351A4A" />
            </Pressable>
            <View>
              <Text style={styles.reviewEyebrow}>DECISION JOURNAL</Text>
              <Text style={styles.reviewTitle}>Review your replies</Text>
            </View>
          </View>
          <ScrollView contentContainerStyle={styles.reviewContent}>
            {!attempt.answers.length ? (
              <View style={styles.emptyReview}>
                <Ionicons name="book-outline" size={40} color="#B99EC7" />
                <Text style={styles.emptyReviewTitle}>Your journal is waiting</Text>
                <Text style={styles.emptyReviewText}>Completed decisions will appear here with explanations and cultural notes.</Text>
              </View>
            ) : attempt.answers.map((answer, index) => {
              const theme = evaluationTheme[answer.evaluation];
              return (
                <View key={`${answer.nodeId}-${index}`} style={styles.reviewCard}>
                  <View style={styles.reviewCardTop}>
                    <Text style={styles.reviewNumber}>DECISION {String(index + 1).padStart(2, '0')}</Text>
                    <Text style={[styles.reviewEvaluation, { color: theme.color }]}>{theme.label}</Text>
                  </View>
                  <Text style={styles.reviewPrompt}>{answer.prompt}</Text>
                  <Text style={styles.coachNotice}>{answer.supported === true ? `Supported practice · ${(answer.helpTypes ?? []).join(', ')}` : answer.supported === false ? 'Independent first answer' : 'Earlier answer · support usage not fully tracked'}</Text>
                  <Text style={styles.reviewSelected}>{answer.selectedJapanese}</Text>
                  <Text style={styles.choiceRomaji}>{selectedRomaji(answer)}</Text>
                  {answer.evaluation !== 'BEST' && (
                    <View style={styles.bestAnswerBox}>
                      <Text style={styles.bestAnswerLabel}>BEST RESPONSE</Text>
                      <Text style={styles.bestAnswerText}>{bestReply(answer)?.japanese || answer.bestResponse.split(' · ')[0]}</Text>
                      <Text style={styles.choiceRomaji}>{bestReply(answer)?.romaji || answer.bestResponse.split(' · ')[1]}</Text>
                    </View>
                  )}
                  <Text style={styles.reviewExplanation}>{getCoachExplanation(answer)}</Text>
                  {Boolean(answer.culturalNote) && <Text style={styles.reviewCulture}>文化 · {answer.culturalNote}</Text>}
                </View>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {readinessVisible && user?.email && <ReplyCoachReadiness attemptId={attempt.id} email={user.email} onClose={() => { setReadinessVisible(false); setResultsVisible(true); }} />}
    </ImageBackground>
  );
}
