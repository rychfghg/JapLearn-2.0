import React, { useContext, useEffect, useRef, useState } from 'react';
import { Image, ImageBackground, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import BackIcon from '../assets/svg/back-icon.svg';
import { AuthContext } from '../context/AuthContext';
import expoconfig from '../expoconfig';
import styles from '../styles/stylesWordMenu';

const WordsMenu = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const { fromWords } = useLocalSearchParams();
  const badgeCheckCompleted = useRef(false);
  const [isBadgeVisible, setBadgeVisible] = useState(false);
  const [completedLessons, setCompletedLessons] = useState({ vocab1: false, vocab2: false, vocab3: false });

  const fetchProgress = async () => {
    if (!user?.email) return;
    try {
      const response = await fetch(`${expoconfig.API_URL}/api/progress/${user.email}`);
      const data = await response.json();
      setCompletedLessons({ vocab1: Boolean(data.vocab1), vocab2: Boolean(data.vocab2), vocab3: Boolean(data.vocab3) });
    } catch (error) {
      console.log('Error fetching progress:', error);
    }
  };

  const checkBadgeConditions = async () => {
    if (badgeCheckCompleted.current || fromWords !== 'true' || !user?.email) return;
    badgeCheckCompleted.current = true;
    try {
      const response = await fetch(`${expoconfig.API_URL}/api/progress/${user.email}`);
      const progress = await response.json();
      if (progress.vocab1 && progress.vocab2 && progress.vocab3 && !progress.badge2) {
        setBadgeVisible(true);
        await fetch(`${expoconfig.API_URL}/api/progress/${user.email}/updateField?field=badge2&value=true`, { method: 'PUT', headers: { 'Content-Type': 'application/json' } });
      }
    } catch (error) {
      console.log('Error checking badge conditions:', error);
    }
  };

  useEffect(() => { fetchProgress(); }, [user?.email]);
  useEffect(() => { checkBadgeConditions(); }, [fromWords, user?.email]);

  const doneCount = Number(completedLessons.vocab1) + Number(completedLessons.vocab2) + Number(completedLessons.vocab3);
  const isReviewUnlocked = completedLessons.vocab1 && completedLessons.vocab2 && completedLessons.vocab3;

  const LessonCard = ({ title, copy, status, image, green, locked, onPress }: any) => (
    <Pressable style={[styles.setCard, locked && styles.setCardLocked]} disabled={locked} onPress={onPress}>
      <View style={[styles.imagePanel, green && styles.imagePanelGreen]}>
        <Text style={styles.cardCharacter}>{green ? '職' : '人'}</Text><Image source={image} style={styles.cardImage} />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.cardTop}><Text style={[styles.status, status === 'COMPLETED' && styles.statusDone]}>{status}</Text><Ionicons name={status === 'COMPLETED' ? 'checkmark-circle' : locked ? 'lock-closed' : 'images-outline'} size={20} color={status === 'COMPLETED' ? '#61B936' : locked ? '#A99DAE' : '#8423D9'} /></View>
        <Text style={styles.cardTitle}>{title}</Text><Text style={styles.cardCopy}>{copy}</Text>
        <View style={styles.cardAction}><Text style={[styles.cardActionText, green && styles.cardActionGreen]}>{status === 'COMPLETED' ? 'Replay collection' : locked ? 'Complete Set 1 first' : 'Open collection'}</Text>{!locked && <Ionicons name="arrow-forward" size={16} color={green ? '#57AA31' : '#8423D9'} />}</View>
      </View>
    </Pressable>
  );

  return <ImageBackground style={styles.background}>
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}><View style={styles.heroOrb} /><View style={styles.heroOrbInner} />
        <View style={styles.header}><Pressable style={styles.backButton} onPress={() => router.push('/LearnMenu')}><BackIcon width={21} height={21} fill="#552E68" /></Pressable><Text style={styles.journeyLabel}>JAPLEARN · WORDS PATH</Text><View style={styles.bookButton}><Ionicons name="images" size={25} color="#8423D9" /></View></View>
        <View style={styles.heroCopy}><Text style={styles.eyebrow}>PICTURE DICTIONARY</Text><Text style={styles.title}>See it. Read it. Remember it.</Text><Text style={styles.subtitle}>Build useful Japanese vocabulary through visual collections.</Text></View>
        <View style={styles.collage}><View style={styles.coverPlate} /><Image source={require('../assets/words_cover/everyday-places-cover.png')} style={styles.collageImageMain} /><Image source={require('../assets/words_cover/people-relationships-cover.png')} style={styles.collageImageSmall} /><Image source={require('../assets/words_cover/school-professions-cover.png')} style={styles.collageImageAccent} /><View style={styles.wordBubble}><Text style={styles.wordBubbleText}>ことば</Text></View></View>
      </View>
      <View style={styles.body}>
        <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Your collections</Text><Text style={styles.sectionSubtitle}>Explore each illustrated word set.</Text></View><View style={styles.countPill}><Text style={styles.countText}>{doneCount} / 3 DONE</Text></View></View>
        <LessonCard title="People & Relationships" copy="Pronouns, family, friends, and people around you." status={completedLessons.vocab1 ? 'COMPLETED' : 'START HERE'} image={require('../assets/words_cover/people-relationships-cover.png')} onPress={() => router.push('/Words1')} />
        <LessonCard title="School & Professions" copy="Useful words for school, work, and everyday roles." status={completedLessons.vocab2 ? 'COMPLETED' : completedLessons.vocab1 ? 'UNLOCKED' : 'LOCKED'} image={require('../assets/words_cover/school-professions-cover.png')} green locked={!completedLessons.vocab1} onPress={() => router.push('/Words2')} />
        <LessonCard title="Everyday Places & Objects" copy="Places, belongings, and transport for everyday life." status={completedLessons.vocab3 ? 'COMPLETED' : completedLessons.vocab2 ? 'UNLOCKED' : 'LOCKED'} image={require('../assets/words_cover/everyday-places-cover.png')} locked={!completedLessons.vocab2} onPress={() => router.push('/Words3')} />
        <Pressable style={[styles.reviewCard, !isReviewUnlocked && styles.reviewCardLocked]} disabled={!isReviewUnlocked} onPress={() => router.push('/WordsPractice')}>
          <View style={styles.reviewGlow} />
          <View style={styles.reviewArtwork}>
            <View style={[styles.reviewPhoto, styles.reviewPhotoBack]}><Image source={require('../assets/words3_image/train.png')} style={styles.reviewPhotoImage} /></View>
            <View style={[styles.reviewPhoto, styles.reviewPhotoMiddle]}><Image source={require('../assets/words_premium/words2-teacher.png')} style={styles.reviewPhotoImage} /></View>
            <View style={[styles.reviewPhoto, styles.reviewPhotoFront]}><Image source={require('../assets/words_premium/words1-friend.png')} style={styles.reviewPhotoImage} /></View>
            <View style={styles.reviewSpark}><Ionicons name={isReviewUnlocked ? 'sparkles' : 'lock-closed'} size={18} color="#FFFFFF" /></View>
          </View>
          <View style={styles.reviewContent}>
            <View style={styles.reviewTop}><Text style={styles.reviewEyebrow}>{isReviewUnlocked ? 'FINAL WORDS CHECKPOINT' : 'LOCKED CHECKPOINT'}</Text><View style={[styles.reviewStatus, isReviewUnlocked && styles.reviewStatusReady]}><Text style={[styles.reviewStatusText, isReviewUnlocked && styles.reviewStatusTextReady]}>{isReviewUnlocked ? 'READY' : '3 SETS'}</Text></View></View>
            <Text style={styles.reviewTitle}>Picture Mix Review</Text>
            <Text style={styles.reviewCopy}>{isReviewUnlocked ? 'Recall words from every illustrated collection.' : 'Complete all three collections to unlock.'}</Text>
            <View style={styles.reviewAction}><Text style={styles.reviewActionText}>{isReviewUnlocked ? 'Start review' : 'Keep collecting'}</Text><View style={styles.reviewArrow}><Ionicons name={isReviewUnlocked ? 'arrow-forward' : 'lock-closed-outline'} size={16} color="#FFFFFF" /></View></View>
          </View>
        </Pressable>
      </View>
    </ScrollView>
    <Modal visible={isBadgeVisible} transparent animationType="fade" onRequestClose={() => setBadgeVisible(false)}><View style={styles.awardModal}><View style={styles.awardCard}><View style={styles.awardGlow}><Image source={require('../assets/word_badge.png')} style={styles.awardBadge} /></View><Text style={styles.awardEyebrow}>NEW MILESTONE</Text><Text style={styles.awardTitle}>Words path completed!</Text><Text style={styles.awardCopy}>You completed all three illustrated collections. Your Words badge is saved and the final Grammar stage is now unlocked.</Text><Pressable style={styles.awardButton} onPress={() => { setBadgeVisible(false); router.replace('/LearnMenu'); }}><Text style={styles.awardButtonText}>Continue to final stage</Text></Pressable></View></View></Modal>
  </ImageBackground>;
};

export default WordsMenu;
