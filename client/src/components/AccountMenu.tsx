import { useProfile } from '../hooks/useProfile'
import styles from './AccountMenu.module.css'

type Props = {
  onClose: () => void
}

function startOver() {
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('crew.')) localStorage.removeItem(key)
    }
    sessionStorage.removeItem('crew.onboarding.draft')
    sessionStorage.removeItem('crew.propose.draft')
  } catch {
    /* private mode — nothing stored anyway */
  }
  window.location.reload()
}

export function AccountMenu({ onClose }: Props) {
  const profile = useProfile()
  const name = profile?.displayName?.trim() || profile?.firstName || 'You'

  return (
    <div className={styles.menu} role="menu" aria-label="Account">
      <div className={styles.identity}>
        <span className={styles.name}>{name}</span>
        {profile?.school && (
          <span className={styles.school}>
            {profile.school}
            {profile.grade ? ` · grade ${profile.grade}` : ''}
          </span>
        )}
      </div>
      <div className={styles.divider} role="separator" />
      <button
        type="button"
        role="menuitem"
        className={styles.item}
        onClick={() => {
          onClose()
          startOver()
        }}
      >
        Start over
        <small>Clears your profile and sessions on this device</small>
      </button>
    </div>
  )
}
