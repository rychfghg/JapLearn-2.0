import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import expoconfig from '../expoconfig';
import styles from '../styles/stylesQuackResponseGuided';
import { coachExamples } from '../services/replyCoachPractice';
import { shuffleOptions } from '../services/shuffleOptions';

type Review = { questionId: string; skill: string; prompt: string; correct: boolean; supported: boolean; explanation: string; bestReply: string; bestRomaji: string; practiceNumber: number };
type Check = {
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED'; runId?: string; answered: number; ready: boolean;
  policy: { thresholdPercent: number; questionCount: number; label: string }; passed?: boolean; correct?: number; supported?: number;
  practicedQuestions?: string[]; review?: Review[];
  question?: { id: string; prompt: string; helpTypes: string[]; choices: { id: string; japanese: string; romaji: string; meaning: string }[] };
};

export default function ReplyCoachReadiness({ attemptId, email, onClose }: { attemptId: string; email: string; onClose: () => void }) {
  const [check, setCheck] = useState<Check | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, boolean>>({});
  const [practiceHelp, setPracticeHelp] = useState<Record<number, string[]>>({});
  const lock = useRef(false);
  const practiceOrder=useRef<Record<string,boolean[]>>({});
  const choicesFor=(number:number)=>{
    const key=`${check?.runId}:${number}`;
    return practiceOrder.current[key]??(practiceOrder.current[key]=shuffleOptions([false,true]));
  };
  const request = async (body?: Record<string, string>) => {
    const response = await fetch(`${expoconfig.API_URL}/api/reply-coach/readiness${body ? '' : `?attemptId=${encodeURIComponent(attemptId)}&email=${encodeURIComponent(email)}`}`, body ? {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ attemptId, email, ...body }),
    } : undefined);
    if (!response.ok) throw new Error('Could not save or open your check. Please try again.');
    return response.json();
  };
  useEffect(() => { let active = true; request().then(value => { if (active) setCheck(value); }).catch(reason => { if (active) setError(reason.message); }); return () => { active = false; }; }, [attemptId, email]);
  const act = async (body: Record<string, string>) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try { setCheck(await request(body)); }
    catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Please try again.');
      // A response may be lost after the server saved it. Recover the authoritative current question.
      try { setCheck(await request()); } catch { /* Keep the retry and save-and-return controls available. */ }
    }
    finally { lock.current = false; setBusy(false); }
  };
  const practice = async (number: number, correctChoice: boolean) => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try {
      const example = coachExamples[number - 1];
      const result = await request({ action: 'practice', mode: 'targeted', questionId: `practice-${number}`,
        selectedJapanese: example[correctChoice ? 1 : 4], helpTypes: (practiceHelp[number] ?? []).join(',') });
      setPracticeAnswers(value => ({ ...value, [number]: result.correct }));
      setCheck(value => value ? { ...value, practicedQuestions: [...(value.practicedQuestions ?? []), `practice-${number}`] } : value);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Please try again.'); }
    finally { lock.current = false; setBusy(false); }
  };
  const needed = [...new Set((check?.review ?? []).filter(item => !item.correct || item.supported).map(item => item.practiceNumber))];
  const practiceDone = needed.every(number => check?.practicedQuestions?.includes(`practice-${number}`));
  const question = check?.question;
  return <Modal visible animationType="slide" onRequestClose={onClose}>
    <SafeAreaView style={styles.reviewPage}>
      <View style={styles.reviewHeader}><Pressable accessibilityLabel="Save and return" style={styles.iconButton} onPress={onClose}><Ionicons name="arrow-back" size={23} color="#8423D9" /></Pressable><Text style={styles.reviewTitle}>Readiness check</Text></View>
      <ScrollView contentContainerStyle={[styles.reviewContent, { width: '100%', maxWidth: 700, alignSelf: 'center' }]}>
        {error ? <><Text accessibilityRole="alert" style={styles.coachNotice}>{error}</Text>{!check && <Pressable style={styles.secondaryButton} onPress={() => { setError(''); request().then(setCheck).catch(reason => setError(reason.message)); }}><Text style={styles.secondaryButtonText}>Retry</Text></Pressable>}</> : null}
        {!check && !error && <ActivityIndicator color="#8423D9" />}
        {check && <>
          <Text style={styles.coachNotice}>{check.policy.label}</Text>
          <Text style={styles.coachContextText}>{check.policy.questionCount} questions · no timer. Romaji is included below Japanese. Answer at least {check.policy.thresholdPercent}% correctly without optional meaning support to demonstrate readiness. Using meaning support is allowed, but that check becomes supported practice.</Text>
          <Text style={styles.coachNotice}>Text-only scenarios · separate from your chapter practice score.</Text>
          {check.status === 'NOT_STARTED' && <Pressable disabled={busy} style={styles.primaryButton} onPress={() => act({ action: 'start' })}><Text style={styles.primaryButtonText}>Start readiness check</Text></Pressable>}
          {check.status === 'IN_PROGRESS' && question && <>
            <Text style={styles.hintTitle}>Question {check.answered + 1} of {check.policy.questionCount}</Text>
            <Text style={styles.hintText}>{question.prompt}</Text>
            <View style={styles.coachTools}>{['meaning'].map(help => <Pressable key={help} disabled={busy || question.helpTypes.includes(help)} style={styles.coachTool} onPress={() => act({ action: 'support', runId: check.runId!, questionId: question.id, helpType: help })}><Text style={styles.coachToolText}>{question.helpTypes.includes(help) ? `${help} shown` : `Show ${help}`}</Text></Pressable>)}</View>
            {question.helpTypes.length > 0 && <Text style={styles.coachNotice}>Support used · this answer will not count as independent.</Text>}
            {question.choices.map(choice => <Pressable key={choice.id} disabled={busy} style={styles.coachExample} onPress={() => act({ action: 'answer', runId: check.runId!, questionId: question.id, choiceId: choice.id })}><Text style={styles.choiceJapanese}>{choice.japanese}</Text>{Boolean(choice.romaji) && <Text style={styles.choiceRomaji}>{choice.romaji}</Text>}{Boolean(choice.meaning) && <Text style={styles.dialogueText}>{choice.meaning}</Text>}</Pressable>)}
            <Text style={styles.coachNotice}>Feedback appears after all questions. Each answer is saved; you can return later.</Text>
          </>}
          {check.status === 'COMPLETED' && <>
            <Text style={styles.hintTitle}>{check.passed ? 'Ready for the next activities' : 'Let’s strengthen these skills'}</Text>
            <Text style={styles.hintText}>{check.correct}/{check.policy.questionCount} correct · {check.supported} supported</Text>
            {check.review?.map(item => <View key={item.questionId} style={styles.reviewCard}><Text style={styles.coachContextLabel}>{item.skill} · {item.correct ? 'Correct' : 'Review'}{item.supported ? ' · supported' : ''}</Text><Text style={styles.reviewPrompt}>{item.prompt}</Text><Text style={styles.bestAnswerText}>{item.bestReply}</Text><Text style={styles.choiceRomaji}>{item.bestRomaji}</Text><Text style={styles.reviewExplanation}>{item.explanation}</Text></View>)}
            {!check.passed && <>
              <Text style={styles.hintTitle}>Targeted practice</Text>
              <Text style={styles.coachNotice}>Practice the missed or supported skills below, then try a different set. Your previous check stays saved.</Text>
              {needed.map(number => { const example = coachExamples[number - 1]; const done = check.practicedQuestions?.includes(`practice-${number}`); const help = practiceHelp[number] ?? []; return <View key={number} style={styles.reviewCard}>
                <Text style={styles.reviewPrompt}>{example[0]}</Text>
                <View style={styles.coachTools}>{['meaning'].map(type => <Pressable key={type} disabled={done} style={styles.coachTool} onPress={() => setPracticeHelp(value => ({ ...value, [number]: [...new Set([...help, type])] }))}><Text style={styles.coachToolText}>Show {type}</Text></Pressable>)}</View>
                {choicesFor(number).map((correct, index) => <Pressable key={index} disabled={busy || done} style={styles.coachExample} onPress={() => practice(number, correct)}><Text style={styles.choiceJapanese}>{example[correct ? 1 : 4]}</Text><Text style={styles.choiceRomaji}>{example[correct ? 2 : 5]}</Text>{help.includes('meaning') && <Text style={styles.dialogueText}>{example[correct ? 3 : 6]}</Text>}</Pressable>)}
                {done && <Text style={styles.reviewExplanation}>{practiceAnswers[number] === false ? 'Review: ' : 'Practice saved. '}{example[7]}</Text>}
              </View>; })}
              <Pressable disabled={busy || !practiceDone} style={[styles.primaryButton, !practiceDone && { opacity: 0.5 }]} onPress={() => { setPracticeAnswers({}); setPracticeHelp({}); void act({ action: 'start' }); }}><Text style={styles.primaryButtonText}>Try a different readiness set</Text></Pressable>
            </>}
          </>}
        </>}
        {busy && <ActivityIndicator style={{ marginTop: 12 }} color="#8423D9" />}
        <Pressable style={styles.secondaryButton} onPress={onClose}><Text style={styles.secondaryButtonText}>Save and return</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  </Modal>;
}
