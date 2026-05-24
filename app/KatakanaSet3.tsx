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

const KatakanaSet3 = () => {
  const { user } = useContext(AuthContext); // Get the user object (which includes email)
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalVisible, setModalVisible] = useState(false);

  const katakanaSet = [
    { character: 'マ', romaji: 'ma', audio: require('../assets/charactersaudio/ma.mp3') },
    { character: 'ミ', romaji: 'mi', audio: require('../assets/charactersaudio/mi.mp3') },
    { character: 'ム', romaji: 'mu', audio: require('../assets/charactersaudio/mu.mp3') },
    { character: 'メ', romaji: 'me', audio: require('../assets/charactersaudio/me.mp3') },
    { character: 'モ', romaji: 'mo', audio: require('../assets/charactersaudio/mo.mp3') },
    { character: 'ヤ', romaji: 'ya', audio: require('../assets/charactersaudio/ya.mp3') },
    { character: 'ユ', romaji: 'yu', audio: require('../assets/charactersaudio/yu.mp3') },
    { character: 'ヨ', romaji: 'yo', audio: require('../assets/charactersaudio/yo.mp3') },
    { character: 'ラ', romaji: 'ra', audio: require('../assets/charactersaudio/ra.mp3') },
    { character: 'リ', romaji: 'ri', audio: require('../assets/charactersaudio/ri.mp3') },
    { character: 'ル', romaji: 'ru', audio: require('../assets/charactersaudio/ru.mp3') },
    { character: 'レ', romaji: 're', audio: require('../assets/charactersaudio/re.mp3') },
    { character: 'ロ', romaji: 'ro', audio: require('../assets/charactersaudio/ro.mp3') },
    { character: 'ワ', romaji: 'wa', audio: require('../assets/charactersaudio/wa.mp3') },
    { character: 'ヲ', romaji: 'wo', audio: require('../assets/charactersaudio/wo.mp3') },
    { character: 'ン', romaji: 'n', audio: require('../assets/charactersaudio/n.mp3') },
  ];

  const playAudio = async () => {
    const { audio } = katakanaSet[currentIndex];
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

  // Update backend to set 'katakana3' to true
  // const updateKatakanaProgress = async () => {
  //   if (user && user.email) {
  //     try {
  //       const response = await fetch(
  //         `${expoconfig.API_URL}/api/progress/${user.email}/updateField?field=katakana3&value=true`,
  //         {
  //           method: 'PUT',
  //           headers: {
  //             'Content-Type': 'application/json',
  //           },
  //         }
  //       );

  //       if (response.ok) {
  //         console.log("Katakana3 progress updated successfully!"); // Success message
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

  const handleBackPress = () => {
    router.push("/KatakanaMenu");
  };
  const handlePreviousPress = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  const handleCompletePress = async () => {
    // Update the backend to mark Katakana3 as completed
    // await updateKatakanaProgress();

    setModalVisible(false); // Close the modal
    router.push('/CharacterExercise6'); // Navigate to the next exercise
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

        <CompletionModal
          isVisible={isModalVisible}
          onComplete={handleCompletePress}
          message="Fantastic work! You have mastered the third set of Katakana characters!"
        />
      </View>
    </ImageBackground>
  );
};

export default KatakanaSet3;
