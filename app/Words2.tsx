import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, Pressable, ImageBackground, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import BackIcon from '../assets/svg/back-icon.svg';
import styles from '../styles/stylesWords';
import expoconfig from '../expoconfig';
import { AuthContext } from '../context/AuthContext';


const Words = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  const [processedWords, setProcessedWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0); // Current word index
  const [completionVisible, setCompletionVisible] = useState(false);
  const vocabulary = [
    { word: "きょうし", romaji: "kyoushi", translation: "teacher, instructor", image: require('../assets/words_premium/words2-teacher.png') },
    { word: "せんせい", romaji: "sensei", translation: "teacher, instructor (as an address)", image: require('../assets/words_premium/words2-teacher_address.png') },
    { word: "がくせい", romaji: "gakusei", translation: "student", image: require('../assets/words_premium/words2-student.png') },
    { word: "りゅうがくせい", romaji: "ryuugakusei", translation: "foreign student", image: require('../assets/words_premium/words2-foreign_student.png') },
    { word: "けんきゅうしゃ", romaji: "kenkyuusha", translation: "researcher, scholar" , image: require('../assets/words_premium/words2-research.png')},
    { word: "ぎんこういん", romaji: "ginkouin", translation: "bank employee", image: require('../assets/words_premium/words2-bank.png') },
    { word: "エンジニア", romaji: "enjinia", translation: "engineer", image: require('../assets/words_premium/words2-engineer.png') },
    { word: "いしゃ", romaji: "isha", translation: "medical doctor", image: require('../assets/words_premium/words2-doctor.png') },
    { word: "はいしゃ", romaji: "haisha", translation: "dentist", image: require('../assets/words_premium/words2-dentist.png') },
    { word: "べんごし", romaji: "bengoshi", translation: "lawyer", image: require('../assets/words_premium/words2-lawyer.png') },
    { word: "とこや", romaji: "tokoya", translation: "barber", image: require('../assets/words_premium/words2-barber.png') },
    { word: "かいしゃいん", romaji: "kaishain", translation: "company employee" , image: require('../assets/words_premium/words2-employee.png')},
    { word: "~しゃいん", romaji: "~shain", translation: "employee of ~" , image: require('../assets/words_premium/words2-employee_of.png')}
  ];

  const handleBackPress = () => {
    router.back(); // Navigate to the previous screen
  };

  const handleNextPress = () => {
    if (currentWordIndex < vocabulary.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1); // Move to the next word
    } else {
      console.log('End of word list!');
    }
  };

  const handlePreviousPress = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1); // Move to the previous word
    }
  };

  const handleFinishLesson = async () => {
    console.log('Finishing lesson');

    if (!user?.email) return;

    try {
      // Determine the field to update based on the lessonId (vocab1)
      let fieldToUpdate = 'vocab2';

      // Update the field using the API
      const response = await fetch(`${expoconfig.API_URL}/api/progress/${user.email}/updateField?field=${fieldToUpdate}&value=true`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log(`${fieldToUpdate} updated successfully!`);
      } else {
        console.error(`Failed to update ${fieldToUpdate}`);
      }

      // Redirect to WordsMenu after updating the progress
      
    setCompletionVisible(true);

    } catch (error) {
      console.error('Error marking lesson as complete:', error);
    }
  };

  const currentWord = vocabulary[currentWordIndex];

  return (
    <ImageBackground style={styles.background}>
      <View style={styles.ambientCircle} /><View style={styles.ambientLeaf} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <View style={styles.backButtonContainer}>
              <BackIcon width={22} height={22} fill={'#552E68'} />
            </View>
          </Pressable>
          <Text style={styles.headerLabel}>SCHOOL & PROFESSIONS</Text>
          <View style={styles.counterPill}><Text style={styles.counterText}>{currentWordIndex + 1} / {vocabulary.length}</Text></View>
        </View>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${((currentWordIndex + 1) / vocabulary.length) * 100}%` }]} /></View>

        {/* Word Content */}
        {currentWord ? (
          <View style={styles.contentContainer}>
            {/* Word Image */}
            <View style={styles.imageStage}><View style={styles.imageAccent} /><View style={styles.imageAccentSmall} /><Image source={currentWord.image} style={styles.image} /></View>
            <View style={styles.wordContent}>
            <Text style={styles.categoryLabel}>Picture dictionary · Set 2</Text>
            <Text style={styles.japanese}>{currentWord.word}</Text><Text style={styles.romaji}>{currentWord.romaji}</Text><Text style={styles.english}>{currentWord.translation}</Text>

            {/* Navigation Buttons */}
            <View style={styles.navigationContainer}>
              <Pressable
                style={[styles.nextButton, styles.previousButton, currentWordIndex === 0 && styles.disabledButton]}
                onPress={handlePreviousPress}
                disabled={currentWordIndex === 0}
              >
                <Ionicons name="arrow-back" size={17} color="#593269" /><Text style={[styles.nextButtonText, styles.previousButtonText]}>Back</Text>
              </Pressable>

              <Pressable
                style={styles.nextButton}
                onPress={currentWordIndex < vocabulary.length - 1 ? handleNextPress : handleFinishLesson}
              >
                <Text style={styles.nextButtonText}>
                  {currentWordIndex < vocabulary.length - 1 ? 'Next' : 'Finish'}
                </Text>
                <Ionicons name={currentWordIndex < vocabulary.length - 1 ? 'arrow-forward' : 'checkmark'} size={18} color="#FFF" />
              </Pressable>
            </View>
            </View>
          </View>
        ) : (
          <Text style={styles.noWordsText}>No words available!</Text>
        )}
      </View>
      <Modal visible={completionVisible} transparent animationType="fade" onRequestClose={() => setCompletionVisible(false)}><View style={styles.modalBackdrop}><View style={styles.completionCard}>
        <View style={styles.completionArt}><Ionicons name="ribbon-outline" size={43} color="#8423D9" /></View>
        <Text style={styles.completionEyebrow}>WORDS PATH COMPLETE</Text><Text style={styles.completionTitle}>A new milestone is yours!</Text>
        <Text style={styles.completionCopy}>You finished both illustrated word collections. Your Words progress and badge have been saved.</Text>
        <Pressable style={styles.completionButton} onPress={() => router.replace('/WordsMenu?fromWords=true')}><Text style={styles.completionButtonText}>View my milestone</Text><Ionicons name="arrow-forward" size={19} color="#FFF" /></Pressable>
      </View></View></Modal>
    </ImageBackground>
  );
};

export default Words;
