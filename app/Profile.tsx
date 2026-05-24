import React, { useContext, useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, Modal,Pressable } from "react-native";
import BackIcon from "../assets/svg/back-icon.svg";
import { AuthContext } from "../context/AuthContext";
import ForgetPasswordModal from "../components/ForgetPasswordModalProps";
import expoconfig from "../expoconfig";
import studentProfile from "../assets/img/studentProfile.png";
import { styles } from "../styles/stylesProfile";
import { useRouter } from "expo-router";

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [forgetPasswordVisible, setForgetPasswordVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [badgeModalVisible, setBadgeModalVisible] = useState(false);
  const [badgeInfo, setBadgeInfo] = useState("");
  const [badges, setBadges] = useState([]);
  
  const router = useRouter();

  const fetchUserBadges = async () => {
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
          acquired: progress.badge2,  // Check if badge2 is true
          lockedMessage: "Complete Vocabulary Lessons to unlock this badge.",
          unlockedMessage: "This badge is for completing the Vocabulary Lesson.",
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

  const handleBackPress = () => {
    router.back();
  };

  const handleLogout = () => {
    logout();
    router.push("/Login");
  };

  const handleForgetPassword = async (email) => {
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
      setModalMessage(`Error: ${error.message}`);
    }
    setForgetPasswordVisible(false);
    setModalVisible(true);
  };

  const handleBadgeClick = (badge) => {
    setBadgeInfo(badge.acquired ? badge.unlockedMessage : badge.lockedMessage);
    setBadgeModalVisible(true);
  };

  const handleCloseBadgeModal = () => {
    setBadgeModalVisible(false);
  };

  return (
    <View>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <BackIcon width={30} height={30} />
        </TouchableOpacity>
      </View>
      <View>
      <View>
  <View style={styles.coverStudent} />
  <View style={styles.profileContainer}>
    <Image source={studentProfile} style={styles.profilePicture} />
  </View>
  <View style={styles.actionContainer}>
    <TouchableOpacity onPress={handleLogout} style={styles.buttonContainerStudent}>
      <Text style={styles.buttonTextStudent}>Logout</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => setForgetPasswordVisible(true)} style={styles.buttonContainerStudent}>
    <Text style={styles.buttonTextStudent}>Reset Password</Text>
    </TouchableOpacity>
  </View>
</View>

  <View style={styles.profileContainer}>
    <Image source={studentProfile} style={styles.profilePicture} />
  </View>
  <View style={styles.whiteSpaceStudent} />
</View>
      <View style={styles.description}>
        <View style={styles.descTextContainerStudent}>
          <Text style={styles.descText}>
            User: {user ? `${user.fname} ${user.lname}` : ""}
          </Text>
          <Text style={styles.descText}>Email: {user ? user.email : ""}</Text>
        </View>
      </View>

      {/* Badge Section */}
      <View>
        <Text style={styles.badgesTitle}>Badges</Text>
        <View style={styles.badgeContainer}>
          {badges.map((badge, index) => (
            <TouchableOpacity
              key={index}
              style={styles.badgeWrapper}
              onPress={() => handleBadgeClick(badge)}
            >
              <Image
                source={badge.acquired ? badge.image : badge.grayImage}
                style={styles.badgeImage}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Badge Info Modal */}
      {badgeModalVisible && (
        <Modal visible={badgeModalVisible} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Badge Info</Text>
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
    </View>
  );
};

export default Profile;
