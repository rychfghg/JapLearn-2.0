import { View, Pressable, ImageBackground } from 'react-native';
import React, { useContext, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import styles from '../styles/stylesExercises';
import BackIcon from '../assets/svg/back-icon.svg';
import ImageButton from '../components/ImageButton';
import { AuthContext } from '../context/AuthContext';

const Exercises = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();
  
  const [refreshKey, setRefreshKey] = useState(0); // State to force re-render on page focus

  const handleBackPress = () => {
    router.push('/Menu');
  };

  const handleButtonPress = (buttonTitle) => {
    console.log(`${buttonTitle} button pressed`);
    switch (buttonTitle) {
      case 'KANA':
        router.push('/Quackamole');
        break;
      case 'WORDS':
        router.push('/Quackman');
        break;
      case 'GRAMMAR':
        router.push('/QuackslateMenu');
        break;
      default:
        console.log('Unknown button pressed');
    }
  };

  // Refresh the page when it gains focus
  useFocusEffect(
    useCallback(() => {
      console.log('Exercises page refreshed!');
      setRefreshKey(prevKey => prevKey + 1); // Increment refreshKey to trigger re-render
    }, [])
  );

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
          {/* Add refreshKey as the key to force re-render */}
          <ImageButton
            key={`kana-button-${refreshKey}`} // Key changes to force re-render
            title="CHARACTERS"
            subtitle="KANA Exercise"
            onPress={() => handleButtonPress('KANA')}
            imageSource={require('../assets/img/kana_button.png')}
            infoContent="This exercise tests your understanding of KANA characters."
          />
          <ImageButton
            key={`words-button-${refreshKey}`} // Key changes to force re-render
            title="WORDS"
            subtitle="Japanese Words Exercise"
            onPress={() => handleButtonPress('WORDS')}
            imageSource={require('../assets/img/words_button.png')}
            infoContent="This exercise tests your understanding of basic Japanese words."
          />
          <ImageButton
            key={`grammar-button-${refreshKey}`} // Key changes to force re-render
            title="GRAMMAR"
            subtitle="Grammar Exercise"
            onPress={() => handleButtonPress('GRAMMAR')}
            imageSource={require('../assets/img/grammar_button.png')}
            infoContent="This exercise tests your understanding of basic Japanese grammar."
          />
        </View>
      </View>
    </ImageBackground>
  );
};

export default Exercises;
