import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import QuackSituateMissionLoader from './QuackSituateMissionLoader';

type Props = {
  title: string;
  subtitle: string;
  status: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  onComplete: () => void;
};

const getMascot = (color: string) => {
  if (color === '#D88727') {
    return require('../assets/thinking.png');
  }

  if (color === '#8423D9') {
    return require('../assets/talk.png');
  }

  return require('../assets/hello.png');
};

export default function QuackSituateExit({
  title,
  subtitle,
  status,
  color,
  icon,
  onComplete,
}: Props) {
  return (
    <QuackSituateMissionLoader
      action={status}
      color={color}
      description={subtitle}
      icon={icon}
      mascot={getMascot(color)}
      mode="exit"
      title={title}
      onComplete={onComplete}
    />
  );
}
