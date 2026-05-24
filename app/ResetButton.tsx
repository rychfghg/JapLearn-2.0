import React from 'react';
import { Button } from 'react-native';
import { useLessonProgress } from '../context/LessonProgressContext';

const ResetButton = () => {
  const { resetProgress } = useLessonProgress();

  return <Button title="Reset Progress" onPress={resetProgress} />;
};

export default ResetButton;
