import React, { useState } from 'react';
import { Pressable, Text, StyleSheet, ImageBackground, View, Modal } from 'react-native';

const MenuButton = ({ title, onPress, buttonStyle, textStyle, imageSource, infoText, imageStyle }) => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Pressable
        onPress={onPress}
        style={[styles.button, buttonStyle]}
      >
        <ImageBackground
          source={imageSource}
          style={[styles.imageBackground, imageStyle]}
          imageStyle={styles.image}
        >
          <Text style={[styles.text, textStyle]}>{title}</Text>
          <Pressable
            style={styles.infoButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.infoText}>i</Text>
          </Pressable>
        </ImageBackground>
      </Pressable>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Text style={styles.modalContent}>{infoText}</Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderRadius: 20,
    borderWidth: 5,
    borderColor: '#81AF59',
  },
  imageBackground: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    resizeMode: 'contain', // Adjust the image size without covering the entire background
  },
  text: {
    fontFamily: 'Jua',
    fontSize: 18,
    color: 'white',
    zIndex: 1, // Ensures the text appears above the image
  },
  infoButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15, // Half of the width/height to make it a circle
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2, // Ensures the info button appears above the image and text
  },
  infoText: {
    color: 'white',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalContent: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#81AF59',
    borderRadius: 10,
    padding: 10,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default MenuButton;
