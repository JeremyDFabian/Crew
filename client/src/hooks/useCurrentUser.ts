import { useProfile } from './useProfile'
import { CURRENT_USER } from '../mocks/sessions'
import type { Member } from '../mocks/sessions'

export function useCurrentUser(): Member {
  const profile = useProfile()
  if (!profile) return CURRENT_USER
  const name =
    profile.displayName?.trim() || profile.firstName.trim() || CURRENT_USER.name
  return { id: CURRENT_USER.id, name }
}
