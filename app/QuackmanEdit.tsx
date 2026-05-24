import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { stylesEdit } from '../styles/stylesEdit';
import { styles } from '../styles/stylesModal';
import BackIcon from '../assets/svg/back-icon.svg';
import CustomButton from '../components/CustomButton';
import {useRouter, useLocalSearchParams } from 'expo-router';
 
const QuackmanEdit = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [removeModalVisible, setRemoveModalVisible] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [word, setWord] = useState('');
    const [hint, setHint] = useState('');
    const [editWord, setEditWord] = useState('');
    const [editHint, setEditHint] = useState('');
    const [content, setContent] = useState([]);
    const [selectedContentId, setSelectedContentId] = useState(null);
    const [selectedWordIndex, setSelectedWordIndex] = useState(null);
    const { classCode, levelId } = useLocalSearchParams();
    const router = useRouter();
 
    useEffect(() => {
        fetchContent();
    }, []);
 
    const fetchContent = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/quackmancontent/getContentByLevelId/${levelId}`);
            const responseText = await response.text();
 
            if (response.ok) {
                if (responseText) {
                    const data = JSON.parse(responseText);
                    setContent([data]);
                } else {
                    console.warn("Response was empty, creating a content");
                    await createNewContent();
                }
            } else {
                console.error('Failed to fetch content:', responseText);
                Alert.alert('Error', 'Failed to fetch content');
            }
        } catch (error) {
            console.error('Error fetching content:', error);
            Alert.alert('Error', 'Failed to fetch content');
        }
    };
 
    const createNewContent = async () => {
        try {
            const newContent = {
                word: [],
                hint: [],
                levelId: levelId
            };
   
            const response = await fetch(`http://localhost:8080/api/quackmancontent/addContent`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newContent)
            });
   
            if (response.ok) {
                const createdContent = await response.json();
                setContent([createdContent]);
            } else {
                const errorData = await response.text();
                console.error('Failed to create new content:', errorData);
                Alert.alert('Error', 'Failed to create new content');
            }
        } catch (error) {
            console.error('Error creating new content:', error);
            Alert.alert('Error', 'Failed to create new content');
        }
    };
 
    const handleAddContent = async () => {
        try {
            const encodedWord = encodeURIComponent(word);
            const encodedHint = encodeURIComponent(hint);
            const encodedLevelId = encodeURIComponent(levelId);
            const response = await fetch(`http://localhost:8080/api/quackmancontent/addContentToLevel?levelId=${encodedLevelId}&word=${encodedWord}&hint=${encodedHint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
 
            if (response.ok) {
                Alert.alert('Success', 'Content added successfully!');
                fetchContent(); // Refresh the list
                setModalVisible(false);
                setWord('');
                setHint('');
            } else {
                const errorData = await response.text();
                console.error('Failed to add content:', errorData);
                Alert.alert('Error', 'Failed to add content');
            }
        } catch (error) {
            console.error('Error adding content:', error);
            Alert.alert('Error', 'Failed to add content');
        }
    };
 
    const handleEditContent = async () => {
        try {
            // Prepare the updated content
            const updatedContent = {
                word: [...content[0].word],
                hint: [...content[0].hint]
            };
   
            // Update the word and hint at the selected index
            updatedContent.word[selectedWordIndex] = editWord;
            updatedContent.hint[selectedWordIndex] = editHint;
   
            console.log('Sending update request with content ID:', selectedContentId);
            console.log('Updated content:', updatedContent);
   
            // Send the update request to the backend
            const response = await fetch(`http://localhost:8080/api/quackmancontent/updateContent/${selectedContentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    word: updatedContent.word,
                    hint: updatedContent.hint
                })
            });
   
            const responseText = await response.text();
            console.log('Edit response:', responseText);
   
            if (response.ok) {
                // Update the local state with the new content
                setContent([{ ...content[0], word: updatedContent.word, hint: updatedContent.hint }]);
                Alert.alert('Success', 'Content updated successfully!');
                setEditModalVisible(false);
                setEditWord('');
                setEditHint('');
            } else {
                console.error('Failed to update content:', responseText);
                Alert.alert('Error', responseText);
            }
        } catch (error) {
            console.error('Error updating content:', error);
            Alert.alert('Error', 'Failed to update content');
        }
    };
   
 
    const handleRemoveContent = async () => {
        try {
            const wordToRemove = content[0].word[selectedWordIndex];
            const hintToRemove = content[0].hint[selectedWordIndex];
           
            const response = await fetch(`http://localhost:8080/api/quackmancontent/deleteContent/${selectedContentId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    word: wordToRemove,
                    hint: hintToRemove,
                })
            });
   
            const responseText = await response.text();
   
            if (response.ok) {
                // Optimistically update the local state
                const updatedContent = [...content];
                updatedContent[0].word.splice(selectedWordIndex, 1);
                updatedContent[0].hint.splice(selectedWordIndex, 1);
                setContent(updatedContent);
   
                Alert.alert('Success', 'Content removed successfully!');
                setConfirmModalVisible(false);
                setRemoveModalVisible(false);
            } else {
                console.error('Failed to remove content:', responseText);
                Alert.alert('Error', responseText);
            }
        } catch (error) {
            console.error('Error removing content:', error);
            Alert.alert('Error', 'Failed to remove content');
        }
    };
   
   
    const handleBackPress = () => {
        router.push(`/QuackmanLevels?classCode=${classCode}`);
    };
 
    const handleCloseModal = () => {
        setModalVisible(false);
        setWord('');
        setHint('');
    };
 
    const handleOpenEditModal = (contentId, wordIndex, word, hint) => {
        setSelectedContentId(contentId);
        setSelectedWordIndex(wordIndex);
        setEditWord(word);
        setEditHint(hint);
        setEditModalVisible(true);
    };
 
    const handleCloseEditModal = () => {
        setEditModalVisible(false);
        setEditWord('');
        setEditHint('');
    };
 
    const handleOpenRemoveModal = () => {
        setRemoveModalVisible(true);
    };
 
    const handleCloseRemoveModal = () => {
        setRemoveModalVisible(false);
    };
 
    const handleSelectContentForRemoval = (contentId, wordIndex) => {
        setSelectedContentId(contentId);
        setSelectedWordIndex(wordIndex);
        setConfirmModalVisible(true);
    };
 
    const handleConfirmRemove = () => {
        handleRemoveContent();
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
            <View style={stylesEdit.titleTextContainer}>
                <Text style={stylesEdit.titleText}>Quackman: {classCode}</Text>
            </View>
            <View style={stylesEdit.buttonContainer}>
                <CustomButton title="Add" onPress={() => setModalVisible(true)} buttonStyle={stylesEdit.button} textStyle={stylesEdit.buttonText} />
                <CustomButton title="Remove" onPress={handleOpenRemoveModal} buttonStyle={stylesEdit.button} textStyle={stylesEdit.buttonText} />
            </View>
 
            <ScrollView style={{ flex: 1 }}>
                {content.map((item, index) =>
                    item.word.map((wordItem, wordIndex) => (
                        <TouchableOpacity
                            key={`${index}-${wordIndex}`}
                            onLongPress={() => handleOpenEditModal(item.contentId, wordIndex, wordItem, item.hint[wordIndex])}
                        >
                            <View style={stylesEdit.quackmaneditContent}>
                                <Text style={stylesEdit.contentText}>{`Hint: ${item.hint[wordIndex]}`}</Text>
                                <Text style={stylesEdit.contentText}>{`Word: ${wordItem}`}</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
 
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={handleCloseModal}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>X</Text>
                        </TouchableOpacity>
                        <View style={styles.modalContent}>
                            <Text style={styles.text}>Enter new content:</Text>
                            <TextInput
                                style={styles.input}
                                value={word}
                                onChangeText={setWord}
                                placeholder="Enter word"
                            />
                            <TextInput
                                style={styles.input}
                                value={hint}
                                onChangeText={setHint}
                                placeholder="Enter hint"
                            />
                            <CustomButton title="Add" onPress={handleAddContent} buttonStyle={styles.button} textStyle={styles.buttonText} />
                        </View>
                    </View>
                </View>
            </Modal>
 
            <Modal
                animationType="slide"
                transparent={true}
                visible={editModalVisible}
                onRequestClose={handleCloseEditModal}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <TouchableOpacity onPress={handleCloseEditModal} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>X</Text>
                        </TouchableOpacity>
                        <View style={styles.modalContent}>
                            <Text style={styles.text}>Edit content:</Text>
                            <TextInput
                                style={styles.input}
                                value={editWord}
                                onChangeText={setEditWord}
                                placeholder="Enter word"
                            />
                            <TextInput
                                style={styles.input}
                                value={editHint}
                                onChangeText={setEditHint}
                                placeholder="Enter hint"
                            />
                            <CustomButton title="Save" onPress={handleEditContent} buttonStyle={styles.button} textStyle={styles.buttonText} />
                        </View>
                    </View>
                </View>
            </Modal>
 
            <Modal
                animationType="slide"
                transparent={true}
                visible={removeModalVisible}
                onRequestClose={handleCloseRemoveModal}
            >
                <ScrollView contentContainerStyle={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.closeButtonContainer}>
                            <TouchableOpacity onPress={handleCloseRemoveModal} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>X</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalContent}>
                            <Text style={styles.text}>Select content to remove:</Text>
                            <ScrollView style={styles.scrollContainer}>
                                {content.map((item, index) =>
                                    item.word.map((wordItem, wordIndex) => (
                                        <TouchableOpacity
                                            key={`${index}-${wordIndex}`}
                                            onPress={() => handleSelectContentForRemoval(item.contentId, wordIndex)}
                                        >
                                            <View style={selectedContentId === item.contentId && selectedWordIndex === wordIndex ? styles.selected : styles.contentModalContainer}>
                                                <Text style={styles.contentText}>{`Hint: ${item.hint[wordIndex]}`}</Text>
                                                <Text style={styles.contentText}>{`Word: ${wordItem}`}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </ScrollView>
                           
                        </View>
                    </View>
                </ScrollView>
            </Modal>
 
            <Modal
                animationType="slide"
                transparent={true}
                visible={confirmModalVisible}
                onRequestClose={() => setConfirmModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <TouchableOpacity onPress={() => setConfirmModalVisible(false)} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>X</Text>
                        </TouchableOpacity>
                        <View style={styles.modalContent}>
                            <Text style={styles.text}>Would you like to remove this level?</Text>
                            <View style={styles.buttonRow}>
                                <CustomButton title="Yes" onPress={handleConfirmRemove} buttonStyle={styles.button} textStyle={styles.buttonText} />
                                <CustomButton title="No" onPress={() => setConfirmModalVisible(false)} buttonStyle={styles.button} textStyle={styles.buttonText} />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};
 
export default QuackmanEdit;
 