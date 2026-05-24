import { Text, View, Pressable, ImageBackground, Modal, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import React, { useContext, useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { stylesLessonPage } from '../styles/stylesLessonPageEdit';
import { styles } from '../styles/stylesLessonModal';
import BackIcon from '../assets/svg/back-icon.svg';
import { AuthContext } from '../context/AuthContext';
import CustomButton from '../components/CustomButton';
import expoconfig from '../expoconfig';

const LessonPageEdit = () => {
    const { user } = useContext(AuthContext);
    const router = useRouter();
    const { lessonId } = useLocalSearchParams();
    const [showAddPageModal, setShowAddPageModal] = useState(false);
    const [showRemovePageModal, setShowRemovePageModal] = useState(false);
    const [lessonPageData, setLessonPageData] = useState([]);
    const [newPageTitle, setNewPageTitle] = useState('');
    const [selectedPages, setSelectedPages] = useState(new Set());
    const [showEditPageTitleModal, setShowEditPageTitleModal] = useState(false);
    const [pageToEditId, setPageToEditId] = useState(null);

    // Function to fetch lesson page data
  const fetchLessonPageData = async () => {
    try {
      // Replace 'API_URL' with your backend API URL
      const response = await fetch(`${expoconfig.API_URL}/api/lessonPage/getAllLessonPage/${lessonId}`);
      
      if (response.ok) {
        const data = await response.json();  // Parse the response as JSON
        setLessonPageData(data);  // Set the fetched data to state
      } else {
        Alert.alert('Error', 'Failed to fetch lesson pages');
      }
    } catch (error) {
      console.error('Error fetching lesson page data:', error);
      Alert.alert('Error', 'Unable to fetch lesson pages');
    }
  };

  // Fetch data when the component mounts
  useEffect(() => {
    if (lessonId) {
      fetchLessonPageData();  // Call the fetch function
    }
  }, [lessonId]);

    const handleBackPress = () => {
      router.back();
    };

    const handleLessonPageLongPress = (lessonPageId) => {
      console.log("lessonPageID: ", lessonPageId);
      router.push(`/LessonContentEdit?lessonPageId=${lessonPageId}`);
    }

    const toggleSelectPage = (id) => {
      const newSelectedPages = new Set(selectedPages);
      if (newSelectedPages.has(id)) {
        newSelectedPages.delete(id);
    } else {
      newSelectedPages.add(id);
    }
      setSelectedPages(newSelectedPages);
    }

    const handleAddPage = () => {
      setShowAddPageModal(true);
    }

    const handleSavePage = async () => {
      if (newPageTitle.trim() === "") {
        alert("Please enter a lesson title.");
        return;
      }
    
      const newPage = {
        lessonId :lessonId,
        page_title: newPageTitle, // Include other properties if needed, like `lessonId` if it's required on the server side
      };
    
      try {
        // Replace 'API_URL' with your backend API URL
        const response = await fetch(`${expoconfig.API_URL}/api/lessonPage/addLessonPage`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newPage),
        });
    
        if (response.ok) {
          const savedPage = await response.json(); // Get the saved page from the response
    
          // Update the local state with the newly saved page
          setLessonPageData((prevData) => [...prevData, savedPage]);
    
          // Reset the input fields and close the modal
          setNewPageTitle('');
          setShowAddPageModal(false);
        } else {
          alert("Error: Failed to save the page.");
        }
      } catch (error) {
        console.error("Error saving lesson page:", error);
        alert("Error: Unable to save the page.");
      }
    };

    const canelAdd = () => {
      setNewPageTitle('');
      setShowAddPageModal(false);
    }

    const handleRemovePage = () => {
      if(selectedPages.size === 0){
        return;
      }

      setShowRemovePageModal(true);
    }

    const confirmRemovePages = async () => {
      try {
        // Loop over the selected pages to send delete requests for each one
        for (let id of selectedPages) {
          console.log(`Removing lesson with id: ${id}`);
          
          // Send DELETE request to the backend to remove the page
          const response = await fetch(`${expoconfig.API_URL}/api/lessonPage/deleteLessonPage?pageId=${id}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
          });
    
          if (!response.ok) {
            console.error('Error in deleting page', id);
          }
        }
    
        // Update local state to remove deleted pages
        setLessonPageData(prev => prev.filter(page => !selectedPages.has(page.id)));
    
        // Reset the selected pages state
        setSelectedPages(new Set());
    
        // Close the modal
        setShowRemovePageModal(false);
    
      } catch (error) {
        console.error('Error in removing pages', error);
      }
    };
 
    const handleLessonPageEdit = (pageId, currentTitle) => {
      // Set the page ID and current title so the modal can display them
      setPageToEditId(pageId);
      setNewPageTitle(currentTitle); // This is the title currently being edited
      setShowEditPageTitleModal(true); // Show the modal
    };

    const editLessonPageTitle = async () => {
      if (newPageTitle.trim().length === 0) {
        alert("Please input a title");
        return;
      }
    
      // Step 1: Update the local state
      setLessonPageData(prevPages =>
        prevPages.map(page =>
          page.id === pageToEditId
            ? { ...page, page_title: newPageTitle } // Update the title of the page to the new value
            : page
        )
      );
    
      // Step 2: Send the PUT request to the backend to update the lesson page title
      try {
        const response = await fetch(`${expoconfig.API_URL}/api/lessonPage/updateLessonPage/${pageToEditId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: pageToEditId,
            page_title: newPageTitle,
          }),
        });
    
        if (!response.ok) {
          alert('Error: Failed to update the lesson page title.');
          console.error('Error updating lesson page title', await response.text());
        }
    
        // Step 3: Reset state and close modal after success
        setNewPageTitle('');
        setPageToEditId(null);
        setShowEditPageTitleModal(false);
    
      } catch (error) {
        console.error('Error in editing page title:', error);
        alert('Error: Unable to update the lesson page title.');
      }
    };

    return (
        <View style={stylesLessonPage.container}>
          <View style={stylesLessonPage.header}>
            <TouchableOpacity onPress={handleBackPress}>
                <View style={stylesLessonPage.backButtonContainer}>
                  <BackIcon width={20} height={20} fill={'white'} />
                </View>
            </TouchableOpacity>
            <View style={stylesLessonPage.centerContainer}>
                <Text style={stylesLessonPage.headerText}>Lesson Page Edit</Text>
            </View>
          </View>
          {/* Buttons section */}
          <View style={stylesLessonPage.buttonContainer}>
                <CustomButton title="Add" onPress={handleAddPage} buttonStyle={styles.button} textStyle={styles.buttonText} />
                <CustomButton title="Remove" onPress={handleRemovePage} buttonStyle={styles.button} textStyle={styles.buttonText} />
          </View>

          {/* Page container view */}
          <ScrollView contentContainerStyle={stylesLessonPage.contentScrollContainer}>
            <View style={stylesLessonPage.pageContentContainer}>
                {lessonPageData.map((page, index) => (
                    <TouchableOpacity key={index} onPress={() => toggleSelectPage(page.id)} 
                    onLongPress={() => handleLessonPageLongPress(page.id)}
                    >
                        <View style={[stylesLessonPage.pageContent, selectedPages.has(page.id) && stylesLessonPage.selectedPage]}>
                            <Text style={stylesLessonPage.pageContentText}>{page.page_title}</Text>
                            <CustomButton title="Edit" onPress={() => handleLessonPageEdit(page.id, page.page_title)} buttonStyle={stylesLessonPage.lessonButton} textStyle={stylesLessonPage.buttonText} />
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
          </ScrollView>

          {/*Modal for Adding Pages*/}
          <Modal
          animationType="slide"
          transparent={true}
          visible={showAddPageModal}
          onRequestClose={() => setShowAddPageModal(false)}
            >
              <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                      <TextInput
                          style={styles.input}
                          value={newPageTitle}
                          onChangeText={setNewPageTitle}
                          placeholder="Page Title"
                      />
                      <View style={styles.buttonRow}>
                          <CustomButton title="Save" onPress={handleSavePage} buttonStyle={styles.button} textStyle={styles.buttonText} />
                          <CustomButton title="Cancel" onPress={() => canelAdd()} buttonStyle={styles.button} textStyle={styles.buttonText} />
                      </View>
                  </View>
              </View>
         </Modal>

          {/*Modal for Removing Pages*/}
          <Modal
              animationType="slide"
              transparent={true}
              visible={showRemovePageModal}
              onRequestClose={() => setShowRemovePageModal(false)}
          >
              <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                      <Text style={styles.modalText}>Are you sure you want to remove the selected Pages?</Text>
                      <View style={styles.buttonRow}>
                          <CustomButton title="Yes" onPress={confirmRemovePages} buttonStyle={styles.button} textStyle={styles.buttonText} />
                          <CustomButton title="No" onPress={() => setShowRemovePageModal(false)} buttonStyle={styles.button} textStyle={styles.buttonText} />
                      </View>
                  </View>
              </View>
          </Modal>

          {/* Modal for Editing Page Title */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={showEditPageTitleModal}
            onRequestClose={() => setShowEditPageTitleModal(false)}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <TextInput
                  style={styles.input}
                  value={newPageTitle} // This should show the current title to be edited
                  onChangeText={setNewPageTitle} // Updates the title as user types
                  placeholder="Page Title"
                />
                <View style={styles.buttonRow}>
                  <CustomButton
                    title="Save"
                    onPress={editLessonPageTitle}
                    buttonStyle={styles.button}
                    textStyle={styles.buttonText}
                  />
                  <CustomButton
                    title="Cancel"
                    onPress={() => setShowEditPageTitleModal(false)}
                    buttonStyle={styles.button}
                    textStyle={styles.buttonText}
                  />
                </View>
              </View>
            </View>
          </Modal>

        </View>
    );
};  

export default LessonPageEdit;
