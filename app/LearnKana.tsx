import { View, Pressable, ImageBackground } from 'react-native';
import React, { useContext } from 'react';
import { useRouter } from 'expo-router';
import styles from '../styles/stylesLearnMenu';
import BackIcon from '../assets/svg/back-icon.svg';
import { AuthContext } from '../context/AuthContext';

const LearnKana = () => {
    const { user } = useContext(AuthContext);
    const router = useRouter();


    const handleBackPress = () => {
      router.back();
    };

    return (
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable onPress={handleBackPress}>
              <View style={styles.backButtonContainer}>
                <BackIcon width={20} height={20} fill={'white'} />
              </View>
            </Pressable>
          </View>
          <View style={styles.menuContainer}>

          </View>
        </View>
    );
};  

export default LearnKana;
