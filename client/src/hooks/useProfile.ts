import { useEffect, useState } from 'react'
import { loadProfile } from '../onboarding/storage'
import type { Profile } from '../onboarding/types'

export function useProfile(): Profile | null {
  const [profile, setProfile] = useState<Profile | null>(() => loadProfile())

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === 'crew.profile' || e.key === null) {
        setProfile(loadProfile())
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return profile
}
