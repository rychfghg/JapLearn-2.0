import React, { useContext } from "react";
import { View, Text, TouchableOpacity, ImageBackground, Image} from 'react-native';
import { styles } from '../styles/stylesProfile';
import { useRouter } from "expo-router";
import BackIcon from '../assets/svg/back-icon.svg';
import { AuthContext } from '../context/AuthContext';
import teacherProfile from '../assets/img/teacherProfile.png';


const ProfileTeacher = () => {
    const { user, role, logout } = useContext(AuthContext);
    const router = useRouter(); 

    const handleBackPress = () => {
        router.back();
    }


    const handleLogout = () => {
        logout();
        router.push('/Login');
    }
    
    return (
        <View>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackPress}>
                    <BackIcon width={30} height={30}/>
                </TouchableOpacity>
            </View>
            
            <View>
                
                <View style={styles.cover}>
                <ImageBackground
                    source={require('../assets/img/cover.png')} 
                    style={{ flex: 1, width: '100%', height: '100%',}}
                    resizeMode="repeat" 
                />
                </View>
                <View style={styles.profileContainer}>
                <Image source={teacherProfile} style={styles.profilePicture} />
                </View>
                <View style={styles.whiteSpace}>
                    <TouchableOpacity onPress={handleLogout} style={styles.buttonContainer}>
                        <Text style={styles.buttonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
                
            </View>
            <View style={styles.description}>
                
                <View style={styles.descTextContainer}>
                    <Text style={styles.descText}>Username: {user ? `${user.fname} ${user.lname}` : ''}</Text>
                </View>
            </View>
        </View>
    );
}

export default ProfileTeacher;
