import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { stylesEdit } from '../styles/stylesEdit';
import { styles } from '../styles/stylesModal';
import BackIcon from '../assets/svg/back-icon.svg';
import CustomButton from '../components/CustomButton';
import expoconfig from '../expoconfig';  
import { useRouter, useLocalSearchParams } from 'expo-router';
import stylesSlate from '../styles/StylesSlate';

const QuackslateEdit = () => {
    const { gameCode, classCode, title } = useLocalSearchParams();  
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [removeModalVisible, setRemoveModalVisible] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [wordToTranslate, setWordToTranslate] = useState('');
    const [japaneseCharacter, setJapaneseCharacter] = useState('');
    const [updatedEnglishWord, setUpdatedEnglishWord] = useState(''); // Changed from 'updatedWord' to 'updatedEnglishWord'
    const [updatedWord, setUpdatedWord] = useState('');
    const [updatedTranslatedWord, setUpdatedTranslatedWord] = useState('');
    const [selectedContentID, setSelectedContentID] = useState(null);
    const [content, setContent] = useState([]); // Store fetched content here
    const [selectedItem, setSelectedItem] = useState(null);
    const [sentenceInput, setSentenceInput] = useState('');
    const [studentsJoined, setStudentsJoined] = useState(0);
    const router = useRouter();
    const [wrongAnswer, setWrongAnswer] = useState('');
    
    // Fetch content based on the class code
    const fetchContent = async () => {
        try {
            const response = await fetch(`${expoconfig.API_URL}/api/quackslateContent/getAllQuackslateContent`);
            if (response.ok) {
                const data = await response.json();
                setContent(data.length ? data : []); // Ensure content is an array
                console.log('Fetched content:', data);
            } else {
                console.error(`Failed to fetch: ${response.status} ${response.statusText}`);
                throw new Error('Failed to fetch content');
            }
        } catch (error) {
            console.error('Error fetching content:', error);
            Alert.alert('Error', 'Failed to fetch content');
        }
    };
    

    // Example navigation code in QuackslateEdit
    const startQuiz = async () => {
        try {
            if (!gameCode) {
                console.error("GameCode is not provided. Cannot start quiz.");
                Alert.alert("Error", "Game code is missing.");
                return;
            }
    
            console.log("Starting quiz with gameCode:", gameCode);
            const response = await fetch(`${expoconfig.API_URL}/api/quackslateLevels/startQuiz/${gameCode}`, { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
    
            if (response.ok) {
                const data = await response.json();
                console.log("GameCode received from backend:", data.gameCode);
    
                Alert.alert('Success', 'Quiz started successfully!');
                
                // Navigate to QuackslateHost for the teacher
                router.push({
                    pathname: 'QuackslateHost',
                    params: { gameCode, classCode, title },
                });
               
    
                // Simulate sending the gameCode to the student side (Quackslate)
                console.log("Share this gameCode with students:", gameCode);
            } else {
                throw new Error(`Failed to start quiz: ${response.status}`);
            }
        } catch (error) {
            console.error('Error starting quiz:', error);
            Alert.alert('Error', 'Failed to start quiz');
        }
    };
    
    // Use useEffect to fetch content and students count when the component mounts
    useEffect(() => {
        fetchContent(); // Fetch content from the backend
         // Fetch students who have joined
    }, []); // Empty dependency array means this runs once when the component mounts

    const addTranslationToDatabase = async () => {
        try {
            const options = sentenceInput.trim().split(' ').filter(Boolean); // Split sentence into individual words
            
            if (options.length === 0) {
                Alert.alert('Error', 'Please enter a valid sentence to split into options.');
                return;
            }
    
            // Set the correctAnswer as the concatenation of the options
            const correctAnswer = options.join(' ');  // The correct answer is the full sentence built from options
    
            let response = await fetch(`${expoconfig.API_URL}/api/quackslateContent/addQuackslateContent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: Math.floor(Math.random() * 10000), // Random ID generation
                    englishWord: updatedEnglishWord, // Word to be translated (Japanese character)
                    translatedWord: wordToTranslate, // The English translation of the word
                    level: title, // The level title (this is passed from the frontend)
                    classCode: classCode, // The class code (this is passed from the frontend)
                    options: options, // Array of options (answers)
                    correctAnswer: correctAnswer,  // Correct answer is the full sentence made up of the options
                    wrongAnswer: wrongAnswer.trim() !== '' ? wrongAnswer : null, // Only set if provided
                }),
            });
    
            if (response.ok) {
                Alert.alert('Success', 'Content added successfully!');
                fetchContent(); // Refresh the content list after adding the content
                setAddModalVisible(false); // Close the modal after adding
                setWordToTranslate(''); // Reset the input fields
                setUpdatedEnglishWord(''); // Reset the updated word
                setSentenceInput('');
                setWrongAnswer(''); // Reset wrongAnswer
            } else {
                throw new Error('Failed to add content');
            }
        } catch (error) {
            console.error('Error adding content:', error);
            Alert.alert('Error', 'Failed to add content');
        }
    };
    

    const handleEditPress = (item) => {
        setSelectedContentID(item.id);
        setUpdatedEnglishWord(item.englishWord); // Changed from 'word' to 'englishWord'
        setUpdatedTranslatedWord(item.translatedWord);
        setWrongAnswer(item.wrongAnswer || '');
        setSentenceInput(item.options ? item.options.join(' ') : ''); // Convert options back to sentence
        setEditModalVisible(true); // Show the modal for editing
    };

    const updateContentInDatabase = async () => {
        if (!selectedContentID) return;
    
        try {
            // Ensure sentenceInput is a string and split it into words
            const options = typeof sentenceInput === 'string' ? sentenceInput.split(' ').filter(Boolean) : [];
            
            // Check if options (sentenceInput) is empty
            if (options.length === 0) {
                Alert.alert('Error', 'Please enter a valid sentence to split into options.');
                return;
            }
    
            // Build the correct answer by joining the options
            const correctAnswer = options.join(' ');  // The correct answer is the full sentence built from options
    
            // Sending the data to the backend
            let response = await fetch(`${expoconfig.API_URL}/api/quackslateContent/updateQuackslateContent/${selectedContentID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: selectedContentID,
                    englishWord: updatedEnglishWord,
                    translatedWord: updatedTranslatedWord,
                    level: title,
                    options: options,  // Set the options as individual words
                    correctAnswer: correctAnswer,  // Correct answer is the full sentence
                    wrongAnswer: wrongAnswer.trim() !== '' ? wrongAnswer : null, // Only set if provided
                }),
            });
    
            if (response.ok) {
                Alert.alert('Success', 'Content updated successfully!');
                fetchContent(); // Re-fetch content to get the latest data
                setEditModalVisible(false); // Close the modal after updating
                setUpdatedEnglishWord(''); // Clear the English word
                setUpdatedTranslatedWord(''); // Clear the translated word
                setWrongAnswer(''); // Clear the wrong answer
            } else {
                throw new Error('Failed to update content');
            }
        } catch (error) {
            console.error('Error updating content:', error);
            Alert.alert('Error', 'Failed to update content');
        }
    };
    
    // Show the list of all content items inside the remove modal for deletion
    const handleRemoveButtonPress = () => {
        setRemoveModalVisible(true); // Open the remove modal
    };

    const handleRemovePress = (item) => {
        setSelectedItem(item); // Set the item to remove
        setConfirmModalVisible(true); // Open confirmation modal
    };

    const handleConfirmRemove = async () => {
        if (!selectedItem) return;

        try {
            let response = await fetch(`${expoconfig.API_URL}/api/quackslateContent/deleteQuackslateContent/${selectedItem.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                Alert.alert('Success', 'Content removed successfully!');
                setSelectedItem(null);
                fetchContent(); // Refresh content after removing the item
                setConfirmModalVisible(false);
                setRemoveModalVisible(false);
            } else {
                throw new Error('Failed to remove content');
            }
        } catch (error) {
            console.error('Error removing content:', error);
            Alert.alert('Error', 'Failed to remove content');
        }
    };

    const handleBackPress = () => {
        router.back();
    };

    const handleAddPress = () => {
        setAddModalVisible(true);
    };

    const handleCloseModal = () => {
        setAddModalVisible(false);
        setRemoveModalVisible(false);
        setEditModalVisible(false);
        setConfirmModalVisible(false);
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={stylesEdit.header}>
                <TouchableOpacity onPress={handleBackPress}>
                    <View style={stylesEdit.backButtonContainer}>
                        <BackIcon width={20} height={20} fill={'white'} />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Game Code Display in the center */}
            <View style={stylesSlate.gameCodeContainer}>
                <Text style={stylesSlate.gameCodeText}>Game Code: {gameCode}</Text> 
            </View>

            <View style={stylesEdit.buttonContainer}>
                <CustomButton title="Start Quiz" onPress={startQuiz} buttonStyle={stylesEdit.button} textStyle={stylesEdit.buttonText} />
            </View>

            
            <View style={stylesEdit.buttonContainer}>
                <CustomButton title="Add" onPress={handleAddPress} buttonStyle={stylesEdit.button} textStyle={stylesEdit.buttonText} />
                <CustomButton title="Remove" onPress={handleRemoveButtonPress} buttonStyle={stylesEdit.button} textStyle={stylesEdit.buttonText} />
            </View>

            <ScrollView style={{ flex: 1 }}>
                {content.map((item) => (
                    <TouchableOpacity key={item.id} onPress={() => handleEditPress(item)} onLongPress={() => handleRemovePress(item)}>
                        <View style={stylesEdit.quackmaneditContent}>
                        <Text style={stylesEdit.contentText}>{item.englishWord}</Text>
                            <Text style={stylesEdit.contentText}>{item.correctAnswer}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Modal for adding new content */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={addModalVisible}
                onRequestClose={handleCloseModal}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>X</Text>
                        </TouchableOpacity>
                        <Text style={styles.text}>Add New Content</Text>
                        <TextInput
                            style={styles.input}
                            value={updatedEnglishWord}
                            onChangeText={setUpdatedEnglishWord}
                            placeholder="English Word"
                        />
                        <TextInput
                            style={styles.input}
                            value={wordToTranslate}
                            onChangeText={setWordToTranslate}
                            placeholder="Japanese Character"
                        />
                        <TextInput
                            style={styles.input}
                            value={sentenceInput}
                            onChangeText={setSentenceInput}
                            placeholder="Answer Options"
                        />
                        <TextInput
                            style={styles.input}
                            value={wrongAnswer}
                            onChangeText={setWrongAnswer}
                            placeholder="Wrong Options"
                        />

                        <CustomButton title="Add" onPress={addTranslationToDatabase} buttonStyle={styles.button} textStyle={styles.buttonText} />
                    </View>
                </View>
            </Modal>

            {/* Modal for editing content */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={editModalVisible}
                onRequestClose={handleCloseModal}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>X</Text>
                        </TouchableOpacity>
                        <Text style={styles.text}>Edit Content</Text>
                        <TextInput
                            style={styles.input}
                            value={updatedEnglishWord}
                            onChangeText={setUpdatedEnglishWord}
                            placeholder="English Word"
                        />
                        <TextInput
                            style={styles.input}
                            value={updatedTranslatedWord}
                            onChangeText={setUpdatedTranslatedWord}
                            placeholder="Japanese Translation"
                        />
                        <TextInput
                            style={styles.input}
                            value={sentenceInput}
                            onChangeText={setSentenceInput}
                            placeholder="Answer Options"
                        />
                        <TextInput
                            style={styles.input}
                            value={wrongAnswer}
                            onChangeText={setWrongAnswer}
                            placeholder="Wrong Options"
                        />
                        <CustomButton title="Update" onPress={updateContentInDatabase} buttonStyle={styles.button} textStyle={styles.buttonText} />
                    </View>
                </View>
            </Modal>

            {/* Modal for removing content */}
            <Modal
    animationType="slide"
    transparent={true}
    visible={removeModalVisible}
    onRequestClose={handleCloseModal}
>
    <View style={styles.centeredView}>
        <View style={styles.modalView}>
            <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>
            <Text style={styles.text}>Select Content to Remove</Text>
            <ScrollView 
                contentContainerStyle={stylesSlate.scrollViewContent} 
                showsVerticalScrollIndicator={true} 
            >
                {content.map((item) => (
                    <TouchableOpacity key={item.id} onPress={() => handleRemovePress(item)}>
                        <View style={stylesSlate.quackslateEditContent}>
                            <Text style={stylesEdit.contentText}>{item.englishWord}</Text>
                            <Text style={stylesEdit.contentText}>{item.translatedWord}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    </View>
</Modal>


            {/* Confirmation Modal for Deleting content */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={confirmModalVisible}
                onRequestClose={handleCloseModal}
            >
                <View style={styles.centeredView}>
                    <View style={stylesSlate.modalView}>
                        <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>X</Text>
                        </TouchableOpacity>
                        <Text style={styles.text}>Are you sure you want to delete this content?</Text>
                        <View style={styles.buttonRow}>
                        <CustomButton title="Yes" onPress={handleConfirmRemove} buttonStyle={styles.button} textStyle={styles.buttonText} />
                        <CustomButton title="No" onPress={handleCloseModal} buttonStyle={styles.button} textStyle={styles.buttonText} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default QuackslateEdit;
