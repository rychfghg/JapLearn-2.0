import React, { useState, useEffect } from 'react';
import { Text, View, ScrollView, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { stylesLevels } from '../styles/stylesLevels';
import { styles } from '../styles/stylesModal';
import BackIcon from '../assets/svg/back-icon.svg';
import CustomButton from '../components/CustomButton';
import ConfirmationModal from '../components/ConfirmationModal'; 
import expoconfig from '../expoconfig';
import { useRouter, useLocalSearchParams } from 'expo-router';

const QuackamoleLevels = () => {
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [removeModalVisible, setRemoveModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [confirmationVisible, setConfirmationVisible] = useState(false);
    const [confirmationMessage, setConfirmationMessage] = useState('');
    const [confirmationAction, setConfirmationAction] = useState(() => () => {});
    const { classCode } = useLocalSearchParams();
    const [newTitle, setNewTitle] = useState('');
    const [levels, setLevels] = useState([]);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [updatedTitle, setUpdatedTitle] = useState('');
    const router = useRouter();

    const fetchLevels = async () => {
        const url = `${expoconfig.API_URL}/api/quackamolelevels/getLevels/${classCode}`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (response.ok) {
                setLevels(data);
                console.log('Fetched levels:', data);
            } else {
                throw new Error(`Failed to fetch levels: ${data.message} (Status code: ${response.status})`);
            }
        } catch (error) {
            console.error('Error fetching levels:', error);
        }
    };

    useEffect(() => {
        fetchLevels();
    }, [classCode]);

    const handleBackPress = () => {
        router.push(`/ClassDashboard/?classCode=${classCode}`);
    };

    const handleLevelNavigatePress = (level) => {
        router.push(`/QuackamoleEdit?classCode=${classCode}&levelId=${level.levelId}`);
    };

    const handleAddPress = () => {
        setAddModalVisible(true);
    };

    const handleRemovePress = () => {
        setRemoveModalVisible(true);
    };

    const confirmAction = (message, action) => {
        setConfirmationMessage(message);
        setConfirmationAction(() => action);
        setConfirmationVisible(true);
    };

    const handleAddLevel = async () => {
        const url = `${expoconfig.API_URL}/api/quackamolelevels/addLevel`;
        const levelData = {
            title: newTitle,
            classId: classCode
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(levelData)
            });

            const data = await response.json();
            if (response.ok) {
                console.log('Level added successfully:', data);
                setAddModalVisible(false);
                setNewTitle('');
                fetchLevels();
            } else {
                throw new Error(`Failed to add level: ${data.message} (Status code: ${response.status})`);
            }
        } catch (error) {
            console.error('Error adding level:', error);
        }
    };

    const handleRemoveLevel = async () => {
        if (!selectedLevel) {
            Alert.alert('Error', 'Please select a level to remove.');
            return;
        }

        const url =  `${expoconfig.API_URL}/api/quackamolelevels/deleteLevel/${selectedLevel.levelId}`;
        console.log(`Sending DELETE request to: ${url}`);
        try {
            const response = await fetch(url, { method: 'DELETE' });
            console.log(`Response status: ${response.status}`);
            if (response.ok) {
                console.log('Level removed successfully');
                setSelectedLevel(null);
                setRemoveModalVisible(false);
                fetchLevels();
            } else {
                throw new Error(`Failed to remove level: ${response.statusText} (Status code: ${response.status})`);
            }
        } catch (error) {
            console.error('Error removing level:', error);
        }
    };

    const handleEditPress = (level) => {
        setSelectedLevel(level);
        setUpdatedTitle(level.title);
        setEditModalVisible(true);
    };

    const handleSaveLevel = async () => {
        if (!selectedLevel) return;

        const url =  `${expoconfig.API_URL}/api/quackamolelevels/updateLevel/${selectedLevel.levelId}`;
        const levelData = {
            ...selectedLevel,
            title: updatedTitle
        };

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(levelData)
            });

            const data = await response.json();
            if (response.ok) {
                console.log('Level updated successfully:', data);
                setEditModalVisible(false);
                fetchLevels();
            } else {
                throw new Error(`Failed to update level: ${data.message} (Status code: ${response.status})`);
            }
        } catch (error) {
            console.error('Error updating level:', error);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <View style={stylesLevels.header}>
                <TouchableOpacity onPress={handleBackPress}>
                    <View style={stylesLevels.backButtonContainer}>
                        <BackIcon width={20} height={20} fill={'white'} />
                    </View>
                </TouchableOpacity>
            </View>
            <View style={stylesLevels.titleTextContainer}>
                <Text style={stylesLevels.titleText}>Quackamole: {classCode} </Text>
            </View>
            <View style={stylesLevels.buttonContainer}>
                <CustomButton title="Add" onPress={handleAddPress} buttonStyle={stylesLevels.button} textStyle={stylesLevels.buttonText} />
                <CustomButton title="Remove" onPress={handleRemovePress} buttonStyle={stylesLevels.button} textStyle={stylesLevels.buttonText} />
            </View>
            <ScrollView contentContainerStyle={stylesLevels.levelContainer} style={{ flex: 1 }}>
                {levels.map((level) => (
                    <TouchableOpacity
                        key={level.levelId}
                        onPress={() => handleLevelNavigatePress(level)}
                        onLongPress={() => handleEditPress(level)}
                    >
                        <View style={stylesLevels.level}>
                            <Text style={stylesLevels.levelText}>{level.title}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
            <Modal
                animationType="slide"
                transparent={true}
                visible={addModalVisible}
                onRequestClose={() => setAddModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.closeButtonContainer}>
                            <TouchableOpacity onPress={() => setAddModalVisible(false)} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>X</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalContent}>
                            <Text style={styles.text}>Enter new level name:</Text>
                            <TextInput
                                style={styles.input}
                                value={newTitle}
                                onChangeText={setNewTitle}
                                placeholder="Level Name"
                            />
                            <CustomButton title="Add" onPress={() => confirmAction('Would you like to add this level?', handleAddLevel)} buttonStyle={styles.button} textStyle={styles.buttonText} />
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={removeModalVisible}
                onRequestClose={() => setRemoveModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.closeButtonContainer}>
                            <TouchableOpacity onPress={() => setRemoveModalVisible(false)} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>X</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalContent}>
                            <Text style={styles.text}>Select a level to remove:</Text>
                            <ScrollView style={styles.scrollContainer}>
                                {levels.map((level) => (
                                    <TouchableOpacity key={level.levelId} onPress={() => setSelectedLevel(level)}>
                                        <View style={selectedLevel && selectedLevel.levelId === level.levelId ? styles.selected : styles.contentModalContainer}>
                                            <Text style={styles.contentText}>{level.title}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                            <CustomButton title="Remove" onPress={() => confirmAction('Would you like to remove this level?', handleRemoveLevel)} buttonStyle={styles.button} textStyle={styles.buttonText} />
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="slide"
                transparent={true}
                visible={editModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.closeButtonContainer}>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>X</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.modalContent}>
                            <Text style={styles.text}>Edit level name:</Text>
                            <TextInput
                                style={styles.input}
                                value={updatedTitle}
                                onChangeText={setUpdatedTitle}
                                placeholder="Level Name"
                            />
                            <CustomButton title="Save" onPress={() => confirmAction('Would you like to save changes to this level?', handleSaveLevel)} buttonStyle={styles.button} textStyle={styles.buttonText} />
                        </View>
                    </View>
                </View>
            </Modal>

            <ConfirmationModal
                visible={confirmationVisible}
                onClose={() => setConfirmationVisible(false)}
                onConfirm={() => {
                    setConfirmationVisible(false);
                    confirmationAction();
                }}
                message={confirmationMessage}
            />
        </View>
    );
}

export default QuackamoleLevels;
