import type { ReactNode } from 'react'
import type { Session } from '../mocks/sessions'
import { minutesUntil, timeOfDay, weekday, isToday } from '../lib/timeFormat'
import { CURRENT_USER } from '../mocks/sessions'
import styles from './Hero.module.css'

type Props = {
  lead: Session | null
}

function firstName(full: string): string {
  return full.split(/\s+/)[0]
}

function leadNames(s: Session): string {
  const others = s.members.filter((m) => m.id !== CURRENT_USER.id)
  if (others.length === 0) return 'just you'
  if (others.length === 1) return firstName(others[0].name)
  if (others.length === 2)
    return `${firstName(others[0].name)} & ${firstName(others[1].name)}`
  return `${firstName(others[0].name)}, ${firstName(others[1].name)} & ${others.length - 2} more`
}

function content(lead: Session | null): ReactNode {
  if (!lead) {
    return (
      <>
        Find your <em>first crew</em>.
      </>
    )
  }
  if (lead.isLive) {
    return (
      <>
        You&rsquo;re in <em>{lead.subject}</em>, live now.
      </>
    )
  }
  const m = minutesUntil(lead.startsAt)
  const names = leadNames(lead)
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

export function Hero({ lead }: Props) {
  return (
    <header className={styles.hero}>
      <h1 className={styles.title}>{content(lead)}</h1>
    </header>
  )
}
