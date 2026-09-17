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
                            Welcome to JapLearn. Your privacy is our priority, and we are committed
                            to safeguarding your personal data. This Privacy Policy outlines the
                            information we collect, how we use it, and the measures we take to
                            protect it. By using our application, you consent to the practices
                            described in this policy. If you have any concerns about how we handle
                            your information, please contact us directly using the details provided
                            below.
                        </Text>

                        <Text style={styles.subtitle}>1. Information We Collect</Text>
                        <Text style={styles.paragraph}>
                            To enhance your experience and provide our services effectively, we
                            collect and process the following types of information:
                        </Text>
                        <Text style={styles.listItem}>
                            - <Text style={styles.bold}>Personal Information:</Text> Your name,
                            email address, and other contact details provided during account
                            registration.
                        </Text>
                        <Text style={styles.listItem}>
                            - <Text style={styles.bold}>Usage Data:</Text> Information such as your
                            app activity, learning scores, and progress logs. We use this data to
                            analyze your learning journey and provide tailored recommendations.
                        </Text>
                        <Text style={styles.listItem}>
                            - <Text style={styles.bold}>Device Information:</Text> Details about your
                            device, such as type, operating system, and app version, to ensure
                            compatibility and optimize performance.
                        </Text>

                        <Text style={styles.subtitle}>2. How We Use Your Information</Text>
                        <Text style={styles.paragraph}>
                            The information we collect is used to:
                        </Text>
                        <Text style={styles.listItem}>
                            - Create and maintain your account.
                        </Text>
                        <Text style={styles.listItem}>
                            - Improve our app and provide personalized learning experiences.
                        </Text>
                        <Text style={styles.listItem}>
                            - Communicate important updates and changes to our services.
                        </Text>
                        <Text style={styles.listItem}>
                            - Ensure the security and functionality of the app.
                        </Text>

                        <Text style={styles.subtitle}>3. Data Security</Text>
                        <Text style={styles.paragraph}>
                            We implement strict security measures to protect your data from
                            unauthorized access, loss, or misuse. While no system is entirely secure,
                            we follow industry best practices to safeguard your information.
                        </Text>
                        <Text style={styles.paragraph}>
                            In the unlikely event of a data breach, we will promptly notify affected
                            users and take immediate steps to minimize risks.
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
