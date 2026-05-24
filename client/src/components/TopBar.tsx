import { avatarColor } from '../lib/colorFromId'
import styles from './TopBar.module.css'

type Props = {
  user: { id: string; name: string }
  hasUnread?: boolean
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('')
}

export function TopBar({ user, hasUnread }: Props) {
  const { fill, ink } = avatarColor(user.id)
  return (
    <nav className={styles.bar} aria-label="Top">
      <span className={styles.mark}>Crew</span>
      <button
        className={styles.avatar}
        style={{ background: fill, color: ink }}
        aria-label="Account"
        type="button"
      >
        {initialsOf(user.name)}
        {hasUnread && <span className={styles.dot} aria-hidden="true" />}
      </button>
    </nav>
  )
}
