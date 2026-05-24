import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import CustomButton from '../components/CustomButton';
import { stylesDashboard } from '../styles/stylesDashboard';
import expoconfig from '../expoconfig';
import { useRouter } from 'expo-router';
import teacherProfile from '../assets/img/teacherProfile.png';
import BackIcon from '../assets/svg/back-icon.svg';

const PendingApproval = () => {
    const [pendingUsers, setPendingUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null); // Track selected user
    const router = useRouter();

    // Fetch pending approval users
    const fetchPendingUsers = async () => {
        try {
            const response = await fetch(`${expoconfig.API_URL}/api/users/pending-approval`);
            if (response.ok) {
                const data = await response.json();
                setPendingUsers(data);
            } else {
                throw new Error('Failed to fetch pending users');
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    // Approve a user
    const approveUser = async (userId) => {
        try {
            const response = await fetch(`${expoconfig.API_URL}/api/users/approve/${userId}`, { method: 'POST' });
            if (response.ok) {
                Alert.alert('Success', 'User approved successfully');
                setSelectedUser(null); // Reset selection
                fetchPendingUsers();
            } else {
                throw new Error('Failed to approve user');
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    // Reject a user
    const rejectUser = async (userEmail) => {
        try {
            const response = await fetch(`${expoconfig.API_URL}/api/users/remove-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: userEmail }), // Send the user's email
            });
            if (response.ok) {
                Alert.alert('Success', 'User removed successfully');
                setSelectedUser(null); // Reset selection
                fetchPendingUsers();
            } else {
                const errorData = await response.json();
            console.error('Error response:', errorData); // Debug log
            throw new Error(errorData.error || 'Failed to remove user');
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    useEffect(() => {
        fetchPendingUsers();
    }, []);

    // Handle profile press
    const handleProfilePress = () => {
        router.push('/ProfileTeacher');
    };

    // Handle back button press
    const handleBackPress = () => {
        router.back(); // This will navigate to the previous screen
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                {/* Header Section with Back Button */}
                <View style={stylesDashboard.header}>
                    <View style={stylesDashboard.leftContainer}>
                        {/* Back Button */}
                        <TouchableOpacity onPress={handleBackPress}>
                            <View style={stylesDashboard.backButtonContainer}>
                                <BackIcon width={20} height={20} fill={'white'} />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={stylesDashboard.rightContainer}>
                        <TouchableOpacity onPress={handleProfilePress}>
                            <Image source={teacherProfile} style={stylesDashboard.pictureCircle} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Title Section */}
                <View style={stylesDashboard.titleContainer}>
                    <Text style={stylesDashboard.titleText}>Users waiting for approval</Text>
                </View>

                {/* Pending Users Section */}
                <ScrollView contentContainerStyle={stylesDashboard.classContainer} showsVerticalScrollIndicator={false}>
                    {pendingUsers.length > 0 ? (
                        pendingUsers.map(user => (
                            <TouchableOpacity
    key={user.id}
    style={stylesDashboard.pendingUserContent}
    onPress={() => setSelectedUser(selectedUser === user.id ? null : user.id)} // Toggle selection
>
    <View style={stylesDashboard.userInfoContainer}>
        <Text style={stylesDashboard.pendingUserText}>{user.fname} {user.lname}</Text>
        <Text style={stylesDashboard.pendingUserEmail}>{user.email}</Text>
    </View>
    {selectedUser === user.id && (
        <View style={stylesDashboard.actionContainer}>
            <CustomButton
                title="Approve"
                onPress={() => approveUser(user.id)}
                buttonStyle={stylesDashboard.buttonApprove}
                textStyle={stylesDashboard.buttonText}
            />
            <CustomButton
                title="Reject"
                onPress={() => rejectUser(user.email)}
                buttonStyle={stylesDashboard.rejectButton}
                textStyle={stylesDashboard.buttonText}
            />
    </View>
)}

                              
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={stylesDashboard.classContentText}>No users pending approval</Text>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default PendingApproval;
