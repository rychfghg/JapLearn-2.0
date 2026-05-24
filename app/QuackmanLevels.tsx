import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from 'react-native';
import { stylesLevels } from '../styles/stylesLevels';
import BackIcon from '../assets/svg/back-icon.svg';
import CustomButton from '../components/CustomButton';
import ConfirmationModal from '../components/ConfirmationModal';
import { styles } from '../styles/stylesModal';
import { useRouter, useLocalSearchParams } from 'expo-router';

const QuackmanLevels = () => {
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [removeModalVisible, setRemoveModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [confirmationVisible, setConfirmationVisible] = useState(false);
    const [confirmationMessage, setConfirmationMessage] = useState('');
    const [confirmationAction, setConfirmationAction] = useState(() => () => {});
    
    const [newLevelName, setNewLevelName] = useState('');
    const [updatedLevelName, setUpdatedLevelName] = useState('');
    const [levels, setLevels] = useState([]);
    const [selectedLevelID, setSelectedLevelID] = useState(null);
    const { classCode } = useLocalSearchParams();
    const router = useRouter();

    useEffect(() => {
        fetchLevels();
    }, []);

    const fetchLevels = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/quackmanlevels/getLevels/${classCode}`);
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                setLevels(data);
            } else {
                throw new Error('Failed to fetch levels');
            }
        } catch (error) {
            console.error('Error fetching levels:', error);
            Alert.alert('Error', 'Failed to fetch levels');
        }
    };

    const handleBackPress = () => {
        router.push(`/ClassDashboard?classCode=${classCode}`);
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
        try {
            const response = await fetch('http://localhost:8080/api/quackmanlevels/addLevel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newLevelName,
                    classId: classCode,
                }),
            });

            if (response.ok) {
                Alert.alert('Success', 'Level added successfully!');
                setAddModalVisible(false);
                setNewLevelName('');
                fetchLevels();
            } else {
                throw new Error('Failed to add level');
            }
        } catch (error) {
            console.error('Error adding level:', error);
            Alert.alert('Error', 'Failed to add level');
        }
    };

    const handleRemoveLevel = async () => {
        if (!selectedLevelID) {
            Alert.alert('Error', 'Please select a level to remove.');
            return;
        }

        try {
            const response = await fetch(`http://localhost:8080/api/quackmanlevels/deleteLevel/${selectedLevelID}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                Alert.alert('Success', 'Level removed successfully!');
                setRemoveModalVisible(false);
                setSelectedLevelID(null);
                fetchLevels();
            } else {
                throw new Error('Failed to remove level');
            }
        } catch (error) {
            console.error('Error removing level:', error);
            Alert.alert('Error', 'Failed to remove level');
        }
    };

    const handleEditPress = (level) => {
        setSelectedLevelID(level.levelId);
        setUpdatedLevelName(level.title);
        setEditModalVisible(true);
    };

    const handleSaveLevel = async () => {
        if (!selectedLevelID) return;

        try {
            const response = await fetch(`http://localhost:8080/api/quackmanlevels/updateLevel/${selectedLevelID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: updatedLevelName,
                }),
            });

            if (response.ok) {
                Alert.alert('Success', 'Level updated successfully!');
                setEditModalVisible(false);
                fetchLevels();
            } else {
                throw new Error('Failed to update level');
            }
        } catch (error) {
            console.error('Error updating level:', error);
            Alert.alert('Error', 'Failed to update level');
        }
    };

    const handleLevelNavigate = (levelId) => {
        router.push(`/QuackmanEdit?classCode=${classCode}&levelId=${levelId}`);
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
                <Text style={stylesLevels.titleText}>Quackman: {classCode}</Text>
            </View>
            <View style={stylesLevels.buttonContainer}>
                <CustomButton title="Add" onPress={handleAddPress} buttonStyle={stylesLevels.button} textStyle={stylesLevels.buttonText} />
                <CustomButton title="Remove" onPress={handleRemovePress} buttonStyle={stylesLevels.button} textStyle={stylesLevels.buttonText} />
            </View>
            <ScrollView contentContainerStyle={stylesLevels.levelContainer} style={{ flex: 1 }}>
                {levels.map((level) => (
                    <TouchableOpacity key={level.levelId} onPress={() => handleLevelNavigate(level.levelId, level.title)} onLongPress={() => handleEditPress(level)}>
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
                                value={newLevelName}
                                onChangeText={setNewLevelName}
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
                                    <TouchableOpacity key={level.levelId} onPress={() => setSelectedLevelID(level.levelId)}>
                                        <View style={selectedLevelID === level.levelId ? styles.selected : styles.contentModalContainer}>
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
                                value={updatedLevelName}
                                onChangeText={setUpdatedLevelName}
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
};

export default QuackmanLevels;
