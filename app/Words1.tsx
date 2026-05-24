import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Image, Pressable, ImageBackground } from 'react-native';
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
  const vocabulary = [
    { word: "わたし", romaji: "watashi", translation: "I, me", image: require('../assets/words_image/me.png') },
    { word: "わたしたち", romaji: "watashitachi", translation: "we", image: require('../assets/words_image/we.png') },
    { word: "あなた", romaji: "anata", translation: "you", image: require('../assets/words_image/you.png') },
    { word: "あなたたち", romaji: "anatatachi", translation: "you (plural)", image: require('../assets/words_image/you_plural.png') },
    { word: "かれ", romaji: "kare", translation: "he", image: require('../assets/words_image/he.png') },
    { word: "かのじょ", romaji: "kanojo", translation: "she", image: require('../assets/words_image/she.png') },
    { word: "あのひと", romaji: "ano hito", translation: "that person", image: require('../assets/words_image/that_person.png') },
    { word: "あのかた", romaji: "ano kata", translation: "that person (polite)", image: require('../assets/words_image/that_person_polite.png') },
    { word: "ともだち", romaji: "tomodachi", translation: "friend", image: require('../assets/words_image/friend.png') },
    { word: "かぞく", romaji: "kazoku", translation: "family", image: require('../assets/words_image/family.png') },
    { word: "こども", romaji: "kodomo", translation: "child", image: require('../assets/words_image/child.png') },
    { word: "おとこのひと", romaji: "otoko no hito", translation: "man", image: require('../assets/words_image/man.png') },
    { word: "おんなのひと", romaji: "onna no hito", translation: "woman", image: require('../assets/words_image/woman.png') },
    { word: "おとこのこ", romaji: "otoko no ko", translation: "boy", image: require('../assets/words_image/boy.png') },
    { word: "おんなのこ", romaji: "onna no ko", translation: "girl", image: require('../assets/words_image/girl.png') }
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
      
    router.push('/WordsMenu?fromWords=true');

    } catch (error) {
      console.error('Error marking lesson as complete:', error);
    }
  };

  const currentWord = vocabulary[currentWordIndex];

  return (
    <ImageBackground
      source={require('../assets/img/MenuBackground.png')}
      style={styles.background}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <View style={styles.backButtonContainer}>
              <BackIcon width={30} height={30} fill={'white'} />
            </View>
          </Pressable>
        </View>

        {/* Word Content */}
        {currentWord ? (
          <View style={styles.contentContainer}>
            {/* Word Image */}
            <Image source={currentWord.image} style={styles.image} />
            <Text style={styles.japanese}>{currentWord.word}</Text>
            <Text style={styles.romaji}>{currentWord.romaji}</Text>
            <Text style={styles.english}>{currentWord.translation}</Text>

            {/* Navigation Buttons */}
            <View style={styles.navigationContainer}>
              <Pressable
                style={[styles.nextButton, currentWordIndex === 0 && styles.disabledButton]}
                onPress={handlePreviousPress}
                disabled={currentWordIndex === 0}
              >
                <Text style={styles.nextButtonText}>Previous</Text>
              </Pressable>

              <Pressable
                style={styles.nextButton}
                onPress={currentWordIndex < vocabulary.length - 1 ? handleNextPress : handleFinishLesson}
              >
                <Text style={styles.nextButtonText}>
                  {currentWordIndex < vocabulary.length - 1 ? 'Next' : 'Finish'}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Text style={styles.noWordsText}>No words available!</Text>
        )}
      </View>
    </ImageBackground>
  );
};

export default Words;
