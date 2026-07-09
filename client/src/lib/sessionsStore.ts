import type { Session, SessionStatus } from './types'
import { getSessions } from '../mocks/sessions'
import { useCallback, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'crew.sessions.v1'
// v2: dropped the stored isLive flag — liveness is derived from the clock.
const STORAGE_VERSION = 2

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

export type SessionsLoadState =
  | { kind: 'loading' }
  | { kind: 'ready'; sessions: Session[] }
  | { kind: 'error' }

export type UseSessions = {
  state: SessionsLoadState
  add: (session: Session) => void
  accept: (id: string) => void
  decline: (id: string) => { prevStatus: SessionStatus } | null
  undoDecline: (id: string, prevStatus: SessionStatus) => void
  join: (id: string) => void
  refresh: () => Promise<void>
}

export function useSessions(): UseSessions {
  const [state, setState] = useState<SessionsLoadState>({ kind: 'loading' })
  const sessionsRef = useRef<Session[]>([])

  const refresh = useCallback(async () => {
    setState({ kind: 'loading' })
    try {
      const sessions = await loadOrSeed()
      sessionsRef.current = sessions
      setState({ kind: 'ready', sessions })
    } catch {
      setState({ kind: 'error' })
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  function commit(next: Session[]) {
    sessionsRef.current = next
    writeStoredSessions(next)
    setState({ kind: 'ready', sessions: next })
  }

  const add = useCallback((session: Session) => {
    commit([...sessionsRef.current, session])
  }, [])

  const accept = useCallback((id: string) => {
    const { next } = applyStatus(sessionsRef.current, id, 'accepted')
    commit(next)
  }, [])

  const decline = useCallback((id: string) => {
    const { next, prevStatus } = applyStatus(
      sessionsRef.current,
      id,
      'declined',
    )
    if (prevStatus === null) return null
    commit(next)
    return { prevStatus }
  }, [])

  const undoDecline = useCallback(
    (id: string, prevStatus: SessionStatus) => {
      const { next } = applyStatus(sessionsRef.current, id, prevStatus)
      commit(next)
    },
    [],
  )

  const join = useCallback((id: string) => {
    const session = sessionsRef.current.find((s) => s.id === id)
    if (!session) return
    if (!session.joinUrl) {
      console.warn('crew: join called on session without joinUrl', id)
      return
    }
    window.open(session.joinUrl, '_blank', 'noopener,noreferrer')
  }, [])

  return { state, add, accept, decline, undoDecline, join, refresh }
}
