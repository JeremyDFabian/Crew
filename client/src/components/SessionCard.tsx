import { useState } from 'react'
import type { MouseEvent } from 'react'
import type { Session } from '../mocks/sessions'
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
}

export function SessionCard({ session, tier, isLead }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [accepted, setAccepted] = useState(session.userStatus === 'accepted')
  const [joining, setJoining] = useState(false)

  const m = minutesUntil(session.startsAt)
  const isLive = tier === 'live'
  const isFeatured = tier === 'featured'
  const canExpand = !isLive

  function onJoin(e: MouseEvent) {
    e.stopPropagation()
    setJoining(true)
    setTimeout(() => setJoining(false), 700)
    console.log('joining session', session.id, session.joinUrl)
  }

  function onAccept(e: MouseEvent) {
    e.stopPropagation()
    setAccepted(true)
  }

  function onDecline(e: MouseEvent) {
    e.stopPropagation()
    setExpanded(false)
    console.log('declined', session.id)
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
              onClick={headCta.action === 'join' ? onJoin : onAccept}
            >
              {headCta.label}
            </Button>
          )}
        </div>
      </div>

      {expanded && (
        <div className={styles.detail}>
          <ul className={styles.members}>
            {session.members.map((m) => (
              <li key={m.id} className={styles.member}>
                <span>{m.name}</span>
                {m.id === session.hostId && (
                  <span className={styles.host}>host</span>
                )}
              </li>
            ))}
          </ul>
          <div className={styles.actions}>
            {!accepted && (
              <Button variant="secondary" onClick={onAccept}>
                Accept
              </Button>
            )}
            <Button variant="ghost" onClick={onDecline}>
              Decline
            </Button>
          </div>
        </div>
      )}
    </article>
  )
}
