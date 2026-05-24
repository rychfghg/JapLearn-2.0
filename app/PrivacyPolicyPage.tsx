    import React from 'react';
    import { ScrollView, Text, View, StyleSheet } from 'react-native';
    import CustomButton from '../components/CustomButton';
    import { useLocalSearchParams, useRouter } from 'expo-router';

    const PrivacyPolicyPage = () => {
        const router = useRouter();
        const { fromSignup } = useLocalSearchParams();

        const handleAgree = () => {
            if (fromSignup === 'true') {
                router.push({
                    pathname: '/Signup',
                    params: { showPrivacyModal: 'true' }, // Pass state to re-open modal
                });
            } else {
                router.back();
            }
        };


        return (
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.contentContainer}>
                    <Text style={styles.header}>JapLearn Privacy Policy</Text>
                    <Text style={styles.intro}>
                    </Text>
                    <Text style={styles.paragraph}>
                        Welcome to JapLearn. Your privacy is our priority, and we are committed to safeguarding your personal data. This Privacy Policy outlines the information we collect, how we use it, and the measures we take to protect it. By using our application, you consent to the practices described in this policy. If you have any concerns about how we handle your information, please contact us directly using the details provided below.
                    </Text>

                    <Text style={styles.subtitle}>1. Information We Collect</Text>
                    <Text style={styles.paragraph}>
                        To enhance your experience and provide our services effectively, we collect and process the following types of information:
                    </Text>
                    <Text style={styles.listItem}>
                        - <Text style={styles.bold}>Personal Information:</Text> This includes your name, email address, and other contact details provided during account registration. This data is essential for creating and managing your account, providing personalized features, and ensuring effective communication.
                    </Text>
                    <Text style={styles.listItem}>
                        - <Text style={styles.bold}>Usage Data:</Text> This includes information such as your app activity, learning scores, and progress logs. We use this data to analyze your learning journey, track your performance, and provide tailored recommendations for improvement.
                    </Text>
                    <Text style={styles.listItem}>
                        - <Text style={styles.bold}>Device Information:</Text> Details about your device, such as type, operating system, app version, and unique identifiers. This information helps us ensure compatibility, optimize app performance, and address technical issues promptly.
                    </Text>

                    <Text style={styles.subtitle}>2. How We Use Your Information</Text>
                    <Text style={styles.paragraph}>
                        The information we collect is used to enhance your experience, improve our services, and ensure the proper functioning of the app. Specifically, we use your information for the following purposes:
                    </Text>
                    <Text style={styles.listItem}>
                        - <Text style={styles.bold}>Account Management:</Text> Creating and maintaining your account to enable access to personalized features and learning tools.
                    </Text>
                    <Text style={styles.listItem}>
                        - <Text style={styles.bold}>Service Improvement:</Text> Analyzing your app usage, feedback, and performance data to identify areas for improvement and to develop new features.
                    </Text>
                    <Text style={styles.listItem}>
                        - <Text style={styles.bold}>Communication:</Text> Sending updates, notifications, and important announcements regarding the app, including changes to our policies or new features available.
                    </Text>
                    <Text style={styles.listItem}>
                        - <Text style={styles.bold}>Security and Functionality:</Text> Identifying and addressing technical issues to ensure the app operates smoothly and securely.
                    </Text>

                    <Text style={styles.subtitle}>3. Data Security</Text>
                    <Text style={styles.paragraph}>
                        We implement strict security measures to protect your data from unauthorized access, loss, or misuse. Our security practices include encryption, secure storage systems, and regular monitoring of our infrastructure. We also adhere to industry standards to ensure your information is handled responsibly.
                    </Text>
                    <Text style={styles.paragraph}>
                        While we strive to protect your data, it is important to note that no system can guarantee absolute security. To help secure your account, we recommend using a strong password, avoiding sharing your login credentials, and keeping your app updated to the latest version.
                    </Text>
                    <Text style={styles.paragraph}>
                        In the unlikely event of a data breach, we will promptly notify affected users and take immediate steps to minimize risks and secure the system.
                    </Text>

                    
                </ScrollView>
                <CustomButton 
                    title="I Agree" 
                    onPress={handleAgree} 
                    buttonStyle={styles.agreeButton} 
                    textStyle={styles.agreeButtonText} 
                />
            </View>
        );
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: '#ffffff',
            paddingHorizontal: 20,
            paddingVertical: 10,
        },
        contentContainer: {
            paddingBottom: 20,
            paddingTop: 50,
        },
        header: {
            fontSize: 32,
            fontFamily: 'Jua',
            fontWeight: 'bold',
            color: '#4CAF50',
            marginBottom: 10,
            textAlign: 'center',
        },
        intro: {
            fontSize: 16,
            color: '#333333',
            textAlign: 'center',
            marginBottom: 20,
            fontFamily: 'Jua',
        },
        subtitle: {
            fontSize: 22,
            fontWeight: 'bold',
            color: '#3B3B3B',
            marginVertical: 15,
            fontFamily: 'Jua',
        },
        paragraph: {
            fontSize: 16,
            lineHeight: 24,
            color: '#4F4F4F',
            marginBottom: 10,
            fontFamily: 'Jua',
        },
        listItem: {
            fontSize: 16,
            lineHeight: 24,
            color: '#4F4F4F',
            marginLeft: 20,
            marginBottom: 5,
            fontFamily: 'Jua',
        },
        bold: {
            fontWeight: 'bold',
        },
        contactInfo: {
            fontSize: 16,
            color: '#4CAF50',
            marginBottom: 5,
            fontFamily: 'Jua',
        },
        agreeButton: {
            backgroundColor: '#4CAF50',
            paddingVertical: 12,
            borderRadius: 8,
            marginHorizontal: 20,
            marginTop: 20,
        },
        agreeButtonText: {
            color: '#ffffff',
            fontSize: 18,
            fontWeight: 'bold',
            fontFamily: 'Jua',
        },
    });

    export default PrivacyPolicyPage;
