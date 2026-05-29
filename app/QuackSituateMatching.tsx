import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  Modal,
  Animated,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { router } from 'expo-router';
import BackIcon from '../assets/svg/back-icon.svg';
import { stylesMatching } from '../styles/stylesQuackSituateMatching';

import background from '../assets/forest.jpg';
import duckIdle from '../assets/idle.png';
import duckTalk from '../assets/talk.png';
import duckHappy from '../assets/hello.png';
import duckThinking from '../assets/thinking.png';

const { width } = Dimensions.get('window');

const expressions = [
  { id: 'thanks', jp: 'ありがとうございます', romaji: 'arigatou gozaimasu', x: 22, y: 150 },
  { id: 'sorry', jp: 'すみません', romaji: 'sumimasen', x: 22, y: 300 },
  { id: 'eat', jp: 'いただきます', romaji: 'itadakimasu', x: 22, y: 450 },
];

const scenes = [
  { id: 'sorry', emoji: '🙇', text: 'You bump into someone lightly.', x: width - 202, y: 150 },
  { id: 'eat', emoji: '🍱', text: 'Before eating a meal.', x: width - 202, y: 315 },
  { id: 'thanks', emoji: '🎁', text: 'Someone helps you.', x: width - 202, y: 480 },
];

const QuackSituateMatching = () => {
  const [connections, setConnections] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [character, setCharacter] = useState(duckIdle);
  const [message, setMessage] = useState('Tap a Japanese expression, then tap the matching scene.');
  const [resultVisible, setResultVisible] = useState(false);
  const [score, setScore] = useState(0);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const pulse = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.06, duration: 120, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
    ]).start();
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleExpressionClick = (item: any) => {
    setSelectedId(item.id);
    setCharacter(duckTalk);
    setMessage(`Now choose the scene for "${item.romaji}".`);
    pulse();
  };

  const handleSceneClick = (scene: any) => {
    if (!selectedId) {
      setCharacter(duckThinking);
      setMessage('Choose a Japanese expression first.');
      shake();
      return;
    }

    const selectedExpression = expressions.find((item) => item.id === selectedId);
    if (!selectedExpression) return;

    const correct = selectedExpression.id === scene.id;

    setConnections((prev) => [
      ...prev.filter(
        (c) => c.from.id !== selectedExpression.id && c.to.id !== scene.id
      ),
      { from: selectedExpression, to: scene, correct },
    ]);

    if (correct) {
      setCharacter(duckHappy);
      setMessage('Nice! That expression matches the situation.');
    } else {
      setCharacter(duckThinking);
      setMessage('Hmm... that rope feels wrong. Try reconnecting it.');
      shake();
    }

    setSelectedId(null);
  };

  const checkGame = () => {
    const correct = connections.filter((c) => c.correct).length;
    setScore(correct);
    setResultVisible(true);
  };

  const resetGame = () => {
    setConnections([]);
    setSelectedId(null);
    setCharacter(duckIdle);
    setMessage('Tap a Japanese expression, then tap the matching scene.');
    setScore(0);
    setResultVisible(false);
  };

  return (
    <View style={stylesMatching.container}>
      <ImageBackground source={background} style={stylesMatching.background} resizeMode="cover">
        <View style={stylesMatching.overlay} />

        <TouchableOpacity style={stylesMatching.backButton} onPress={() => router.push('/QuackSituate')}>
          <BackIcon width={20} height={20} fill="white" />
        </TouchableOpacity>

        <View style={stylesMatching.titleBoard}>
          <Text style={stylesMatching.titleText}>Duck Rope Match</Text>
          <Text style={stylesMatching.subtitleText}>Tap expression → tap matching scene</Text>
        </View>

        <View style={stylesMatching.stage}>
          <Svg style={stylesMatching.ropeLayer} pointerEvents="none">
            {connections.map((line, index) => (
              <Path
                key={index}
                d={`
                  M ${line.from.x + 173} ${line.from.y + 52}
                  C ${width / 2 - 16} ${line.from.y + 45},
                    ${width / 2 + 16} ${line.to.y + 55},
                    ${line.to.x + 3} ${line.to.y + 55}
                `}
                stroke={line.correct ? '#FFE066' : '#FF5C5C'}
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
              />
            ))}
          </Svg>

          <View style={stylesMatching.columnLabelLeft}>
            <Text style={stylesMatching.columnLabelText}>Expressions</Text>
          </View>

          <View style={stylesMatching.columnLabelRight}>
            <Text style={stylesMatching.columnLabelText}>Scenes</Text>
          </View>

          {expressions.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.88}
              onPress={() => handleExpressionClick(item)}
              style={[
                stylesMatching.expressionNode,
                { left: item.x, top: item.y },
              ]}
            >
              <Image source={duckIdle} style={stylesMatching.duckSprite} />

              <Animated.View
                style={[
                  stylesMatching.expressionCard,
                  selectedId === item.id && stylesMatching.selectedCard,
                  selectedId === item.id && { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Text style={stylesMatching.jpText}>{item.jp}</Text>
                <Text style={stylesMatching.romajiText}>{item.romaji}</Text>
              </Animated.View>

              <View style={stylesMatching.anchorRight} />
            </TouchableOpacity>
          ))}

          {scenes.map((scene) => (
            <TouchableOpacity
              key={scene.id}
              activeOpacity={0.88}
              onPress={() => handleSceneClick(scene)}
              style={[
                stylesMatching.sceneNode,
                { left: scene.x, top: scene.y },
              ]}
            >
              <View style={stylesMatching.sceneCard}>
                <Text style={stylesMatching.sceneEmoji}>{scene.emoji}</Text>
                <Text style={stylesMatching.sceneText}>{scene.text}</Text>
              </View>

              <View style={stylesMatching.anchorLeft} />
            </TouchableOpacity>
          ))}

          <View style={stylesMatching.floatingDuckGlow} />

          <Animated.Image
            source={character}
            style={[
              stylesMatching.characterImage,
              { transform: [{ translateX: shakeAnim }] },
            ]}
          />

          <View style={stylesMatching.dialogueContainer}>
            <Text style={stylesMatching.dialogueText}>{message}</Text>
          </View>

          <View style={stylesMatching.bottomBar}>
            <TouchableOpacity style={stylesMatching.gameButton} onPress={checkGame}>
              <Text style={stylesMatching.gameButtonText}>Check</Text>
            </TouchableOpacity>

            <TouchableOpacity style={stylesMatching.resetButton} onPress={resetGame}>
              <Text style={stylesMatching.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal visible={resultVisible} transparent animationType="fade">
          <View style={stylesMatching.modalOverlay}>
            <View style={stylesMatching.modalCard}>
              <Text style={stylesMatching.modalTitle}>
                {score === 3 ? 'Perfect Match!' : 'Try Again!'}
              </Text>

              <Text style={stylesMatching.modalText}>
                {score}/3 ropes are correct.
                {score === 3
                  ? '\nGreat job connecting the expressions!'
                  : '\nSome ropes are incorrect. Reconnect them and try again.'}
              </Text>

              <TouchableOpacity style={stylesMatching.gameButton} onPress={resetGame}>
                <Text style={stylesMatching.gameButtonText}>Retry</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[stylesMatching.resetButton, { marginTop: 10 }]}
                onPress={() => router.push('/QuackSituate')}
              >
                <Text style={stylesMatching.resetButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
};

export default QuackSituateMatching;