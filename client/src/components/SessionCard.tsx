import { useState } from 'react'
import type { MouseEvent } from 'react'
import type { Session } from '../lib/types'
import { AvatarStack } from './AvatarStack'
import { Button } from './Button'
import { LivePill, YoureInPill } from './Pill'
import { formatRelative, minutesUntil } from '../lib/timeFormat'
import styles from './SessionCard.module.css'

export type Tier = 'live' | 'featured' | 'regular'

type Props = {
  session: Session
  tier: Tier
  isLead: boolean
  onAccept: (id: string) => void
  onDecline: (id: string) => void
  onJoin: (id: string) => void
}

export function SessionCard({
  session,
  tier,
  isLead,
  onAccept,
  onDecline,
  onJoin,
}: Props) {
  const [expanded, setExpanded] = useState(false)
  const [joining, setJoining] = useState(false)

  const accepted = session.userStatus === 'accepted'
  const m = minutesUntil(session.startsAt)
  const isLive = tier === 'live'
  const isFeatured = tier === 'featured'
  const canExpand = !isLive

  function handleJoin(e: MouseEvent) {
    e.stopPropagation()
    setJoining(true)
    setTimeout(() => setJoining(false), 700)
    onJoin(session.id)
  }

  function handleAccept(e: MouseEvent) {
    e.stopPropagation()
    onAccept(session.id)
  }

  function handleDecline(e: MouseEvent) {
    e.stopPropagation()
    setExpanded(false)
    onDecline(session.id)
  }

  let headCta: { label: string; action: 'join' | 'accept' } | null = null
  if (isLive) {
    headCta = { label: 'Join', action: 'join' }
  } else if (isFeatured) {
    if (!accepted) headCta = { label: 'Accept', action: 'accept' }
    else if (m <= 10) headCta = { label: 'Join', action: 'join' }
  }

  const ctaVariant = isLead ? 'primary' : 'secondary'

  return (
    <article
      className={[
        styles.card,
        styles[tier],
        expanded ? styles.expanded : '',
        joining ? styles.joining : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={canExpand ? () => setExpanded((v) => !v) : undefined}
      data-clickable={canExpand}
    >
      <div className={styles.head}>
        <div className={styles.meta}>
          <div className={styles.topRow}>
            {isLive && <LivePill />}
            {!isLive && accepted && <YoureInPill />}
            <span className={styles.time}>{formatRelative(session.startsAt)}</span>
          </div>
          <h3 className={styles.subject}>{session.subject}</h3>
          <p className={styles.where}>
            {session.mode === 'remote'
              ? 'Remote'
              : (session.location ?? 'In person')}
          </p>
        </div>

        <div className={styles.right}>
          <AvatarStack
            members={session.members}
            max={isLive ? 5 : 4}
            size={isLive ? 32 : 28}
          />
          {headCta && (
            <Button
              variant={ctaVariant}
              onClick={headCta.action === 'join' ? handleJoin : handleAccept}
            >
              {headCta.label}
            </Button>
          )}
        </div>
      </div>

      {expanded && (
        <div className={styles.detail}>
          <ul className={styles.members}>
            {session.members.map((member) => (
              <li key={member.id} className={styles.member}>
                <span>{member.name}</span>
                {member.id === session.hostId && (
                  <span className={styles.host}>host</span>
                )}
              </li>
            ))}
          </ul>
          <div className={styles.actions}>
            {!accepted && (
              <Button variant="secondary" onClick={handleAccept}>
                Accept
              </Button>
            )}
            <Button variant="ghost" onClick={handleDecline}>
              Decline
            </Button>
          </div>
        </div>
      )}
    </article>
  )
}
