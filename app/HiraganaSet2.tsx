import React, { useState, useContext } from 'react';
import { View, Text, Pressable, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import BackIcon from '../assets/svg/back-icon.svg';
import VoiceIcon from '../assets/svg/voice.svg'; // Import the voice icon SVG
import styles from '../styles/stylesHiraganaSet1'; // Adjust if styles are separate for HiraganaSet2
import CompletionModal from '../components/CompletionModal';
import { AuthContext } from '../context/AuthContext'; // Assuming you have an AuthContext
import { Audio } from 'expo-av';

const HiraganaSet2 = () => {
  const router = useRouter();
  const { user } = useContext(AuthContext); // Get the user object (which includes email)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);

  const hiraganaSet = [
    { character: 'た', romaji: 'ta', audio: require('../assets/charactersaudio/ta.mp3') },
    { character: 'ち', romaji: 'chi', audio: require('../assets/charactersaudio/chi.mp3') },
    { character: 'つ', romaji: 'tsu', audio: require('../assets/charactersaudio/tsu.mp3') },
    { character: 'て', romaji: 'te', audio: require('../assets/charactersaudio/te.mp3') },
    { character: 'と', romaji: 'to', audio: require('../assets/charactersaudio/to.mp3') },
    { character: 'な', romaji: 'na', audio: require('../assets/charactersaudio/na.mp3') },
    { character: 'に', romaji: 'ni', audio: require('../assets/charactersaudio/ni.mp3') },
    { character: 'ぬ', romaji: 'nu', audio: require('../assets/charactersaudio/nu.mp3') },
    { character: 'ね', romaji: 'ne', audio: require('../assets/charactersaudio/ne.mp3') },
    { character: 'の', romaji: 'no', audio: require('../assets/charactersaudio/no.mp3') },
    { character: 'は', romaji: 'ha', audio: require('../assets/charactersaudio/ha.mp3') },
    { character: 'ひ', romaji: 'hi', audio: require('../assets/charactersaudio/hi.mp3') },
    { character: 'ふ', romaji: 'fu', audio: require('../assets/charactersaudio/fu.mp3') },
    { character: 'へ', romaji: 'he', audio: require('../assets/charactersaudio/he.mp3') },
    { character: 'ほ', romaji: 'ho', audio: require('../assets/charactersaudio/ho.mp3') },
  ];

  const playAudio = async () => {
    const { audio } = hiraganaSet[currentIndex];
    const sound = new Audio.Sound();

    try {
      await sound.loadAsync(audio);
      await sound.setVolumeAsync(0.4); // Set volume to 40%
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const handleNextPress = () => {
    if (currentIndex < hiraganaSet.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setModalVisible(true);
    }
  };

  const handleBackPress = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleBackToMenuPress = () => {
    router.push('/HiraganaMenu');
  };

  const handleCompletePress = () => {
    setModalVisible(false);
    router.push('/CharacterExercise2'); // Navigate to the next exercise
  };

  return (
    <ImageBackground
      source={require('../assets/img/MenuBackground.png')}
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={handleBackToMenuPress}>
            <View style={styles.backButtonContainer}>
              <BackIcon width={20} height={20} fill={'white'} />
            </View>
          </Pressable>
        </View>
        <View style={styles.contentContainer}>
          {/* Play Audio Button */}
          <Pressable style={styles.audioButton} onPress={playAudio}>
            <VoiceIcon width={70} height={70} />
          </Pressable>

          {/* Character and Romaji */}
          <Text style={styles.character}>{hiraganaSet[currentIndex].character}</Text>
          <Text style={styles.romaji}>{hiraganaSet[currentIndex].romaji}</Text>

          {/* Navigation Buttons */}
          <View style={styles.buttonContainer}>
            <Pressable style={styles.backButton} onPress={handleBackPress}>
              <Text style={styles.buttonText}>Back</Text>
            </Pressable>

            <Pressable style={styles.nextButton} onPress={handleNextPress}>
              <Text style={styles.nextButtonText}>Next</Text>
            </Pressable>
          </View>
        </View>

        {/* Completion Modal */}
        <CompletionModal
          isVisible={isModalVisible}
          onComplete={handleCompletePress}
          message="Congratulations on completing the second set of Hiragana characters!"
        />
      </View>
    </ImageBackground>
  );
};

export default HiraganaSet2;
