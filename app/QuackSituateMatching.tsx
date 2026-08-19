import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  Modal,
  Animated,
  useWindowDimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { router } from 'expo-router';
import BackIcon from '../assets/svg/back-icon.svg';
import AhiruMissionExit from '../components/AhiruMissionExit';
import { stylesMatching } from '../styles/stylesQuackSituateMatching';

import background from '../assets/forest.jpg';
import duckIdle from '../assets/idle.png';
import duckTalk from '../assets/talk.png';
import duckHappy from '../assets/hello.png';
import duckThinking from '../assets/thinking.png';

const CARD_W = 168;
const CARD_H = 104;
const SCENE_H = 114;

const QuackSituateMatching = () => {
  const { width, height } = useWindowDimensions();

  const [connections, setConnections] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [character, setCharacter] = useState(duckIdle);
  const [message, setMessage] = useState('Tap a phrase, then tap the matching forest scene.');
  const [resultVisible, setResultVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const smallDuckFloat = useRef(new Animated.Value(0)).current;
  const mainDuckFloat = useRef(new Animated.Value(0)).current;

  const layout = useMemo(() => {
    const leftX = Math.max(18, width * 0.06);
    const rightX = width - CARD_W - Math.max(24, width * 0.04);
    const topStart = height * 0.18;
    const gap = height * 0.135;

    return {
      leftX,
      rightX,
      labelTop: topStart - 32,
      expressions: [
        { id: 'thanks', jp: 'ありがとうございます', romaji: 'arigatou gozaimasu', x: leftX, y: topStart },
        { id: 'sorry', jp: 'すみません', romaji: 'sumimasen', x: leftX, y: topStart + gap },
        { id: 'eat', jp: 'いただきます', romaji: 'itadakimasu', x: leftX, y: topStart + gap * 2 },
      ],
      scenes: [
        { id: 'sorry', emoji: '🙇', text: 'You bump into someone lightly.', x: rightX, y: topStart },
        { id: 'eat', emoji: '🍱', text: 'Before eating a meal.', x: rightX, y: topStart + gap },
        { id: 'thanks', emoji: '🎁', text: 'Someone helps you.', x: rightX, y: topStart + gap * 2 },
      ],
    };
  }, [width, height]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(smallDuckFloat, {
          toValue: -7,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(smallDuckFloat, {
          toValue: 0,
          duration: 650,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(mainDuckFloat, {
          toValue: -9,
          duration: 850,
          useNativeDriver: true,
        }),
        Animated.timing(mainDuckFloat, {
          toValue: 0,
          duration: 850,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const getStartPoint = (from: any) => ({
    x: from.x + CARD_W + 2,
    y: from.y + CARD_H / 2,
  });

  const getEndPoint = (to: any) => ({
    x: to.x - 2,
    y: to.y + SCENE_H / 2,
  });

  const drawRope = (start: any, end: any) => `
    M ${start.x} ${start.y}
    C ${start.x + 95} ${start.y},
      ${end.x - 95} ${end.y},
      ${end.x} ${end.y}
  `;

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
      Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleExpressionClick = (item: any) => {
    setSelectedId(item.id);
    setCharacter(duckTalk);
    setMessage(`Rope ready! Now tap the scene for "${item.romaji}".`);
    pulse();
  };

  const handleSceneClick = (scene: any) => {
    if (!selectedId) {
      setCharacter(duckThinking);
      setMessage('Choose a Japanese phrase first.');
      shake();
      return;
    }

    const selectedExpression = layout.expressions.find((item) => item.id === selectedId);
    if (!selectedExpression) return;

    const correct = selectedExpression.id === scene.id;

    setConnections((prev) => [
      ...prev.filter(
        (c) => c.from.id !== selectedExpression.id && c.to.id !== scene.id
      ),
      { from: selectedExpression, to: scene, correct },
    ]);

    setCharacter(correct ? duckHappy : duckThinking);
    setMessage(
      correct
        ? 'Nice! The rope connected to the correct scene.'
        : 'Oops! That rope path is wrong. Try reconnecting it.'
    );

    if (!correct) shake();
    setSelectedId(null);
  };

  const checkGame = () => {
    const correct = connections.filter((c) => c.correct).length;
    setScore(correct);
    setResultVisible(true);
    setCharacter(correct === 3 ? duckHappy : duckThinking);
  };

  const resetGame = () => {
    setConnections([]);
    setSelectedId(null);
    setCharacter(duckIdle);
    setMessage('Tap a phrase, then tap the matching forest scene.');
    setScore(0);
    setResultVisible(false);
  };

  const goBack = () => {
    setResultVisible(false);
    setIsExiting(true);
  };

  const getConnectionForExpression = (id: string) =>
    connections.find((c) => c.from.id === id);

  const getConnectionForScene = (id: string) =>
    connections.find((c) => c.to.id === id);

  const selectedExpression = selectedId
    ? layout.expressions.find((item) => item.id === selectedId)
    : null;

  if (isExiting) return <AhiruMissionExit color="#D88727" tint="#FFF0DC" icon="git-compare-outline" eyebrow="MATCH SESSION SAVED" title="Connections made!" message="Your phrase-and-scene matching session is complete. Ahiru is packing away the challenge board." footer="Strong connections make expressions easier to recall." mascot={duckThinking} onComplete={() => router.push({ pathname: '/QuackSituate', params: { skipLoading: '1' } })} />;

  return (
    <View style={stylesMatching.container}>
      <ImageBackground source={background} style={stylesMatching.background} resizeMode="cover">
        <View style={stylesMatching.overlay} />

        <TouchableOpacity style={stylesMatching.backButton} onPress={goBack}>
          <BackIcon width={20} height={20} fill="white" />
        </TouchableOpacity>

        <View style={stylesMatching.titleBoard}>
          <Text style={stylesMatching.titleText}>Duck Rope Match</Text>
          <Text style={stylesMatching.subtitleText}>Tap phrase → tap matching scene</Text>
        </View>

        <View style={stylesMatching.stage}>
          <Svg
            width={width}
            height={height}
            style={stylesMatching.ropeLayer}
            pointerEvents="none"
          >
            {selectedExpression && (() => {
              const start = getStartPoint(selectedExpression);
              const end = {
                x: width / 2,
                y: start.y,
              };

              return (
                <>
                  <Path
                    d={drawRope(start, end)}
                    stroke="rgba(50, 25, 8, 0.45)"
                    strokeWidth={14}
                    fill="none"
                    strokeLinecap="round"
                  />
                  <Path
                    d={drawRope(start, end)}
                    stroke="#FFE7A6"
                    strokeWidth={9}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="14 8"
                    opacity={1}
                  />
                </>
              );
            })()}

            {connections.map((line, index) => {
              const start = getStartPoint(line.from);
              const end = getEndPoint(line.to);

              return (
                <>
                  <Path
                    key={`shadow-${line.from.id}-${line.to.id}-${index}`}
                    d={drawRope(start, end)}
                    stroke="rgba(50, 25, 8, 0.5)"
                    strokeWidth={15}
                    fill="none"
                    strokeLinecap="round"
                  />
                  <Path
                    key={`rope-${line.from.id}-${line.to.id}-${index}`}
                    d={drawRope(start, end)}
                    stroke={line.correct ? '#FFD45A' : '#E94B3C'}
                    strokeWidth={10}
                    fill="none"
                    strokeLinecap="round"
                  />
                </>
              );
            })}
          </Svg>

          <View
            style={[
              stylesMatching.columnLabelLeft,
              { top: layout.labelTop, left: layout.leftX + 4 },
            ]}
          >
            <Text style={stylesMatching.columnLabelText}>Phrases</Text>
          </View>

          <View
            style={[
              stylesMatching.columnLabelRight,
              { top: layout.labelTop, right: Math.max(30, width * 0.04) },
            ]}
          >
            <Text style={stylesMatching.columnLabelText}>Scenes</Text>
          </View>

          {layout.expressions.map((item) => {
            const connection = getConnectionForExpression(item.id);

            return (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.88}
                onPress={() => handleExpressionClick(item)}
                style={[
                  stylesMatching.expressionNode,
                  { left: item.x, top: item.y },
                ]}
              >
                <Animated.Image
                  source={selectedId === item.id ? duckThinking : duckIdle}
                  style={[
                    stylesMatching.duckSprite,
                    {
                      transform: [
                        { translateY: smallDuckFloat },
                        { rotate: selectedId === item.id ? '-6deg' : '0deg' },
                        { scale: selectedId === item.id ? 1.08 : 1 },
                      ],
                    },
                  ]}
                />

                <Animated.View
                  style={[
                    stylesMatching.expressionCard,
                    selectedId === item.id && stylesMatching.selectedCard,
                    connection?.correct === true && stylesMatching.correctCard,
                    connection?.correct === false && stylesMatching.wrongCard,
                    selectedId === item.id && { transform: [{ scale: pulseAnim }] },
                  ]}
                >
                  <Text style={stylesMatching.jpText}>{item.jp}</Text>
                  <Text style={stylesMatching.romajiText}>{item.romaji}</Text>
                </Animated.View>

                <View style={stylesMatching.anchorRight} />
              </TouchableOpacity>
            );
          })}

          {layout.scenes.map((scene) => {
            const connection = getConnectionForScene(scene.id);

            return (
              <TouchableOpacity
                key={scene.id}
                activeOpacity={0.88}
                onPress={() => handleSceneClick(scene)}
                style={[
                  stylesMatching.sceneNode,
                  { left: scene.x, top: scene.y },
                ]}
              >
                <Animated.View
                  style={[
                    stylesMatching.sceneCard,
                    connection?.correct === true && stylesMatching.correctCard,
                    connection?.correct === false && stylesMatching.wrongCard,
                    selectedId && { transform: [{ scale: 1.02 }] },
                  ]}
                >
                  <Text style={stylesMatching.sceneEmoji}>{scene.emoji}</Text>
                  <Text style={stylesMatching.sceneText}>{scene.text}</Text>
                </Animated.View>

                <View style={stylesMatching.anchorLeft} />
              </TouchableOpacity>
            );
          })}

          <View style={stylesMatching.floatingDuckGlow} />

          <Animated.Image
            source={character}
            style={[
              stylesMatching.characterImage,
              {
                transform: [
                  { translateX: shakeAnim },
                  { translateY: mainDuckFloat },
                ],
              },
            ]}
          />

          <View style={stylesMatching.bottomBar}>
            <TouchableOpacity style={stylesMatching.gameButton} onPress={checkGame}>
              <Text style={stylesMatching.gameButtonText}>Check</Text>
            </TouchableOpacity>

            <TouchableOpacity style={stylesMatching.resetButton} onPress={resetGame}>
              <Text style={stylesMatching.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <View style={stylesMatching.dialogueContainer}>
            <Text style={stylesMatching.dialogueText}>{message}</Text>
          </View>
        </View>

        <Modal
          visible={resultVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setResultVisible(false)}
        >
          <View style={stylesMatching.modalOverlay}>
            <View style={stylesMatching.modalCard}>
              <TouchableOpacity
                style={stylesMatching.modalCloseButton}
                onPress={() => setResultVisible(false)}
              >
                <Text style={stylesMatching.modalCloseText}>X</Text>
              </TouchableOpacity>

              <Image
                source={score === 3 ? duckHappy : duckThinking}
                style={stylesMatching.modalDuck}
              />

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
                onPress={goBack}
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
