import React, { useContext, useState } from 'react';
import { View, Text, Pressable, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import BackIcon from '../assets/svg/back-icon.svg';
import styles from '../styles/stylesHiraganaSet1'; // Reusing styles from HiraganaSet1
import CompletionModal from '../components/CompletionModal';
import { AuthContext } from '../context/AuthContext';
import expoconfig from '../expoconfig'; // Import the configuration for your backend API
import { Audio } from 'expo-av';
import VoiceIcon from '../assets/svg/voice.svg';

const KatakanaSet1 = () => {
  const { user } = useContext(AuthContext); // Get the user object (which includes email)
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);

  const katakanaSet = [
    { character: 'ア', romaji: 'a', audio: require('../assets/charactersaudio/a.mp3') },
    { character: 'イ', romaji: 'i', audio: require('../assets/charactersaudio/i.mp3') },
    { character: 'ウ', romaji: 'u', audio: require('../assets/charactersaudio/u.mp3') },
    { character: 'エ', romaji: 'e', audio: require('../assets/charactersaudio/e.mp3') },
    { character: 'オ', romaji: 'o', audio: require('../assets/charactersaudio/o.mp3') },
    { character: 'カ', romaji: 'ka', audio: require('../assets/charactersaudio/ka.mp3') },
    { character: 'キ', romaji: 'ki', audio: require('../assets/charactersaudio/ki.mp3') },
    { character: 'ク', romaji: 'ku', audio: require('../assets/charactersaudio/ku.mp3') },
    { character: 'ケ', romaji: 'ke', audio: require('../assets/charactersaudio/ke.mp3') },
    { character: 'コ', romaji: 'ko', audio: require('../assets/charactersaudio/ko.mp3') },
    { character: 'サ', romaji: 'sa', audio: require('../assets/charactersaudio/sa.mp3') },
    { character: 'シ', romaji: 'shi', audio: require('../assets/charactersaudio/shi.mp3') },
    { character: 'ス', romaji: 'su', audio: require('../assets/charactersaudio/su.mp3') },
    { character: 'セ', romaji: 'se', audio: require('../assets/charactersaudio/se.mp3') },
    { character: 'ソ', romaji: 'so', audio: require('../assets/charactersaudio/so.mp3') },
  ];

  const playAudio = async () => {
    const { audio } = katakanaSet[currentIndex];
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

  // Update backend to set 'katakana1' to true
  // const updateKatakanaProgress = async () => {
  //   if (user && user.email) {
  //     try {
  //       const response = await fetch(
  //         `${expoconfig.API_URL}/api/progress/${user.email}/updateField?field=katakana1&value=true`,
  //         {
  //           method: 'PUT',
  //           headers: {
  //             'Content-Type': 'application/json',
  //           },
  //         }
  //       );

  //       if (response.ok) {
  //         console.log("Katakana1 progress updated successfully!"); // Success message
  //       } else {
  //         const error = await response.json();
  //         console.log(error.message || "An error occurred.");
  //       }
  //     } catch (error) {
  //       console.log(`Error: ${error.message}`);
  //     }
  //   } else {
  //     console.error('No user email found.');
  //   }
  // };

  const handleNextPress = () => {
    if (currentIndex < katakanaSet.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setModalVisible(true);
    }
  };

  const handlePreviousPress = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleBackPress = () => {
    router.push("/KatakanaIntro");
  };

  const handleCompletePress = async () => {
    // Update the backend to mark Katakana1 as completed
    // await updateKatakanaProgress();

    setModalVisible(false); // Close the modal
    router.push('/CharacterExercise4'); // Navigate to the next exercise
  };

  return (
    <ImageBackground
      source={require('../assets/img/MenuBackground.png')}
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={handleBackPress}>
            <View style={styles.backButtonContainer}>
              <BackIcon width={20} height={20} fill={'white'} />
            </View>
          </Pressable>
        </View>
        <View style={styles.contentContainer}>
        <Pressable style={styles.audioButton} onPress={playAudio}>
            <VoiceIcon width={70} height={70} />
          </Pressable>
          <Text style={styles.character}>{katakanaSet[currentIndex].character}</Text>
          <Text style={styles.romaji}>{katakanaSet[currentIndex].romaji}</Text>
          <View style={styles.buttonContainer}>
            <Pressable style={styles.backButton} onPress={handlePreviousPress}>
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
          message="Congratulations on completing the first set of Katakana characters!"
        />
      </View>
    </ImageBackground>
  );
};

export default KatakanaSet1;
