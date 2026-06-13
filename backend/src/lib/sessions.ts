// Shared in-memory session store for demo purposes
interface SessionData {
  userId: string;
  name: string;
  email: string;
}

const sessions = new Map<string, SessionData>();

export function createSession(token: string, data: SessionData): void {
  sessions.set(token, data);
}

export function getSession(token: string): SessionData | null {
  return sessions.get(token) || null;
}

export function invalidateSession(token: string): void {
  sessions.delete(token);
}
