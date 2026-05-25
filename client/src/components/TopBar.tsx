import { avatarColor } from '../lib/colorFromId'
import styles from './TopBar.module.css'

type Props = {
  user: { id: string; name: string }
  hasUnread?: boolean
  onPropose?: () => void
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('')
}

export function TopBar({ user, hasUnread, onPropose }: Props) {
  const { fill, ink } = avatarColor(user.id)
  return (
    <nav className={styles.bar} aria-label="Top">
      <span className={styles.mark}>Crew</span>
      <div className={styles.right}>
        {onPropose && (
          <button
            type="button"
            className={styles.propose}
            onClick={onPropose}
            aria-label="Propose a session"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className={styles.proposeLabel}>Propose</span>
          </button>
        )}
        <button
          className={styles.avatar}
          style={{ background: fill, color: ink }}
          aria-label="Account"
          type="button"
        >
          {initialsOf(user.name)}
          {hasUnread && <span className={styles.dot} aria-hidden="true" />}
        </button>
      </div>
    </nav>
  )
}
