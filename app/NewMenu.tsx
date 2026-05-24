import { SafeAreaView, StyleSheet, Text, View, Pressable, FlatList, Modal, Image, ImageBackground } from 'react-native';
import React, { useContext, useState } from 'react';
import { useRouter } from 'expo-router';
import styles from '../styles/stylesNewMenu';
import Profile from '../assets/svg/user_pf.svg';
import Background from '../assets/img/MenuBackground.png'; 
import { AuthContext } from '../context/AuthContext';
import CustomButton from '../components/CustomButton';
import MenuButton from '../components/MenuButton';

const NewMenu = () => {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const [userId, setUserId] = useState(null);
    const [modalVisible, setModalVisible] = useState(true);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ImageBackground 
                source={Background} 
                style={{ flex: 1 }} // Ensure the background image takes up the full space
                resizeMode="cover" // Adjust how the image is scaled
            >
                <View style={styles.container}>
                    <View style={[styles.header, { padding: 20 }]}>
                        <View style={styles.leftContainer}>
                            <Text style={styles.hText1}>Welcome Back</Text>
                            {/*<Text style={styles.hText2}>{user?.fname}</Text>*/}
                            <Text style={styles.hText2}>Sample Name</Text>
                        </View>
                        <View style={styles.rightContainer}>
                            <CustomButton
                                title="Profile"
                                onPress={() => () => router.push('/Profile')}
                                buttonStyle={styles.profileButton} 
                                textStyle={styles.profileButtonText}
                            />
                        </View>
                    </View>
                    <View style={styles.menuContainer}>
                        <View style={styles.classContainer}>
                            <Text style={styles.classText}>FLO33 Classname: G1</Text>
                        </View>
                        <MenuButton 
                            title="Learn" 
                            onPress={() => { console.log('You tapped the button!'); }}
                            imageSource={require('../assets/img/m_menu_button.png')}
                            infoText="Learn is where there will be lessons to facilitate your process in learning the Japanese language." 
                            buttonStyle={styles.menuButton} 
                            textStyle={styles.menuButtonText}
                        />
                        <MenuButton 
                            title="Play" 
                            onPress={() => { console.log('You tapped the button!'); }} 
                            buttonStyle={styles.menuButton} 
                            textStyle={styles.menuButtonText}
                            imageSource={require('../assets/img/m_menu_button2.png')}
                            infoText="Play is where activities are given by the teacher synchronously."
                        />
                    </View>
                </View>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalTitle}>Instructions</Text>
                            <Text style={styles.modalText}>
                                Welcome to the learning menu! You will be greeted with options for learning and there are side information buttons for the options to fully explain and go further detail for each button.
                            </Text>
                            <CustomButton 
                                title="Got it!" 
                                onPress={() => setModalVisible(false)} 
                                buttonStyle={styles.modalButton} 
                                textStyle={styles.modalButtonText} 
                            />
                        </View>
                    </View>
                </Modal>
            </ImageBackground>
        </SafeAreaView>
    );
};

export default NewMenu;
