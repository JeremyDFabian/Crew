const AUTH_KEY = 'crew.auth.v1'

export type Auth = {
  userId: string
  token: string
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
    /* private mode or quota — non-fatal */
  }
}

function safeRemove(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch {
    /* non-fatal */
  }
}

export function loadAuth(): Auth | null {
  const raw = safeGet(AUTH_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Auth
    if (!parsed.userId || !parsed.token) return null
    return parsed
  } catch {
    return null
  }
}

export function saveAuth(auth: Auth): void {
  safeSet(AUTH_KEY, JSON.stringify(auth))
}

export function clearAuth(): void {
  safeRemove(AUTH_KEY)
}
