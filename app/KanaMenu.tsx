import React, { useState, useEffect, useContext } from 'react';
import { View, Pressable, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import styles from '../styles/stylesWordMenu';
import BackIcon from '../assets/svg/back-icon.svg';
import ImageButton from '../components/ImageButton';
import expoconfig from '../expoconfig'; // Import your backend API configuration
import { AuthContext } from '../context/AuthContext';


const KanaMenu = () => {
  const router = useRouter();
  const { user } = useContext(AuthContext);
  const [completedLessons, setCompletedLessons] = useState({
    hiragana1: false,
    hiragana2: false,
    hiragana3: false,
  });

  // Fetch lesson progress from the backend (you can change the endpoint based on your API)
  const fetchLessonProgress = async () => {
    try {
      const response = await fetch(`${expoconfig.API_URL}/api/progress/${user.email}`);
      const data = await response.json();
      if (response.ok) {
        // Update the lesson completion status based on the backend data
        setCompletedLessons({
          hiragana1: data.hiragana1,
          hiragana2: data.hiragana2,
          hiragana3: data.hiragana3,
        });
      } else {
        console.error('Failed to fetch lesson progress');
      }
    } catch (error) {
      console.error('Error fetching lesson progress:', error);
    }
  };

  useEffect(() => {
    fetchLessonProgress();
  }, []);

  const handleBackPress = () => {
    router.push("/LearnMenu");
  };

  const handleButtonPress = (buttonTitle) => {
    switch (buttonTitle) {
      case 'Hiragana':
        router.push('/HiraganaMenu');
        break;
      case 'Katakana':
        if (completedLessons.hiragana1 && completedLessons.hiragana2 && completedLessons.hiragana3) {
          router.push('/KatakanaMenu'); // Only proceed if all Hiragana lessons are complete
        } else {
          console.log('Hiragana lessons are not completed yet.');
        }
        break;
      default:
        console.log(`${buttonTitle} button pressed`);
    }
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
        <View style={styles.menuContainer}>
          {/* Hiragana Button */}
          <ImageButton
            title="Hiragana"
            subtitle="Learn Hiragana characters"
            onPress={() => handleButtonPress('Hiragana')}
            imageSource={require('../assets/img/kana_button.png')}
            infoContent="This lesson introduces you to Hiragana characters."
          />

          {/* Katakana Button - Disabled if any Hiragana lessons are not completed */}
          <ImageButton
            title="Katakana"
            subtitle="Learn Katakana characters"
            onPress={() => handleButtonPress('Katakana')}
            imageSource={require('../assets/img/kana_button.png')}
            infoContent="This lesson introduces you to Katakana characters."
            buttonStyle={
              !(completedLessons.hiragana1 && completedLessons.hiragana2 && completedLessons.hiragana3)
                ? styles.disabledButton
                : null
            }
            textStyle={
              !(completedLessons.hiragana1 && completedLessons.hiragana2 && completedLessons.hiragana3)
                ? styles.disabledText
                : null
            }
            disabled={!(completedLessons.hiragana1 && completedLessons.hiragana2 && completedLessons.hiragana3)}
          />
        </View>
      </View>
    </ImageBackground>
  );
};

export default KanaMenu;
