import React, { useState, useEffect, useContext } from 'react';
import { Modal, View, KeyboardAvoidingView, Text, Pressable, SafeAreaView, ScrollView, Image, TextInput, StyleSheet, Alert } from 'react-native';
import CustomButton from '../components/CustomButton';
import { stylesDashboard } from '../styles/stylesDashboard';
import { AuthContext } from '../context/AuthContext';
import expoconfig from '../expoconfig';
import { useRouter } from 'expo-router';
import teacherProfile from '../assets/img/teacherProfile.png';
import { styles } from '../styles/stylesModal';

const TeacherDashboard = () => {
    const [classCodes, setClassCodes] = useState([]);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteClassCode, setDeleteClassCode] = useState('');
    const [newClassCode, setNewClassCode] = useState('');
    const { user } = useContext(AuthContext);
    const router = useRouter();

    // Fetch all class codes
    const fetchClassCodes = async () => {
        try {
            const response = await fetch(`${expoconfig.API_URL}/api/classes/getAllClasses`);
            if (response.ok) {
                const data = await response.json();
                setClassCodes(data.map(item => item.classCodes));
            } else {
                const errorData = await response.json();
                throw new Error('Failed to fetch class codes: ' + errorData.message);
            }
        } catch (error) {
            console.error('Fetch error:', error.message);
            alert('Failed to load class codes: ' + error.message);
        }
    };

    useEffect(() => {
        fetchClassCodes();
    }, []);

    // Add a new class
    const addClass = async () => {
        if (!newClassCode.trim()) { 
            alert("Please enter a class code");
            return;
        }
        const classEntity = {
            classCodes: newClassCode
        };
        try {
            const response = await fetch(`${expoconfig.API_URL}/api/classes/addClass`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(classEntity)
            });
            const data = await response.json();
            if (response.ok) {
                fetchClassCodes();
                setAddModalVisible(false);
                setNewClassCode('');
            } else {
                alert(data.error || 'Error adding class'); 
            }
        } catch (error) {
            console.error('Error adding class:', error);
            alert('Error adding class: ' + error.message);
        }
    };

    // Remove a class
    const handleRemoveClass = async () => {
        if (!deleteClassCode.trim()) {
            alert("Please enter a valid class code to delete");
            return;
        }
        try {
            const response = await fetch(`${expoconfig.API_URL}/api/classes/removeClass?classCode=${deleteClassCode}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                fetchClassCodes();
                setDeleteModalVisible(false);
                setDeleteClassCode('');
            } else {
                throw new Error(data.error || 'Failed to delete class'); 
            }
        } catch (error) {
            alert(`Error removing class: ${error.message}`);
        }
    };

    // Redirect to profile
    const handleProfilePress = () => {
        router.push('/ProfileTeacher');
    };

    // Open the modal to add a class
    const handleAddPress = () => {
        setAddModalVisible(true);
    };

    // Open the modal to remove a class
    const handleRemovePress = () => {
        setDeleteModalVisible(true);
    };

    // Close modals
    const closeModal = () => {
        setAddModalVisible(false);
        setDeleteModalVisible(false);
        setDeleteClassCode('');
    };

    // Handle pressing a class
    const handleClassPress = (classCode) => {
        console.log("Navigating to class:", classCode);
        router.push(`/ClassDashboard?classCode=${classCode}`);
    };

    // Redirect to pending approval page
    const handlePendingApprovalPress = () => {
        router.push('/PendingApproval');
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
                <View style={{ flex: 1 }}>
                    <View style={stylesDashboard.header}>
                        <View style={stylesDashboard.leftContainer}>
                            <Text style={stylesDashboard.hText}>Welcome Back</Text>
                            <Text style={stylesDashboard.hText}>{user?.fname} {user?.lname}</Text>
                        </View>
                        <View style={stylesDashboard.rightContainer}>
                            <Pressable onPress={handleProfilePress}>
                                <Image source={teacherProfile} style={stylesDashboard.pictureCircle} />
                            </Pressable>
                        </View>
                    </View>

                    <View style={stylesDashboard.menuContainer}>
                        <View style={stylesDashboard.buttonContainer}>
                            <CustomButton title="Add" onPress={handleAddPress} buttonStyle={stylesDashboard.button} textStyle={stylesDashboard.buttonText} />
                            <CustomButton title="Remove" onPress={handleRemovePress} buttonStyle={stylesDashboard.button} textStyle={stylesDashboard.buttonText} />
                            <CustomButton title="Pending" onPress={handlePendingApprovalPress} buttonStyle={stylesDashboard.button} textStyle={stylesDashboard.buttonText} />
                        </View>
                    </View>

                    <ScrollView 
            contentContainerStyle={{
                flexGrow: 1, // Ensures content grows to fill the ScrollView
            }}
        >
            <View style={stylesDashboard.classContainer}>
                <Text style={stylesDashboard.titleText}>Classes</Text>
                {classCodes.map((code, index) => (
                    <Pressable key={index} onPress={() => handleClassPress(code)}>
                        <View style={stylesDashboard.classContent}>
                            <Text style={stylesDashboard.classContentText}>{code}</Text>
                        </View>
                    </Pressable>
                ))}
            </View>
        </ScrollView>

                    {/* Add Class Modal */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={addModalVisible}
                        onRequestClose={closeModal}
                    >
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <View style={styles.closeButtonContainer}>
                                    <Pressable onPress={closeModal} style={styles.closeButton}>
                                        <Text style={styles.closeButtonText}>X</Text>
                                    </Pressable>
                                </View>
                                <View style={styles.modalContent}>
                                    <TextInput
                                        placeholder="Class Code"
                                        value={newClassCode}
                                        onChangeText={setNewClassCode}
                                        style={stylesDashboard.input}
                                    />
                                    <CustomButton title="Add" onPress={addClass} buttonStyle={stylesDashboard.button} textStyle={stylesDashboard.buttonText} />
                                </View>
                            </View>
                        </View>
                    </Modal>

                    {/* Remove Class Modal */}
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={deleteModalVisible}
                        onRequestClose={closeModal}
                    >
                        <View style={styles.centeredView}>
                            <View style={styles.modalView}>
                                <View style={styles.closeButtonContainer}>
                                    <Pressable onPress={closeModal} style={styles.closeButton}>
                                        <Text style={styles.closeButtonText}>X</Text>
                                    </Pressable>
                                </View>
                                <View style={styles.modalContent}>
                                    <Text style={styles.text}>Are you sure you want to delete the following class?</Text>
                                    <TextInput
                                        placeholder="Enter Class Code"
                                        value={deleteClassCode}
                                        onChangeText={setDeleteClassCode}
                                        style={stylesDashboard.input}
                                    />
                                    <CustomButton title="Delete" onPress={handleRemoveClass} buttonStyle={stylesDashboard.button} textStyle={stylesDashboard.buttonText} />
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default TeacherDashboard;

