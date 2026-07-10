import { useProfile } from './useProfile'
import { loadAuth } from '../lib/auth'
import type { Member } from '../lib/types'

export function useCurrentUser(): Member {
  const profile = useProfile()
  const id = loadAuth()?.userId ?? ''
  const name =
    profile?.displayName?.trim() || profile?.firstName.trim() || 'You'
  return { id, name }
}
