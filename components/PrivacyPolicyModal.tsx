import React, { useEffect, useRef, useState } from 'react';
import { Modal, ScrollView, Text, View, StyleSheet, Dimensions } from 'react-native';
import CustomButton from './CustomButton'; // Assuming you have a CustomButton component

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
                    <ScrollView
                        ref={scrollViewRef}
                        contentContainerStyle={styles.scrollContainer}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={styles.header}>JapLearn Privacy Policy</Text>
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
                    <CustomButton
                        title="I Agree"
                        onPress={onAgree}
                        buttonStyle={[
                            styles.agreeButton,
                            { backgroundColor: canAgree ? '#4CAF50' : '#ccc' },
                        ]}
                        textStyle={[
                            styles.agreeButtonText,
                            { color: canAgree ? '#fff' : '#666' },
                        ]}
                        disabled={!canAgree}
                    />
                </View>
            </View>
        </Modal>
    );
};

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '90%',
        maxHeight: height * 0.8,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
    },
    scrollContainer: {
        paddingBottom: 20,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#4CAF50',
        fontFamily: 'Jua',
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
        color: '#4CAF50',
        fontFamily: 'Jua',
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 22,
        marginBottom: 10,
        color: '#555',
        fontFamily: 'Jua',
    },
    listItem: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 5,
        color: '#555',
        fontFamily: 'Jua',
    },
    bold: {
        fontWeight: 'bold',
        fontFamily: 'Jua',
    },
    agreeButton: {
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    agreeButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Jua',
    },
});

export default PrivacyPolicyModal;
