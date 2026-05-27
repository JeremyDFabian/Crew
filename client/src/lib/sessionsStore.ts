import type { Session, SessionStatus } from '../mocks/sessions'
import { getSessions } from '../mocks/sessions'

const STORAGE_KEY = 'crew.sessions.v1'
const STORAGE_VERSION = 1

type SerializedSession = Omit<Session, 'startsAt'> & { startsAt: string }
type StorageShape = { version: number; sessions: SerializedSession[] }

function serialize(s: Session): SerializedSession {
  return { ...s, startsAt: s.startsAt.toISOString() }
}

function deserialize(s: SerializedSession): Session {
  return { ...s, startsAt: new Date(s.startsAt) }
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    console.warn('crew: localStorage write failed; continuing in-memory only')
  }
}

export function readStoredSessions(): Session[] | null {
  const raw = safeGet(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as StorageShape
    if (parsed.version !== STORAGE_VERSION) return null
    if (!Array.isArray(parsed.sessions)) return null
    return parsed.sessions.map(deserialize)
  } catch {
    return null
  }
}

export function writeStoredSessions(sessions: Session[]): void {
  const payload: StorageShape = {
    version: STORAGE_VERSION,
    sessions: sessions.map(serialize),
  }
  safeSet(STORAGE_KEY, JSON.stringify(payload))
}

export async function loadOrSeed(): Promise<Session[]> {
  const stored = readStoredSessions()
  if (stored) return stored
  const seeded = await getSessions()
  writeStoredSessions(seeded)
  return seeded
}

export function applyStatus(
  sessions: Session[],
  id: string,
  status: SessionStatus,
): { next: Session[]; prevStatus: SessionStatus | null } {
  let prevStatus: SessionStatus | null = null
  const next = sessions.map((s) => {
    if (s.id !== id) return s
    prevStatus = s.userStatus
    return { ...s, userStatus: status }
  })
  return { next, prevStatus }
}
