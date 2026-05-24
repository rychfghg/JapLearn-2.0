import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Pressable, ImageBackground, Modal, Animated, Text, Button, TouchableWithoutFeedback, Image } from 'react-native';
import expoconfig from '../expoconfig';
import styles from '../styles/stylesWords';
import { AuthContext } from '../context/AuthContext';
import BackIcon from '../assets/svg/back-icon.svg'
import { useRouter } from 'expo-router';
import LessonContentEdit from './LessonContentEdit';

const WordsPractices = () => {
    const { user } = useContext(AuthContext);
    const [wordLessons, setWordLessons] = useState([]);
    const [vocabulary, setvocabulary] = useState([]);
    const [classCode, setClassCode] = useState('');
    const [lessonContent, setLessonContent] = useState([]);
    const [processedWords, setProcessedWords] = useState([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0); 
    const [idSet, setIdSet] = useState([]);
    const router = useRouter();
  
    const fetchUserClassCode = async () => {
        try {
          const response = await fetch(`${expoconfig.API_URL}/api/students/getStudentByEmail?email=${user.email}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
    
          const responseData = await response.json();
          setClassCode(responseData.classCode);
        } catch (error) {
          console.log("Error fetching user class code: ", error);
        }
      };
    
      const fetchWordLesson = async () => {
        try {
          const response = await fetch(`${expoconfig.API_URL}/api/lesson/getLessonByClass/${classCode}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
    
          const responseData = await response.json();
          setWordLessons(responseData);
          console.log(responseData);

          const ids = responseData.map((lesson)=>lesson.id);
          console.log(ids);
          setIdSet(ids);
          
        } catch (error) {
          console.log("Error fetching word lessons: ", error);
        }
      };

    useEffect(() => {
          if (user?.email) {
            fetchUserClassCode();
          }
        }, [user]);
      
    useEffect(() => {
          if (classCode) {
            fetchWordLesson();
          }
        }, [classCode]);

    const handleFetchLessonContent = async (id) => {
        try {
            const response = await fetch(`${expoconfig.API_URL}/api/lessonPage/getAllLessonPage/${id}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            });
    
            const lessonPageData = await response.json();
    
            const allLessonContent = [];
    
            for (const lessonPage of lessonPageData) {
            const content = await fetch(`${expoconfig.API_URL}/api/lessonContent/getAllLessonContentWithFiles/${lessonPage.id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });
    
            const lessonContentData = await content.json();
            allLessonContent.push(...lessonContentData);
            }
    
            setLessonContent(prevContent => [...prevContent, ...allLessonContent]);
        } catch (error) {
            console.error('Error in fetching lesson content: ', error);
        }
    };

    useEffect(() => {
        const fetchContentSequentially = async () => {
          for (const lessonId of idSet) {
            await handleFetchLessonContent(lessonId); // Await each fetch to maintain order
          }
        };
      
        if (idSet.length > 0) {
          fetchContentSequentially();
        }
      }, [idSet]);

    useEffect(() => {
        if (lessonContent.length > 0) {
            const allParsedWords = lessonContent
              .filter(item => item.text_content) // Ensure only items with text_content are processed
              .flatMap(content => 
                content.text_content
                  .match(/\(word: [^)]*\)/g) || [] // Extract individual word groups, handle null match
              )
              .map(entry => {
                const [word, romaji, translation] = entry
                  .replace(/[()]/g, '') // Remove parentheses
                  .split(', ') // Split by commas
                  .map(str => str.split(': ')[1]); // Extract value after `: `
                return { word, romaji, translation, image: require('../assets/hello.png') }; // Replace with actual image if available
              });
    
            setProcessedWords(allParsedWords);
        }
    }, [lessonContent]);

      const handleBackPress = () => {
        router.back(); // Navigate to the previous screen
      };
    
      const handleNextPress = () => {
        if (currentWordIndex < processedWords.length - 1) {
          setCurrentWordIndex(currentWordIndex + 1); // Move to the next word
        } else {
          console.log('End of word list!');
        }
      };
    
      const handlePreviousPress = () => {
        if (currentWordIndex > 0) {
          setCurrentWordIndex(currentWordIndex - 1); // Move to the previous word
        }
      };

      const handleFinishLesson = async () => {        
        router.push('/WordsMenu');
      };

    const currentWord = processedWords[currentWordIndex];

    return (
        <ImageBackground
          source={require('../assets/img/MenuBackground.png')}
          style={styles.background}
        >
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
              <Pressable onPress={handleBackPress}>
                <View style={styles.backButtonContainer}>
                  <BackIcon width={30} height={30} fill={'white'} />
                </View>
              </Pressable>
            </View>
    
            {/* Word Content */}
            {currentWord ? (
              <View style={styles.contentContainer}>
                <Image source={currentWord.image} style={styles.image} />
                <Text style={styles.japanese}>{currentWord.word}</Text>
                <Text style={styles.romaji}>{currentWord.romaji}</Text>
                <Text style={styles.english}>{currentWord.translation}</Text>
    
                {/* Navigation Buttons */}
                <View style={styles.navigationContainer}>
                  <Pressable
                    style={[
                      styles.nextButton,
                      currentWordIndex === 0 && styles.disabledButton, // Disable styling for first word
                    ]}
                    onPress={handlePreviousPress}
                    disabled={currentWordIndex === 0} // Disable button if at the first word
                  >
                    <Text style={styles.nextButtonText}>Previous</Text>
                  </Pressable>
    
                  <Pressable
                    style={styles.nextButton}
                    onPress={currentWordIndex < processedWords.length - 1 ? handleNextPress : handleFinishLesson}
                  >
                    <Text style={styles.nextButtonText}>
                      {currentWordIndex < processedWords.length - 1 ? 'Next' : 'Finish'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Text style={styles.noWordsText}>No words available!</Text>
            )}
          </View>
        </ImageBackground>
      );
    };

export default WordsPractices;