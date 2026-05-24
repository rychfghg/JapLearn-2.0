import React, { useContext, useEffect } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router } from 'expo-router';
import CustomButton from '../components/CustomButton';
import Logo from '../assets/svg/index_logo.svg';
import styles from '../styles/stylesIndex';


const Login = () => {

  return (
    <View style={styles.container}>
        <View style={styles.logoContainer}>
            <Logo width={190} height={190} />
            <View style={styles.textContainer}>
                <Text style={styles.textLogo}>Have fun, and enjoy learning language!</Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <CustomButton title="GET STARTED" onPress={() => router.push("/Signup")} buttonStyle={styles.button} textStyle={styles.buttonText} />
          <CustomButton title="ALREADY HAVE AN ACCOUNT" onPress={() => router.push("/Login")} buttonStyle={styles.button} textStyle={styles.buttonText} />
        </View>
    </View>
  )
}

export default Login;
