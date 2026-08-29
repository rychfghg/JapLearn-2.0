import React, { useContext, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, Modal, ScrollView, SafeAreaView, StatusBar, Linking, TextInput, ActivityIndicator } from "react-native";
import { AuthContext } from "../context/AuthContext";
import ForgetPasswordModal from "../components/ForgetPasswordModalProps";
import expoconfig from "../expoconfig";
import studentProfile from "../assets/img/studentProfile.png";
import { styles } from "../styles/stylesProfile";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import StudentBottomNav from "../components/StudentBottomNav";
import { useClassCode } from "../context/ClassCodeContext";

type Badge = {
  title: string;
  image: any;
  grayImage: any;
  acquired: boolean;
  lockedMessage: string;
  unlockedMessage: string;
};

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [forgetPasswordVisible, setForgetPasswordVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [badgeModalVisible, setBadgeModalVisible] = useState(false);
  const [badgeInfo, setBadgeInfo] = useState("");
  const [badges, setBadges] = useState<Badge[]>([]);
  const [classCodeInput, setClassCodeInput] = useState("");
  const [currentClassCode, setCurrentClassCode] = useState("");
  const [editingClass, setEditingClass] = useState(true);
  const [joiningClass, setJoiningClass] = useState(false);
  const { setClassCode: storeClassCode } = useClassCode() as {
    setClassCode: (code: string) => Promise<void>;
  };
  
  const router = useRouter();

  const fetchUserBadges = async () => {
    if (!user?.email) return;
    try {
      // Fetch user progress from the backend using the user's email
      const response = await fetch(`${expoconfig.API_URL}/api/progress/${user.email}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      const progress = await response.json();

      // Badge logic based on backend data
      const badgeData = [
        {
          title: "Character Badge",
          image: require("../assets/kana_badge.png"),
          grayImage: require("../assets/kanagray.png"),
          acquired: progress.badge1,  // Check if badge1 is true
          lockedMessage: "Complete the Characters Lesson to unlock this badge.",
          unlockedMessage: "This badge is for completing the Characters Lesson.",
        },
        {
          title: "Word Badge",
          image: require("../assets/word_badge.png"),
          grayImage: require("../assets/wordgray.png"),
          acquired: progress.badge2 && progress.vocab1 && progress.vocab2 && progress.vocab3,
          lockedMessage: "Complete all three Words collections to unlock this badge.",
          unlockedMessage: "This badge is for completing all three Words collections.",
        },
        {
          title: "Sentence Badge",
          image: require("../assets/sentence_badge.png"),
          grayImage: require("../assets/sentencegray.png"),
          acquired: progress.badge3,  // Check if badge3 is true
          lockedMessage: "Complete Sentence and Grammar Lessons to unlock this badge.",
          unlockedMessage: "This badge is for completing the Sentence and Grammar Lesson.",
        },
      ];

      setBadges(badgeData);
    } catch (error) {
      console.log("Error fetching user progress:", error);
    }
  };

  useEffect(() => {
    if (user?.email) {
      fetchUserBadges();  // Fetch user badges on component mount
    }
  }, [user]);

  useEffect(() => {
    const loadStudentClass = async () => {
      if (!user?.email) return;

      try {
        const response = await fetch(
          `${expoconfig.API_URL}/api/students/getStudentByEmail?email=${encodeURIComponent(user.email)}`,
        );

        if (!response.ok) return;

        const student = await response.json();
        const savedClassCode = String(student?.classCode || "");
        setCurrentClassCode(savedClassCode);
        setClassCodeInput(savedClassCode);
        setEditingClass(!savedClassCode);
        await storeClassCode(savedClassCode);
      } catch (error) {
        console.warn("Unable to load the student's class.", error);
      }
    };

    void loadStudentClass();
  }, [user?.email]);

  const contactSupport = async () => {
    const mailUrl = "mailto:japlearnofficial@gmail.com?subject=JapLearn%20Support%20Request";
    try {
      await Linking.openURL(mailUrl);
    } catch {
      setModalMessage("Please email japlearnofficial@gmail.com for support.");
      setModalVisible(true);
    }
  };

  const handleBackPress = () => {
    router.replace('/Menu');
  };

  const joinTeacherClass = async () => {
    const nextClassCode = classCodeInput.trim();

    if (!user?.email || !nextClassCode) {
      setModalMessage("Enter the class code provided by your teacher.");
      setModalVisible(true);
      return;
    }

    setJoiningClass(true);

    try {
      const response = await fetch(
        `${expoconfig.API_URL}/api/students/joinClass?email=${encodeURIComponent(user.email)}&classCode=${encodeURIComponent(nextClassCode)}`,
        { method: "POST" },
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "The class code could not be found.");
      }

      setCurrentClassCode(nextClassCode);
      setClassCodeInput(nextClassCode);
      setEditingClass(false);
      await storeClassCode(nextClassCode);
      setModalMessage(`You are now enrolled in class ${nextClassCode}.`);
    } catch (error) {
      setModalMessage(
        error instanceof Error
          ? error.message
          : "Unable to join the class right now.",
      );
    } finally {
      setJoiningClass(false);
      setModalVisible(true);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/Login");
  };

  const handleForgetPassword = async (email: string) => {
    try {
      const response = await fetch(`${expoconfig.API_URL}/api/users/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setModalMessage("Password reset email sent. Please check your inbox.");
      } else {
        const error = await response.json();
        setModalMessage(error.message || "An error occurred.");
      }
    } catch (error) {
      setModalMessage(`Error: ${error instanceof Error ? error.message : 'Unable to reset password.'}`);
    }
    setForgetPasswordVisible(false);
    setModalVisible(true);
  };

  const handleBadgeClick = (badge: Badge) => {
    setBadgeInfo(badge.acquired ? badge.unlockedMessage : badge.lockedMessage);
    setBadgeModalVisible(true);
  };

  const handleCloseBadgeModal = () => {
    setBadgeModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8423D9" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <View style={styles.heroCircleOne} />
          <View style={styles.heroCircleTwo} />
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackPress} style={styles.iconButton}>
              <Ionicons name="arrow-back" size={23} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Profile</Text>
            <View style={styles.headerSpacer} />
          </View>
          <View style={styles.avatarShell}>
            <Image source={studentProfile} style={styles.profilePicture} />
            <View style={styles.studentBadge}><Ionicons name="school" size={15} color="#FFFFFF" /></View>
          </View>
          <Text style={styles.profileName}>{user ? `${user.fname} ${user.lname}` : "Student"}</Text>
          <View style={styles.rolePill}><Text style={styles.roleText}>JAPLEARN STUDENT</Text></View>
        </View>

        <View style={styles.pageContent}>
          <View style={styles.infoCard}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Account information</Text>
                <Text style={styles.sectionSubtitle}>Your personal learning profile</Text>
              </View>
              <View style={styles.verifiedPill}>
                <Ionicons name="checkmark-circle" size={15} color="#5AA524" />
                <Text style={styles.verifiedText}>Active</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}><Ionicons name="person-outline" size={21} color="#8423D9" /></View>
              <View style={styles.infoCopy}><Text style={styles.infoLabel}>Full name</Text><Text style={styles.infoValue}>{user ? `${user.fname} ${user.lname}` : ""}</Text></View>
            </View>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}><Ionicons name="mail-outline" size={21} color="#8423D9" /></View>
              <View style={styles.infoCopy}><Text style={styles.infoLabel}>Email address</Text><Text style={styles.infoValue}>{user ? user.email : ""}</Text></View>
            </View>
            <View style={[styles.infoRow, styles.lastInfoRow, styles.classInfoRow]}>
              <View style={styles.infoIcon}><Ionicons name="people-outline" size={21} color="#8423D9" /></View>
              <View style={styles.classInfoCopy}>
                <Text style={styles.infoLabel}>Class</Text>
                <View style={styles.classJoinRow}>
                  <TextInput
                    accessibilityLabel="Teacher class code"
                    autoCapitalize="characters"
                    editable={editingClass && !joiningClass}
                    onChangeText={setClassCodeInput}
                    placeholder="Enter teacher class code"
                    placeholderTextColor="#A79DAA"
                    style={[styles.classCodeInput, !editingClass && styles.classCodeInputReadOnly]}
                    value={classCodeInput}
                  />
                  <TouchableOpacity
                    accessibilityRole="button"
                    disabled={joiningClass || (editingClass && !classCodeInput.trim())}
                    onPress={() => {
                      if (currentClassCode && !editingClass) {
                        setEditingClass(true);
                        return;
                      }
                      void joinTeacherClass();
                    }}
                    style={[
                      styles.joinClassButton,
                      (
                        joiningClass
                        || (editingClass && !classCodeInput.trim())
                      ) && styles.joinClassButtonDisabled,
                    ]}
                  >
                    {joiningClass
                      ? <ActivityIndicator size="small" color="#FFFFFF" />
                      : <View style={styles.joinClassButtonContent}>
                          <Ionicons name={currentClassCode && !editingClass ? "pencil" : "enter-outline"} size={14} color="#FFFFFF" />
                          <Text style={styles.joinClassButtonText}>{currentClassCode && !editingClass ? "EDIT" : "JOIN"}</Text>
                        </View>}
                  </TouchableOpacity>
                </View>
                {!currentClassCode && <Text style={styles.classHelpText}>Use the code shared by your teacher.</Text>}
              </View>
            </View>
          </View>

          <View style={styles.achievementsCard}>
            <View style={styles.sectionHeaderRow}>
              <View><Text style={styles.sectionTitle}>Achievements</Text><Text style={styles.sectionSubtitle}>Tap a badge to view its details</Text></View>
              <Ionicons name="trophy-outline" size={24} color="#F7AE23" />
            </View>
            <View style={styles.badgeContainer}>
              {badges.map((badge, index) => (
                <TouchableOpacity key={index} style={styles.badgeWrapper} onPress={() => handleBadgeClick(badge)}>
                  <View style={[styles.badgeImageShell, badge.acquired && styles.badgeAcquired]}>
                    <Image source={badge.acquired ? badge.image : badge.grayImage} style={styles.badgeImage} />
                    <View style={[styles.badgeStatus, badge.acquired ? styles.badgeStatusUnlocked : styles.badgeStatusLocked]}>
                      <Ionicons name={badge.acquired ? "checkmark" : "lock-closed"} size={11} color="#FFFFFF" />
                    </View>
                  </View>
                  <Text style={styles.badgeName} numberOfLines={2}>{badge.title.replace(' Badge', '')}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={styles.settingsTitle}>Preferences & support</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Open JapLearn privacy policy"
              onPress={() => router.push({ pathname: '/PrivacyPolicyPage', params: { fromProfile: 'true' } })}
              style={styles.settingRow}
            >
              <View style={styles.settingIcon}><Ionicons name="shield-checkmark-outline" size={21} color="#8423D9" /></View>
              <View style={styles.settingCopy}><Text style={styles.settingLabel}>Privacy policy</Text><Text style={styles.settingDescription}>See how JapLearn handles your information</Text></View>
              <Ionicons name="chevron-forward" size={20} color="#A89EAD" />
            </TouchableOpacity>
            <TouchableOpacity onPress={contactSupport} style={styles.settingRow}>
              <View style={styles.settingIcon}><Ionicons name="headset-outline" size={21} color="#8423D9" /></View>
              <View style={styles.settingCopy}><Text style={styles.settingLabel}>Contact support</Text><Text style={styles.settingDescription}>japlearnofficial@gmail.com</Text></View>
              <Ionicons name="open-outline" size={19} color="#A89EAD" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setForgetPasswordVisible(true)} style={styles.settingRow}>
              <View style={styles.settingIcon}><Ionicons name="key-outline" size={21} color="#8423D9" /></View>
              <View style={styles.settingCopy}><Text style={styles.settingLabel}>Reset password</Text><Text style={styles.settingDescription}>Send a secure reset link to your email</Text></View>
              <Ionicons name="chevron-forward" size={20} color="#A89EAD" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={[styles.settingRow, styles.logoutRow]}>
              <View style={[styles.settingIcon, styles.logoutIcon]}><Ionicons name="log-out-outline" size={21} color="#C53D47" /></View>
              <View style={styles.settingCopy}><Text style={styles.logoutLabel}>Log out</Text><Text style={styles.settingDescription}>Sign out of your JapLearn account</Text></View>
              <Ionicons name="chevron-forward" size={20} color="#A89EAD" />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <StudentBottomNav active="profile" />

      {/* Badge Info Modal */}
      {badgeModalVisible && (
        <Modal visible={badgeModalVisible} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
                <View style={styles.modalIcon}><Ionicons name="ribbon-outline" size={28} color="#8423D9" /></View>
                <Text style={styles.modalTitle}>Badge details</Text>
              <Text style={styles.modalMessage}>{badgeInfo}</Text>
              <TouchableOpacity onPress={handleCloseBadgeModal} style={styles.buttonContainer}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      <ForgetPasswordModal
        isVisible={forgetPasswordVisible}
        onClose={() => setForgetPasswordVisible(false)}
        onSubmit={handleForgetPassword}
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Notice</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.buttonContainer}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;
