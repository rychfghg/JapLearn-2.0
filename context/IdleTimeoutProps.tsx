import React, { useEffect, useState, useContext } from 'react';
import { AppState, Dimensions, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { AuthContext } from '../context/AuthContext';

interface IdleTimeoutProps {
  timeout: number; // Timeout in milliseconds
}

const IdleTimeout: React.FC<IdleTimeoutProps> = ({ timeout }) => {
  const [lastActive, setLastActive] = useState(Date.now());
  const { logout } = useContext(AuthContext); // Use logout from AuthContext

  useEffect(() => {
    // Reset timeout when user interacts
    const resetTimeout = () => {
      setLastActive(Date.now());
    };

    // Check for inactivity
    const checkIdleTimeout = () => {
      if (Date.now() - lastActive > timeout) {
        logout();
      }
    };

    // Attach listeners for user activity
    const subscriptions = [
      Dimensions.addEventListener('change', resetTimeout), // Handle screen orientation changes
      Keyboard.addListener('keyboardDidShow', resetTimeout), // Handle keyboard interactions
      Keyboard.addListener('keyboardDidHide', resetTimeout), // Handle keyboard interactions
      AppState.addEventListener('change', (nextAppState) => {
        if (nextAppState === 'active') {
          resetTimeout();
        }
      }),
      // For touch-based interactions
      TouchableWithoutFeedback.defaultProps = {
        onPress: resetTimeout,
      },
    ];

    // Check idle timeout every second
    const interval = setInterval(checkIdleTimeout, 1000);

    // Cleanup on component unmount
    return () => {
      subscriptions.forEach((sub) => sub.remove && sub.remove());
      clearInterval(interval);
    };
  }, [lastActive, timeout, logout]);

  return null; // No UI for this component
};

export default IdleTimeout;
