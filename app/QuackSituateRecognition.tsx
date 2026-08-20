import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import BackIcon from '../assets/svg/back-icon.svg';
import QuackSituateExit from '../components/QuackSituateExit';
import { AuthContext } from '../context/AuthContext';
import expoconfig from '../expoconfig';
import { stylesRecognition as styles } from '../styles/stylesQuackSituateRecognition';

type Choice = { japanese: string; romaji: string };
type Question = { id: string; difficulty: 'STARTER' | 'HARD'; order: number; location: string; sceneKey: string; scenario: string; hint: string; choices: Choice[]; correctAnswer: string; explanation: string };

const sceneImages: Record<string, any> = {
  school: require('../assets/quacksituate/recognition-school-hallway-v2.png'),
  classroom: require('../assets/img/background/classroom a st2 day.png'),
  station: require('../assets/img/background/train_scene day.png'),
  office: require('../assets/content/office.png'),
  meal: require('../assets/img/background/school a s5st2 day.png'),
  home: require('../assets/words3_image/house.png'),
};
const shuffle = <T,>(values: T[]) => [...values].sort(() => Math.random() - 0.5);

export default function QuackSituateRecognition() {
  const { user } = useContext(AuthContext);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<Choice | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hintVisible, setHintVisible] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [levelVisible, setLevelVisible] = useState(false);
  const [completeVisible, setCompleteVisible] = useState(false);
  const [exitVisible, setExitVisible] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetch(`${expoconfig.API_URL}/api/situational/questions?gameType=RECOGNITION&activeOnly=true`)
      .then(async (response) => { if (!response.ok) throw new Error(); return response.json(); })
      .then((data: Question[]) => {
        if (!mounted) return;
        const ordered = [...data].sort((a, b) => a.order - b.order).map((item) => ({ ...item, choices: shuffle(item.choices) }));
        setQuestions(ordered);
        setError(ordered.length ? '' : 'No active Recognition missions were found.');
      })
      .catch(() => mounted && setError('Start the updated JapLearn backend to load Recognition missions.'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const question = questions[index];
  const progress = questions.length ? ((index + 1) / questions.length) * 100 : 0;
  const phaseTotal = question?.difficulty === 'HARD' ? 10 : 15;
  const phaseNumber = question?.difficulty === 'HARD' ? index - 14 : index + 1;
  const sceneImage = useMemo(() => sceneImages[question?.sceneKey] || sceneImages.school, [question?.sceneKey]);

  const submit = () => {
    if (!selected || !question) return;
    const correct = selected.japanese === question.correctAnswer;
    setLastCorrect(correct);
    if (correct) setCorrectCount((value) => value + 1);
    setFeedbackVisible(true);
  };

  const saveAttempt = async (finalCorrectCount: number) => {
    if (!user?.email) return;
    setSaving(true);
    try {
      await fetch(`${expoconfig.API_URL}/api/situational/attempts`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: user.email, name: `${user.fname || ''} ${user.lname || ''}`.trim(), gameType: 'RECOGNITION', difficulty: 'STARTER_AND_HARD', score: finalCorrectCount * 10, totalQuestions: questions.length, correctAnswers: finalCorrectCount, completed: true }) });
    } finally { setSaving(false); }
  };

  const continueAfterFeedback = () => {
    const finalCorrectCount = correctCount + (lastCorrect ? 1 : 0);
    setFeedbackVisible(false);
    setSelected(null);
    if (index === 14 && questions.length > 15) { setLevelVisible(true); return; }
    if (index >= questions.length - 1) { void saveAttempt(finalCorrectCount).finally(() => setCompleteVisible(true)); return; }
    setIndex((value) => value + 1);
  };

  if (isExiting) return <QuackSituateExit color="#65A936" icon="eye-outline" title="Recognition complete" subtitle="Great choices today. Your situational greeting result is safely recorded." status="PACKING YOUR FIELD NOTES" onComplete={() => router.replace({ pathname: '/QuackSituate', params: { skipLoading: '1' } })} />;
  if (loading) return <View style={styles.centerState}><ActivityIndicator size="large" color="#8423D9" /><Text style={styles.stateTitle}>Preparing Recognition...</Text></View>;
  if (!question) return <View style={styles.centerState}><Ionicons name="cloud-offline-outline" size={38} color="#8423D9" /><Text style={styles.stateTitle}>Missions could not load</Text><Text style={styles.stateText}>{error}</Text><Pressable style={styles.primaryButton} onPress={() => router.back()}><Text style={styles.primaryButtonText}>Return</Text></Pressable></View>;

  return <View style={styles.screen}>
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}><Pressable style={styles.backButton} onPress={() => setExitVisible(true)}><BackIcon width={19} height={19} fill="#462A5E" /></Pressable><View style={styles.brandBlock}><Text style={styles.brandEyebrow}>QUICK CHOICE</Text><Text style={styles.brandTitle}>Recognition</Text></View><View style={styles.missionBadge}><Text style={styles.missionLabel}>MISSION</Text><Text style={styles.missionNumber}>{String(index + 1).padStart(2, '0')}</Text></View></View>
      <View style={styles.statusRow}><View style={[styles.levelPill, question.difficulty === 'HARD' && styles.hardPill]}><Ionicons name={question.difficulty === 'HARD' ? 'flame' : 'leaf'} size={13} color={question.difficulty === 'HARD' ? '#D87D19' : '#65A936'} /><Text style={[styles.levelPillText, question.difficulty === 'HARD' && styles.hardPillText]}>{question.difficulty}</Text></View><Text style={styles.phaseText}>{phaseNumber} / {phaseTotal}</Text><View style={styles.scorePill}><Ionicons name="star" size={14} color="#E29A17" /><Text style={styles.scoreText}>{correctCount * 10}</Text></View></View>
      <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View>
      <View style={styles.introCopy}><Text style={styles.introTitle}>Pick the best phrase</Text><Text style={styles.introText}>Read the situation and choose the Japanese expression that feels natural.</Text></View>
      <View style={styles.sceneCard}>
        <View style={styles.sceneMedia}>
          <Image source={sceneImage} style={styles.sceneBackdrop} resizeMode="cover" blurRadius={12} />
          <View style={styles.sceneBackdropTint} />
          <Image source={sceneImage} style={styles.scenePicture} resizeMode="contain" />
          <View style={styles.locationPill}>
            <Ionicons name="location" size={14} color="#FFFFFF" />
            <Text style={styles.locationText}>{question.location}</Text>
          </View>
        </View>
        <View style={styles.scenarioCopy}>
          <View style={styles.scenarioHeading}>
            <View style={styles.scenarioMarker}><Ionicons name="chatbubble-ellipses" size={14} color="#65A936" /></View>
            <Text style={styles.scenarioLabel}>WHAT WOULD YOU SAY?</Text>
          </View>
          <Text style={styles.scenarioText}>{question.scenario}</Text>
        </View>
      </View>
      <View style={styles.answerHeader}><View><Text style={styles.answerTitle}>Choose your response</Text><Text style={styles.answerSubtitle}>Japanese phrase with reading support</Text></View><Pressable style={styles.hintButton} onPress={() => setHintVisible(true)}><Ionicons name="information-circle-outline" size={20} color="#8423D9" /><Text style={styles.hintButtonText}>Hint</Text></Pressable></View>
      <View style={styles.choices}>{question.choices.map((choice, choiceIndex) => { const active = selected?.japanese === choice.japanese; return <Pressable key={`${choice.japanese}-${choiceIndex}`} style={[styles.choiceCard, active && styles.choiceCardActive]} onPress={() => setSelected(choice)}><View style={[styles.choiceMarker, active && styles.choiceMarkerActive]}><Text style={[styles.choiceMarkerText, active && styles.choiceMarkerTextActive]}>{String.fromCharCode(65 + choiceIndex)}</Text></View><View style={styles.choiceCopy}><Text style={styles.choiceJapanese}>{choice.japanese}</Text><Text style={styles.choiceRomaji}>{choice.romaji}</Text></View><Ionicons name={active ? 'checkmark-circle' : 'ellipse-outline'} size={23} color={active ? '#8423D9' : '#D7CBDB'} /></Pressable>; })}</View>
      <Pressable disabled={!selected} style={[styles.submitButton, !selected && styles.submitButtonDisabled]} onPress={submit}><Text style={styles.submitText}>LOCK IN ANSWER</Text><Ionicons name="arrow-forward" size={19} color="#FFFFFF" /></Pressable>
    </ScrollView>

    <Modal transparent visible={hintVisible} animationType="fade" onRequestClose={() => setHintVisible(false)}><View style={styles.modalShade}><View style={styles.modalCard}><View style={styles.modalIconSoft}><Ionicons name="bulb-outline" size={29} color="#D88B19" /></View><Text style={styles.modalEyebrow}>MISSION HINT</Text><Text style={styles.modalTitle}>Read the social clue</Text><Text style={styles.modalBody}>{question.hint}</Text><Pressable style={styles.modalSecondary} onPress={() => setHintVisible(false)}><Text style={styles.modalSecondaryText}>Continue mission</Text></Pressable></View></View></Modal>
    <Modal transparent visible={feedbackVisible} animationType="fade"><View style={styles.modalShade}><View style={styles.modalCard}><Image source={lastCorrect ? require('../assets/hello.png') : require('../assets/thinking.png')} style={styles.feedbackMascot} /><Text style={[styles.modalEyebrow, !lastCorrect && styles.wrongEyebrow]}>{lastCorrect ? 'NATURAL RESPONSE' : 'LET’S REVIEW'}</Text><Text style={styles.modalTitle}>{lastCorrect ? 'That fits the moment!' : 'A better reply is:'}</Text>{!lastCorrect && <><Text style={styles.correctJapanese}>{question.correctAnswer}</Text><Text style={styles.correctRomaji}>{question.choices.find((item) => item.japanese === question.correctAnswer)?.romaji}</Text></>}<View style={styles.explanationBox}><Ionicons name="chatbubble-ellipses-outline" size={18} color="#65A936" /><Text style={styles.modalBody}>{question.explanation}</Text></View><Pressable style={styles.primaryButton} onPress={continueAfterFeedback}><Text style={styles.primaryButtonText}>CONTINUE</Text><Ionicons name="arrow-forward" size={18} color="#FFFFFF" /></Pressable></View></View></Modal>
    <Modal transparent visible={levelVisible} animationType="fade"><View style={styles.modalShade}><View style={styles.levelCard}><View style={styles.hardIcon}><Ionicons name="flame" size={34} color="#FFFFFF" /></View><Text style={styles.levelEyebrow}>STARTER SET COMPLETE</Text><Text style={styles.levelTitle}>Hard missions unlocked</Text><Text style={styles.levelBody}>The next 10 situations use closer answer choices, formal settings, and more subtle social cues.</Text><View style={styles.levelStats}><Text>15 missions cleared</Text><Text>{correctCount} correct</Text></View><Pressable style={styles.primaryButton} onPress={() => { setLevelVisible(false); setIndex(15); }}><Text style={styles.primaryButtonText}>BEGIN HARD LEVEL</Text><Ionicons name="flame" size={18} color="#FFFFFF" /></Pressable></View></View></Modal>
    <Modal transparent visible={completeVisible} animationType="fade"><View style={styles.modalShade}><View style={styles.modalCard}><View style={styles.trophyIcon}><Ionicons name="trophy" size={32} color="#FFFFFF" /></View><Text style={styles.modalEyebrow}>RECOGNITION COMPLETE</Text><Text style={styles.modalTitle}>Mission report ready</Text><Text style={styles.finalScore}>{correctCount * 10}</Text><Text style={styles.finalScoreLabel}>points · {correctCount}/{questions.length} correct</Text><Text style={styles.modalBody}>{saving ? 'Saving your progress...' : 'Your result is recorded in QuackProgress and is available to your teacher.'}</Text><Pressable disabled={saving} style={styles.primaryButton} onPress={() => { setCompleteVisible(false); setIsExiting(true); }}><Text style={styles.primaryButtonText}>VIEW RESULT</Text><Ionicons name="arrow-forward" size={18} color="#FFFFFF" /></Pressable></View></View></Modal>
    <Modal transparent visible={exitVisible} animationType="fade" onRequestClose={() => setExitVisible(false)}><View style={styles.modalShade}><View style={styles.modalCard}><View style={styles.modalIconSoft}><Ionicons name="flag-outline" size={28} color="#8423D9" /></View><Text style={styles.modalEyebrow}>LEAVE MISSION?</Text><Text style={styles.modalTitle}>Your current run will end</Text><Text style={styles.modalBody}>Completed answers in this unfinished run will not be submitted as a final score.</Text><Pressable style={styles.primaryButton} onPress={() => { setExitVisible(false); setIsExiting(true); }}><Text style={styles.primaryButtonText}>EXIT RECOGNITION</Text></Pressable><Pressable style={styles.modalSecondary} onPress={() => setExitVisible(false)}><Text style={styles.modalSecondaryText}>Keep playing</Text></Pressable></View></View></Modal>
  </View>;
}
