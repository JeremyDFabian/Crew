import { useEffect, useRef, useState } from 'react'
import { avatarColor } from '../lib/colorFromId'
import { initialsOf } from '../lib/initials'
import { AccountMenu } from './AccountMenu'
import styles from './TopBar.module.css'

type Props = {
  user: { id: string; name: string }
  hasUnread?: boolean
  onPropose?: () => void
}

export function TopBar({ user, hasUnread, onPropose }: Props) {
  const { fill, ink } = avatarColor(user.id)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function onPointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

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
        <div className={styles.account} ref={menuRef}>
          <button
            className={styles.avatar}
            style={{ background: fill, color: ink }}
            aria-label="Account"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {initialsOf(user.name)}
            {hasUnread && <span className={styles.dot} aria-hidden="true" />}
          </button>
          {menuOpen && <AccountMenu onClose={() => setMenuOpen(false)} />}
        </div>
      </div>
    </nav>
  )
}
