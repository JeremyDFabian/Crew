import { useEffect, useState } from 'react'
import { loadProfile, PROFILE_EVENT } from '../onboarding/storage'
import type { Profile } from '../onboarding/types'

export function useProfile(): Profile | null {
  const [profile, setProfile] = useState<Profile | null>(() => loadProfile())

  useEffect(() => {
    function reload() {
      setProfile(loadProfile())
    }
    function onStorage(e: StorageEvent) {
      if (e.key === 'crew.profile' || e.key === null) {
        reload()
      }
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener(PROFILE_EVENT, reload)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener(PROFILE_EVENT, reload)
    }
  }, [])

  return profile
}
