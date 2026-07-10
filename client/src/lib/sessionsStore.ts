import type { Session, SessionStatus } from './types'
import * as api from './api'
import { useCallback, useEffect, useRef, useState } from 'react'

// Sessions used to persist locally under this key; the server owns them now.
const LEGACY_STORAGE_KEY = 'crew.sessions.v1'

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

  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY)
    } catch {
      /* non-fatal */
    }
  }, [])

  const refresh = useCallback(async () => {
    setState({ kind: 'loading' })
    try {
      const sessions = await api.getSessions()
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
    setState({ kind: 'ready', sessions: next })
  }

  const add = useCallback((session: Session) => {
    commit([...sessionsRef.current, session])
  }, [])

  const accept = useCallback(
    (id: string) => {
      const snapshot = sessionsRef.current
      const { next, prevStatus } = applyStatus(snapshot, id, 'accepted')
      if (prevStatus === null) return
      commit(next)
      api.rsvp(id, 'accepted').catch(() => {
        commit(snapshot)
        refresh()
      })
    },
    [refresh],
  )

  const decline = useCallback(
    (id: string) => {
      const snapshot = sessionsRef.current
      const { next, prevStatus } = applyStatus(snapshot, id, 'declined')
      if (prevStatus === null) return null
      commit(next)
      api.rsvp(id, 'declined').catch(() => {
        commit(snapshot)
        refresh()
      })
      return { prevStatus }
    },
    [refresh],
  )

  const undoDecline = useCallback(
    (id: string, prevStatus: SessionStatus) => {
      const snapshot = sessionsRef.current
      const { next } = applyStatus(snapshot, id, prevStatus)
      commit(next)
      api.rsvp(id, prevStatus).catch(() => {
        commit(snapshot)
        refresh()
      })
    },
    [refresh],
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
