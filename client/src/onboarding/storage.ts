import type { DraftProfile, Profile } from './types'

const DRAFT_KEY = 'crew.onboarding.draft'
const PROFILE_KEY = 'crew.profile'

function safeGet(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(storage: Storage, key: string, value: string): void {
  try {
    storage.setItem(key, value)
  } catch {
    /* private mode or quota — non-fatal */
  }
}

function safeRemove(storage: Storage, key: string): void {
  try {
    storage.removeItem(key)
  } catch {
    /* non-fatal */
  }
}

export function loadDraft(): DraftProfile {
  const raw = safeGet(sessionStorage, DRAFT_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as DraftProfile
  } catch {
    return {}
  }
}

export function saveDraft(draft: DraftProfile): void {
  safeSet(sessionStorage, DRAFT_KEY, JSON.stringify(draft))
}

export function clearDraft(): void {
  safeRemove(sessionStorage, DRAFT_KEY)
}

export function loadProfile(): Profile | null {
  const raw = safeGet(localStorage, PROFILE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as Profile
  } catch {
    return null
  }
}

// localStorage 'storage' events only fire in *other* tabs; this custom event
// lets same-tab listeners (useProfile) react to profile writes.
export const PROFILE_EVENT = 'crew:profile'

function notifyProfileChanged(): void {
  window.dispatchEvent(new Event(PROFILE_EVENT))
}

export function commitProfile(profile: Profile): void {
  safeSet(localStorage, PROFILE_KEY, JSON.stringify(profile))
  clearDraft()
  notifyProfileChanged()
}

export function clearProfile(): void {
  safeRemove(localStorage, PROFILE_KEY)
  notifyProfileChanged()
}
