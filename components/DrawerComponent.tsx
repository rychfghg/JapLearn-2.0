import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const DrawerComponent = ({ onNavigateHome, onNextPage, onPreviousPage, onClose }) => {
    const translateX = useRef(new Animated.Value(-300)).current; // Start off-screen

    // Open drawer animation
    const openDrawer = () => {
        Animated.spring(translateX, {
            toValue: 0, // Move to position
            useNativeDriver: true, // Use native driver for better performance
        }).start();
    };

    // Close drawer animation
    const closeDrawer = () => {
        Animated.spring(translateX, {
            toValue: -300, // Move off-screen
            useNativeDriver: true,
        }).start(() => onClose()); // Ensure onClose is called after animation finishes
    };

    useEffect(() => {
        openDrawer(); // Trigger open animation on mount
        // Optional: handle close animation on unmount if necessary
        return () => closeDrawer(); // Clean up by closing drawer
    }, []);

    return (
        <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
            <TouchableOpacity onPress={closeDrawer} style={styles.closeButton}>
                <FontAwesome name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.header}>Lesson Navigation</Text>
            <TouchableOpacity onPress={onNavigateHome} style={styles.menuItem}>
                <Text>Home</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPreviousPage} style={styles.menuItem}>
                <Text>Previous Page</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onNextPage} style={styles.menuItem}>
                <Text>Next Page</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    drawer: {
        position: 'absolute',
        width: '75%', // Set drawer width
        height: '100%', // Full height
        backgroundColor: 'white',
        padding: 20,
        left: 0,
        top: 0,
        zIndex: 1000, // Ensure it is above other content
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    closeButton: {
        alignSelf: 'flex-end',
        marginBottom: 20,
    },
    header: {
        fontSize: 20,
        marginBottom: 20,
    },
    menuItem: {
        fontSize: 18,
        paddingVertical: 10,
    }
});

export default DrawerComponent;
