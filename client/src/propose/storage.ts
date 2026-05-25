import type { DraftSession } from './types'

const KEY = 'crew.propose.draft'

export function loadDraft(): DraftSession {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return {}
    return JSON.parse(raw) as DraftSession
  } catch {
    return {}
  }
}

export function saveDraft(d: DraftSession): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(d))
  } catch {
    /* non-fatal */
  }
}

export function clearDraft(): void {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* non-fatal */
  }
}

export function isDraftTouched(d: DraftSession): boolean {
  return Boolean(
    d.subject ||
      d.timeMode ||
      d.startsAt ||
      d.inviteeIds?.length ||
      d.openToCourse ||
      d.location ||
      d.mode ||
      d.durationMin,
  )
}
