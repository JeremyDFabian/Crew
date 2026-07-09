import type { ReactNode } from 'react'
import type { Session } from '../lib/types'
import {
  minutesUntil,
  timeOfDay,
  weekday,
  isToday,
  isLiveNow,
} from '../lib/timeFormat'
import styles from './Hero.module.css'

type Props = {
  lead: Session | null
  currentUserId?: string
}

function firstName(full: string): string {
  return full.split(/\s+/)[0]
}

function leadNames(s: Session, currentUserId?: string): string {
  const others = s.members.filter((m) => m.id !== currentUserId)
  if (others.length === 0) return 'just you'
  if (others.length === 1) return firstName(others[0].name)
  if (others.length === 2)
    return `${firstName(others[0].name)} & ${firstName(others[1].name)}`
  return `${firstName(others[0].name)}, ${firstName(others[1].name)} & ${others.length - 2} more`
}

function content(lead: Session | null, currentUserId?: string): ReactNode {
  if (!lead) {
    return (
      <>
        Find your <em>first crew</em>.
      </>
    )
  }
  if (isLiveNow(lead.startsAt, lead.durationMin)) {
    return (
      <>
        You&rsquo;re in <em>{lead.subject}</em>, live now.
      </>
    )
  }
  const m = minutesUntil(lead.startsAt)
  const names = leadNames(lead, currentUserId)
  if (m < 60) {
    return (
      <>
        <em>{lead.subject}</em> with {names}, in <em>{m} min</em>.
      </>
    )
  }
  if (isToday(lead.startsAt)) {
    return (
      <>
        Today: {lead.subject} with {names}, <em>{timeOfDay(lead.startsAt)}</em>.
      </>
    )
  }
  return (
    <>
      Next:{' '}
      <em>
        {weekday(lead.startsAt)}, {lead.subject}
      </em>
      .
    </>
  )
}

export function Hero({ lead, currentUserId }: Props) {
  return (
    <header className={styles.hero}>
      <h1 className={styles.title}>{content(lead, currentUserId)}</h1>
    </header>
  )
}
