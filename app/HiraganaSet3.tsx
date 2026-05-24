import React, { useState, useContext } from 'react';
import { View, Text, Pressable, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import BackIcon from '../assets/svg/back-icon.svg';
import VoiceIcon from '../assets/svg/voice.svg'; // Import the voice icon SVG
import styles from '../styles/stylesHiraganaSet1'; // Reusing styles from HiraganaSet1
import CompletionModal from '../components/CompletionModal';
import { AuthContext } from '../context/AuthContext'; // Assuming you have an AuthContext
import { Audio } from 'expo-av';

const HiraganaSet3 = () => {
  const router = useRouter();
  const { user } = useContext(AuthContext); // Get the user object (which includes email)
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);

  const hiraganaSet = [
    { character: 'ま', romaji: 'ma', audio: require('../assets/charactersaudio/ma.mp3') },
    { character: 'み', romaji: 'mi', audio: require('../assets/charactersaudio/mi.mp3') },
    { character: 'む', romaji: 'mu', audio: require('../assets/charactersaudio/mu.mp3') },
    { character: 'め', romaji: 'me', audio: require('../assets/charactersaudio/me.mp3') },
    { character: 'も', romaji: 'mo', audio: require('../assets/charactersaudio/mo.mp3') },
    { character: 'や', romaji: 'ya', audio: require('../assets/charactersaudio/ya.mp3') },
    { character: 'ゆ', romaji: 'yu', audio: require('../assets/charactersaudio/yu.mp3') },
    { character: 'よ', romaji: 'yo', audio: require('../assets/charactersaudio/yo.mp3') },
    { character: 'ら', romaji: 'ra', audio: require('../assets/charactersaudio/ra.mp3') },
    { character: 'り', romaji: 'ri', audio: require('../assets/charactersaudio/ri.mp3') },
    { character: 'る', romaji: 'ru', audio: require('../assets/charactersaudio/ru.mp3') },
    { character: 'れ', romaji: 're', audio: require('../assets/charactersaudio/re.mp3') },
    { character: 'ろ', romaji: 'ro', audio: require('../assets/charactersaudio/ro.mp3') },
    { character: 'わ', romaji: 'wa', audio: require('../assets/charactersaudio/wa.mp3') },
    { character: 'を', romaji: 'wo', audio: require('../assets/charactersaudio/wo.mp3') },
    { character: 'ん', romaji: 'n', audio: require('../assets/charactersaudio/n.mp3') },
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
    router.push('/CharacterExercise3'); // Navigate to the next exercise
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
          message="Fantastic work! You have mastered the third set of Hiragana characters!"
        />
      </View>
    </ImageBackground>
  );
};

export default HiraganaSet3;
