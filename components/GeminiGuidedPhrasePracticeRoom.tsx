import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { router } from "expo-router";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import BackIcon from "../assets/svg/back-icon.svg";
import { AuthContext } from "../context/AuthContext";
import expoconfig from "../expoconfig";
import styles from "../styles/stylesQuackTalkPracticeRoom";

type StartData = {
  sessionId: string;
  scenarioTitle: string;
  roleName: string;
  introduction: string;
  objective: string;
  remainingSeconds: number;
  dailyLimitSeconds: number;
  geminiToken: string;
  geminiModel: string;
  sumiVoice: string;
};
type Scores = {
  turnIndex: number;
  transcript: string;
  pronunciation: number;
  accuracy: number;
  fluency: number;
  pcmBase64: string;
  remainingSeconds: number;
};
const background = require("../assets/quacktalk/guided-phrase-studio-v1.png");
const smile = require("../assets/img/Sumi_PoseB_WinterUni_Smile.png");
const blink = require("../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Smile.png");
const speak = require("../assets/img/Sumi_PoseB_WinterUni_Open.png");
const speakBlink = require("../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Open.png");
const listen = require("../assets/img/Sumi_PoseB_WinterUni_Smile_Blush.png");
const listenBlink = require("../assets/img/Sumi_PoseB_WinterUni_EyesClosed_Smile_Blush.png");

function pcmToWavBase64(chunks: string[]) {
  const bytes = chunks.flatMap((x) => {
    const raw = globalThis.atob(x);
    return Array.from(raw, (c) => c.charCodeAt(0));
  });
  const size = bytes.length;
  const out = new Uint8Array(44 + size);
  const v = new DataView(out.buffer);
  const text = (o: number, s: string) =>
    [...s].forEach((c, i) => (out[o + i] = c.charCodeAt(0)));
  text(0, "RIFF");
  v.setUint32(4, 36 + size, true);
  text(8, "WAVE");
  text(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, 24000, true);
  v.setUint32(28, 48000, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  text(36, "data");
  v.setUint32(40, size, true);
  out.set(bytes, 44);
  let binary = "";
  for (let i = 0; i < out.length; i += 8192)
    binary += String.fromCharCode(...out.subarray(i, i + 8192));
  return globalThis.btoa(binary);
}

export default function GeminiGuidedPhrasePracticeRoom() {
  const { user } = useContext(AuthContext);
  const socket = useRef<WebSocket | null>(null);
  const recording = useRef<Audio.Recording | null>(null);
  const sound = useRef<Audio.Sound | null>(null);
  const audioChunks = useRef<string[]>([]);
  const outputText = useRef("");
  const pendingTurn = useRef<number | null>(null);
  const [session, setSession] = useState<StartData | null>(null);
  const [remaining, setRemaining] = useState(1200);
  const [loading, setLoading] = useState(true);
  const [briefing, setBriefing] = useState(true);
  const [ready, setReady] = useState(false);
  const [recordingNow, setRecordingNow] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [scores, setScores] = useState<Scores | null>(null);
  const [sumiText, setSumiText] = useState("");
  const [inputText, setInputText] = useState("");
  const [hint, setHint] = useState("");
  const [helpLevel, setHelpLevel] = useState(0);
  const [error, setError] = useState("");
  const [conversationStarted, setConversationStarted] = useState(false);
  const headers = { Authorization: `Bearer ${user?.apiToken || ""}` };
  const playOutput = async () => {
    if (!audioChunks.current.length) return;
    setSpeaking(true);
    try {
      const uri = `${FileSystem.cacheDirectory}guided-sumi-${Date.now()}.wav`;
      await FileSystem.writeAsStringAsync(uri, pcmToWavBase64(audioChunks.current), {
        encoding: FileSystem.EncodingType.Base64,
      });
      const result = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, volume: 1 },
      );
      sound.current = result.sound;
      result.sound.setOnPlaybackStatusUpdate((s) => {
        if (s.isLoaded && s.didJustFinish) {
          setSpeaking(false);
          result.sound.setOnPlaybackStatusUpdate(null);
          void result.sound.unloadAsync().finally(() => {
            if (sound.current === result.sound) sound.current = null;
            void FileSystem.deleteAsync(uri, { idempotent: true });
          });
        }
      });
    } catch {
      setSpeaking(false);
      setError("Sumi’s live audio could not be played on this device.");
    } finally {
      audioChunks.current = [];
    }
  };
  const connect = (data: StartData) => {
    const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained?access_token=${encodeURIComponent(data.geminiToken)}`;
    const ws = new WebSocket(url);
    socket.current = ws;
    ws.onopen = () =>
      ws.send(
        JSON.stringify({
          setup: {
            model: `models/${data.geminiModel}`,
            responseModalities: ["AUDIO"],
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            sessionResumption: {},
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: data.sumiVoice },
              },
            },
          },
        }),
      );
    ws.onmessage = (e) => {
      const m = JSON.parse(String(e.data));
      if (m.setupComplete) {
        setReady(true);
        return;
      }
      const c = m.serverContent;
      if (c?.inputTranscription?.text) {
        setInputText((x) => x + c.inputTranscription.text);
      }
      if (c?.outputTranscription?.text) {
        outputText.current += c.outputTranscription.text;
        setSumiText(outputText.current);
      }
      for (const p of c?.modelTurn?.parts || [])
        if (p.inlineData?.data) audioChunks.current.push(p.inlineData.data);
      if (c?.turnComplete) {
        setThinking(false);
        void playOutput();
        if (pendingTurn.current !== null) {
          fetch(
            `${expoconfig.API_URL}/api/guidedPractice/sessions/${data.sessionId}/turn-result`,
            {
              method: "POST",
              headers: { ...headers, "Content-Type": "application/json" },
              body: JSON.stringify({
                turnIndex: pendingTurn.current,
                sumiJapanese: outputText.current,
                feedback:
                  "Gemini continued the scenario from what you communicated.",
                register: "CONVERSATIONAL",
                contextuallyAppropriate: true,
              }),
            },
          ).catch(() => {});
          pendingTurn.current = null;
        }
        outputText.current = "";
      }
    };
    ws.onerror = () =>
      setError("The secure Gemini Live conversation could not connect.");
    ws.onclose = () => setReady(false);
  };
  const start = async () => {
    if (!user?.email || !user.apiToken) {
      setError("Please sign in again.");
      setLoading(false);
      return;
    }
    try {
      const r = await fetch(
        `${expoconfig.API_URL}/api/guidedPractice/sessions/start`,
        {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email }),
        },
      );
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      setSession(d);
      setRemaining(d.remainingSeconds);
      connect(d);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Guided Practice could not start.",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void start();
    const blinkId = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 160);
    }, 3600);
    const timer = setInterval(
      () => setRemaining((x) => Math.max(0, x - 1)),
      1000,
    );
    return () => {
      clearInterval(blinkId);
      clearInterval(timer);
      socket.current?.close();
      sound.current?.unloadAsync().catch(() => {});
      recording.current?.stopAndUnloadAsync().catch(() => {});
    };
  }, [user?.email]);
  useEffect(() => {
    if (remaining !== 0 || !session) return;
    socket.current?.close();
    void fetch(
      `${expoconfig.API_URL}/api/guidedPractice/sessions/${session.sessionId}/end`,
      { method: "POST", headers },
    ).catch(() => {});
    setError(
      "Today’s 20-minute Guided Practice is complete. Your session was saved.",
    );
  }, [remaining, session?.sessionId]);
  const record = async () => {
    if (!ready || thinking || speaking) return;
    const p = await Audio.requestPermissionsAsync();
    if (!p.granted) {
      setError("Microphone permission is required.");
      return;
    }
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    const r = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
    );
    recording.current = r.recording;
    setInputText("");
    setRecordingNow(true);
  };
  const send = async () => {
    if (!recording.current || !session) return;
    setRecordingNow(false);
    setThinking(true);
    try {
      await recording.current.stopAndUnloadAsync();
      const uri = recording.current.getURI();
      recording.current = null;
      if (!uri) throw new Error("Recording could not be read.");
      const ext = uri.split(".").pop() || "m4a";
      const form = new FormData();
      form.append("audio", {
        uri,
        name: `response.${ext}`,
        type: ext === "wav" ? "audio/wav" : "audio/mp4",
      } as any);
      form.append("hintsUsed", String(helpLevel));
      const r = await fetch(
        `${expoconfig.API_URL}/api/guidedPractice/sessions/${session.sessionId}/pronunciation`,
        { method: "POST", headers, body: form },
      );
      const d = await r.json();
      if (!r.ok) throw new Error(d.message);
      setScores(d);
      setRemaining(d.remainingSeconds);
      pendingTurn.current = d.turnIndex;
      socket.current?.send(
        JSON.stringify({
          realtimeInput: {
            audio: { data: d.pcmBase64, mimeType: "audio/pcm;rate=16000" },
          },
        }),
      );
      socket.current?.send(
        JSON.stringify({ realtimeInput: { audioStreamEnd: true } }),
      );
    } catch (e) {
      setThinking(false);
      setError(
        e instanceof Error
          ? e.message
          : "Your response could not be processed.",
      );
    }
  };
  const getHint = async () => {
    if (!session) return;
    const level = Math.min(4, helpLevel + 1);
    const r = await fetch(
      `${expoconfig.API_URL}/api/guidedPractice/sessions/${session.sessionId}/hint?level=${level}`,
      { headers },
    );
    const d = await r.json();
    setHelpLevel(d.level);
    setHint(d.hint);
  };
  const leave = async () => {
    socket.current?.close();
    if (session)
      await fetch(
        `${expoconfig.API_URL}/api/guidedPractice/sessions/${session.sessionId}/end`,
        { method: "POST", headers },
      ).catch(() => {});
    router.replace("/QuackTalk");
  };
  const frame = speaking
    ? blinking
      ? speakBlink
      : speak
    : recordingNow
      ? blinking
        ? listenBlink
        : listen
      : blinking
        ? blink
        : smile;
  const clock = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  if (loading)
    return (
      <SafeAreaView style={styles.safeArea}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            backgroundColor: "#F8F2FC",
          }}
        >
          <ActivityIndicator size="large" color="#D84F83" />
          <Text>Opening a secure live conversation…</Text>
        </View>
      </SafeAreaView>
    );
  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={background}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={[styles.sceneTint, styles.studioTint]} />
        <View style={styles.header}>
          <Pressable onPress={leave} style={styles.headerButton}>
            <BackIcon width={18} height={18} fill="#47295A" />
          </Pressable>
          <View style={[styles.headerMark, { backgroundColor: "#FCE9F1" }]}>
            <Ionicons name="mic" size={19} color="#D84F83" />
          </View>
          <View style={styles.headerCopy}>
            <Text style={[styles.headerEyebrow, { color: "#D84F83" }]}>VOICE PRACTICE</Text>
            <Text style={styles.headerTitle}>Guided Phrase</Text>
          </View>
          <Pressable accessibilityLabel="How Guided Phrase works" onPress={() => setBriefing(true)} style={[styles.headerButton, { backgroundColor: "#FCE9F1" }]}>
            <Ionicons name="help" size={22} color="#D84F83" />
          </Pressable>
        </View>
        <View style={styles.stage}>
          <View style={styles.coachStatus}>
            <View style={styles.onlineDot} />
            <View>
              <Text style={styles.coachStatusText}>
                {speaking
                  ? "SUMI IS SPEAKING"
                  : recordingNow
                    ? "SUMI IS LISTENING"
                    : thinking
                      ? "SUMI IS THINKING"
                      : ready
                        ? "LIVE WITH SUMI"
                        : "CONNECTING"}
              </Text>
              <Text style={styles.coachStatusSubtext}>
                {session?.scenarioTitle}
              </Text>
            </View>
          </View>
          <Image
            source={frame}
            style={styles.sumi}
            resizeMode="contain"
            fadeDuration={0}
          />
          <View style={styles.floorShadow} />
          <View style={[styles.floorLine, { backgroundColor: "#D84F8366" }]} />
          <View style={styles.controlPanel}>
            <View style={styles.voiceToolsRow}>
              <View style={styles.voiceLabelGroup}>
                <View style={[styles.voiceReplay, { backgroundColor: "#FCE9F1" }]}>
                  <Ionicons name={speaking ? "volume-high" : "volume-medium-outline"} size={18} color="#D84F83" />
                </View>
                <View>
                  <Text style={styles.languageLabel}>SUMI'S VOICE</Text>
                  <Text style={styles.voiceProfileLabel}>LIVE JAPANESE COACH</Text>
                </View>
              </View>
              <View style={styles.timerPill}>
                <View style={[styles.timerDot, recordingNow && styles.timerDotActive]} />
                <Text style={styles.timerText}>{clock(remaining)}</Text>
              </View>
            </View>
            <Text
              style={{
                fontSize: 19,
                fontWeight: "800",
                color: "#412650",
                textAlign: "center",
                paddingHorizontal: 18,
              }}
            >
              {sumiText || "Listen to Sumi’s opening, then respond naturally."}
            </Text>
            {inputText ? (
              <Text
                style={{ textAlign: "center", color: "#786B7D", marginTop: 5 }}
              >
                You: {inputText}
              </Text>
            ) : null}
            {scores ? (
              <View
                style={{
                  margin: 14,
                  padding: 11,
                  borderRadius: 16,
                  backgroundColor: "#F0F8EA",
                }}
              >
                <Text style={{ fontWeight: "800" }}>
                  Azure pronunciation assessment
                </Text>
                <Text>
                  Pronunciation {scores.pronunciation} · Accuracy{" "}
                  {scores.accuracy} · Fluency {scores.fluency}
                </Text>
              </View>
            ) : null}
            {hint ? (
              <Text style={{ paddingHorizontal: 18, color: "#5C3970" }}>
                Hint {helpLevel}: {hint}
              </Text>
            ) : null}
            <View style={styles.microphoneArea}>
              <View style={[styles.micOrbit, { borderColor: "#D84F8322" }]} />
              <Pressable
                disabled={!ready || thinking || speaking || remaining === 0}
                onPress={recordingNow ? send : record}
                style={[
                  styles.microphoneButton,
                  { backgroundColor: recordingNow ? "#E34F6C" : "#D84F83" },
                ]}
              >
                <Ionicons
                  name={thinking ? "hourglass" : recordingNow ? "stop" : "mic"}
                  size={32}
                  color="#FFF"
                />
              </Pressable>
              <Text style={styles.microphoneStatus}>
                {thinking
                  ? "Sumi is understanding your response…"
                  : recordingNow
                    ? "Speak naturally, then tap to send."
                    : speaking
                      ? "Listen to Sumi."
                      : "Tap to speak with Sumi."}
              </Text>
            </View>
            <View style={styles.secondaryActions}>
              <Pressable onPress={() => router.push({pathname:'/QuackTalkFeedback',params:{returnTo:'speaking'}})} style={styles.secondaryButton}>
                <Ionicons name="analytics-outline" size={18} color="#7552C8" />
                <Text style={styles.secondaryButtonText}>Feedback</Text>
              </Pressable>
              <Pressable onPress={getHint} style={styles.secondaryButton}>
                <Ionicons name="bulb-outline" size={18} color="#D84F83" />
                <Text style={styles.secondaryButtonText}>
                  Hint {helpLevel}/4
                </Text>
              </Pressable>
            </View>
            {error ? (
              <Text
                style={{ color: "#B43652", textAlign: "center", padding: 10 }}
              >
                {error}
              </Text>
            ) : null}
          </View>
        </View>
        <Modal visible={briefing && !!session} transparent animationType="fade">
          <View style={styles.tutorialShade}>
            <View style={styles.tutorialCard}>
              <View style={styles.tutorialHeader}>
                <View style={[styles.tutorialIcon, {backgroundColor:'#FCE9F1'}]}><Ionicons name="sparkles-outline" size={23} color="#D84F83" /></View>
                <View style={styles.tutorialHeaderCopy}>
                  <Text style={[styles.tutorialKicker,{color:'#D84F83'}]}>QUICK GUIDE</Text>
                  <Text style={styles.tutorialTitle}>Guided Phrase</Text>
                </View>
                <Pressable onPress={() => setBriefing(false)} style={styles.tutorialClose}><Ionicons name="close" size={20} color="#695C6E" /></Pressable>
              </View>
              <Text style={{ color: "#6E6172", lineHeight: 21 }}>
                {session?.introduction}
              </Text>
              {[
                ['1','Listen to Sumi','Sumi welcomes you, explains the situation, and begins the conversation aloud.'],
                ['2','Answer naturally','Tap the microphone, speak in Japanese, then tap again to send your response.'],
                ['3','Keep the conversation moving','Sumi responds to what you actually said. Use progressive hints only when needed.'],
              ].map(([step,title,copy])=><View key={step} style={styles.tutorialStep}><View style={[styles.tutorialStepNumber,{backgroundColor:'#D84F83'}]}><Text style={styles.tutorialStepNumberText}>{step}</Text></View><View style={styles.tutorialStepCopy}><Text style={styles.tutorialStepTitle}>{title}</Text><Text style={styles.tutorialStepText}>{copy}</Text></View></View>)}
              <View style={styles.tutorialNotice}><Ionicons name="time-outline" size={18} color="#A06D1E" /><Text style={styles.tutorialNoticeText}>You have up to 20 minutes of Guided Phrase practice each day. Your remaining time is saved securely.</Text></View>
              <Pressable
                disabled={!ready}
                onPress={() => {setBriefing(false);if(!conversationStarted){setConversationStarted(true);setThinking(true);socket.current?.send(JSON.stringify({realtimeInput:{text:'Welcome the learner in English, briefly explain this selected scenario, then transition to Japanese and begin with one natural question.'}}));}}}
                style={[styles.tutorialDone,{backgroundColor:'#D84F83'},!ready&&{opacity:.55}]}
              >
                <Text style={styles.tutorialDoneText}>
                  {ready?(conversationStarted?'Return to practice':'Start practice'):'Connecting securely…'}
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </SafeAreaView>
  );
}
