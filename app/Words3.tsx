import React, { useContext, useState } from 'react';
import { Image, ImageBackground, Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BackIcon from '../assets/svg/back-icon.svg';
import styles from '../styles/stylesWords';
import expoconfig from '../expoconfig';
import { AuthContext } from '../context/AuthContext';

const vocabulary = [
  { word: 'いえ', romaji: 'ie', translation: 'house', image: require('../assets/words3_image/house.png') },
  { word: 'がっこう', romaji: 'gakkou', translation: 'school', image: require('../assets/words3_image/school.png') },
  { word: 'きょうしつ', romaji: 'kyoushitsu', translation: 'classroom', image: require('../assets/words3_image/classroom.png') },
  { word: 'えき', romaji: 'eki', translation: 'station', image: require('../assets/words3_image/station.png') },
  { word: 'びょういん', romaji: 'byouin', translation: 'hospital', image: require('../assets/words3_image/hospital.png') },
  { word: 'ぎんこう', romaji: 'ginkou', translation: 'bank', image: require('../assets/words3_image/bank.png') },
  { word: 'ほん', romaji: 'hon', translation: 'book', image: require('../assets/words3_image/book.png') },
  { word: 'つくえ', romaji: 'tsukue', translation: 'desk', image: require('../assets/words3_image/desk.png') },
  { word: 'いす', romaji: 'isu', translation: 'chair', image: require('../assets/words3_image/chair.png') },
  { word: 'かばん', romaji: 'kaban', translation: 'bag', image: require('../assets/words3_image/bag.png') },
  { word: 'でんわ', romaji: 'denwa', translation: 'telephone', image: require('../assets/words3_image/phone.png') },
  { word: 'かぎ', romaji: 'kagi', translation: 'key', image: require('../assets/words3_image/key.png') },
  { word: 'くるま', romaji: 'kuruma', translation: 'car', image: require('../assets/words3_image/car.png') },
  { word: 'でんしゃ', romaji: 'densha', translation: 'train', image: require('../assets/words3_image/train.png') },
  { word: 'じてんしゃ', romaji: 'jitensha', translation: 'bicycle', image: require('../assets/words3_image/bicycle.png') },
];

export default function Words3() {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [completionVisible, setCompletionVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const current = vocabulary[index];

  const finish = async () => {
    if (!user?.email || isSaving) return;
    setCompletionVisible(true);
    setIsSaving(true);
    setSaveState('saving');
    try {
      const response = await fetch(`${expoconfig.API_URL}/api/progress/${user.email}/updateField?field=vocab3&value=true`, { method: 'PUT', headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) throw new Error(`Progress save failed (${response.status})`);
      setSaveState('saved');
    } catch (error) {
      setSaveState('error');
      console.error('Error completing Words 3:', error);
    }
    finally { setIsSaving(false); }
  };

  return <ImageBackground style={styles.background}>
    <View style={styles.ambientCircle} /><View style={styles.ambientLeaf} />
    <View style={styles.container}>
      <View style={styles.header}><Pressable onPress={() => router.back()}><View style={styles.backButtonContainer}><BackIcon width={22} height={22} fill="#552E68" /></View></Pressable><Text style={styles.headerLabel}>EVERYDAY PLACES & OBJECTS</Text><View style={styles.counterPill}><Text style={styles.counterText}>{index + 1} / {vocabulary.length}</Text></View></View>
      <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${((index + 1) / vocabulary.length) * 100}%` }]} /></View>
      <View style={styles.contentContainer}><View style={styles.imageStage}><View style={styles.imageAccent} /><View style={styles.imageAccentSmall} /><Image source={current.image} style={styles.image} /></View>
        <View style={styles.wordContent}><Text style={styles.categoryLabel}>Picture dictionary · Set 3</Text><Text style={styles.japanese}>{current.word}</Text><Text style={styles.romaji}>{current.romaji}</Text><Text style={styles.english}>{current.translation}</Text>
          <View style={styles.navigationContainer}><Pressable style={[styles.nextButton, styles.previousButton, index === 0 && styles.disabledButton]} disabled={index === 0} onPress={() => setIndex(index - 1)}><Ionicons name="arrow-back" size={17} color="#593269" /><Text style={[styles.nextButtonText, styles.previousButtonText]}>Back</Text></Pressable><Pressable style={[styles.nextButton, isSaving && styles.disabledButton]} disabled={isSaving} onPress={index < vocabulary.length - 1 ? () => setIndex(index + 1) : finish}><Text style={styles.nextButtonText}>{index < vocabulary.length - 1 ? 'Next' : isSaving ? 'Saving...' : 'Finish'}</Text><Ionicons name={index < vocabulary.length - 1 ? 'arrow-forward' : 'checkmark'} size={18} color="#FFF" /></Pressable></View>
        </View></View>
    </View>
    <Modal visible={completionVisible} transparent animationType="fade" onRequestClose={() => saveState !== 'saving' && setCompletionVisible(false)}><View style={styles.modalBackdrop}><View style={styles.completionCard}><View style={styles.completionArt}><Ionicons name={saveState === 'error' ? 'cloud-offline-outline' : saveState === 'saved' ? 'checkmark-circle-outline' : 'map-outline'} size={43} color={saveState === 'error' ? '#D95A72' : '#8423D9'} /></View><Text style={styles.completionEyebrow}>{saveState === 'error' ? 'PROGRESS NOT SAVED' : saveState === 'saved' ? 'COLLECTION COMPLETE' : 'SAVING YOUR PROGRESS'}</Text><Text style={styles.completionTitle}>{saveState === 'error' ? 'Let’s try that save again.' : saveState === 'saved' ? 'Everyday Japanese unlocked!' : 'Excellent work!'}</Text><Text style={styles.completionCopy}>{saveState === 'error' ? 'Your lesson is complete, but JapLearn could not reach the progress service. Check that the updated backend is running, then retry.' : saveState === 'saved' ? `You collected ${vocabulary.length} useful words. Your Words badge and final Grammar stage are ready.` : 'Your collection is complete. JapLearn is safely recording Word 3 before unlocking the next stage.'}</Text><Pressable style={[styles.completionButton, saveState === 'saving' && styles.disabledButton]} disabled={saveState === 'saving'} onPress={saveState === 'error' ? finish : () => router.replace('/WordsMenu?fromWords=true')}><Text style={styles.completionButtonText}>{saveState === 'error' ? 'Retry saving' : saveState === 'saving' ? 'Saving...' : 'Claim Words badge'}</Text><Ionicons name={saveState === 'error' ? 'refresh' : saveState === 'saving' ? 'cloud-upload-outline' : 'arrow-forward'} size={19} color="#FFF" /></Pressable></View></View></Modal>
  </ImageBackground>;
}
