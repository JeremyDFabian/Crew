import { useProfile } from './useProfile'
import { loadAuth } from '../lib/auth'
import { CURRENT_USER } from '../mocks/sessions'
import type { Member } from '../lib/types'

export function useCurrentUser(): Member {
  const profile = useProfile()
  const id = loadAuth()?.userId ?? CURRENT_USER.id
  if (!profile) return { id, name: CURRENT_USER.name }
  const name =
    profile.displayName?.trim() || profile.firstName.trim() || CURRENT_USER.name
  return { id, name }
}
