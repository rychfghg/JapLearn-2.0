import React, { useState, useEffect, useContext } from 'react';
import {
  Modal,
  View,
  KeyboardAvoidingView,
  Text,
  Pressable,
  SafeAreaView,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import CustomButton from '../components/CustomButton';
import { stylesDashboard } from '../styles/stylesDashboard';
import { AuthContext } from '../context/AuthContext';
import expoconfig from '../expoconfig';
import { useRouter } from 'expo-router';
import teacherProfile from '../assets/img/teacherProfile.png';
import { styles } from '../styles/stylesModal';

const TeacherDashboard = () => {
  const [classCodes, setClassCodes] = useState([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteClassCode, setDeleteClassCode] = useState('');
  const [newClassCode, setNewClassCode] = useState('');

  const { user } = useContext(AuthContext);
  const router = useRouter();

  const fetchClassCodes = async () => {
    try {
      const response = await fetch(`${expoconfig.API_URL}/api/classes/getAllClasses`);

      if (response.ok) {
        const data = await response.json();
        setClassCodes(data.map((item) => item.classCodes));
      } else {
        const errorData = await response.json();
        throw new Error('Failed to fetch class codes: ' + errorData.message);
      }
    } catch (error) {
      console.error('Fetch error:', error.message);
      alert('Failed to load class codes: ' + error.message);
    }
  };

  useEffect(() => {
    fetchClassCodes();
  }, []);

  const addClass = async () => {
    if (!newClassCode.trim()) {
      alert('Please enter a class code');
      return;
    }

    const classEntity = {
      classCodes: newClassCode,
    };

    try {
      const response = await fetch(`${expoconfig.API_URL}/api/classes/addClass`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(classEntity),
      });

      const data = await response.json();

      if (response.ok) {
        fetchClassCodes();
        setAddModalVisible(false);
        setNewClassCode('');
      } else {
        alert(data.error || 'Error adding class');
      }
    } catch (error) {
      console.error('Error adding class:', error);
      alert('Error adding class: ' + error.message);
    }
  };

  const handleRemoveClass = async () => {
    if (!deleteClassCode.trim()) {
      alert('Please enter a valid class code to delete');
      return;
    }

    try {
      const response = await fetch(
        `${expoconfig.API_URL}/api/classes/removeClass?classCode=${deleteClassCode}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        fetchClassCodes();
        setDeleteModalVisible(false);
        setDeleteClassCode('');
      } else {
        throw new Error(data.error || 'Failed to delete class');
      }
    } catch (error) {
      alert(`Error removing class: ${error.message}`);
    }
  };

  const handleProfilePress = () => {
    router.push('/ProfileTeacher');
  };

  const handleAddPress = () => {
    setAddModalVisible(true);
  };

  const handleRemovePress = () => {
    setDeleteModalVisible(true);
  };

  const closeModal = () => {
    setAddModalVisible(false);
    setDeleteModalVisible(false);
    setDeleteClassCode('');
  };

  const handleClassPress = (classCode) => {
    router.push(`/ClassDashboard?classCode=${classCode}`);
  };

  const handlePendingApprovalPress = () => {
    router.push('/PendingApproval');
  };

  const handleMonitorPerformance = () => {
    router.push('/TeacherCommunicationPerformance');
  };

  const handleAssignActivities = () => {
    router.push('/TeacherAssignCommunication');
  };

  const handleGenerateReports = () => {
    router.push('/TeacherCommunicationReports');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <View style={{ flex: 1 }}>
          <View style={stylesDashboard.header}>
            <View style={stylesDashboard.leftContainer}>
              <Text style={stylesDashboard.hText}>Welcome Back</Text>
              <Text style={stylesDashboard.hText}>
                {user?.fname} {user?.lname}
              </Text>
            </View>

            <View style={stylesDashboard.rightContainer}>
              <Pressable onPress={handleProfilePress}>
                <Image source={teacherProfile} style={stylesDashboard.pictureCircle} />
              </Pressable>
            </View>
          </View>

          <View style={stylesDashboard.menuContainer}>
            <View style={stylesDashboard.buttonContainer}>
              <CustomButton
                title="Add"
                onPress={handleAddPress}
                buttonStyle={stylesDashboard.button}
                textStyle={stylesDashboard.buttonText}
              />

              <CustomButton
                title="Remove"
                onPress={handleRemovePress}
                buttonStyle={stylesDashboard.button}
                textStyle={stylesDashboard.buttonText}
              />

              <CustomButton
                title="Pending"
                onPress={handlePendingApprovalPress}
                buttonStyle={stylesDashboard.button}
                textStyle={stylesDashboard.buttonText}
              />
            </View>
          </View>

          <ScrollView contentContainerStyle={stylesDashboard.scrollContent}>
            <View style={stylesDashboard.teacherModuleContainer}>
              <Text style={stylesDashboard.teacherModuleTitle}>
                Communication Management
              </Text>

              <Pressable
                style={stylesDashboard.teacherFeatureCard}
                onPress={handleMonitorPerformance}
              >
                <Text style={stylesDashboard.teacherFeatureCode}>1</Text>

                <View style={stylesDashboard.teacherFeatureInfo}>
                  <Text style={stylesDashboard.teacherFeatureTitle}>
                    Monitor Student Communication Performance
                  </Text>
                  <Text style={stylesDashboard.teacherFeatureDesc}>
                    View learner accuracy, weak areas, and communication progress.
                  </Text>
                </View>
              </Pressable>

              <Pressable
                style={stylesDashboard.teacherFeatureCard}
                onPress={handleAssignActivities}
              >
                <Text style={stylesDashboard.teacherFeatureCode}>2</Text>

                <View style={stylesDashboard.teacherFeatureInfo}>
                  <Text style={stylesDashboard.teacherFeatureTitle}>
                    Assign Communication Activities
                  </Text>
                  <Text style={stylesDashboard.teacherFeatureDesc}>
                    Assign QuackSituate, QuackResponse, and QuackTalk activities.
                  </Text>
                </View>
              </Pressable>

              <Pressable
                style={stylesDashboard.teacherFeatureCard}
                onPress={handleGenerateReports}
              >
                <Text style={stylesDashboard.teacherFeatureCode}>3</Text>

                <View style={stylesDashboard.teacherFeatureInfo}>
                  <Text style={stylesDashboard.teacherFeatureTitle}>
                    Generate Communication Progress Reports
                  </Text>
                  <Text style={stylesDashboard.teacherFeatureDesc}>
                    Prepare communication summaries and learner progress reports.
                  </Text>
                </View>
              </Pressable>
            </View>

            <View style={stylesDashboard.classContainer}>
              <Text style={stylesDashboard.teacherModuleTitle}>
                Classes
              </Text>

              {classCodes.map((code, index) => (
                <Pressable key={index} onPress={() => handleClassPress(code)}>
                  <View style={stylesDashboard.classContent}>
                    <Text style={stylesDashboard.classContentText}>{code}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <Modal
            animationType="slide"
            transparent
            visible={addModalVisible}
            onRequestClose={closeModal}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <View style={styles.closeButtonContainer}>
                  <Pressable onPress={closeModal} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>X</Text>
                  </Pressable>
                </View>

                <View style={styles.modalContent}>
                  <TextInput
                    placeholder="Class Code"
                    value={newClassCode}
                    onChangeText={setNewClassCode}
                    style={stylesDashboard.input}
                  />

                  <CustomButton
                    title="Add"
                    onPress={addClass}
                    buttonStyle={stylesDashboard.button}
                    textStyle={stylesDashboard.buttonText}
                  />
                </View>
              </View>
            </View>
          </Modal>

          <Modal
            animationType="slide"
            transparent
            visible={deleteModalVisible}
            onRequestClose={closeModal}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <View style={styles.closeButtonContainer}>
                  <Pressable onPress={closeModal} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>X</Text>
                  </Pressable>
                </View>

                <View style={styles.modalContent}>
                  <Text style={styles.text}>
                    Are you sure you want to delete the following class?
                  </Text>

                  <TextInput
                    placeholder="Enter Class Code"
                    value={deleteClassCode}
                    onChangeText={setDeleteClassCode}
                    style={stylesDashboard.input}
                  />

                  <CustomButton
                    title="Delete"
                    onPress={handleRemoveClass}
                    buttonStyle={stylesDashboard.button}
                    textStyle={stylesDashboard.buttonText}
                  />
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default TeacherDashboard;