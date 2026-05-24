import { avatarColor } from '../lib/colorFromId'
import styles from './AvatarStack.module.css'

type Member = { id: string; name: string }

type Props = {
  members: Member[]
  max?: number
  size?: number
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('')
}

export function AvatarStack({ members, max = 4, size = 28 }: Props) {
  const visible = members.slice(0, max)
  const overflow = members.length - visible.length

  return (
    <ul
      className={styles.stack}
      style={{ ['--avatar-size' as string]: `${size}px` } as React.CSSProperties}
    >
      {visible.map((m) => {
        const { fill, ink } = avatarColor(m.id)
        return (
          <li
            key={m.id}
            className={styles.avatar}
            style={{ background: fill, color: ink }}
            title={m.name}
          >
            {initialsOf(m.name)}
          </li>
        )
      })}
      {overflow > 0 && (
        <li
          className={`${styles.avatar} ${styles.overflow}`}
          title={`${overflow} more`}
        >
          +{overflow}
        </li>
      )}
    </ul>
  )
}
