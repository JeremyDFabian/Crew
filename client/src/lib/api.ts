import { loadAuth } from './auth'
import type { Session, SessionMode, SessionStatus } from './types'

const BASE_URL: string =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export type ApiUser = {
  id: string
  name: string
  firstName: string
  email: string
  school: string
  grade: number
  courses: string[]
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  if (init?.body) headers.set('Content-Type', 'application/json')
  const auth = loadAuth()
  if (auth) headers.set('Authorization', `Bearer ${auth.token}`)

  let res: Response
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...init, headers })
  } catch {
    throw new ApiError(0, 'Could not reach the server')
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = (await res.json()) as { error?: string }
      if (body.error) message = body.error
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, message)
  }

  return (await res.json()) as T
}

export type RegisterInput = {
  firstName: string
  displayName?: string
  email: string
  school: string
  grade: number
  courses: string[]
}

export function createUser(
  input: RegisterInput,
): Promise<{ user: ApiUser; token: string }> {
  return request('/api/users', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function getMe(): Promise<{ user: ApiUser }> {
  return request('/api/me')
}

// Sessions cross the wire with startsAt as an ISO string.
export type ApiSession = Omit<Session, 'startsAt'> & { startsAt: string }

export function parseSession(s: ApiSession): Session {
  return { ...s, startsAt: new Date(s.startsAt) }
}

export async function getSessions(): Promise<Session[]> {
  const { sessions } = await request<{ sessions: ApiSession[] }>(
    '/api/sessions',
  )
  return sessions.map(parseSession)
}

export type CreateSessionInput = {
  subject: string
  startsAt: string
  durationMin: number
  mode: SessionMode
  location?: string
  inviteeIds: string[]
  openToCourse: boolean
}

export async function createSession(
  input: CreateSessionInput,
): Promise<Session> {
  const { session } = await request<{ session: ApiSession }>('/api/sessions', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return parseSession(session)
}

export async function rsvp(
  id: string,
  status: SessionStatus,
): Promise<Session> {
  const { session } = await request<{ session: ApiSession }>(
    `/api/sessions/${id}/rsvp`,
    { method: 'PATCH', body: JSON.stringify({ status }) },
  )
  return parseSession(session)
}

export async function reschedule(
  id: string,
  patch: { startsAt?: string; durationMin?: number },
): Promise<Session> {
  const { session } = await request<{ session: ApiSession }>(
    `/api/sessions/${id}`,
    { method: 'PATCH', body: JSON.stringify(patch) },
  )
  return parseSession(session)
}

export type Candidate = {
  id: string
  name: string
  matched: string[]
}

export function getCandidates(
  subject: string,
): Promise<{ candidates: Candidate[]; source: string }> {
  return request(`/api/candidates?subject=${encodeURIComponent(subject)}`)
}
