import React, { useState } from 'react';
import { View, Text, ImageBackground, Pressable, Modal, StyleSheet, GestureResponderEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Define types for props
interface ImageButtonProps {
  imageSource: any; // For image source, React Native uses `require()`, so `any` is appropriate here
  title: string;
  subtitle: string;
  infoContent: string;
  onPress: (event: GestureResponderEvent) => void;
  buttonStyle?: object | null;
  textStyle?: object | null;
  disabled?: boolean;
  variant?: 'default' | 'learn';
  lessonNumber?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  accentColor?: string;
  darkMode?: boolean;
}

const ImageButton: React.FC<ImageButtonProps> = ({
  imageSource,
  title,
  subtitle,
  infoContent,
  onPress,
  buttonStyle,
  textStyle,
  disabled = false,
  variant = 'default',
  lessonNumber,
  iconName = 'book-outline',
  accentColor = '#8423D9',
  darkMode = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleInfoPress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handlePlayPress = (e: GestureResponderEvent) => {
    e.stopPropagation(); // Prevent triggering the container's onPress
    if (!disabled) onPress(e); // Trigger the play action if not disabled
  };

  if (variant === 'learn') {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.lessonCard,
          darkMode && styles.lessonCardDark,
          disabled && styles.lessonCardDisabled,
          pressed && !disabled && styles.lessonCardPressed,
        ]}
        onPress={!disabled ? onPress : undefined}
        disabled={disabled}
      >
        <ImageBackground source={imageSource} style={styles.lessonArtwork} imageStyle={styles.lessonArtworkImage} resizeMode="cover">
          <View style={styles.lessonArtworkShade} />
          <View style={[styles.lessonIcon, { backgroundColor: `${accentColor}18` }]}>
            <Ionicons name={disabled ? 'lock-closed' : iconName} size={25} color={disabled ? '#9C94A1' : accentColor} />
          </View>
          <View style={styles.lessonNumberPill}>
            <Text style={styles.lessonNumberText}>{disabled ? 'LOCKED' : `PATH ${lessonNumber}`}</Text>
          </View>
        </ImageBackground>

        <View style={[styles.lessonBody, darkMode && styles.lessonBodyDark]}>
          <View style={styles.lessonHeadingRow}>
            <View style={styles.lessonCopy}>
              <Text style={[styles.lessonTitle, darkMode && styles.lessonTitleDark, disabled && styles.lessonTextDisabled]}>{title}</Text>
              <Text style={[styles.lessonSubtitle, darkMode && styles.lessonSubtitleDark, disabled && styles.lessonTextDisabled]}>{subtitle}</Text>
            </View>
            <Pressable
              hitSlop={10}
              style={styles.lessonInfoButton}
              disabled={disabled}
              onPress={(e) => {
                e.stopPropagation();
                handleInfoPress();
              }}
            >
              <Ionicons name="information-circle-outline" size={22} color="#766B7C" />
            </Pressable>
          </View>

          <View style={styles.lessonFooter}>
            <Text style={[styles.lessonStatus, { color: disabled ? '#958D9A' : accentColor }]}>
              {disabled ? 'Complete the previous path to unlock' : 'Start learning'}
            </Text>
            <View style={[styles.lessonArrow, { backgroundColor: disabled ? '#EEEAEF' : accentColor }]}>
              <Ionicons name={disabled ? 'lock-closed' : 'arrow-forward'} size={17} color="#FFFFFF" />
            </View>
          </View>
        </View>

        <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={handleCloseModal}>
          <Pressable style={styles.lessonModalBackdrop} onPress={handleCloseModal}>
            <Pressable style={styles.lessonModalCard} onPress={(e) => e.stopPropagation()}>
              <View style={[styles.lessonModalIcon, { backgroundColor: `${accentColor}18` }]}>
                <Ionicons name={iconName} size={28} color={accentColor} />
              </View>
              <Text style={styles.lessonModalEyebrow}>ABOUT THIS PATH</Text>
              <Text style={styles.lessonModalTitle}>{title}</Text>
              <Text style={styles.lessonModalText}>{infoContent}</Text>
              <Pressable onPress={handleCloseModal} style={[styles.lessonModalButton, { backgroundColor: accentColor }]}>
                <Text style={styles.lessonModalButtonText}>Got it</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[styles.buttonContainer, buttonStyle, disabled && styles.disabledButton]}
      onPress={!disabled ? onPress : undefined}
      disabled={disabled}
    >
      <View style={[styles.upperPart, disabled && styles.disabledUpper]}>
        <ImageBackground
          source={imageSource}
          style={styles.imageBackground}
          resizeMode="cover"
        >
          <Pressable
            style={[styles.infoButton, disabled && styles.disabledInfoButton]}
            onPress={handleInfoPress}
            disabled={disabled}
          >
            <Text style={[styles.infoText, disabled && styles.disabledText]}>i</Text>
          </Pressable>
        </ImageBackground>
      </View>
      <View style={[styles.lowerPart, disabled && styles.disabledLower]}>
        <Text style={[styles.title, textStyle, disabled && styles.disabledText]}>{title}</Text>
        <Text style={[styles.subtitle, textStyle, disabled && styles.disabledText]}>{subtitle}</Text>
        <Pressable
          style={[styles.playButton, disabled && styles.disabledPlayButton]}
          onPress={handlePlayPress}
          disabled={disabled}
        >
          <Text style={[styles.playText, disabled && styles.disabledPlayText]}>▶</Text>
        </Pressable>
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{infoContent}</Text>
            <Pressable onPress={handleCloseModal} style={styles.modalButton}>
              <Text style={styles.closeModalText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  lessonCard: {
    width: '100%', minHeight: 158, borderRadius: 24, backgroundColor: '#FFFFFF',
    flexDirection: 'row', overflow: 'hidden', borderWidth: 1, borderColor: '#ECE5F0',
    shadowColor: '#40224F', shadowOpacity: 0.10, shadowRadius: 16,
    shadowOffset: { width: 0, height: 7 }, elevation: 5, marginBottom: 14,
  },
  lessonCardDisabled: { opacity: 0.72, backgroundColor: '#FAF9FB' },
  lessonCardDark: { backgroundColor: '#21172A', borderColor: '#3B2B46' },
  lessonCardPressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  lessonArtwork: { width: 112, minHeight: 158, padding: 13, justifyContent: 'space-between' },
  lessonArtworkImage: { opacity: 0.58 },
  lessonArtworkShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.33)' },
  lessonIcon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  lessonNumberPill: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.90)', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 5 },
  lessonNumberText: { color: '#5D5264', fontSize: 8, fontWeight: '900', letterSpacing: 0.8 },
  lessonBody: { flex: 1, paddingHorizontal: 16, paddingVertical: 17, justifyContent: 'space-between', borderLeftWidth: 1, borderLeftColor: '#F1EBF3' },
  lessonBodyDark: { borderLeftColor: '#3B2B46' },
  lessonHeadingRow: { flexDirection: 'row', alignItems: 'flex-start' },
  lessonCopy: { flex: 1, paddingRight: 6 },
  lessonTitle: { color: '#382044', fontFamily: 'Jua', fontSize: 21 },
  lessonTitleDark: { color: '#F6EFFA' },
  lessonSubtitle: { color: '#7E7383', fontSize: 12, lineHeight: 17, marginTop: 3 },
  lessonSubtitleDark: { color: '#B9ACBF' },
  lessonTextDisabled: { color: '#88818B' },
  lessonInfoButton: { width: 34, height: 34, borderRadius: 12, backgroundColor: '#F7F3F9', alignItems: 'center', justifyContent: 'center' },
  lessonFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 13 },
  lessonStatus: { flex: 1, fontSize: 10, lineHeight: 13, fontWeight: '800', paddingRight: 8 },
  lessonArrow: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  lessonModalBackdrop: { flex: 1, backgroundColor: 'rgba(32,18,40,0.58)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  lessonModalCard: { width: '100%', maxWidth: 360, borderRadius: 26, backgroundColor: '#FFFFFF', padding: 24, alignItems: 'center' },
  lessonModalIcon: { width: 58, height: 58, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  lessonModalEyebrow: { color: '#8ED94D', fontSize: 9, fontWeight: '900', letterSpacing: 1.4 },
  lessonModalTitle: { color: '#382044', fontFamily: 'Jua', fontSize: 24, marginTop: 4 },
  lessonModalText: { color: '#766B7C', fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 8 },
  lessonModalButton: { width: '100%', height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  lessonModalButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  buttonContainer: {
    width: 300,
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 5,
    borderColor: '#81AF59',
    marginBottom: 20,
  },
  upperPart: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 10,
  },
  infoButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#A0D468',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    color: '#fff',
    fontSize: 18,
  },
  lowerPart: {
    flex: 1,
    backgroundColor: '#A0D468',
    justifyContent: 'center',
    paddingLeft: 15,
  },
  title: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
  },
  playButton: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playText: {
    color: '#A0D468',
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 250,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
  closeModalText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalButton: {
    padding: 10,
    backgroundColor: '#8ED94D',
    justifyContent: 'center',
    borderRadius: 5,
  },
  // Disabled styles
  disabledButton: {
    borderColor: 'gray',
    opacity: 0.6,
  },
  disabledUpper: {
    backgroundColor: '#ccc',
  },
  disabledLower: {
    backgroundColor: '#999',
  },
  disabledInfoButton: {
    backgroundColor: '#888',
  },
  disabledText: {
    color: '#666',
  },
  disabledPlayButton: {
    backgroundColor: '#ddd',
  },
  disabledPlayText: {
    color: '#bbb',
  },
});

export default ImageButton;
