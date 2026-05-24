import React from 'react';
import { Image, StyleSheet, View, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const Scene = ({ backgroundSource, characterSource, characterPosition }) => {
  const getCharacterPosition = () => {
    switch (characterPosition) {
      case 'left':
        return { left: '10%' };
      case 'right':
        return { right: '10%' };
      case 'center':
      default:
        return { left: width / 2 - characterImageWidth / 2 };
    }
  };

  // Calculate the character image size based on screen dimensions
  const characterImageWidth = width * 0.7; // 40% of the screen width
  const characterImageHeight = height * 0.79; // 60% of the screen height

  return (
    <View style={styles.container}>
      <Image source={backgroundSource} style={styles.backgroundImage} />
      {characterSource && (
        <Image 
          source={characterSource} 
          style={[
            styles.characterImage, 
            getCharacterPosition(), 
            { width: characterImageWidth, height: characterImageHeight }
          ]} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  characterImage: {
    position: 'absolute',
    bottom: 0,
    resizeMode: 'contain',
  },
});

export default Scene;