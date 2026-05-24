import React, { useState } from 'react';
import { Text, View, TouchableOpacity, Alert, Modal, Clipboard } from 'react-native';
import { stylesCode } from '../styles/stylesCode';
import BackIcon from '../assets/svg/back-icon.svg';
import CustomButton from '../components/CustomButton';
import { useRouter, useLocalSearchParams } from 'expo-router';
import expoconfig from '../expoconfig';

const QuackslateLevels = () => {
    const [newGameCode, setNewGameCode] = useState(''); // Store generated game code
    const [modalVisible, setModalVisible] = useState(false); // For controlling the modal visibility
    const { classCode } = useLocalSearchParams();
    const router = useRouter();

    // Handle back navigation
    const handleBackPress = () => {
        router.push(`/ClassDashboard?classCode=${classCode}`);
    };

    // Generate game code
    const generateGameCode = async () => {
        try {
            const response = await fetch(`${expoconfig.API_URL}/api/quackslateLevels/generateGameCode`, {
                method: 'POST',  // Change to POST
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (response.ok) {
                const data = await response.json();
                setNewGameCode(data.gameCode);  // Access 'gameCode' from response
                
            } else {
                throw new Error('Failed to generate game code');
            }
        } catch (error) {
            console.error('Error generating game code:', error);
            Alert.alert('Error', 'Failed to generate game code');
        }
    };
    
    

    // Copy game code to clipboard
    const copyToClipboard = () => {
        Clipboard.setString(newGameCode);
        Alert.alert('Copied', 'Game code copied to clipboard');
    };

    // Navigate to QuackslateEdit with gameCode
    // Navigate to QuackslateEdit with gameCode and classCode
const navigateToEdit = () => {
    if (!newGameCode) {
        setModalVisible(true); // Show modal if no game code is generated
    } else if (!classCode) {
        Alert.alert('Error', 'Class code is missing');
    } else {
        // Pass the parameters using a template literal
        router.push(`/QuackslateEdit?gameCode=${newGameCode}&classCode=${classCode}`);
    }
};

    
    
    

    return (
        <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={stylesCode.header}>
                <TouchableOpacity onPress={handleBackPress}>
                    <View style={stylesCode.backButtonContainer}>
                        <BackIcon width={20} height={20} fill={'white'} />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Game Code Display */}
            <View style={stylesCode.gameCodeContainer}>
                {newGameCode ? (
                    <>
                        <Text style={stylesCode.gameCodeLabel}>Your Game Code is:</Text>
                        <TouchableOpacity onPress={copyToClipboard}>
                            <Text style={stylesCode.bigGameCodeText}>{newGameCode}</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <Text style={stylesCode.noGameCodeText}>Generate a Game Code</Text>
                )}
            </View>

            {/* Button Section */}
            <View style={stylesCode.upperButtonContainer}>
                <CustomButton
                    title="Generate Game Code"
                    onPress={generateGameCode}
                    buttonStyle={stylesCode.leftButton}
                    textStyle={stylesCode.buttonText}
                />
                <CustomButton
                    title="Edit"
                    onPress={navigateToEdit}
                    buttonStyle={stylesCode.rightButton}
                    textStyle={stylesCode.buttonText}
                />
            </View>

            {/* Modal for warning */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={stylesCode.modalContainer}>
                    <View style={stylesCode.modalView}>
                        <Text style={stylesCode.modalTitle}>Error</Text>
                        <Text style={stylesCode.modalText}>Please generate a game code before proceeding to edit.</Text>
                        <CustomButton 
                            title="Close" 
                            onPress={() => setModalVisible(false)} 
                            buttonStyle={stylesCode.modalButton} 
                            textStyle={stylesCode.modalButtonText} 
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default QuackslateLevels;
