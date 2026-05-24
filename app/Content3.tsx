import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableWithoutFeedback, ImageBackground, Image, Dimensions, Pressable, Animated } from 'react-native';
import { styles } from '../styles/content3Styles';
import Game3 from './Game3'; // Import Game3 component
import talk from '../assets/talk.png';
import hello from '../assets/hello.png';
import idle from '../assets/idle.png';
import thinking from '../assets/thinking.png';
import katana from '../assets/Idle_Katana.png';
import surprised from '../assets/Surprised.png';
import lost from '../assets/Crying.png';
import { useRouter } from 'expo-router';
import BackIcon from '../assets/svg/back-icon.svg'; // Import the Back Icon
import expoconfig from '../expoconfig'; // Assuming you have API URL configuration
import { AuthContext } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const dialogues = [
  { character: 'Ahiru-san', text: 'Welcome to Japanese grammar! Today we are going to learn about basic sentence structures.', image: hello },
  { character: 'Ahiru-san', text: 'In Japanese, the basic sentence order is Subject-Object-Verb. For example, "I eat sushi" would be "Watashi wa sushi wo tabemasu." (Subject: "Watashi", Object: "sushi", Verb: "tabemasu")', image: talk },
  { character: 'Ahiru-san', text: 'It\'s important to remember the particle "wa". It helps indicate the subject in the sentence.', image: surprised },
  { character: 'Ahiru-san', text: 'The particle "desu" makes the sentence polite and is equivalent to the be-verbs "is", "am", and "are".', image: talk },
  { character: 'Ahiru-san', text: 'Here\'s an example: Watashi wa Yuki desu (I am Yuki)', image: thinking },
  { character: 'Ahiru-san', text: 'Let\'s learn about some other important particles.', image: idle },
  { character: 'Ahiru-san', text: 'The particle "ja arimasen" is the present negative form of desu and is equivalent to "is not", "am not" and "are not".', image: thinking },
  { character: 'Ahiru-san', text: 'The particle "deshita" is the past affirmative form of desu and is equivalent to "was" and "were".', image: idle },
  { character: 'Ahiru-san', text: 'The particle "mo" replaces particle "wa" and is used to mean "too" or "also" in English."', image: thinking },
  { character: 'Ahiru-san', text: 'For example: Suzuki san mo enjinia desu (Mr. Suzuki is also an engineer)', image: talk },
  { character: 'Ahiru-san', text: 'The particle "no" indicates possession. It is equivalent to "of" or "apostrophe s" in English.', image: talk },
  { character: 'Ahiru-san', text: 'An example of this is: CIT no sensei (teacher of CIT)', image: idle },
  { character: 'Ahiru-san', text: 'Great job! Now you know some of the basic particles and the sentence order in Japanese.', image: hello },
  { character: 'Ahiru-san', text: 'Are you ready for our adventure?!', image: katana },
  { character: 'Ahiru-san', text: 'Great! Ikimashou!', image: katana }
];

const cinematicScenes = [
  'Ahiru-san begins his journey in the deep, green forest.',
  'With determination, he walks deeper into the forest, the canopy thickening above him.',
  'As he progresses, he encounters a big problem....'
];

const postCinematicDialogues = [
  { character: 'Ahiru-san', text: 'Oh no! There\'s an enemy!', image: lost },
  { character: 'Ahiru-san', text: 'Can you help me defeat it?', image: lost } // Trigger Game3 after this dialogue
];

const finalDialogue = {
  character: 'Ahiru-san',
  text: 'Thank you for guiding me through the forest! You\'ve done a great job!',
  image: hello
};

const Content3 = () => {
  const { user } = useContext(AuthContext);
  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [cinematicIndex, setCinematicIndex] = useState(0);
  const [isCinematic, setIsCinematic] = useState(false);
  const [postCinematicIndex, setPostCinematicIndex] = useState(0);
  const [isPostCinematic, setIsPostCinematic] = useState(false);
  const [isFinalDialogue, setIsFinalDialogue] = useState(false); // State to show the final dialogue
  const [showGame3, setShowGame3] = useState(false); // State to conditionally render Game3
  const [showFinishOverlay, setShowFinishOverlay] = useState(false); // Show overlay after final dialogue

  const [shakeAnim] = useState(new Animated.Value(0)); // Animation value for shaking

  const router = useRouter();

  const handleBackPress = () => {
    router.back(); // Navigate to the previous screen
  };

  const nextDialogue = () => {
    if (currentDialogueIndex < dialogues.length - 1) {
      setCurrentDialogueIndex(currentDialogueIndex + 1);
    } else {
      setIsCinematic(true);
    }
  };

  const nextCinematic = () => {
    if (cinematicIndex < cinematicScenes.length - 1) {
      setCinematicIndex(cinematicIndex + 1);
    } else {
      setIsCinematic(false);
      setIsPostCinematic(true);
    }
  };

  const nextPostCinematicDialogue = () => {
    if (postCinematicIndex < postCinematicDialogues.length - 1) {
      setPostCinematicIndex(postCinematicIndex + 1);
    } else {
      // Show Game3 after the last post-cinematic dialogue
      setIsPostCinematic(false);
      setShowGame3(true);
    }
  };

  const handleGameOver = () => {
    // Show the final dialogue after Game3 ends
    setShowGame3(false);
    setIsFinalDialogue(true);
  };

  const handleFinalClick = async () => {

    setShowFinishOverlay(true);

    try {
      // Fetch current sentence progress from the backend
      console.log('Checking current sentence progress...');
      const response = await fetch(`${expoconfig.API_URL}/api/progress/${user.email}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      // Handle error in fetching progress
      if (!response.ok) {
        console.log('Failed to fetch sentence progress', response.statusText);
        return;
      }
  
      const data = await response.json();
      console.log('Current Sentence Progress Data:', data);
  
      // Check if the progress is already set to true
      if (data && data.sentence === true) {
        console.log('Sentence progress is already true, skipping update.');
        router.push({ pathname: '/LearnMenu', params: { fromContent3: 'true' } });
        return;
      }
  
      // If not set to true, proceed with the update
      console.log('Updating sentence progress...');
      const updateResponse = await fetch(
        `${expoconfig.API_URL}/api/progress/${user.email}/updateField?field=sentence&value=true`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      const updateData = await updateResponse.json();
      console.log('Update Response Data:', updateData);
  
      if (updateResponse.ok && updateData.success) {
        router.push({ pathname: '/LearnMenu', params: { fromContent3: 'true' } });
      } else {
        console.log('Failed to update sentence progress', updateData);
      }
    } catch (error) {
      console.log('Error while checking and updating sentence progress:', error);
    }
  };
  
  
  const { character, text, image } = dialogues[currentDialogueIndex];
  const postCinematic = postCinematicDialogues[postCinematicIndex];

  const backgroundSource = isFinalDialogue
    ? require('../assets/forest3.png')
    : isCinematic
    ? require('../assets/forest2.png')
    : isPostCinematic
    ? require('../assets/forest.jpg')
    : require('../assets/background.png');

  // Shake animation logic
  const shake = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.delay(800), // Add delay to make the interval 1.5 seconds (1500 ms total)
      ])
    ).start();
  };

  useEffect(() => {
    if (isPostCinematic) {
      shake(); // Trigger the shake animation when postCinematic is true
    }
  }, [isPostCinematic]);

  if (showGame3) {
    // Render Game3 when it's time and pass the handleGameOver callback
    return <Game3 onGameOver={handleGameOver} />;
  }

  return (
    <TouchableWithoutFeedback
      onPress={
        isCinematic
          ? nextCinematic
          : isPostCinematic
          ? nextPostCinematicDialogue
          : isFinalDialogue || showFinishOverlay
          ? handleFinalClick
          : nextDialogue
      }
    >
      <View style={styles.container}>
        <ImageBackground source={backgroundSource} style={styles.background} resizeMode="cover">
          {/* Back Button */}
          <Pressable style={styles.backButton} onPress={handleBackPress}>
            <BackIcon width={20} height={20} fill="white" />
          </Pressable>

          {/* Dialogue Content */}
          {!isCinematic && !isPostCinematic && !isFinalDialogue ? (
            <>
              <Image source={image} style={[styles.characterImage, { width: width * 0.8, height: height * 0.4 }]} />
              <View style={styles.characterContainer}>
                <Text style={styles.character}>{character}</Text>
              </View>
              <View style={[styles.dialogueContainer, { width: width * 0.9 }]} >
                <Text style={styles.dialogue}>{text}</Text>
              </View>
            </>
          ) : isCinematic ? (
            <View style={styles.cinematicContainer}>
              <Text style={styles.cinematicText}>{cinematicScenes[cinematicIndex]}</Text>
            </View>
          ) : isPostCinematic ? (
            <>
              <Animated.Image
                source={postCinematic.image}
                style={[
                  styles.characterImage,
                  { transform: [{ translateX: shakeAnim }] }, // Apply shake animation here
                ]}
              />
              <View style={styles.characterContainer}>
                <Text style={styles.character}>{postCinematic.character}</Text>
              </View>
              <View style={styles.dialogueContainer}>
                <Text style={styles.dialogue}>{postCinematic.text}</Text>
              </View>
            </>
          ) : isFinalDialogue ? (
            <>
              <Image source={finalDialogue.image} style={[styles.characterImage, { width: width * 0.8, height: height * 0.4 }]} />
              <View style={styles.characterContainer}>
                <Text style={styles.character}>{finalDialogue.character}</Text>
              </View>
              <View style={[styles.dialogueContainer, { width: width * 0.9 }]} >
                <Text style={styles.dialogue}>{finalDialogue.text}</Text>
              </View>
            </>
          ) : null}

          {/* Dark Overlay with "Finish..." */}
          {showFinishOverlay && (
            <TouchableWithoutFeedback onPress={handleFinalClick}>
              <View style={styles.overlay}>
                <Text style={styles.finishText}>Finish...</Text>
              </View>
            </TouchableWithoutFeedback>
          )}
        </ImageBackground>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Content3;
