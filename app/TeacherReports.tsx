import React, { useCallback, useContext, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import { AuthContext } from '../context/AuthContext';
import TeacherBottomNav from '../components/TeacherBottomNav';
import { teacherStyles as s, teacherTheme as t } from '../styles/stylesTeacherApp';
import {
  completionPercent,
  teacherApi,
  type GamePerformance,
  type LessonProgress,
  type TeacherClass,
  type TeacherStudent,
} from '../services/teacherApi';

type Mode = 'report' | 'scores';
type Scope = { kind: 'all' } | { kind: 'class'; code: string } | { kind: 'student'; email: string };

type Scorecard = {
  student: TeacherStudent;
  lessons: number;
  games: number | null;
  attempts: number;
  overall: number;
};

/** Runs the requests a few at a time, like the web portal does. */
async function mapWithLimit<T, R>(items: T[], limit: number, work: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = [];
  for (let index = 0; index < items.length; index += limit) {
    const slice = items.slice(index, index + limit);
    results.push(...await Promise.all(slice.map(work)));
  }
  return results;
}

function standing(value: number) {
  if (value >= 85) return { label: 'Excellent', color: t.green, tint: t.greenSoft };
  if (value >= 60) return { label: 'On track', color: t.brand, tint: t.brandSoft };
  return { label: 'Needs support', color: t.orange, tint: t.orangeSoft };
}

export default function TeacherReports() {
  const { user } = useContext(AuthContext);
  // A pixel cap keeps the sheet on screen; a percentage is not honoured on web.
  const { height: windowHeight } = useWindowDimensions();

  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [mode, setMode] = useState<Mode>('report');
  const [scope, setScope] = useState<Scope>({ kind: 'all' });
  const [scopeOpen, setScopeOpen] = useState(false);
  const [studentQuery, setStudentQuery] = useState('');

  const [cards, setCards] = useState<Scorecard[] | null>(null);
  const [performances, setPerformances] = useState<Record<string, GamePerformance> | null>(null);
  const [working, setWorking] = useState(false);
  const [done, setDone] = useState(0);

  const load = useCallback(async () => {
    setError('');
    try {
      const [classList, studentList, progressList] = await Promise.all([
        teacherApi.classes(user),
        teacherApi.students(user),
        teacherApi.lessonProgress(user).catch(() => [] as LessonProgress[]),
      ]);
      setClasses(Array.isArray(classList) ? classList : []);
      setStudents(Array.isArray(studentList) ? studentList : []);
      setProgress(Array.isArray(progressList) ? progressList : []);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Could not load your classroom.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const targets = useMemo(() => {
    if (scope.kind === 'all') return students;
    if (scope.kind === 'class') return students.filter((student) => student.classCode === scope.code);
    return students.filter((student) => student.email === scope.email);
  }, [students, scope]);

  const scopeLabel = useMemo(() => {
    if (scope.kind === 'all') return 'Everyone';
    if (scope.kind === 'class') return scope.code;
    const match = students.find((student) => student.email === scope.email);
    return match ? `${match.fname} ${match.lname}` : scope.email;
  }, [scope, students]);

  const lessonPercent = (email: string) =>
    completionPercent(progress.find((item) => item.email?.toLowerCase() === email.toLowerCase()));

  const generate = async () => {
    if (working || !targets.length) return;
    setWorking(true);
    setDone(0);
    setCards(null);
    setPerformances(null);
    setError('');
    try {
      const collected: Record<string, GamePerformance> = {};
      const built = await mapWithLimit(targets, 4, async (student) => {
        let performance: GamePerformance | null = null;
        try {
          performance = await teacherApi.gamePerformance(user, student.email);
          if (performance) collected[student.email] = performance;
        } catch {
          // A learner with no saved attempts still belongs in the report.
        }
        setDone((count) => count + 1);

        const scored = (performance?.games ?? [])
          .map((game) => game.summary?.average)
          .filter((value): value is number => typeof value === 'number');
        const games = scored.length ? Math.round(scored.reduce((sum, value) => sum + value, 0) / scored.length) : null;
        const lessons = lessonPercent(student.email);

        return {
          student,
          lessons,
          games,
          attempts: performance?.totalAttempts ?? 0,
          overall: games === null ? lessons : Math.round((lessons + games) / 2),
        } satisfies Scorecard;
      });

      setPerformances(collected);
      setCards(built.sort((a, b) => b.overall - a.overall));
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'The report could not be built.');
    } finally {
      setWorking(false);
    }
  };

  const summary = useMemo(() => {
    if (!cards?.length) return null;
    const average = Math.round(cards.reduce((sum, card) => sum + card.overall, 0) / cards.length);
    const attempts = cards.reduce((sum, card) => sum + card.attempts, 0);
    return { average, attempts, top: cards[0], support: cards.filter((card) => card.overall < 60).length };
  }, [cards]);

  const filteredStudents = students.filter((student) =>
    `${student.fname} ${student.lname} ${student.email}`.toLowerCase().includes(studentQuery.trim().toLowerCase()),
  );

  return (
    <SafeAreaView style={s.screen}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <LinearGradient colors={['#3B1450', '#6B22B4', '#8E34DC']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.header}>
          <Text style={s.headerKicker}>INSIGHTS</Text>
          <Text style={s.headerName}>Reports</Text>
          <Text style={s.headerSub}>Progress reports and saved game scores for your learners.</Text>
        </LinearGradient>

        {/* Reports or Game scores */}
        <View style={{ flexDirection: 'row', gap: 6, padding: 4, marginTop: 16, borderRadius: 14, backgroundColor: '#F2EFF5' }}>
          {(['report', 'scores'] as const).map((item) => {
            const on = mode === item;
            return (
              <Pressable
                key={item}
                onPress={() => { setMode(item); setCards(null); setPerformances(null); }}
                style={[{ flex: 1, paddingVertical: 10, borderRadius: 11, alignItems: 'center' }, on && { backgroundColor: '#FFFFFF' }]}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
              >
                <Text style={[s.ghostText, on && { color: t.ink }]}>{item === 'report' ? 'Progress report' : 'Game scores'}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={s.sectionLabel}>WHO TO INCLUDE</Text>
        <Pressable onPress={() => setScopeOpen(true)} style={({ pressed }) => [s.row, pressed && s.pressed]} accessibilityRole="button">
          <View style={s.rowAvatar}>
            <Ionicons name={scope.kind === 'student' ? 'person-outline' : scope.kind === 'class' ? 'school-outline' : 'people-outline'} size={19} color={t.brand} />
          </View>
          <View style={s.rowBody}>
            <Text style={s.rowTitle}>{scopeLabel}</Text>
            <Text style={s.rowSub}>{targets.length} {targets.length === 1 ? 'learner' : 'learners'} included</Text>
          </View>
          <Ionicons name="chevron-forward" size={19} color={t.muted} />
        </Pressable>

        {!!error && (
          <View style={[s.notice, s.errorNotice]}>
            <Ionicons name="alert-circle-outline" size={17} color={t.danger} />
            <Text style={[s.noticeText, s.errorText]}>{error}</Text>
          </View>
        )}

        <Pressable
          onPress={generate}
          disabled={working || loading || !targets.length}
          style={({ pressed }) => [s.primaryButton, { marginTop: 12 }, (pressed || working || !targets.length) && s.pressed]}
        >
          {working ? <ActivityIndicator color="#FFFFFF" /> : (
            <>
              <Ionicons name={mode === 'report' ? 'document-text-outline' : 'game-controller-outline'} size={18} color="#FFFFFF" />
              <Text style={s.primaryText}>{mode === 'report' ? 'Generate report' : 'Load game scores'}</Text>
            </>
          )}
        </Pressable>

        {working && (
          <Text style={[s.rowSub, { textAlign: 'center', marginTop: 10 }]}>Collecting results · {done} of {targets.length}</Text>
        )}

        {/* Progress report */}
        {mode === 'report' && cards && !working && (
          <>
            <Text style={s.sectionLabel}>SUMMARY · {scopeLabel.toUpperCase()}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              <View style={[s.statCard, { flexBasis: '47%', flexGrow: 1 }]}>
                <View style={[s.statIcon, { backgroundColor: t.brandSoft }]}><Ionicons name="people-outline" size={17} color={t.brand} /></View>
                <Text style={s.statValue}>{cards.length}</Text><Text style={s.statLabel}>Learners</Text>
              </View>
              <View style={[s.statCard, { flexBasis: '47%', flexGrow: 1 }]}>
                <View style={[s.statIcon, { backgroundColor: t.greenSoft }]}><Ionicons name="trending-up-outline" size={17} color={t.green} /></View>
                <Text style={s.statValue}>{summary?.average ?? 0}%</Text><Text style={s.statLabel}>Average overall</Text>
              </View>
              <View style={[s.statCard, { flexBasis: '47%', flexGrow: 1 }]}>
                <View style={[s.statIcon, { backgroundColor: t.blueSoft }]}><Ionicons name="ribbon-outline" size={17} color={t.blue} /></View>
                <Text style={s.statValue}>{summary?.top ? `${summary.top.overall}%` : '—'}</Text>
                <Text style={s.statLabel} numberOfLines={1}>Top · {summary?.top?.student.fname ?? '—'}</Text>
              </View>
              <View style={[s.statCard, { flexBasis: '47%', flexGrow: 1 }]}>
                <View style={[s.statIcon, { backgroundColor: t.orangeSoft }]}><Ionicons name="alert-circle-outline" size={17} color={t.orange} /></View>
                <Text style={s.statValue}>{summary?.support ?? 0}</Text><Text style={s.statLabel}>Need support</Text>
              </View>
            </View>

            <Text style={s.sectionLabel}>RANKED LEARNERS</Text>
            {cards.map((card, index) => {
              const mark = standing(card.overall);
              return (
                <View key={card.student.email} style={[s.card, { marginBottom: 10 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={s.rowAvatar}><Text style={s.rowAvatarText}>{index + 1}</Text></View>
                    <View style={s.rowBody}>
                      <Text style={s.rowTitle} numberOfLines={1}>{card.student.fname} {card.student.lname}</Text>
                      <Text style={s.rowSub} numberOfLines={1}>{card.student.classCode || 'No class'} · {card.attempts} attempts</Text>
                    </View>
                    <View style={[s.chip, { backgroundColor: mark.tint }]}>
                      <Text style={[s.chipText, { color: mark.color }]}>{mark.label}</Text>
                    </View>
                  </View>

                  <View style={{ marginTop: 12, gap: 8 }}>
                    {[
                      { label: 'Lessons', value: card.lessons, color: t.brand },
                      { label: 'Games', value: card.games, color: t.green },
                      { label: 'Overall', value: card.overall, color: t.blue },
                    ].map((bar) => (
                      <View key={bar.label}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text style={s.rowSub}>{bar.label}</Text>
                          <Text style={[s.rowSub, { color: bar.color, fontWeight: '700' }]}>{bar.value === null ? 'No data' : `${bar.value}%`}</Text>
                        </View>
                        <View style={{ height: 6, borderRadius: 4, backgroundColor: '#F0EAF4', overflow: 'hidden' }}>
                          <View style={{ width: `${bar.value ?? 0}%`, height: '100%', borderRadius: 4, backgroundColor: bar.color }} />
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* Game scores */}
        {mode === 'scores' && performances && !working && (
          <>
            <Text style={s.sectionLabel}>GAME SCORES · {scopeLabel.toUpperCase()}</Text>
            {targets.map((student) => {
              const performance = performances[student.email];
              const games = performance?.games ?? [];
              return (
                <View key={student.email} style={[s.card, { marginBottom: 10 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <View style={s.rowAvatar}>
                      <Text style={s.rowAvatarText}>{`${student.fname?.[0] ?? ''}${student.lname?.[0] ?? ''}`.toUpperCase()}</Text>
                    </View>
                    <View style={s.rowBody}>
                      <Text style={s.rowTitle} numberOfLines={1}>{student.fname} {student.lname}</Text>
                      <Text style={s.rowSub}>{performance?.totalAttempts ?? 0} attempts saved</Text>
                    </View>
                  </View>

                  {games.length === 0 ? (
                    <Text style={[s.rowSub, { marginTop: 10 }]}>No game results yet.</Text>
                  ) : (
                    <View style={{ marginTop: 12, gap: 9 }}>
                      {games.map((game) => (
                        <View key={game.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <View style={[s.statIcon, { marginBottom: 0, width: 30, height: 30, backgroundColor: t.brandSoft }]}>
                            <Ionicons name="game-controller-outline" size={15} color={t.brand} />
                          </View>
                          <View style={s.rowBody}>
                            <Text style={s.rowTitle} numberOfLines={1}>{game.name}</Text>
                            <Text style={s.rowSub}>
                              {game.summary?.attempts ?? 0} attempts
                              {game.summary?.highest != null ? ` · best ${Math.round(game.summary.highest)}%` : ''}
                            </Text>
                          </View>
                          <Text style={[s.rowTitle, { color: t.brand }]}>
                            {game.summary?.average != null ? `${Math.round(game.summary.average)}%` : '—'}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </>
        )}

        {!cards && !performances && !working && !loading && (
          <View style={[s.card, s.empty, { marginTop: 18 }]}>
            <Ionicons name={mode === 'report' ? 'document-text-outline' : 'game-controller-outline'} size={30} color={t.muted} />
            <Text style={s.emptyTitle}>Ready when you are</Text>
            <Text style={s.emptyText}>
              {targets.length
                ? `This covers ${scopeLabel} — ${targets.length} ${targets.length === 1 ? 'learner' : 'learners'}. Tap the button above.`
                : 'No learners match this selection yet.'}
            </Text>
          </View>
        )}
      </ScrollView>

      <TeacherBottomNav active="reports" />

      {/* Scope picker */}
      <Modal visible={scopeOpen} transparent animationType="slide" onRequestClose={() => setScopeOpen(false)}>
        <Pressable style={s.sheetBackdrop} onPress={() => setScopeOpen(false)} accessibilityLabel="Close">
          <Pressable style={[s.sheet, { maxHeight: Math.round(windowHeight * 0.82) }]} onPress={() => undefined}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitle}>Who to include</Text>
            <Text style={s.sheetText}>Choose everyone, one class, or a single learner.</Text>

            <Pressable
              onPress={() => { setScope({ kind: 'all' }); setScopeOpen(false); setCards(null); setPerformances(null); }}
              style={({ pressed }) => [s.row, pressed && s.pressed]}
            >
              <View style={s.rowAvatar}><Ionicons name="people-outline" size={19} color={t.brand} /></View>
              <View style={s.rowBody}>
                <Text style={s.rowTitle}>Everyone</Text>
                <Text style={s.rowSub}>All {students.length} learners</Text>
              </View>
              {scope.kind === 'all' && <Ionicons name="checkmark-circle" size={20} color={t.brand} />}
            </Pressable>

            <Text style={s.label}>By class</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 12 }}>
              {classes.map((item) => {
                const on = scope.kind === 'class' && scope.code === item.classCodes;
                return (
                  <Pressable
                    key={item.classCodes}
                    onPress={() => { setScope({ kind: 'class', code: item.classCodes }); setScopeOpen(false); setCards(null); setPerformances(null); }}
                    style={[s.chip, on ? null : s.chipMuted]}
                  >
                    <Text style={[s.chipText, on ? null : s.chipMutedText]}>{item.classCodes}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Text style={s.label}>By student</Text>
            <View style={s.search}>
              <Ionicons name="search" size={17} color={t.muted} />
              <TextInput
                value={studentQuery}
                onChangeText={setStudentQuery}
                placeholder="Search learners"
                placeholderTextColor="#B6ADBB"
                style={s.searchInput}
                autoCapitalize="none"
              />
            </View>

            {/* A bounded height keeps the rows tappable inside the sheet. */}
            <ScrollView style={{ marginTop: 10, maxHeight: 260, flexGrow: 0 }} showsVerticalScrollIndicator nestedScrollEnabled>
              {filteredStudents.map((student) => {
                const on = scope.kind === 'student' && scope.email === student.email;
                return (
                  <Pressable
                    key={student.email}
                    onPress={() => { setScope({ kind: 'student', email: student.email }); setScopeOpen(false); setCards(null); setPerformances(null); }}
                    style={({ pressed }) => [s.row, pressed && s.pressed]}
                  >
                    <View style={s.rowAvatar}>
                      <Text style={s.rowAvatarText}>{`${student.fname?.[0] ?? ''}${student.lname?.[0] ?? ''}`.toUpperCase()}</Text>
                    </View>
                    <View style={s.rowBody}>
                      <Text style={s.rowTitle} numberOfLines={1}>{student.fname} {student.lname}</Text>
                      <Text style={s.rowSub} numberOfLines={1}>{student.classCode || 'No class'}</Text>
                    </View>
                    {on && <Ionicons name="checkmark-circle" size={20} color={t.brand} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
