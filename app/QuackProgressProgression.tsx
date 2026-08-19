import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BackIcon from '../assets/svg/back-icon.svg';
import styles from '../styles/stylesQuackProgressProgression';
import expoconfig from '../expoconfig';
import { AuthContext } from '../context/AuthContext';
import StudentBottomNav from '../components/StudentBottomNav';

type Stage = { id?: number; name: string; progress: number; status: string; unlocked: boolean };
type Reinforcement = { id?: number; title: string; mistake: string; retry: string; targetRoute?: string };
type ProgressionData = { currentMastery: number; unlockRequirement: number; masteryHint: string; coachMessage: string; stages: Stage[]; reinforcement: Reinforcement[] };

export default function QuackProgressProgression() {
  const { user } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRetry, setSelectedRetry] = useState<Reinforcement | null>(null);
  const [progression, setProgression] = useState<ProgressionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProgression(); }, []);

  const fetchProgression = async () => {
    try {
      setLoading(true);
      if (!user?.email) throw new Error('User email not found.');
      const response = await fetch(`${expoconfig.API_URL}/api/quackProgress/progression?email=${user.email}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch progression data.');
      setProgression(data);
    } catch (error: any) {
      console.log('QuackProgress progression fetch error:', error.message);
      setProgression({ currentMastery: 0, unlockRequirement: 80, masteryHint: 'No progression data found yet. Complete communication activities to build mastery.', coachMessage: 'Your next communication stage unlocks when your mastery reaches the required threshold.', stages: [], reinforcement: [] });
    } finally { setLoading(false); }
  };

  const openRetry = (item: Reinforcement) => { setSelectedRetry(item); setModalVisible(true); };
  const startRetry = () => {
    const route = selectedRetry?.targetRoute || '/QuackSituate';
    setModalVisible(false);
    router.push(route as any);
  };

  const mastery = progression?.currentMastery || 0;
  const requirement = progression?.unlockRequirement || 80;

  return <SafeAreaView style={styles.safeArea}><View style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.headerCircle} /><Text style={styles.headerCharacter}>進</Text>
        <View style={styles.topRow}><Pressable onPress={() => router.push('/QuackProgress')} style={styles.backButton}><BackIcon width={18} height={18} fill="#462A5E" /></Pressable><View style={styles.wordmark}><Ionicons name="trail-sign-outline" size={16} color="#65A936" /><Text style={styles.wordmarkText}>MASTERY ROADMAP</Text></View><View style={styles.headerIcon}><Ionicons name="flag-outline" size={22} color="#65A936" /></View></View>
        <View style={styles.headerCopy}><Text style={styles.eyebrow}>PROGRESSION & REINFORCEMENT</Text><Text style={styles.headerTitle}>Build your mastery</Text><Text style={styles.headerText}>Follow each communication stage and revisit skills that need more practice.</Text></View>
        <View style={styles.masterySummary}><View style={styles.masteryCircle}><Text style={styles.masteryValue}>{mastery}%</Text></View><View style={styles.masteryCopy}><View style={styles.masteryTop}><Text style={styles.masteryLabel}>Current mastery</Text><Text style={styles.requirementText}>Goal {requirement}%</Text></View><View style={styles.masteryTrack}><View style={[styles.masteryFill,{width:`${mastery}%`}]} /></View><Text style={styles.masteryHint}>{progression?.masteryHint || `${requirement}% mastery required to unlock the next stage.`}</Text></View></View>
      </View>

      {loading ? <View style={styles.loadingCard}><ActivityIndicator size="large" color="#8423D9" /><Text style={styles.loadingText}>Loading mastery progression...</Text></View> : <View style={styles.content}>
        <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Communication stages</Text><Text style={styles.sectionSubtitle}>Your step-by-step mastery roadmap.</Text></View><View style={styles.stagePill}><Text style={styles.stagePillText}>{progression?.stages?.length || 0} STAGES</Text></View></View>
        {progression?.stages?.length ? <View style={styles.roadmap}>{progression.stages.map((stage,index) => <View key={`${stage.name}-${index}`} style={styles.stageRow}>
          <View style={styles.rail}><View style={[styles.node,stage.unlocked?styles.nodeUnlocked:styles.nodeLocked]}><Ionicons name={stage.unlocked?'checkmark':'lock-closed'} size={16} color="#FFF" /></View>{index < progression.stages.length-1 && <View style={[styles.line,stage.unlocked?styles.lineUnlocked:styles.lineLocked]} />}</View>
          <View style={[styles.stageCard,!stage.unlocked&&styles.lockedCard]}><View style={styles.stageTop}><View style={styles.stageTitleWrap}><Text style={styles.stageIndex}>STAGE {String(index+1).padStart(2,'0')}</Text><Text style={styles.stageName}>{stage.name}</Text></View><View style={[styles.statusBadge,stage.unlocked?styles.statusUnlocked:styles.statusLocked]}><Text style={[styles.statusText,!stage.unlocked&&styles.statusTextLocked]}>{stage.status}</Text></View></View><View style={styles.stageProgressHeader}><Text style={styles.stageProgressLabel}>MASTERY PROGRESS</Text><Text style={styles.stageProgressValue}>{stage.progress}%</Text></View><View style={styles.smallTrack}><View style={[styles.smallFill,{width:`${stage.progress}%`},!stage.unlocked&&styles.lockedFill]} /></View><View style={styles.stageFooter}><Text style={styles.stagePercent}>{stage.unlocked ? 'Stage available' : 'Complete earlier requirements to unlock'}</Text><Ionicons name={stage.unlocked?'checkmark-circle-outline':'lock-closed-outline'} size={18} color={stage.unlocked?'#65A936':'#A59BA9'} /></View></View>
        </View>)}</View> : <View style={styles.emptyCard}><Ionicons name="map-outline" size={27} color="#A99DAE" /><Text style={styles.emptyTitle}>No stages recorded yet</Text><Text style={styles.emptyText}>Complete communication activities to build your roadmap.</Text></View>}

        <View style={styles.sectionHeading}><View><Text style={styles.sectionTitle}>Adaptive reinforcement</Text><Text style={styles.sectionSubtitle}>Focused retries based on repeated patterns.</Text></View><View style={styles.retryPill}><Text style={styles.retryPillText}>{progression?.reinforcement?.length || 0} RETRIES</Text></View></View>
        {progression?.reinforcement?.length ? progression.reinforcement.map((item,index) => <Pressable key={`${item.title}-${index}`} onPress={() => openRetry(item)} style={({pressed})=>[styles.reinforcementCard,pressed&&styles.pressed]}><View style={styles.retryIcon}><Ionicons name="refresh-outline" size={22} color="#D88727" /></View><View style={styles.reinforcementInfo}><Text style={styles.retryLabel}>RECOMMENDED RETRY</Text><Text style={styles.reinforcementTitle}>{item.title}</Text><Text style={styles.reinforcementMistake}>{item.mistake}</Text><View style={styles.retryAction}><Text style={styles.reinforcementRetry}>{item.retry}</Text><Ionicons name="arrow-forward-circle" size={22} color="#D88727" /></View></View></Pressable>) : <View style={styles.emptyCard}><Ionicons name="checkmark-circle-outline" size={27} color="#65A936" /><Text style={styles.emptyTitle}>No reinforcement needed</Text><Text style={styles.emptyText}>Repeated mistakes and focused retries will appear here.</Text></View>}
      </View>}
    </ScrollView>

    <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={()=>setModalVisible(false)}><Pressable style={styles.modalOverlay} onPress={()=>setModalVisible(false)}><Pressable style={styles.modalCard} onPress={e=>e.stopPropagation()}><Pressable style={styles.closeButton} onPress={()=>setModalVisible(false)}><Ionicons name="close" size={20} color="#6E6074" /></Pressable><View style={styles.modalIcon}><Ionicons name="refresh-circle-outline" size={34} color="#D88727" /></View><Text style={styles.modalEyebrow}>FOCUSED PRACTICE</Text><Text style={styles.modalTitle}>Reinforcement ready</Text><Text style={styles.modalText}>{selectedRetry?.retry}</Text><Pressable style={styles.modalButton} onPress={startRetry}><Text style={styles.modalButtonText}>Start retry</Text><Ionicons name="arrow-forward" size={18} color="#FFF" /></Pressable></Pressable></Pressable></Modal>
    <StudentBottomNav />
  </View></SafeAreaView>;
}
