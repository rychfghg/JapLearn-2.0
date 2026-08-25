import React from 'react';
import { Image, Pressable, SafeAreaView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import styles from '../styles/stylesIndex';

const WelcomeScreen = () => (
  <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      <View style={styles.decorativeCircle} />
      <View style={styles.decorativeCircleSmall} />
      <View style={styles.cloudOne} />
      <View style={styles.cloudTwo} />

      <View style={styles.content}>
        <View style={styles.brandRow}>
          <View style={styles.logoPlate}>
            <Image source={require('../assets/APPLOGO.png')} style={styles.appLogo} />
          </View>
          <View>
            <Text style={styles.brandName}>JAPLEARN</Text>
            <Text style={styles.brandSubtitle}>Japanese made interactive</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <View style={styles.mascotScene}>
            <View style={styles.mascotHalo} />
            <View style={styles.mascotGround} />
            <Image source={require('../assets/hello.png')} style={styles.mascot} resizeMode="contain" />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>はじめよう</Text>
            <Text style={styles.title}>Japanese starts here.</Text>
            <Text style={styles.subtitle}>Learn. Play. Speak.</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={() => router.push('/Signup')} style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}>
            <Text style={styles.primaryButtonText}>Create an account</Text>
            <View style={styles.primaryArrow}><Ionicons name="arrow-forward" size={18} color="#8423D9" /></View>
          </Pressable>
          <Pressable onPress={() => router.push('/Login')} style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}>
            <Ionicons name="log-in-outline" size={19} color="#684B76" />
            <Text style={styles.secondaryButtonText}>I already have an account</Text>
          </Pressable>
        </View>

        <Text style={styles.footerText}>Small steps, meaningful progress.</Text>
      </View>
    </View>
  </SafeAreaView>
);

export default WelcomeScreen;
