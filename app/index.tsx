import React from 'react';
import { Image, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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
          <View style={styles.heroCopy}>
            <View style={styles.eyebrowPill}>
              <View style={styles.eyebrowDot} />
              <Text style={styles.eyebrow}>YOUR JAPANESE JOURNEY</Text>
            </View>
            <Text style={styles.title}>Learn Japanese, one joyful step at a time.</Text>
            <Text style={styles.subtitle}>Build real skills through guided lessons, playful challenges, and speaking practice.</Text>
          </View>

          <View style={styles.mascotScene}>
            <View style={styles.mascotHalo} />
            <View style={styles.toriiTop} />
            <View style={styles.toriiLeft} />
            <View style={styles.toriiRight} />
            <View style={styles.mascotGround} />
            <Image source={require('../assets/hello.png')} style={styles.mascot} resizeMode="contain" />
            <View style={styles.speechBubble}>
              <Text style={styles.speechJapanese}>はじめよう!</Text>
              <Text style={styles.speechTranslation}>Let&apos;s begin!</Text>
            </View>
          </View>
        </View>

        <View style={styles.featureRow}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, styles.featureIconPurple]}><Ionicons name="book-outline" size={18} color="#8423D9" /></View>
            <Text style={styles.featureText}>Guided lessons</Text>
          </View>
          <View style={styles.featureDivider} />
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, styles.featureIconGreen]}><Ionicons name="game-controller-outline" size={18} color="#61A936" /></View>
            <Text style={styles.featureText}>Play & practice</Text>
          </View>
          <View style={styles.featureDivider} />
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, styles.featureIconOrange]}><Ionicons name="mic-outline" size={18} color="#D88727" /></View>
            <Text style={styles.featureText}>Speak naturally</Text>
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

        <Text style={styles.footerText}>Small steps. Real progress. Japanese that stays with you.</Text>
      </ScrollView>
    </View>
  </SafeAreaView>
);

export default WelcomeScreen;
