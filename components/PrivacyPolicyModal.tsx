import React, { useEffect, useRef, useState } from 'react';
import { Modal, ScrollView, Text, View, StyleSheet, Dimensions, Pressable, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const uiFont = Platform.select({ android: 'sans-serif', ios: 'System', web: 'Inter, system-ui, sans-serif' });

const PrivacyPolicyModal = ({ visible, onAgree, onClose }) => {
    const [canAgree, setCanAgree] = useState(false);
    const [renderKey, setRenderKey] = useState(0); // Key for re-rendering

    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        if (visible) {
            setCanAgree(false); // Reset the button state
            setRenderKey((prevKey) => prevKey + 1); // Force re-render
        }
    }, [visible]);

    const handleScroll = (event) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
        setCanAgree(isAtBottom);
    };

    return (
        <Modal
            visible={visible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
            key={renderKey} // Force re-render the modal when visible
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.headerRow}>
                        <View style={styles.headerIcon}><Ionicons name="shield-checkmark-outline" size={22} color="#7B2CBF" /></View>
                        <View style={styles.headerCopy}>
                            <Text style={styles.header}>Privacy policy</Text>
                            <Text style={styles.headerHint}>Scroll to the end to continue.</Text>
                        </View>
                        <Pressable onPress={onClose} style={styles.closeButton} hitSlop={8}><Ionicons name="close" size={21} color="#726977" /></Pressable>
                    </View>
                    <ScrollView
                        ref={scrollViewRef}
                        contentContainerStyle={styles.scrollContainer}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.paragraph}>
                            This is a short summary of how JapLearn handles your information. The
                            full policy is always available in the app under Profile, and at
                            portal.japlearn.com/privacy. By creating an account you agree to it.
                        </Text>

                        <Text style={styles.subtitle}>1. What we collect</Text>
                        <Text style={styles.listItem}>
                            - <Text style={styles.bold}>Account details:</Text> your first and last
                            name, email address, password (stored encrypted), and the class code you
                            join.
                        </Text>
                        <Text style={styles.listItem}>
                            - <Text style={styles.bold}>Learning records:</Text> lesson completion,
                            quiz answers, game scores and attempts, badges, streaks, daily goal
                            minutes, and speaking practice results.
                        </Text>
                        <Text style={styles.listItem}>
                            - <Text style={styles.bold}>Voice recordings:</Text> in speaking
                            activities only, and only after you allow microphone access.
                        </Text>
                        <Text style={styles.listItem}>
                            - <Text style={styles.bold}>Basic technical data:</Text> app version and
                            the date and time of activity, used to run and fix the service.
                        </Text>

                        <Text style={styles.subtitle}>2. Microphone and speaking activities</Text>
                        <Text style={styles.paragraph}>
                            Speaking activities record your voice while the activity is running. Your
                            speech is sent securely to Microsoft Azure Speech Services to score
                            pronunciation, accuracy, fluency and completeness, and what you said is
                            sent as text to Google Gemini to generate feedback. We keep the
                            transcript, scores and feedback, not the raw recording. You can decline
                            microphone access and still use every other part of JapLearn.
                        </Text>

                        <Text style={styles.subtitle}>3. Who can see your information</Text>
                        <Text style={styles.paragraph}>
                            The teacher who owns the class you join can see your name, email address
                            and learning records for that class. Other students cannot. We work with
                            MongoDB Atlas (storage), Render (hosting), Microsoft Azure and Google
                            Gemini (speech and feedback), Brevo (account emails) and Expo (app
                            updates). We never sell your information and never use it for
                            advertising.
                        </Text>

                        <Text style={styles.subtitle}>4. Security and your control</Text>
                        <Text style={styles.paragraph}>
                            Connections use encrypted HTTPS and passwords are hashed, so nobody at
                            JapLearn can read them. You can delete your account and all of its
                            learning data at any time from Profile, then Delete account, or at
                            portal.japlearn.com/delete-account. Deletion is permanent.
                        </Text>
                        <Text style={styles.paragraph}>
                            JapLearn is intended for learners aged 13 and above, or younger learners
                            enrolled by their school with consent. Questions or requests:
                            japlearnofficial@gmail.com.
                        </Text>
                    </ScrollView>
                    <Pressable disabled={!canAgree} onPress={onAgree} style={[styles.agreeButton,!canAgree&&styles.agreeButtonDisabled]}>
                        <Text style={[styles.agreeButtonText,!canAgree&&styles.agreeButtonTextDisabled]}>Agree and continue</Text>
                        <Ionicons name="arrow-forward" size={18} color={canAgree?'#FFFFFF':'#9A939E'} />
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(31, 23, 36, 0.55)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        maxHeight: height * 0.8,
        backgroundColor: 'white',
        borderRadius: 22,
        padding: 22,
    },
    headerRow:{flexDirection:'row',alignItems:'center',marginBottom:18},
    headerIcon:{width:44,height:44,borderRadius:14,backgroundColor:'#F2E8F9',alignItems:'center',justifyContent:'center',marginRight:12},
    headerCopy:{flex:1},
    closeButton:{width:36,height:36,borderRadius:18,backgroundColor:'#F5F2F6',alignItems:'center',justifyContent:'center'},
    headerHint:{fontFamily:uiFont,fontSize:12,color:'#847B88',marginTop:2},
    scrollContainer: {
        paddingBottom: 20,
    },
    header: {
        fontFamily:uiFont,fontSize: 20,fontWeight: '400',color: '#302A34',
    },
    subtitle: {
        fontFamily:uiFont,fontSize: 16,fontWeight: '500',
        marginTop: 10,
        marginBottom: 5,
        color: '#5B3B70',
    },
    paragraph: {
        fontFamily:uiFont,fontSize: 14,
        lineHeight: 22,
        marginBottom: 10,
        color: '#555',
    },
    listItem: {
        fontFamily:uiFont,fontSize: 14,
        lineHeight: 24,
        marginBottom: 5,
        color: '#555',
    },
    bold: {
        fontWeight: '500',
    },
    agreeButton: {
        height:52,borderRadius: 12,marginTop: 16,
        backgroundColor:'#7B2CBF',flexDirection:'row',gap:8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    agreeButtonDisabled:{backgroundColor:'#ECE8EE'},
    agreeButtonText: {
        fontFamily:uiFont,fontSize: 15,fontWeight: '500',color:'#FFFFFF',
    },
    agreeButtonTextDisabled:{color:'#9A939E'},
});

export default PrivacyPolicyModal;
