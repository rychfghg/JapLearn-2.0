import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import expoconfig from '../expoconfig';
import styles from '../styles/stylesQuackResponseGuided';

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
  nodes: StoryNode[];
};
type AnswerRecord = {
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
    SMILE: require('../assets/img/Sumi_PoseB_WinterUni_Smile_Blush.png'),
    CORRECT: require('../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Smile.png'),
    WRONG: require('../assets/img/Sumi_PoseB_WinterUni_Frown.png'),
  },
  HARU: {
    NEUTRAL: require('../assets/img/Sprite Male Dark Hair Neu01.png'),
    SPEAKING: require('../assets/img/Sprite Male Dark Hair Smi02.png'),
    SMILE: require('../assets/img/Sprite Male Dark Hair Smi01.png'),
    CORRECT: require('../assets/img/Sprite Male Dark Hair Smi01.png'),
    WRONG: require('../assets/img/Sprite Male Dark Hair Sad01.png'),
  },
};

const evaluationTheme: Record<Evaluation, { label: string; color: string; icon: any }> = {
  BEST: { label: 'Best response', color: '#62B83C', icon: 'checkmark-circle' },
  ACCEPTABLE: { label: 'Acceptable', color: '#5086D8', icon: 'thumbs-up' },
  AWKWARD: { label: 'Awkward', color: '#D89525', icon: 'help-circle' },
  IMPOLITE: { label: 'Impolite', color: '#D4635D', icon: 'alert-circle' },
  RUDE: { label: 'Rude / offensive', color: '#B83B55', icon: 'close-circle' },
};

const shuffle = <T,>(items: T[]) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
};

export default function ReplyCoachStory() {
  const { user } = useContext(AuthContext);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [nodeId, setNodeId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedChoice, setSelectedChoice] = useState<ChoiceOption | null>(null);
  const [choiceFeedback, setChoiceFeedback] = useState(false);
  const [exitVisible, setExitVisible] = useState(false);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;

  const nodes = useMemo(
    () => new Map((chapter?.nodes ?? []).map((node) => [node.id, node])),
    [chapter],
  );
  const currentNode = nodes.get(nodeId);
  const choiceOrder = useMemo(() => {
    const choices = currentNode?.choices ?? [];
    return currentNode?.shuffleChoices ? shuffle(choices) : choices;
  }, [currentNode?.id]);
  const progress = chapter
    ? Math.min(1, (attempt?.answers.length ?? 0) / Math.max(1, chapter.nodes.filter((node) => node.type === 'CHOICE').length))
    : 0;

  useEffect(() => {
    void loadStory();
  }, [user?.email]);

  useEffect(() => {
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [nodeId]);

  const requestJson = async (path: string, options?: RequestInit) => {
    const response = await fetch(`${expoconfig.API_URL}${path}`, options);
    if (!response.ok) throw new Error(`Reply Coach returned ${response.status}.`);
    return response.json();
  };

  const loadStory = async () => {
    setLoading(true);
    setError('');
    try {
      const chapters = (await requestJson('/api/reply-coach/chapters')) as Chapter[];
      if (!chapters.length) throw new Error('No published Reply Coach chapter is available yet.');
      const selectedChapter = chapters[0];
      const newAttempt = (await requestJson('/api/reply-coach/attempts/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          name: `${user?.fname ?? ''} ${user?.lname ?? ''}`.trim(),
          chapterId: selectedChapter.id,
        }),
      })) as Attempt;
      setChapter(selectedChapter);
      setAttempt(newAttempt);
      setNodeId(newAttempt.currentNodeId || selectedChapter.startNodeId);
      await AsyncStorage.setItem('replyCoachLastAttempt', newAttempt.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Reply Coach could not load.');
    } finally {
      setLoading(false);
    }
  };

  const moveTo = async (next?: string) => {
    if (!next || !attempt) return;
    setSelectedChoice(null);
    setChoiceFeedback(false);
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
    if (!attempt || !currentNode || saving) return;
    setSaving(true);
    try {
      const response = await requestJson(`/api/reply-coach/attempts/${attempt.id}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeId: currentNode.id, choiceId: choice.id }),
      });
      setAttempt(response.attempt);
      setSelectedChoice(response.choice);
      setChoiceFeedback(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Your response could not be saved.');
    } finally {
      setSaving(false);
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

  const replay = async () => {
    setResultsVisible(false);
    setReviewVisible(false);
    setChapter(null);
    setAttempt(null);
    setNodeId('');
    await loadStory();
  };

  const background = backgrounds[currentNode?.backgroundKey ?? 'station'] ?? backgrounds.station;
  const primarySprite = currentNode?.characterKey
    ? sprites[currentNode.characterKey]?.[currentNode.expressionKey ?? 'NEUTRAL']
    : null;
  const secondarySprite = currentNode?.secondaryCharacterKey
    ? sprites[currentNode.secondaryCharacterKey]?.[currentNode.secondaryExpressionKey ?? 'NEUTRAL']
    : null;
  const isNarration = currentNode?.type === 'NARRATION' || currentNode?.type === 'CULTURAL_NOTE';

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <Image source={require('../assets/hello.png')} style={styles.loadingMascot} />
        <ActivityIndicator color="#8423D9" size="large" />
        <Text style={styles.loadingTitle}>Opening your story...</Text>
        <Text style={styles.loadingText}>Preparing the next Japanese moment.</Text>
      </View>
    );
  }

  if (!chapter || !attempt || !currentNode) {
    return (
      <View style={styles.loadingScreen}>
        <Ionicons name="cloud-offline-outline" size={44} color="#8423D9" />
        <Text style={styles.loadingTitle}>Reply Coach is resting</Text>
        <Text style={styles.loadingText}>{error || 'The story could not be opened.'}</Text>
        <Pressable style={styles.primaryButton} onPress={loadStory}>
          <Text style={styles.primaryButtonText}>Try again</Text>
        </Pressable>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.textButton}>Return to mission map</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ImageBackground source={background} style={styles.background} resizeMode="cover">
      <View style={styles.backgroundShade} />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={() => setExitVisible(true)}>
            <Ionicons name="arrow-back" size={24} color="#351A4A" />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.headerEyebrow}>REPLY COACH · CHAPTER {chapter.order ?? 1}</Text>
            <Text style={styles.headerTitle} numberOfLines={1}>{chapter.title}</Text>
          </View>
          <Pressable style={styles.iconButton} onPress={() => setReviewVisible(true)}>
            <Ionicons name="journal-outline" size={23} color="#8423D9" />
          </Pressable>
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.max(2, progress * 100)}%` }]} />
        </View>

        <Animated.View style={[styles.storyStage, { opacity: fade }]}>
          {currentNode.spritesVisible && !isNarration && (
            <View style={styles.spriteStage} pointerEvents="none">
              {secondarySprite && (
                <Image source={secondarySprite} style={[styles.sprite, styles.secondarySprite]} resizeMode="contain" fadeDuration={0} />
              )}
              {primarySprite && (
                <Image source={primarySprite} style={[styles.sprite, styles.primarySprite]} resizeMode="contain" fadeDuration={0} />
              )}
            </View>
          )}

          {isNarration ? (
            <Pressable style={styles.narrationWrap} onPress={() => moveTo(currentNode.nextNodeId)}>
              <View style={styles.narrationCard}>
                <View style={styles.narrationRule} />
                <Text style={styles.narrationEyebrow}>
                  {currentNode.type === 'CULTURAL_NOTE' ? 'CULTURE NOTE' : currentNode.title}
                </Text>
                <Text style={styles.narrationText}>{currentNode.text}</Text>
                <View style={styles.continueRow}>
                  <Text style={styles.continueText}>Tap to continue</Text>
                  <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
                </View>
              </View>
            </Pressable>
          ) : currentNode.type === 'CHOICE' ? (
            <View style={styles.decisionPanel}>
              <View style={styles.decisionHeading}>
                <View style={styles.decisionIcon}>
                  <Ionicons name="chatbubbles-outline" size={21} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.decisionEyebrow}>YOUR TURN</Text>
                  <Text style={styles.decisionTitle}>{currentNode.title || 'What would you say?'}</Text>
                </View>
              </View>
              <Text style={styles.decisionPrompt}>{currentNode.text}</Text>
              <ScrollView style={styles.choiceScroll} showsVerticalScrollIndicator={false}>
                {choiceOrder.map((choice, index) => (
                  <Pressable
                    key={choice.id}
                    disabled={saving}
                    style={({ pressed }) => [styles.choiceButton, pressed && styles.choicePressed]}
                    onPress={() => choose(choice)}
                  >
                    <View style={styles.choiceLetter}>
                      <Text style={styles.choiceLetterText}>{String.fromCharCode(65 + index)}</Text>
                    </View>
                    <View style={styles.choiceCopy}>
                      <Text style={styles.choiceJapanese}>{choice.japanese}</Text>
                      <Text style={styles.choiceRomaji}>{choice.romaji}</Text>
                      <Text style={styles.choiceEnglish}>{choice.text}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={19} color="#A58CAF" />
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : currentNode.type === 'ENDING' ? (
            <View style={styles.endingCard}>
              <Ionicons name="ribbon-outline" size={48} color="#8423D9" />
              <Text style={styles.endingEyebrow}>JOURNEY COMPLETE</Text>
              <Text style={styles.endingTitle}>{currentNode.title}</Text>
              <Text style={styles.endingText}>{currentNode.text}</Text>
              <Pressable style={styles.primaryButton} onPress={finish} disabled={saving}>
                <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'View my results'}</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.dialogueArea} onPress={() => moveTo(currentNode.nextNodeId)}>
              <View style={styles.dialogueBox}>
                <View style={styles.speakerRow}>
                  <View style={styles.speakerDot} />
                  <Text style={styles.speakerName}>{currentNode.speaker || currentNode.title}</Text>
                  <Text style={styles.nodeType}>{currentNode.type}</Text>
                </View>
                {Boolean(currentNode.japanese) && <Text style={styles.dialogueJapanese}>{currentNode.japanese}</Text>}
                {Boolean(currentNode.romaji) && <Text style={styles.dialogueRomaji}>{currentNode.romaji}</Text>}
                <Text style={styles.dialogueText}>{currentNode.text}</Text>
                <View style={styles.continueRowDark}>
                  <Text style={styles.continueTextDark}>Tap to continue</Text>
                  <Ionicons name="chevron-forward" size={18} color="#8423D9" />
                </View>
              </View>
            </Pressable>
          )}
        </Animated.View>
      </SafeAreaView>

      <Modal visible={choiceFeedback} transparent animationType="fade" onRequestClose={() => undefined}>
        <View style={styles.modalBackdrop}>
          {selectedChoice && (
            <View style={styles.feedbackCard}>
              <View style={[styles.feedbackIcon, { backgroundColor: evaluationTheme[selectedChoice.evaluation].color }]}>
                <Ionicons name={evaluationTheme[selectedChoice.evaluation].icon} size={29} color="#FFFFFF" />
              </View>
              <Text style={[styles.feedbackEyebrow, { color: evaluationTheme[selectedChoice.evaluation].color }]}>
                {evaluationTheme[selectedChoice.evaluation].label.toUpperCase()}
              </Text>
              <Text style={styles.feedbackReaction}>{selectedChoice.reactionText}</Text>
              <View style={styles.explanationBox}>
                <Text style={styles.explanationLabel}>WHY IT SOUNDS THIS WAY</Text>
                <Text style={styles.explanationText}>{selectedChoice.explanation}</Text>
              </View>
              {Boolean(selectedChoice.culturalNote) && (
                <View style={styles.cultureBox}>
                  <Ionicons name="flower-outline" size={20} color="#5DAF37" />
                  <Text style={styles.cultureText}>{selectedChoice.culturalNote}</Text>
                </View>
              )}
              <Pressable style={styles.primaryButton} onPress={() => moveTo(selectedChoice.nextNodeId)}>
                <Text style={styles.primaryButtonText}>Continue the story</Text>
                <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
              </Pressable>
            </View>
          )}
        </View>
      </Modal>

      <Modal visible={exitVisible} transparent animationType="fade" onRequestClose={() => setExitVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.exitCard}>
            <Ionicons name="bookmark-outline" size={38} color="#8423D9" />
            <Text style={styles.exitTitle}>Save your place?</Text>
            <Text style={styles.exitText}>Your story progress is already saved. You can continue from this exact moment later.</Text>
            <Pressable style={styles.primaryButton} onPress={() => router.replace('/QuackResponse')}>
              <Text style={styles.primaryButtonText}>Save and leave</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => setExitVisible(false)}>
              <Text style={styles.secondaryButtonText}>Continue playing</Text>
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
              <Pressable style={styles.secondaryButton} onPress={replay}>
                <Text style={styles.secondaryButtonText}>Replay chapter</Text>
              </Pressable>
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
                  <Text style={styles.reviewSelected}>{answer.selectedJapanese}</Text>
                  <Text style={styles.reviewEnglish}>{answer.selectedText}</Text>
                  {answer.evaluation !== 'BEST' && (
                    <View style={styles.bestAnswerBox}>
                      <Text style={styles.bestAnswerLabel}>BEST RESPONSE</Text>
                      <Text style={styles.bestAnswerText}>{answer.bestResponse}</Text>
                    </View>
                  )}
                  <Text style={styles.reviewExplanation}>{answer.explanation}</Text>
                  {Boolean(answer.culturalNote) && <Text style={styles.reviewCulture}>文化 · {answer.culturalNote}</Text>}
                </View>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </ImageBackground>
  );
}
