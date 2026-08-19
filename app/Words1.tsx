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
    { word: "わたし", romaji: "watashi", translation: "I, me", image: require('../assets/words_premium/words1-me.png') },
    { word: "わたしたち", romaji: "watashitachi", translation: "we", image: require('../assets/words_premium/words1-we.png') },
    { word: "あなた", romaji: "anata", translation: "you", image: require('../assets/words_premium/words1-you.png') },
    { word: "あなたたち", romaji: "anatatachi", translation: "you (plural)", image: require('../assets/words_premium/words1-you_plural.png') },
    { word: "かれ", romaji: "kare", translation: "he", image: require('../assets/words_premium/words1-he.png') },
    { word: "かのじょ", romaji: "kanojo", translation: "she", image: require('../assets/words_premium/words1-she.png') },
    { word: "あのひと", romaji: "ano hito", translation: "that person", image: require('../assets/words_premium/words1-that_person.png') },
    { word: "あのかた", romaji: "ano kata", translation: "that person (polite)", image: require('../assets/words_premium/words1-that_person_polite.png') },
    { word: "ともだち", romaji: "tomodachi", translation: "friend", image: require('../assets/words_premium/words1-friend.png') },
    { word: "かぞく", romaji: "kazoku", translation: "family", image: require('../assets/words_premium/words1-family.png') },
    { word: "こども", romaji: "kodomo", translation: "child", image: require('../assets/words_premium/words1-child.png') },
    { word: "おとこのひと", romaji: "otoko no hito", translation: "man", image: require('../assets/words_premium/words1-man.png') },
    { word: "おんなのひと", romaji: "onna no hito", translation: "woman", image: require('../assets/words_premium/words1-woman.png') },
    { word: "おとこのこ", romaji: "otoko no ko", translation: "boy", image: require('../assets/words_premium/words1-boy.png') },
    { word: "おんなのこ", romaji: "onna no ko", translation: "girl", image: require('../assets/words_premium/words1-girl.png') }
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
      let fieldToUpdate = 'vocab1';

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
      <View style={styles.ambientCircle} />
      <View style={styles.ambientLeaf} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <View style={styles.backButtonContainer}>
              <BackIcon width={22} height={22} fill={'#552E68'} />
            </View>
          </Pressable>
          <Text style={styles.headerLabel}>PEOPLE & RELATIONSHIPS</Text>
          <View style={styles.counterPill}><Text style={styles.counterText}>{currentWordIndex + 1} / {vocabulary.length}</Text></View>
        </View>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${((currentWordIndex + 1) / vocabulary.length) * 100}%` }]} /></View>

        {/* Word Content */}
        {currentWord ? (
          <View style={styles.contentContainer}>
            <View style={styles.imageStage}>
              <View style={styles.imageAccent} /><View style={styles.imageAccentSmall} />
              <Image source={currentWord.image} style={styles.image} />
            </View>
            <View style={styles.wordContent}>
              <Text style={styles.categoryLabel}>Picture dictionary · Set 1</Text>
              <Text style={styles.japanese}>{currentWord.word}</Text>
              <Text style={styles.romaji}>{currentWord.romaji}</Text>
              <Text style={styles.english}>{currentWord.translation}</Text>

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
      <Modal visible={completionVisible} transparent animationType="fade" onRequestClose={() => setCompletionVisible(false)}>
        <View style={styles.modalBackdrop}><View style={styles.completionCard}>
          <View style={styles.completionArt}><Ionicons name="images-outline" size={42} color="#8423D9" /></View>
          <Text style={styles.completionEyebrow}>WORD SET COMPLETE</Text>
          <Text style={styles.completionTitle}>Your picture dictionary is growing!</Text>
          <Text style={styles.completionCopy}>You explored {vocabulary.length} useful words about people and relationships. Set 2 is now ready.</Text>
          <Pressable style={styles.completionButton} onPress={() => router.replace('/WordsMenu?fromWords=true')}><Text style={styles.completionButtonText}>Continue journey</Text><Ionicons name="arrow-forward" size={19} color="#FFF" /></Pressable>
        </View></View>
      </Modal>
    </ImageBackground>
  );
};

export default Words;
