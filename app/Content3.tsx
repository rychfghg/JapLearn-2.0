import React, { useContext, useEffect, useRef, useState } from 'react';
import { Animated, Image, ImageBackground, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { loadBundledSound } from '../utils/nativeAudio';
import { useRouter } from 'expo-router';
import Game3 from './Game3';
import { styles } from '../styles/content3Styles';
import expoconfig from '../expoconfig';
import { AuthContext } from '../context/AuthContext';

const talk = require('../assets/talk.png');
const hello = require('../assets/hello.png');
const idle = require('../assets/idle.png');
const thinking = require('../assets/thinking.png');
const katana = require('../assets/Idle_Katana.png');
const surprised = require('../assets/Surprised.png');
const lost = require('../assets/Crying.png');

const dialogues = [
  { title: 'A new path begins', text: 'Welcome to Japanese grammar. Today, we will learn how words join together to form clear sentences.', image: hello },
  { title: 'The sentence order', text: 'Japanese commonly follows Subject–Object–Verb. “I eat sushi” becomes “Watashi wa sushi wo tabemasu.”', image: talk },
  { title: 'Meet 「wa」', text: 'The particle “wa” marks the topic—the person or thing your sentence is speaking about.', image: surprised },
  { title: 'Speak politely', text: '“Desu” gives a sentence a polite ending. It can express “am,” “is,” or “are.”', image: talk },
  { title: 'Try the pattern', text: 'Watashi wa Yuki desu means “I am Yuki.” Notice how wa marks the topic and desu completes the thought.', image: thinking },
  { title: 'More useful particles', text: 'You are ready to discover the particles that change meaning, time, and connection.', image: idle },
  { title: 'Make it negative', text: '“Ja arimasen” is the present negative form of desu: “am not,” “is not,” or “are not.”', image: thinking },
  { title: 'Speak about the past', text: '“Deshita” is the past form of desu and expresses “was” or “were.”', image: idle },
  { title: 'Add someone too', text: '“Mo” replaces wa when you mean “too” or “also.”', image: thinking },
  { title: 'Use 「mo」', text: 'Suzuki-san mo enjinia desu means “Mr. Suzuki is also an engineer.”', image: talk },
  { title: 'Show possession', text: '“No” connects two nouns and shows belonging—similar to “of” or apostrophe-s in English.', image: talk },
  { title: 'Use 「no」', text: 'CIT no sensei means “a teacher of CIT.”', image: idle },
  { title: 'Lesson mastered', text: 'Excellent. You now hold the sentence patterns and particles needed for the final path.', image: hello },
  { title: 'The forest is calling', text: 'But knowledge must be tested. Beyond the temple lies an old grammar gate guarded by a mysterious master.', image: katana },
  { title: 'Begin the journey', text: 'Stay beside me. We will cross the forest and face the trial together. Ikimashou!', image: katana },
];

const cinematicScenes = [
  { chapter: 'CHAPTER I', title: 'Into the whispering forest', text: 'Ahiru leaves the safety of the temple. Every step carries the particles you have learned.', icon: 'leaf-outline' as const },
  { chapter: 'CHAPTER II', title: 'The path grows silent', text: 'The trees close around the trail. Ahead, an ancient gate begins to glow.', icon: 'footsteps-outline' as const },
  { chapter: 'CHAPTER III', title: 'A challenger appears', text: 'A powerful presence blocks the road. The final grammar trial is about to begin.', icon: 'flash-outline' as const },
];

const postCinematicDialogues = [
  { title: 'The guardian!', text: 'That is the master of the grammar gate. We cannot pass without answering the particle trials.', image: lost },
  { title: 'Will you fight with me?', text: 'Choose each answer carefully. Your knowledge will guide every attack. Let us open the gate together!', image: katana },
];

const finalDialogue = { title: 'The path is open', text: 'We did it! Your grammar guided us safely through the forest. The final lesson is now complete.', image: hello };

export default function Content3() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [dialogueIndex, setDialogueIndex] = useState(0);
  const [cinematicIndex, setCinematicIndex] = useState(0);
  const [postIndex, setPostIndex] = useState(0);
  const [phase, setPhase] = useState<'lesson' | 'cinematic' | 'warning' | 'battle' | 'final' | 'saving'>('lesson');
  const ambient = useRef(new Animated.Value(0)).current;
  const mascot = useRef(new Animated.Value(0)).current;
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    const ambientLoop = Animated.loop(Animated.timing(ambient, { toValue: 1, duration: 10000, useNativeDriver: true }));
    const mascotLoop = Animated.loop(Animated.sequence([
      Animated.timing(mascot, { toValue: 1, duration: 1400, useNativeDriver: true }),
      Animated.timing(mascot, { toValue: 0, duration: 1400, useNativeDriver: true }),
    ]));
    ambientLoop.start(); mascotLoop.start();
    return () => {
      ambientLoop.stop(); mascotLoop.stop();
      soundRef.current?.stopAsync().catch(() => undefined);
      soundRef.current?.unloadAsync().catch(() => undefined);
    };
  }, [ambient, mascot]);

  const playCue = async (source: number) => {
    try {
      if (soundRef.current) { await soundRef.current.stopAsync(); await soundRef.current.unloadAsync(); }
      const { sound } = await loadBundledSound(source, { shouldPlay: true, volume: 0.38 });
      soundRef.current = sound;
    } catch { /* Narrative continues normally without device audio. */ }
  };

  const next = () => {
    if (phase === 'lesson') {
      if (dialogueIndex < dialogues.length - 1) setDialogueIndex((value) => value + 1);
      else { setPhase('cinematic'); playCue(require('../assets/audio/sfx/quiz.mp3')); }
    } else if (phase === 'cinematic') {
      if (cinematicIndex < cinematicScenes.length - 1) setCinematicIndex((value) => value + 1);
      else { setPhase('warning'); playCue(require('../assets/audio/sfx/incorrect.mp3')); }
    } else if (phase === 'warning') {
      if (postIndex < postCinematicDialogues.length - 1) setPostIndex((value) => value + 1);
      else setPhase('battle');
    } else if (phase === 'final') finishLesson();
  };

  const finishLesson = async () => {
    if (!user?.email) return;
    setPhase('saving');
    try {
      const response = await fetch(`${expoconfig.API_URL}/api/progress/${user.email}`, { headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) { setPhase('final'); return; }
      const data = await response.json();
      if (!data?.sentence) {
        const update = await fetch(`${expoconfig.API_URL}/api/progress/${user.email}/updateField?field=sentence&value=true`, { method: 'PUT', headers: { 'Content-Type': 'application/json' } });
        const result = await update.json();
        if (!update.ok || !result.success) { setPhase('final'); return; }
      }
      router.push({ pathname: '/LearnMenu', params: { fromContent3: 'true' } });
    } catch { setPhase('final'); }
  };

  if (phase === 'battle') {
    return (
      <Game3
        onGameOver={() => setPhase('final')}
        onExit={() => setPhase('warning')}
      />
    );
  }

  const lesson = dialogues[dialogueIndex];
  const warning = postCinematicDialogues[postIndex];
  const scene = cinematicScenes[cinematicIndex];
  const background = phase === 'cinematic' ? require('../assets/forest2.png') : phase === 'warning' ? require('../assets/forest.jpg') : phase === 'final' || phase === 'saving' ? require('../assets/forest3.png') : require('../assets/background.png');
  const current = phase === 'warning' ? warning : phase === 'final' || phase === 'saving' ? finalDialogue : lesson;
  const driftX = ambient.interpolate({ inputRange: [0, 1], outputRange: [-60, 430] });
  const mascotY = mascot.interpolate({ inputRange: [0, 1], outputRange: [0, -5] });
  const progress = phase === 'lesson' ? (dialogueIndex + 1) / dialogues.length : 1;

  return (
    <ImageBackground source={background} style={styles.background} resizeMode="cover">
      <View style={styles.softShade} />
      <Animated.View style={[styles.lightOrb, { transform: [{ translateX: driftX }] }]} />
      <Animated.Text style={[styles.fallingLeaf, { transform: [{ translateX: driftX }, { rotate: '20deg' }] }]}>🍃</Animated.Text>

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.replace('/LearnMenu')}><Ionicons name="arrow-back" size={23} color="#432653" /></Pressable>
        <View style={styles.headerCopy}><Text style={styles.pathLabel}>JAPLEARN · FINAL LESSON</Text><View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress * 100}%` }]} /></View></View>
        <View style={styles.soundPill}><Ionicons name="volume-medium" size={18} color="#8424E8" /></View>
      </View>

      {phase === 'cinematic' ? (
        <View style={styles.cinematicWrap}>
          <View style={styles.chapterIcon}><Ionicons name={scene.icon} size={27} color="#8424E8" /></View>
          <Text style={styles.chapter}>{scene.chapter}</Text>
          <Text style={styles.cinematicTitle}>{scene.title}</Text>
          <Text style={styles.cinematicText}>{scene.text}</Text>
          <View style={styles.sceneDots}>{cinematicScenes.map((_, i) => <View key={i} style={[styles.sceneDot, i === cinematicIndex && styles.sceneDotActive]} />)}</View>
          <Pressable style={[styles.continueButton, styles.cinematicContinueButton]} onPress={next}>
            <Text style={[styles.continueText, styles.cinematicContinueText]}>{cinematicIndex === cinematicScenes.length - 1 ? 'FACE THE CHALLENGER' : 'FOLLOW THE PATH'}</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.cinematicContinueIcon} />
          </Pressable>
        </View>
      ) : (
        <View style={[styles.storyLayout, phase === 'warning' && styles.warningLayout]}>
          {phase === 'warning' && <View style={styles.warningBadge}><Ionicons name="alert-circle" size={15} color="#C94F63" /><Text style={styles.warningText}>ENCOUNTER</Text></View>}
          <Animated.Image source={current.image} style={[styles.characterImage, phase === 'warning' && styles.warningCharacterImage, { transform: [{ translateY: mascotY }] }]} />
          <View style={[styles.dialogueCard, phase === 'warning' && styles.warningDialogueCard]}>
            <View style={styles.speakerRow}><View style={styles.speakerDot} /><Text style={styles.speaker}>AHIRU-SAN</Text><Text style={styles.step}>{phase === 'lesson' ? `${dialogueIndex + 1} / ${dialogues.length}` : phase === 'warning' ? `${postIndex + 1} / 2` : 'COMPLETE'}</Text></View>
            <Text style={styles.dialogueTitle}>{current.title}</Text>
            <Text style={styles.dialogue}>{current.text}</Text>
            <Pressable disabled={phase === 'saving'} style={[styles.continueButton, phase === 'saving' && styles.continueDisabled]} onPress={next}>
              <Text style={styles.continueText}>{phase === 'saving' ? 'SAVING PROGRESS…' : phase === 'warning' && postIndex === 1 ? 'ENTER THE BATTLE' : phase === 'final' ? 'COMPLETE LESSON' : 'CONTINUE'}</Text><Ionicons name="arrow-forward" size={20} color="#fff" />
            </Pressable>
          </View>
        </View>
      )}
    </ImageBackground>
  );
}

