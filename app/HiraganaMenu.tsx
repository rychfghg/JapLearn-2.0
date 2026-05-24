import React, { useState, useEffect, useContext } from 'react';
import { View, Pressable, ImageBackground, Text, Modal, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';
import styles from '../styles/stylesLearnMenu';
import BackIcon from '../assets/svg/back-icon.svg';
import ImageButton from '../components/ImageButton';
import { AuthContext } from '../context/AuthContext'; // Assuming you have an AuthContext
import expoconfig from '../expoconfig'; // Configuration for your backend API
import CustomButton from '../components/CustomButton';


const HiraganaMenu = () => {
  const { user } = useContext(AuthContext); // Access user data (including email)
  const [completedLessons, setCompletedLessons] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility
  const router = useRouter();

  useEffect(() => {
    // Fetch the student's progress when the component is mounted
    const fetchProgress = async () => {
      if (user && user.email) {
        try {
          const response = await fetch(`${expoconfig.API_URL}/api/progress/${user.email}`);
          const data = await response.json();

          if (response.ok) {
            // Set the completed lessons based on the progress
            setCompletedLessons({
              basics1: data.hiragana1,
              basics2: data.hiragana2,
              basics3: data.hiragana3,
            });
            if (!data.hiragana1) {
              setIsModalVisible(true);
            }
          } else {
            console.error('No progress record found for this email.');
          } 
        } catch (error) {
          console.error('Error. No progress record found for this email.');
          
        }
      }
    };

    fetchProgress();
  }, [user]); // Rerun the effect if the user changes

  const handleBackPress = () => {
    router.push("/KanaMenu");
  };

  const handleButtonPress = (buttonTitle) => {
    if (buttonTitle === 'Hiragana Basics 1') {
      router.push('/HiraganaSet1');
    } else if (buttonTitle === 'Hiragana Basics 2' && completedLessons.basics1) {
      router.push('/HiraganaSet2');
    } else if (buttonTitle === 'Hiragana Basics 3' && completedLessons.basics2) {
      router.push('/HiraganaSet3');
    }
  };

  const closeModal = () => {
    setIsModalVisible(false);
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
          {/* Hiragana Basics 1 */}
          <ImageButton
            title="Hiragana Basics 1"
            subtitle="Learn the first set of Hiragana characters"
            onPress={() => handleButtonPress('Hiragana Basics 1')}
            imageSource={require('../assets/img/kana_button.png')}
            infoContent="This lesson introduces the first set of Hiragana characters."
          />

          {/* Hiragana Basics 2 - Disabled if Basics 1 is not completed */}
          <ImageButton
            title="Hiragana Basics 2"
            subtitle="Continue learning Hiragana characters"
            onPress={() => handleButtonPress('Hiragana Basics 2')}
            imageSource={require('../assets/img/kana_button.png')}
            infoContent="This lesson covers the next set of Hiragana characters."
            buttonStyle={!completedLessons.basics1 ? [styles.disabledButton] : null}
            textStyle={!completedLessons.basics1 ? [styles.disabledText] : null}
            disabled={!completedLessons.basics1}
          />

          {/* Hiragana Basics 3 - Disabled if Basics 2 is not completed */}
          <ImageButton
            title="Hiragana Basics 3"
            subtitle="Master the remaining Hiragana characters"
            onPress={() => handleButtonPress('Hiragana Basics 3')}
            imageSource={require('../assets/img/kana_button.png')}
            infoContent="This lesson completes your Hiragana learning journey."
            buttonStyle={!completedLessons.basics2 ? [styles.disabledButton] : null}
            textStyle={!completedLessons.basics2 ? [styles.disabledText] : null}
            disabled={!completedLessons.basics2}
          />
        </View>

        {/* Modal for Introduction */}
        <Modal
          visible={isModalVisible}
          transparent={true}
          animationType="slide"
        >
          <View style={modalStyles.modalBackground}>
            <View style={modalStyles.modalContainer}>
            <Text style={modalStyles.modalTitle}>Welcome to Hiragana</Text>
<Text style={modalStyles.modalText}>
  Hiragana is one of the three writing systems used in Japanese, alongside Katakana and Kanji. It is a phonetic script, where each character represents a sound. Hiragana is primarily used to write native Japanese words and grammatical elements.
  {"\n\n"}
  Why learn Hiragana?
  {"\n"}• It is the foundation of the Japanese writing system.
  {"\n"}• It helps you understand pronunciation and grammatical structure.
  {"\n"}• It allows you to write Japanese even if you don’t know Kanji.
  {"\n\n"}
  Hiragana has 46 basic characters, such as あ (a), い (i), う (u), え (e), and お (o). It is essential for writing verbs, particles, and adjectives, and appears frequently in children’s books and beginner materials. 
  {"\n\n"}
  Mastering Hiragana is your first step to reading, writing, and understanding Japanese. Let’s get started!
</Text>
<CustomButton title="Got it!" onPress={closeModal} buttonStyle={modalStyles.buttonStyle} 
        textStyle={modalStyles.buttonTextStyle}  />

            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
};

// Styles for the modal
const modalStyles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 28, // Increased size for emphasis
    fontWeight: 'bold',
    marginBottom: 20, // Added space below the title
    fontFamily: 'Jua', // Consistent font
    textAlign: 'center', // Center the title
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Jua',
  },
  buttonStyle: {
    backgroundColor: '#4CAF50', // Green color matching your app
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonTextStyle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Jua',
  },
});

export default HiraganaMenu;
