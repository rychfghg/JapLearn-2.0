import React, { useState, useContext } from 'react';
import { View, Text, Pressable, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import BackIcon from '../assets/svg/back-icon.svg';
import styles from '../styles/stylesHiraganaSet1';
import CompletionModal from '../components/CompletionModal';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext
import { Audio } from 'expo-av';
import VoiceIcon from '../assets/svg/voice.svg';

const HiraganaSet1 = () => {
  const router = useRouter();
  const { user } = useContext(AuthContext); // Get the user object (which includes email)

  const hiraganaSet = [
  { character: 'あ', romaji: 'a', audio: require('../assets/charactersaudio/a.mp3') },
  { character: 'い', romaji: 'i', audio: require('../assets/charactersaudio/i.mp3') },
  { character: 'う', romaji: 'u', audio: require('../assets/charactersaudio/u.mp3') },
  { character: 'え', romaji: 'e', audio: require('../assets/charactersaudio/e.mp3') },
  { character: 'お', romaji: 'o', audio: require('../assets/charactersaudio/o.mp3') },
  { character: 'か', romaji: 'ka', audio: require('../assets/charactersaudio/ka.mp3') },
  { character: 'き', romaji: 'ki', audio: require('../assets/charactersaudio/ki.mp3') },
  { character: 'く', romaji: 'ku', audio: require('../assets/charactersaudio/ku.mp3') },
  { character: 'け', romaji: 'ke', audio: require('../assets/charactersaudio/ke.mp3') },
  { character: 'こ', romaji: 'ko', audio: require('../assets/charactersaudio/ko.mp3') },
  { character: 'さ', romaji: 'sa', audio: require('../assets/charactersaudio/sa.mp3') },
  { character: 'し', romaji: 'shi', audio: require('../assets/charactersaudio/shi.mp3') },
  { character: 'す', romaji: 'su', audio: require('../assets/charactersaudio/su.mp3') },
  { character: 'せ', romaji: 'se', audio: require('../assets/charactersaudio/se.mp3') },
  { character: 'そ', romaji: 'so', audio: require('../assets/charactersaudio/so.mp3') },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);

  const playAudio = async () => {
    const { audio } = hiraganaSet[currentIndex];
    const sound = new Audio.Sound();
  
    try {
      await sound.loadAsync(audio);
      await sound.setVolumeAsync(0.4); // Set volume to 50%
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
  

  // Function to update progress on the backend using fetch
  // const saveProgressOnBackend = async () => {
  //   if (user && user.email) {
  //     try {
  //       // Fetch the current progress for the user
  //       const response = await fetch(`${expoconfig.API_URL}/api/progress/${user.email}`);
        
  //       if (response.ok) {
  //         const progress = await response.json();
  
  //         // Check if hiragana1 is already true
  //         if (progress.hiragana1) {
  //           console.log("Progress already completed for hiragana1. Skipping update.");
  //           return; // Exit if already true
  //         }
  
  //         // If not true, update progress
  //         const updateResponse = await fetch(
  //           `${expoconfig.API_URL}/api/progress/${user.email}`,
  //           {
  //             method: 'POST',
  //             headers: {
  //               'Content-Type': 'application/json',
  //             },
  //             body: JSON.stringify({ hiragana1: true }), // Update only hiragana1
  //           }
  //         );
  
  //         if (updateResponse.ok) {
  //           console.log("Progress saved successfully!");
  //         } else {
  //           const error = await updateResponse.json();
  //           console.log(error.message || "An error occurred while updating progress.");
  //         }
  //       } else {
  //         console.log("Failed to fetch user progress.");
  //       }
  //     } catch (error) {
  //       console.log(`Error: ${error.message}`);
  //     }
  //   } else {
  //     console.error('No user email found.');
  //   }
  // };
  

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

  const handleCompletePress = () => {
    setModalVisible(false);
    router.push('/CharacterExercise1');
  };

  const handleBackToIntroPress = () => {
    router.push('/HiraganaIntro');
  };

  return (
    <ImageBackground
      source={require('../assets/img/MenuBackground.png')}
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={handleBackToIntroPress}>
            <View style={styles.backButtonContainer}>
              <BackIcon width={20} height={20} fill={'white'} />
            </View>
          </Pressable>
        </View>
        <View style={styles.contentContainer}>
        <Pressable style={styles.audioButton} onPress={playAudio}>
            <VoiceIcon width={70} height={70} />
          </Pressable>
          <Text style={styles.character}>{hiraganaSet[currentIndex].character}</Text>
          <Text style={styles.romaji}>{hiraganaSet[currentIndex].romaji}</Text>

          <View style={styles.buttonContainer}>
            <Pressable style={styles.backButton} onPress={handleBackPress}>
              <Text style={styles.buttonText}>Back</Text>
            </Pressable>

            <Pressable style={styles.nextButton} onPress={handleNextPress}>
              <Text style={styles.nextButtonText}>Next</Text>
            </Pressable>
          </View>
        </View>

        <CompletionModal
          isVisible={isModalVisible}
          onComplete={handleCompletePress}
          message="Congratulations on completing the first set of Hiragana characters!"
        />
      </View>
    </ImageBackground>
  );
};

export default HiraganaSet1;
