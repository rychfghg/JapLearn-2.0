import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Alert, TextInput } from 'react-native';
import CustomButton from '../components/CustomButton';
import { stylesClass } from '../styles/stylesClass';
import { styles } from '../styles/stylesModal';
import { styles1 } from '../styles/stylesModal1';
import BackIcon from '../assets/svg/back-icon.svg';
import expoconfig from '../expoconfig';
import Icon1 from '../assets/svg/gameIcon1.svg';
import Icon2 from '../assets/svg/gameIcon2.svg';
import Icon3 from '../assets/svg/gameIcon3.svg';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

const ClassDashboard = () => {
    const [activeCategory, setActiveCategory] = useState('MEMBERS');
    const { classCode } = useLocalSearchParams();
    const [userData, setUserData] = useState([]);
    const [scoresData, setScoresData] = useState([]);
    const [filteredScoresData, setFilteredScoresData] = useState([]);
    const [selectedScores, setSelectedScores] = useState(new Set());
    const [selectedStudents, setSelectedStudents] = useState(new Set());
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [showConfirmRemoveModal, setShowConfirmRemoveModal] = useState(false);
    const [selectedGame, setSelectedGame] = useState(null);
    const router = useRouter();
    const [lessonsData, setLessonsData] = useState([]);
    const [showAddLessonModal, setShowAddLessonModal] = useState(false);
    const [newLessonTitle, setNewLessonTitle] = useState('');
    const [selectedLessons, setSelectedLessons] = useState(new Set());
    const [showConfirmRemoveLessonModal, setShowConfirmRemoveLessonModal] = useState(false);
    const [showEditLessonTitleModal, setShowEditLessonTitleModal] = useState(false);
    const [lessonToEditId, setLessonToEditId] = useState(null);
    const [lessonType, setLessonType] = useState('');
    const [showAddLessonMenuModal, setShowAddLessonMenuModal] = useState(false);
    const [showDatabankLessonChoicesModal, setShowDatabankLessonChoicesModal] = useState(false);
    const [databankLessonsData, setdatabankLessonsData] = useState([]);
    const [databankLessonData, setdatabankLessonData] = useState(null);
    const [databankLessonPageData, setdatabankLessonPageData] = useState(null);
    const [lessonPageData, setShowLessonPageData] = useState(null);
    const [databankLessonContentData, setdatabankLessonContentData] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(false);
    const [filteredUserData, setFilteredUserData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [availableDates, setAvailableDates] = useState([]);
    const [showDatesModal, setShowDatesModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    const deleteScoresByDate = async (date) => {
        try {
            const response = await fetch(`${expoconfig.API_URL}/api/scores/deleteByDate?date=${date}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (response.ok) {
                alert(`Scores deleted successfully for the date: ${date}`);
                fetchAvailableDates(); // Refresh scores data
            } else {
                const errorData = await response.json();
                alert(`Failed to delete scores: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error deleting scores:', error);
            alert('Error deleting scores. Please try again.');
        }
    };
    

    const fetchAvailableDates = async () => {
        try {
            const response = await fetch(`${expoconfig.API_URL}/api/scores/getAvailableDates`);
            if (response.ok) {
                const dates = await response.json();
                setAvailableDates(dates);
                setShowDatesModal(true); // Show modal after fetching dates
            } else {
                console.error('Failed to fetch available dates');
            }
        } catch (error) {
            console.error('Error fetching available dates:', error);
        }
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
        setShowConfirmationModal(true);
    };
    
    


    const downloadCsv = (date) => {
        fetch(`${expoconfig.API_URL}/api/scores/export?date=${date}`)
            .then((response) => {
                if (response.ok) {
                    return response.blob(); // Convert to blob
                } else {
                    throw new Error('Failed to download file');
                }
            })
            .then((blob) => {
                // Create a download link
                const url = window.URL.createObjectURL(new Blob([blob]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `scores_${date}.csv`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            })
            .catch((error) => console.error('Error downloading file:', error));
    };

    useEffect(() => {
        const lowerCaseQuery = searchQuery.toLowerCase();
        const filtered = userData.filter(user =>
            `${user.fname} ${user.lname}`.toLowerCase().includes(lowerCaseQuery)
        );
        setFilteredUserData(filtered);
    }, [searchQuery, userData]);
    

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`${expoconfig.API_URL}/api/students/getByClassCode?classCode=${classCode}`);
                if (response.ok) {
                    const data = await response.json();
                    setUserData(data);
                } else {
                    console.error('Failed to fetch user data');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        fetchUserData();
    }, [classCode]);


    const handleDeleteModalConfirm = async () => {
        setShowDeleteModal(false);
        console.log('Removing students:', selectedStudents);
        try {
            for (let id of selectedStudents) {
                const student = userData.find(user => user.id === id);
                const response = await fetch(`${expoconfig.API_URL}/api/students/removeStudent`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ classCode, name: `${student.fname} ${student.lname}` })
                });
                if (response.ok) {
                    const updatedUserData = userData.filter(user => user.id !== id);
                    setUserData(updatedUserData);
                    console.log('Student removed successfully');
                } else {
                    const errorData = await response.json();
                    console.error('Failed to remove student:', errorData);
                }
            }
        } catch (error) {
            console.error('Error removing students:', error);
        }
    };
    
    

    const handleCategoryPress = (category) => {
        setActiveCategory(category);
    };

    const handleBackPress = () => {
        router.push('/TeacherDashboard');
    };

    const getGameName = (level) => {
        if (level.startsWith('Intro') || level.startsWith('Basics')) {
            return `Quackslate ${level}`;
        } else if (level.startsWith('Hiragana') || level.startsWith('Katakana')) {
            return `Quackamole ${level}`;
        } else {
            return `Quackman ${level}`;
        }
    };


    const toggleSelectScore = (id) => {
        const newSelectedScores = new Set(selectedScores);
        if (newSelectedScores.has(id)) {
            newSelectedScores.delete(id);
        } else {
            newSelectedScores.add(id);
        }
        setSelectedScores(newSelectedScores);
    };

    const toggleSelectStudent = (id) => {
        const newSelectedStudents = new Set(selectedStudents);
        if (newSelectedStudents.has(id)) {
            newSelectedStudents.delete(id);
        } else {
            newSelectedStudents.add(id);
        }
        setSelectedStudents(newSelectedStudents);
    };
    

    const handleRemoveScores = () => {
        if (selectedScores.size === 0) {
            alert('Select a score first');
            return;
        }
        setShowConfirmRemoveModal(true);
    };

    const handleRemoveStudents = () => {
        if (selectedStudents.size === 0) {
            alert('Select a student first');
            return;
        }
        setShowDeleteModal(true);
    };


    // Lessons Code 
    useEffect(() => {
        if (activeCategory === 'LESSONS') {
            const classId = classCode;
            fetchLessonsData(classId);
        }
    }, [activeCategory]);

    const fetchLessonsData = async (classId) => {
        try {
            const response = await fetch(`${expoconfig.API_URL}/api/lesson/getLessonByClass/${classId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (response.ok) {
                const data = await response.json();
                setLessonsData(data); // Update state with fetched data
            } else {
                Alert.alert('Error', 'Failed to fetch lessons data');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong while fetching lessons data');
            console.error(error);
        }
    };

    const fetchLessonFromDatabank = async() => {
        try {
            const response = await fetch(`${expoconfig.API_URL}/api/DatabankLesson/getAllDatabankLessons`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (response.ok) {
                const data = await response.json();
                setdatabankLessonsData(data); // Update state with fetched data
                console.log(data);
            } else {
                Alert.alert('Error', 'Failed to fetch lessons data');
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong while fetching lessons data');
            console.error(error);
        }
    }

     const handleAddLessons = () => {
        setShowAddLessonMenuModal(false);
        setShowAddLessonModal(true);
     }

     const handleAddLessonMenu = () => {
        setShowAddLessonMenuModal(true);
     }

     const handleAddExistingLessons = () => {
        setShowAddLessonMenuModal(false);
        fetchLessonFromDatabank();
        setShowDatabankLessonChoicesModal(true);
     }

     const handleSaveLesson = async () => {
        if (newLessonTitle.trim() === "") {
            alert("Please enter a lesson title.");
            return;
        }

        if (lessonType === "") {
            alert("Please enter a lesson type.");
            return;
        }
    
        const newLesson = {
            lesson_title: newLessonTitle,
            lesson_type: lessonType,
            classId: classCode
        };
    
        try {
            const response = await fetch(`${expoconfig.API_URL}/api/lesson/createLesson`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newLesson),
            });
    
            if (response.ok) {
                await fetchLessonsData(classCode);
                setNewLessonTitle('');
                setLessonType('');
                setShowAddLessonModal(false);
                fetchLessonsData(classCode);
            } else {
                alert('Error: Failed to save the lesson.');
            }
        } catch (error) {
            alert('Error: Unable to save the lesson.');
            console.error(error);
        }
    };

    const handleAddLessonFromDatabank = async (lessonId) => {
        try {
            // Step 1: Fetch the lesson from the databank
            const lessonResponse = await fetch(`${expoconfig.API_URL}/api/DatabankLesson/getDatabankLesson/${lessonId}`);
            const lessonData = await lessonResponse.json();
    
            // Step 2: Create the lesson in the class
            const newLesson = {
                classId: classCode,
                lesson_title: lessonData.lesson_title,
                lesson_type: lessonData.lesson_type,
            };
            const createLessonResponse = await fetch(`${expoconfig.API_URL}/api/lesson/createLesson`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLesson),
            });
            const createdLesson = await createLessonResponse.json();
            const createdLessonId = createdLesson.id;
    
            // Step 3: Fetch all databank lesson pages
            const pageResponse = await fetch(`${expoconfig.API_URL}/api/DatabankLessonPage/getAllDatabankLessonPage/${lessonId}`);
            const pages = await pageResponse.json();
    
            console.log(pages);
            // Step 4: Create pages for the new lesson
            for (const page of pages) {
                const { id, ...lessonPageData } = page;
                const lessonPage = {
                    ...lessonPageData,
                    lessonId: createdLessonId,
                };

                console.log("LessonPage: ", lessonPage);
                const createPageResponse = await fetch(`${expoconfig.API_URL}/api/lessonPage/addLessonPage`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(lessonPage),
                });
                
                const createdPage = await createPageResponse.json();

                console.log("CreatedPage: ", createdPage);
                const createdPageId = createdPage.id;
    
                // Step 5: Fetch and process content for each page
                const contentResponse = await fetch(`${expoconfig.API_URL}/api/DatabankLessonContent/getAllDatabankLessonContentWithFiles/${page.id}`);
                const contents = await contentResponse.json();
    
                console.log("Contents: ", contents);
                for (const content of contents) {
                    const lessonContent = {
                        ...content,
                        lessonPageId: createdPageId,
                    };

                    const formData = new FormData();
                    formData.append("lessonContent", JSON.stringify(lessonContent));

                    console.log("lessonContent: ",lessonContent);
                    const lessonContentResponse = await fetch(`${expoconfig.API_URL}/api/lessonContent/addLessonContent`, {
                        method: 'POST',
                        body: formData,
                    });

                    const lessonContentData = await lessonContentResponse.json();
                    console.log("lessonContentData: ",lessonContentData);
                }
            }
    
            // Step 6: Optionally update the state or UI
            console.log('Lesson added successfully');
            alert('Lesson added to class successfully!');
            fetchLessonsData(classCode);
        } catch (error) {
            console.error('Error while adding lesson from databank:', error);
            alert('Failed to add lesson. Please try again.');
        }

        setShowDatabankLessonChoicesModal(false);
    };

    const cancelAdd = () => {
        setNewLessonTitle('');
        setLessonType('');
        setShowAddLessonModal(false);
    }

     const handleRemoveLessons = () => {
        if (selectedLessons.size === 0) {
            return;
        }
        setShowConfirmRemoveLessonModal(true);
     }

     const confirmRemoveLessons = async () => {
        try {
            // Loop through selected lessons and send DELETE requests
            for (let id of selectedLessons) {
                const response = await fetch(`${expoconfig.API_URL}/api/lesson/deleteLesson?classId=${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
    
                if (response.ok) {
                    console.log(`Successfully removed lesson with ID: ${id}`);
                } else {
                    console.error(`Failed to remove lesson with ID: ${id}`);
                    alert(`Failed to remove lesson with ID: ${id}`);
                }
            }
    
            // Update the local state after deletion
            setLessonsData((prev) => prev.filter((lesson) => !selectedLessons.has(lesson.id)));
            setSelectedLessons(new Set());
            setShowConfirmRemoveLessonModal(false);
        } catch (error) {
            console.error('Error removing lessons:', error);
            alert('Error removing lessons');
        }
    };

     const toggleSelectLesson = (id) => {
        const newSelectedLessons = new Set(selectedLessons);
        if (newSelectedLessons.has(id)) {
            newSelectedLessons.delete(id);
        } else {
            newSelectedLessons.add(id);
        }
        setSelectedLessons(newSelectedLessons);
    };

    const handleLessonLongPress = (lessonId) => {
        router.push(`/LessonPageEdit?lessonId=${lessonId}`);
    }

    const handleLessonEdit = (lesson) => {
        setLessonToEditId(lesson.id);
        setNewLessonTitle(lesson.lesson_title);
        setLessonType(lesson.lesson_type);
        setShowEditLessonTitleModal(true);
    };

    const editLessonTitle = async () => {
        if (newLessonTitle.trim() === "") {
            alert("Please enter a lesson title.");
            return;
        }
    
        if (lessonType === "") {
            alert("Please select a lesson type.");
            return;
        }
    
        const updatedLesson = {
            lesson_title: newLessonTitle,
            lesson_type: lessonType,
        };
    
        try {
            const response = await fetch(`${expoconfig.API_URL}/api/lesson/editLesson/${lessonToEditId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedLesson),
            });
    
            if (response.ok) {
                const savedLesson = await response.json();
    
                // Update local state with the edited lesson
                setLessonsData((prevLessons) =>
                    prevLessons.map((lesson) =>
                        lesson.id === lessonToEditId
                            ? { ...lesson, ...savedLesson }
                            : lesson
                    )
                );
    
                // Clear input fields and close modal
                setNewLessonTitle('');
                setLessonType('');
                setLessonToEditId(null);
                setShowEditLessonTitleModal(false);
            } else {
                alert('Error: Failed to edit the lesson.');
            }
        } catch (error) {
            alert('Error: Unable to edit the lesson.');
            console.error(error);
        }
    };    

    const cancelLessonEdit = () => {
        setNewLessonTitle('');
        setLessonType('');
        setShowEditLessonTitleModal(false);
    }

    return (
        <View style={stylesClass.container}>
            <View style={stylesClass.header}>
                <TouchableOpacity onPress={handleBackPress}>
                    <View style={stylesClass.backButtonContainer}>
                        <BackIcon width={20} height={20} fill={'white'} />
                    </View>
                </TouchableOpacity>
            </View>
            <View style={stylesClass.menuContainer}>
                <Text style={stylesClass.titleText}>Class: {classCode}</Text>
                <View style={stylesClass.categoryContainer}>
                    <CustomButton title="MEMBERS" onPress={() => handleCategoryPress('MEMBERS')} buttonStyle={stylesClass.categoryButton} textStyle={stylesClass.categoryButtonText} />
                    <CustomButton title="QUACKSLATE SCORES" onPress={() => handleCategoryPress('SCORES')} buttonStyle={stylesClass.categoryButton} textStyle={stylesClass.categoryButtonText} />
                    <CustomButton title="GAMES" onPress={() => handleCategoryPress('GAMES')} buttonStyle={stylesClass.categoryButton} textStyle={stylesClass.categoryButtonText} />
                    <CustomButton title="LESSONS" onPress={() => handleCategoryPress('LESSONS')} buttonStyle={stylesClass.categoryButton} textStyle={stylesClass.categoryButtonText} />
                </View>
            </View>

            <View>
                {activeCategory === 'MEMBERS' && (
                     <View style={stylesClass.searchContainer}>
                     <TextInput
                         style={stylesClass.searchInput}
                         placeholder="Search by name..."
                         value={searchQuery}
                         onChangeText={setSearchQuery}
                         placeholderTextColor="#BDBDBD" // Subtle placeholder color
                     />
                     <CustomButton 
                         title="Remove" 
                         onPress={handleRemoveStudents} 
                         buttonStyle={stylesClass.button} 
                         textStyle={stylesClass.buttonText} 
                     />
                 </View>
                 
                )}
                {activeCategory === 'SCORES' && (
                    <View style={stylesClass.buttonContainer}>
                        <CustomButton
                         title="Generate"
                         onPress={fetchAvailableDates}
                         buttonStyle={stylesClass.button}
                         textStyle={stylesClass.buttonText}
                        />
                    </View>
                )}
                {activeCategory === 'LESSONS' && (
                    <View style={stylesClass.buttonContainer}>
                        <CustomButton title="Add" onPress={handleAddLessonMenu} buttonStyle={stylesClass.button} textStyle={stylesClass.buttonText} />
                        <CustomButton title="Remove" onPress={handleRemoveLessons} buttonStyle={stylesClass.button} textStyle={stylesClass.buttonText} />
                    </View>
                )}

            </View>
            <ScrollView contentContainerStyle={stylesClass.contentScrollContainer}>
                <View style={stylesClass.contentContainer}>
                    {activeCategory === 'MEMBERS' && (
                        <View style={stylesClass.membersContentContainer}>
                            {filteredUserData.map((user, index) => (
                                <TouchableOpacity key={index} onPress={() => toggleSelectStudent(user.id)}>
                                    <View style={[stylesClass.content, selectedStudents.has(user.id) && stylesClass.selectedScore]}>
                                        <Text style={stylesClass.classContentText}>
                                            {user.fname} {user.lname}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {activeCategory === 'SCORES' && (
                        <View style={stylesClass.membersContentContainer}>
                         <View style={stylesClass.dateContainer}>
    {availableDates.map((date, index) => (
        <TouchableOpacity
            key={index}
            style={stylesClass.dateButton}
            onPress={() => handleDateClick(date)}
        >
            <Text style={stylesClass.dateButtonText}>{date}</Text>
        </TouchableOpacity>
    ))}
</View>   
                            
                        </View>
                    )}

                    {activeCategory === 'GAMES' && (
                        <View style={stylesClass.membersContentContainer}>
                            <View style={stylesClass.gameContent}>
                                <CustomButton title="Edit" onPress={() => router.push(`/QuackamoleEdit?classCode=${classCode}`)} buttonStyle={stylesClass.gameButton} textStyle={stylesClass.buttonText} />
                                <View style={stylesClass.gameTextContainer}>
                                    <Text style={stylesClass.gameContentText}>Quackamole</Text>
                                </View>
                                <Icon1 style={stylesClass.floatingIcon} width={150} height={150} fill={'#fff'} />
                            </View>
                            <View style={stylesClass.gameContent}>
                                <CustomButton title="Edit" onPress={() => router.push(`/QuackslateLevels?classCode=${classCode}`)} buttonStyle={stylesClass.gameButton} textStyle={stylesClass.buttonText} />
                                <View style={stylesClass.gameTextContainer}>
                                    <Text style={stylesClass.gameContentText}>Quackslate</Text>
                                </View>
                                <Icon2 style={stylesClass.floatingIcon} width={130} height={130} fill={'#fff'} />
                            </View>
                            <View style={stylesClass.gameContent}>
                                <CustomButton title="Edit" onPress={() => router.push(`/QuackmanContent?classCode=${classCode}`)} buttonStyle={stylesClass.gameButton} textStyle={stylesClass.buttonText} />
                                <View style={stylesClass.gameTextContainer}>
                                    <Text style={stylesClass.gameContentText}>Quackman</Text>
                                </View>
                                <Icon3 style={stylesClass.floatingIcon} width={175} height={175} fill={'#fff'} />

                            </View>
                        </View>
                    )}

                    {activeCategory === 'LESSONS' && (
                        <View style={stylesClass.membersContentContainer}>
                            {lessonsData.map((lesson, index) => (
                                <TouchableOpacity key={index} onPress={() => toggleSelectLesson(lesson.id)} 
                                onLongPress={() => handleLessonLongPress(lesson.id)}
                                >
                                    <View style={[stylesClass.lessonContent, selectedLessons.has(lesson.id) && stylesClass.selectedScore]}>
                                        <View style={stylesClass.textButtonContainer}>
                                            <View style={stylesClass.textContainer}>
                                                <Text style={[stylesClass.lessonContentText, stylesClass.titleTextSpacing]}>Title: {lesson.lesson_title}</Text>
                                                <Text style={stylesClass.lessonContentText}>Type: {lesson.lesson_type}</Text>
                                            </View>
                                            <View style={stylesClass.editButtonContainer}>
                                                <CustomButton title="Edit" onPress={() => handleLessonEdit(lesson)} buttonStyle={stylesClass.editButton} textStyle={stylesClass.buttonText} />
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                    
                </View>

            </ScrollView>


            <Modal
                animationType="slide"
                transparent={true}
                visible={showDeleteModal}
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <View style={styles.closeButtonContainer}>
                            <TouchableOpacity onPress={() => setShowDeleteModal(false)} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>X</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.text}>Are you sure you want to remove these students?</Text>
                        <View style={styles.buttonRow}>
                            <CustomButton title="Yes" onPress={handleDeleteModalConfirm} buttonStyle={styles.button} textStyle={styles.buttonText} />
                            <CustomButton title="No" onPress={() => setShowDeleteModal(false)} buttonStyle={styles.button} textStyle={styles.buttonText} />
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
    animationType="slide"
    transparent={true}
    visible={showConfirmationModal}
    onRequestClose={() => setShowConfirmationModal(false)}
>
    <View style={styles.centeredView}>
        <View style={styles.modalView2}>
            <Text style={styles.modalText}>
                What action would you like to perform for {selectedDate}?
            </Text>
            <View style={styles.buttonRow2}>
                <CustomButton
                    title="Download CSV"
                    onPress={() => {
                        downloadCsv(selectedDate);
                        setShowConfirmationModal(false);
                    }}
                    buttonStyle={styles.button2}
                    textStyle={styles.buttonText}
                />
                <CustomButton
                    title="Delete Scores"
                    onPress={() => {
                        deleteScoresByDate(selectedDate);
                        setShowConfirmationModal(false);
                    }}
                    buttonStyle={styles.button2}
                    textStyle={styles.buttonText}
                />
                <CustomButton
                    title="Cancel"
                    onPress={() => setShowConfirmationModal(false)}
                    buttonStyle={styles.button2}
                    textStyle={styles.buttonText}
                />
            </View>
        </View>
    </View>
</Modal>


            {/*Modal for Adding Lessons*/}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showAddLessonModal}
                onRequestClose={() => setShowAddLessonModal(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <TextInput
                            style={styles.input}
                            value={newLessonTitle}
                            onChangeText={setNewLessonTitle}
                            placeholder="Lesson Title"
                        />
                        <Picker
                        selectedValue={lessonType}
                        onValueChange={(itemValue) =>
                            setLessonType(itemValue)
                          }>
                        {/* <Picker.Item label="None" value=""/>
                        <Picker.Item label="Characters" value="Characters"/> */}
                        <Picker.Item label="Vocabulary" value="Vocabulary"/>
                        {/* <Picker.Item label="Sentence and Grammar" value="Sentence and Grammar"/> */}
                        </Picker>
                        <View style={styles.buttonRow}>
                            <CustomButton title="Save" onPress={handleSaveLesson} buttonStyle={styles.button} textStyle={styles.buttonText} />
                            <CustomButton title="Cancel" onPress={() => cancelAdd()} buttonStyle={styles.button} textStyle={styles.buttonText} />
                        </View>
                    </View>
                </View>
            </Modal>

            {/*Modal for Add Lessons menu*/}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showAddLessonMenuModal}
                onRequestClose={() => setShowAddLessonMenuModal(false)}
                        >
                        <View style={styles1.centeredView}>
                            <View style={styles1.modalView}>
                            <TouchableOpacity
                        style={styles1.closeButton}
                        onPress={() => setShowAddLessonMenuModal(false)}
                        >
                        <Text style={styles1.closeButtonText}>X</Text>
                        </TouchableOpacity>
                        <Text style={styles1.modalText}>Would you like to add new lesson or existing lessons?</Text>
                        <View>
                            <CustomButton title="Add new lesson" onPress={handleAddLessons} buttonStyle={styles1.button} textStyle={styles1.buttonText} />
                            <CustomButton title="Select an existing one" onPress={() => handleAddExistingLessons()} buttonStyle={styles1.button} textStyle={styles1.buttonText} />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* modal for adding lessons in data bank */} 
            <Modal
                animationType="slide"
                transparent={true}
                visible={showDatabankLessonChoicesModal}
                onRequestClose={() => setShowDatabankLessonChoicesModal(false)}
            >
                <View style={styles1.centeredView}>
                    <View style={styles1.modalView}>
                        <TouchableOpacity
                            style={styles1.closeButton}
                            onPress={() => setShowDatabankLessonChoicesModal(false)}
                        >
                            <Text style={styles1.closeButtonText}>X</Text>
                        </TouchableOpacity>
                        <ScrollView contentContainerStyle={styles.scrollContainer}>
                        <View style={styles1.buttonList}>
                            {/* Check if databankLessonsData is available */}
                            {databankLessonsData && databankLessonsData.length > 0 ? (
                                databankLessonsData.map((lesson, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles1.lessonButton}
                                        onPress={() => handleAddLessonFromDatabank(lesson.id)}
                                    >
                                        <Text style={styles1.lessonButtonText}>{lesson.lesson_title}</Text>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text>No lessons available</Text>
                            )}
                        </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/*Modal for Removing Lessons*/}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showConfirmRemoveLessonModal}
                onRequestClose={() => setShowConfirmRemoveLessonModal(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Are you sure you want to remove the selected lessons?</Text>
                        <View style={styles.buttonRow}>
                            <CustomButton title="Yes" onPress={confirmRemoveLessons} buttonStyle={styles.button} textStyle={styles.buttonText} />
                            <CustomButton title="No" onPress={() => setShowConfirmRemoveLessonModal(false)} buttonStyle={styles.button} textStyle={styles.buttonText} />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal for Editing Lesson Title */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showEditLessonTitleModal}
                onRequestClose={() => setShowEditLessonTitleModal(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalText}>Input new Lesson title</Text>
                        
                        {/* TextInput for Lesson Title */}
                        <TextInput
                            style={styles.input}
                            value={newLessonTitle}  // Use the current title value
                            onChangeText={setNewLessonTitle}
                            placeholder="New Lesson Title"
                        />
                        
                        {/* Picker for Lesson Type */}
                        <Picker
                            selectedValue={lessonType}  // Use the current lesson type value
                            onValueChange={(itemValue) => setLessonType(itemValue)}
                        >
                            <Picker.Item label="None" value=""/>
                            <Picker.Item label="Characters" value="Characters"/>
                            <Picker.Item label="Vocabulary" value="Vocabulary"/>
                            <Picker.Item label="Sentence and Grammar" value="Sentence and Grammar"/>
                        </Picker>

                        <View style={styles.buttonRow}>
                            <CustomButton
                                title="Yes"
                                onPress={editLessonTitle}
                                buttonStyle={styles.button}
                                textStyle={styles.buttonText}
                            />
                            <CustomButton
                                title="No"
                                onPress={() => cancelLessonEdit()}
                                buttonStyle={styles.button}
                                textStyle={styles.buttonText}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

        </View>
    );
}

export default ClassDashboard;
