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
