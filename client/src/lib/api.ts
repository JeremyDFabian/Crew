import { loadAuth } from './auth'

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
