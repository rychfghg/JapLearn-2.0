import { View, Pressable, ImageBackground, TouchableOpacity, Text, Modal, TextInput, ScrollView , Image } from 'react-native';
import React, { useContext, useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { stylesLessonContent } from '../styles/stylesLessonContentEdit';
import { styles } from '../styles/stylesLessonModal';
import BackIcon from '../assets/svg/back-icon.svg';
import { AuthContext } from '../context/AuthContext';
import CustomButton from '../components/CustomButton';
import RemoveButton from '../components/RemoveButton';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Picker } from '@react-native-picker/picker';
import { Audio } from 'expo-av';
import expoconfig from '../expoconfig';

const LessonContentEdit = () => {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const { lessonPageId } = useLocalSearchParams();
    const [showAddContentModal, setShowAddContentModal] = useState(false);
    const [textContent, setTextContent] = useState('');
    const [image, setImage] = useState <string | null>(null);
    const [audio, setAudio] = useState(null);
    const [lessonContentData, setLessonContentData] = useState([]);
    const [lessonContent, setLessonContent] = useState(null);
    const [selectedLessonContent, setselectedLessonContent] = useState(new Set());
    const [showViewContentModal, setShowViewContentModal] = useState(false);
    const [gamePicked, setGamePicked] = useState('');
    const [showDeleteContentModal, setShowDeleteContentModal] = useState(false);
    const [showLessonContentEdit, setShowLessonContentEdit] = useState(false);
    const [lessonContentToEditId, setLessonContentToEditId] = useState('');
    const soundObject = new Audio.Sound();
    const [inputHeight, setInputHeight] = useState(65);
    const [selectedLessonContentToEdit, setSelectedLessonContentToEdit] = useState(null);

    const handleBackPress = () => {
      router.back();
    };

    const fetchLessonContent = async () => {
      try {
        console.log("Starting API call.....")
        const response = await fetch(`${expoconfig.API_URL}/api/lessonContent/getAllLessonContentWithFiles/${lessonPageId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          },
        });
    
        if (!response.ok) {
          throw new Error('Failed to fetch lesson content');
        }
    
        const data = await response.json();
        console.log("Data: ",data);
        // Transform the response if needed, e.g., base64 image/audio
        const transformedData = data.map((content) => ({
          ...content,
          contentImage: content.imageData
            ? { uri: `data:image/jpeg;base64,${content.imageData}` } // Assuming imageData is base64 encoded
            : null,
          contentAudio: content.audioData
            ? { uri: `data:audio/mpeg;base64,${content.audioData}`, name: content.audioFileName } // Assuming audioData is base64 encoded
            : null,
        }));
    
        setLessonContentData(transformedData);
      } catch (error) {
        console.error('Error fetching lesson content:', error.message);
      }
    };

    useEffect(() => {
        fetchLessonContent();  // Call the fetch function
    }, [lessonPageId]);

    const handleAddLessonContent = () => {
      setShowAddContentModal(true);
    }

    const handleSaveLessonContent = async () => {
      // console.log("image URI: ", image.uri);
      const formData = new FormData();
    
      // Add JSON data as a string
      formData.append(
        "lessonContent",
        JSON.stringify({
          text_content: textContent,
          lessonPageId: lessonPageId,
        })
      );
    
      // Add image file if selected
      if (image) {
        console.log('Adding image file:', image.uri);  // Log image URI to make sure it's correct
        console.log('Adding image type:', image.type)
        console.log('Adding image name:', image.fileName)
        formData.append("imageFile", {
          uri: image.uri,
          type: image.mimeType || "image/jpeg",  // Default to JPEG
          name: image.fileName || "image.jpg",  // Provide a default file name
        });
      } else {
        console.log('No image file selected.');
      }
    
      // Add audio file if selected
      if (audio) {
        console.log('Adding audio file:', audio.uri);  // Log audio URI to make sure it's correct
        formData.append("audioFile", {
          uri: audio.uri,
          type: audio.type || "audio/mpeg",  // Default to MPEG
          name: audio.name || "audio.mp3",  // Provide a default file name
        });
      } else {
        console.log('No audio file selected.');
      }
    
      try {
        // Send the request with FormData
        const response = await fetch(`${expoconfig.API_URL}/api/lessonContent/addLessonContent`, {
          method: "POST",
          body: formData, // Do not set Content-Type, browser will handle it
          headers: {
            Accept: "application/json", // This tells the server that the response should be in JSON format
          },
        });

        console.log("response: ", response);
    
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to add lesson content: ${errorText}`);
        }
    
        const newContent = await response.json();
        setLessonContentData([...lessonContentData, newContent]);
        console.log("Successfully added lesson content");
        cancelAdd();
        setShowAddContentModal(false);
      } catch (error) {
        console.error("Error adding lesson content:", error.message);
      }
    };
    
    const cancelAdd = () => {
      setTextContent('');
      setImage(null);
      setAudio(null);
      setGamePicked('');
      setShowAddContentModal(false);
    }

    const handleRemoveLessonContent = () => {
      setShowDeleteContentModal(true);
    }

    const confirmRemoveLessonContent = async () => {
      try {
        const selectedIds = Array.from(selectedLessonContent);
        if (selectedIds.length === 0) {
          console.log("No lesson content selected for deletion.");
          return;
        }
    
        // Sending delete request for each selected content
        for (const id of selectedIds) {
          const response = await fetch(`${expoconfig.API_URL}/api/lessonContent/deleteLessonContent?lessonContentId=${id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });
    
          if (!response.ok) {
            throw new Error('Failed to delete lesson content');
          }
    
          // Filter out deleted content from the state
          setLessonContentData(prevData => prevData.filter(content => content.id !== id));
          console.log(`Lesson content with ID ${id} deleted successfully`);
        }
    
        // Reset selected items after deletion
        setselectedLessonContent(new Set());
      } catch (error) {
        console.error('Error deleting lesson content:', error.message);
      } finally {
        setShowDeleteContentModal(false); // Close delete modal
      }
    }

    const handleLessonContentEdit = (content) => {
      setSelectedLessonContentToEdit(content);
      setLessonContentToEditId(content.id);
      setTextContent(content.text_content);
      setImage(content.contentImage);
      setAudio(content.contentAudio);
      setGamePicked(content.contentGame);
      setShowLessonContentEdit(true);
    }
    
    const confirmLessonContentEdit = async() => {
      try{ 
        const formData = new FormData();
        formData.append('lessonContent', JSON.stringify({
          text_content: textContent
        }));
        if (image) formData.append('imageFile', { uri: image.uri, type: image.mimeType, name: image.name });
        if (audio) formData.append('audioFile', { uri: audio.uri, type: audio.type, name: audio.name });

        console.log(formData);

        const response = await fetch(`${expoconfig.API_URL}/api/lessonContent/updateLessonContent/${lessonContentToEditId}`,{
          method: 'PUT',
          body: formData,
          headers: {
            Accept: 'application/json' }
        });

        const updatedContent = await response.json();
        console.log("Content: ", updatedContent);
        setLessonContentData((prevContent) =>
          prevContent.map((content) =>
            content.id === lessonContentToEditId ? updatedContent : content
          )
        );

        setLessonContentToEditId('');
        setTextContent('');
        setImage(null);
        setAudio(null);
        setGamePicked('');
        setShowLessonContentEdit(false);
      } catch (error) {
        console.error("Error updating content: ",error);
      }
    }

    const cancelLessonContentEdit = () => {
      setLessonContentToEditId('');
      setTextContent('');
      setImage(null);
      setAudio(null);
      setGamePicked('');
      setShowLessonContentEdit(false);
    }

    //Image picker
    const pickImage = async () => {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All
      });
  
      console.log(result);
  
      if (!result.canceled) {
        setImage(result.assets[0]);
      }
    };

    const removeImage = () => {
      setImage(null);
    }

    //Get Audio
    const pickAudio = async () => {
     let result = await DocumentPicker.getDocumentAsync({type: 'audio/*', copyToCacheDirectory:true});

     console.log(result);

     if(!result.canceled){
      setAudio(result.assets[0]);
     }
    }
    
    const removeAudio = () => {
      setAudio(null);
    }

    const playAudio = async (audio) => {
      const audioUri = audio.uri;

      soundObject.setOnPlaybackStatusUpdate();

      await soundObject.loadAsync({uri: audioUri});
      await soundObject.playAsync();
      soundObject.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {;

          soundObject.setPositionAsync(0);
          unloadAudio();
        }
      });
    }

    const unloadAudio = async () => {
      await soundObject.unloadAsync();
    }
  
    const toggleSelectContent = (id) => {
      const newSelectedLessonContent = new Set(selectedLessonContent);
      if(newSelectedLessonContent.has(id)){
        newSelectedLessonContent.delete(id);
      } else {
        newSelectedLessonContent.add(id);
      }
      setselectedLessonContent(newSelectedLessonContent);
    }

    const viewContent = (content) => {
      setLessonContent(content);
      setShowViewContentModal(true);
    }

    const closeViewContentModal = () => {
      setLessonContent(null);
      unloadAudio();
      setShowViewContentModal(false);
    }

    return (
      // Header 
        <View style={stylesLessonContent.container}>
          <View style={stylesLessonContent.header}>
            <TouchableOpacity onPress={handleBackPress}>
              <View style={stylesLessonContent.backButtonContainer}>
                <BackIcon width={20} height={20} fill={'white'} />
              </View>
            </TouchableOpacity>
            <View style={stylesLessonContent.centerContainer}>
                <Text style={stylesLessonContent.headerText}>Lesson Content Edit</Text>
            </View>
          </View>
          <View style={stylesLessonContent.buttonContainer}>
                <CustomButton title="Add" onPress={handleAddLessonContent} buttonStyle={stylesLessonContent.button} textStyle={stylesLessonContent.buttonText} />
                <CustomButton title="Remove" onPress={handleRemoveLessonContent} buttonStyle={stylesLessonContent.button} textStyle={stylesLessonContent.buttonText} />
          </View>

          {/* Lesson Content container view */}
          <ScrollView contentContainerStyle={stylesLessonContent.contentScrollContainer}>
            <View style={stylesLessonContent.lessonContentContainer}>
              {lessonContentData.map((content, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => toggleSelectContent(content.id)}
                  onLongPress={() => viewContent(content)}
                >
                  <View
                    style={[
                      stylesLessonContent.LessonContent,
                      selectedLessonContent.has(content.id) && stylesLessonContent.selectedLessonContent,
                    ]}
                  >
                    {/* Display Image */}
                    {content.imageData && (
                      <Image
                        source={{ uri: content.contentImage.uri }}
                        style={stylesLessonContent.lessonContentImage}
                      />
                    )}

                    {/* Content Details */}
                    <View style={stylesLessonContent.textContainer}>
                      {/* Display Text Content */}
                      {content.text_content && (
                        <Text style={stylesLessonContent.LessonContentText}>
                          Text Content: {content.text_content}
                        </Text>
                      )}

                      {/* Display Audio */}
                      {content.contentAudio && (
                        <View>
                          <Text style={stylesLessonContent.LessonContentText}>
                            Audio: {content.audio_name}
                          </Text>
                        </View>
                      )}

                      {/* Display Game Information */}
                      {content.contentGame && (
                        <Text style={stylesLessonContent.LessonContentText}>
                          Game: {content.contentGame}
                        </Text>
                      )}
                    </View>

                    {/* Edit Button */}
                    <CustomButton
                      title="Edit"
                      onPress={() => handleLessonContentEdit(content)}
                      buttonStyle={stylesLessonContent.lessonContentButton}
                      textStyle={stylesLessonContent.buttonText}
                    />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

         { /* modal for Adding content */ }
          <Modal
          animationType="slide"
          transparent={true}
          visible={showAddContentModal}
          onRequestClose={() => setShowAddContentModal(false)}
            >
              <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                      <TextInput
                          style={[styles.input, {textAlignVertical: 'top'}]}
                          multiline={true}
                          value={textContent}
                          onChangeText={setTextContent}
                          placeholder="Add Lesson Content"
                          onContentSizeChange={(event) =>
                            setInputHeight(event.nativeEvent.contentSize.height)
                        }
                      />
                      <CustomButton title="Pick an image" onPress={pickImage} buttonStyle={styles.button} textStyle={styles.buttonText}/>
                      {image && (
                        <>
                          <Text>Selected image: {image.fileName}</Text>
                          <RemoveButton title="Remove" onPress={removeImage} buttonStyle={styles.RemoveButton} textStyle={styles.buttonText}/>
                        </>
                      )}
                      <CustomButton title="Pick an audio" onPress={pickAudio}  buttonStyle={styles.button} textStyle={styles.buttonText}/>
                      {audio && (
                        <>
                          <Text>Selected audio: {audio.name}</Text>
                          <RemoveButton title="Remove" onPress={removeAudio} buttonStyle={styles.RemoveButton} textStyle={styles.buttonText}/>
                        </>
                      )}
                      {/* <Picker
                        selectedValue={gamePicked}
                        onValueChange={(itemValue, itemIndex) =>
                            setGamePicked(itemValue)
                          }>
                        <Picker.Item label="None" value=""/>
                        <Picker.Item label="Game 1" value="Game1"/>
                        <Picker.Item label="Game 2" value="Game2"/>
                        <Picker.Item label="Game 3" value="Game3"/>
                      </Picker> */}

                      <View style={styles.buttonRow}>
                          <CustomButton title="Save" onPress={handleSaveLessonContent} buttonStyle={styles.button} textStyle={styles.buttonText} />
                          <CustomButton title="Cancel" onPress={() => cancelAdd()} buttonStyle={styles.button} textStyle={styles.buttonText} />
                      </View>
                  </View>
              </View>
         </Modal>

         { /* modal for Removing content */ }
          <Modal
              animationType="slide"
              transparent={true}
              visible={showDeleteContentModal}
              onRequestClose={() => setShowDeleteContentModal(false)}
          >
              <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                      <Text style={styles.modalText}>Are you sure you want to remove the selected Lesson Content?</Text>
                      <View style={styles.buttonRow}>
                          <CustomButton title="Yes" onPress={confirmRemoveLessonContent} buttonStyle={styles.button} textStyle={styles.buttonText} />
                          <CustomButton title="No" onPress={() => setShowDeleteContentModal(false)} buttonStyle={styles.button} textStyle={styles.buttonText} />
                      </View>
                  </View>
              </View>
          </Modal>

          { /* modal for Editing content */ }
          {showLessonContentEdit && selectedLessonContentToEdit && (
          <Modal
          animationType="slide"
          transparent={true}
          visible={showLessonContentEdit}
          onRequestClose={() => setShowLessonContentEdit(false)}
            >
              <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                      <TextInput
                          style={styles.input}
                          value={textContent}
                          onChangeText={(text) => setTextContent(text)}
                          placeholder="Add Lesson Content"
                      />
                      <CustomButton title="Pick an image" onPress={pickImage} buttonStyle={styles.button} textStyle={styles.buttonText}/>
                      {image && (
                        <>
                          <Text>Selected image: {selectedLessonContentToEdit.image_name}</Text>
                          <RemoveButton title="Remove" onPress={removeImage} buttonStyle={styles.RemoveButton} textStyle={styles.buttonText}/>
                        </>
                      )}
                      <CustomButton title="Pick an audio" onPress={pickAudio}  buttonStyle={styles.button} textStyle={styles.buttonText}/>
                      {audio && (
                        <>
                          <Text>Selected audio: {selectedLessonContentToEdit.audio_name}</Text>
                          <RemoveButton title="Remove" onPress={removeAudio} buttonStyle={styles.RemoveButton} textStyle={styles.buttonText}/>
                        </>
                      )}
                      {/* <Picker
                        selectedValue={gamePicked}
                        onValueChange={(itemValue) =>
                            setGamePicked(itemValue)
                          }>
                        <Picker.Item label="None" value=""/>
                        <Picker.Item label="Game 1" value="Game1"/>
                        <Picker.Item label="Game 2" value="Game2"/>
                        <Picker.Item label="Game 3" value="Game3"/>
                      </Picker> */}

                      <View style={styles.buttonRow}>
                          <CustomButton title="Save" onPress={confirmLessonContentEdit} buttonStyle={styles.button} textStyle={styles.buttonText} />
                          <CustomButton title="Cancel" onPress={() => cancelLessonContentEdit()} buttonStyle={styles.button} textStyle={styles.buttonText} />
                      </View>
                  </View>
              </View>
         </Modal>
          )}

         { /* modal for Viewing content */ }
         <Modal
            animationType="slide"
            transparent={true}
            visible={showViewContentModal}
            onRequestClose={() => setShowViewContentModal(false)}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                {lessonContent ? (
                  <>
                    {lessonContent.contentImage && (
                      <Image
                        source={{ uri: lessonContent.contentImage.uri }}
                        style={styles.lessonContentImage}
                      />
                    )}
                    {lessonContent.lessonTextContent && (
                      <Text>
                        Text: {lessonContent.lessonTextContent}
                      </Text>
                    )}
                    {lessonContent.contentAudio && (
                      <Text>
                        Audio: {lessonContent.audio_name}
                        <CustomButton title="Play Audio" onPress={() => playAudio(lessonContent.contentAudio)} buttonStyle={styles.playButton} textStyle={styles.playButtonText} />
                      </Text>
                    )}
                    {lessonContent.contentGame && (
                      <Text>
                        Game: {lessonContent.contentGame}
                      </Text>
                    )}
                    </>
                ) : (
                  <> </>
                )}
                  <View style={styles.buttonRow}>              
                    <CustomButton title="Cancel" onPress={() => closeViewContentModal()} buttonStyle={styles.button} textStyle={styles.buttonText} />
                  </View>
              </View>
            </View>
          </Modal>
        </View>
    );
};  

export default LessonContentEdit;