import { View, Pressable, ImageBackground, ScrollView } from 'react-native';
import React, { useContext, useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import styles from '../styles/stylesExercises';
import BackIcon from '../assets/svg/back-icon.svg';
import ImageButton from '../components/ImageButton';
import { AuthContext } from '../context/AuthContext';

const Exercises = () => {
  const { user } = useContext(AuthContext);
  const router = useRouter();

  const [refreshKey, setRefreshKey] = useState(0);

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
      case 'SITUATIONAL':
      router.push('/QuackSituate');
      break;
      case 'INTERACTIVE RESPONSE':
        //alert('QuackResponse module coming soon!');
        router.push('/QuackResponse');
        break;
      case 'QUACKPROGRESS':
        alert('QuackProgress module coming soon!');
        break;
      case 'QUACKTALK':
        router.push('/QuackTalk');
        break;
      default:
        console.log('Unknown button pressed');
    }
  };

  useFocusEffect(
    useCallback(() => {
      console.log('Exercises page refreshed!');
      setRefreshKey(prevKey => prevKey + 1);
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

<ScrollView
  style={{ flex: 1, width: '100%' }}
  contentContainerStyle={{
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 80,
  }}
  showsVerticalScrollIndicator={false}
>
          <ImageButton
            key={`kana-button-${refreshKey}`}
            title="CHARACTERS"
            subtitle="KANA Exercise"
            onPress={() => handleButtonPress('KANA')}
            imageSource={require('../assets/img/kana_button.png')}
            infoContent="This exercise tests your understanding of KANA characters."
          />

          <ImageButton
            key={`words-button-${refreshKey}`}
            title="WORDS"
            subtitle="Japanese Words Exercise"
            onPress={() => handleButtonPress('WORDS')}
            imageSource={require('../assets/img/words_button.png')}
            infoContent="This exercise tests your understanding of basic Japanese words."
          />

          <ImageButton
            key={`grammar-button-${refreshKey}`}
            title="GRAMMAR"
            subtitle="Grammar Exercise"
            onPress={() => handleButtonPress('GRAMMAR')}
            imageSource={require('../assets/img/grammar_button.png')}
            infoContent="This exercise tests your understanding of basic Japanese grammar."
          />

          <ImageButton
            key={`situate-button-${refreshKey}`}
            title="SITUATIONAL"
            subtitle="Situational Communication"
            onPress={() => handleButtonPress('SITUATIONAL')}
            imageSource={require('../assets/img/kana_button.png')}
            infoContent="Practice situational Japanese communication."
          />

          <ImageButton
            key={`response-button-${refreshKey}`}
            title="INTERACTIVE RESPONSE"
            subtitle="Response Activities"
            onPress={() => handleButtonPress('INTERACTIVE RESPONSE')}
            imageSource={require('../assets/img/words_button.png')}
            infoContent="Practice selecting appropriate Japanese responses."
          />

          <ImageButton
            key={`progress-button-${refreshKey}`}
            title="QUACKPROGRESS"
            subtitle="Progress Tracking"
            onPress={() => handleButtonPress('QUACKPROGRESS')}
            imageSource={require('../assets/img/grammar_button.png')}
            infoContent="Track learner progress and reinforcement."
          />

          <ImageButton
            key={`talk-button-${refreshKey}`}
            title="QUACKTALK"
            subtitle="Guided Conversation"
            onPress={() => handleButtonPress('QUACKTALK')}
            imageSource={require('../assets/img/kana_button.png')}
            infoContent="Practice guided Japanese conversation."
          />
        </ScrollView>
      </View>
    </ImageBackground>
  );
};

export default Exercises;