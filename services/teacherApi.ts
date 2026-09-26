import expoconfig from '../expoconfig';

/**
 * Teacher endpoints for the in-app dashboard.
 *
 * Every call carries the signed-in teacher's email and session token, exactly
 * as the web teacher portal does, so the server only ever returns that
 * teacher's own classes and learners.
 */

export type TeacherClass = { id?: string; classCodes: string; classTitle?: string };
export type TeacherStudent = {
  id?: string;
  fname: string;
  lname: string;
  email: string;
  classCode?: string;
  approved?: boolean;
  emailConfirmed?: boolean;
};

export type TeacherSession = { email?: string; portalSessionToken?: string };

function requireSession(session: TeacherSession | null | undefined) {
  const email = session?.email?.trim().toLowerCase();
  const token = session?.portalSessionToken;
  if (!email || !token) throw new Error('Your teacher session has expired. Please sign in again.');
  return { email, token };
}

async function request<T>(session: TeacherSession | null | undefined, path: string, options?: RequestInit): Promise<T> {
  const { token } = requireSession(session);
  const headers = new Headers(options?.headers);
  headers.set('X-Teacher-Token', token);
  const response = await fetch(`${expoconfig.API_URL}${path}`, { ...options, headers });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    if (response.status === 401 || response.status === 403) {
      throw new Error('Your teacher session has expired. Please sign in again.');
    }
    throw new Error(text?.trim() || 'The request could not be completed. Please try again.');
  }

  const body = await response.text();
  if (!body) return undefined as T;
  try {
    return JSON.parse(body) as T;
  } catch {
    return body as unknown as T;
  }
}

export type GameSummary = {
  label: string;
  attempts: number;
  scoredAttempts: number;
  latest: number | null;
  average: number | null;
  highest: number | null;
  latestAt: string | null;
};

export type GameAttempt = {
  id: string;
  game: string;
  activity: string;
  score: number | null;
  maxScore: number | null;
  percentage: number | null;
  playedAt: string | null;
  status: string;
  feedbackSummary?: string | null;
};

export type GamePerformance = {
  studentEmail: string;
  totalAttempts: number;
  games: Array<{ name: string; summary: GameSummary; activities: GameSummary[] }>;
  attempts: GameAttempt[];
};

/** Lesson milestones the web portal counts for class progress. */
export const LESSON_FIELDS = [
  'hiragana1', 'hiragana2', 'hiragana3',
  'katakana1', 'katakana2', 'katakana3',
  'vocab1', 'vocab2', 'vocab3',
  'sentence',
] as const;

export type LessonProgress = { email: string } & Partial<Record<(typeof LESSON_FIELDS)[number], boolean>>;

/** Share of the ten lesson milestones a learner has completed, 0–100. */
export function completionPercent(progress: LessonProgress | undefined): number {
  if (!progress) return 0;
  const done = LESSON_FIELDS.filter((field) => progress[field] === true).length;
  return Math.round((done / LESSON_FIELDS.length) * 100);
}

export const teacherApi = {
  classes: (session: TeacherSession | null | undefined) => {
    const { email } = requireSession(session);
    return request<TeacherClass[]>(session, `/api/classes/getAllClasses?teacherEmail=${encodeURIComponent(email)}`);
  },

  students: (session: TeacherSession | null | undefined) => {
    const { email } = requireSession(session);
    return request<TeacherStudent[]>(session, `/api/students/getAllStudents?teacherEmail=${encodeURIComponent(email)}`);
  },

  /** The server generates the class code from the title. */
  addClass: (session: TeacherSession | null | undefined, classTitle: string) => {
    const { email } = requireSession(session);
    return request<TeacherClass>(session, `/api/classes/addClass?teacherEmail=${encodeURIComponent(email)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classTitle }),
    });
  },

  /** Every saved game attempt for one learner, grouped by game. */
  gamePerformance: (session: TeacherSession | null | undefined, studentEmail: string) => {
    const { email } = requireSession(session);
    return request<GamePerformance>(
      session,
      `/api/teacher/game-performance?studentEmail=${encodeURIComponent(studentEmail)}&teacherEmail=${encodeURIComponent(email)}`,
    );
  },

  /** Deletes one of this teacher's classes. */
  removeClass: (session: TeacherSession | null | undefined, classCode: string) => {
    const { email } = requireSession(session);
    return request<string>(
      session,
      `/api/classes/removeClass?classCode=${encodeURIComponent(classCode)}&teacherEmail=${encodeURIComponent(email)}`,
      { method: 'DELETE' },
    );
  },

  /** The roster of one class. */
  studentsByClass: (session: TeacherSession | null | undefined, classCode: string) => {
    const { email } = requireSession(session);
    return request<TeacherStudent[]>(
      session,
      `/api/students/getByClassCode?classCode=${encodeURIComponent(classCode)}&teacherEmail=${encodeURIComponent(email)}`,
    );
  },

  /** Lesson milestones for every learner in this teacher's classes. */
  lessonProgress: (session: TeacherSession | null | undefined) => {
    const { email } = requireSession(session);
    return request<LessonProgress[]>(session, `/api/progress/teacher?teacherEmail=${encodeURIComponent(email)}`);
  },

  /** Removes a learner from one of this teacher's classes. */
  removeStudent: (session: TeacherSession | null | undefined, classCode: string, student: TeacherStudent) => {
    const { email } = requireSession(session);
    return request<string>(session, '/api/students/removeStudent', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ classCode, name: `${student.fname} ${student.lname}`.trim(), teacherEmail: email }),
    });
  },

  /** Adds an existing learner account to one of this teacher's classes. */
  addStudentToClass: (session: TeacherSession | null | undefined, studentEmail: string, classCode: string) => {
    const { email } = requireSession(session);
    return request<string>(
      session,
      `/api/students/joinClass?email=${encodeURIComponent(studentEmail)}&classCode=${encodeURIComponent(classCode)}&teacherEmail=${encodeURIComponent(email)}`,
      { method: 'POST' },
    );
  },
};
