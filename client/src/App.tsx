import { useEffect, useState } from 'react'
import { CURRENT_USER, getSessions } from './mocks/sessions'
import type { Session } from './mocks/sessions'
import { Hero } from './components/Hero'
import { TopBar } from './components/TopBar'
import { SessionCard } from './components/SessionCard'
import type { Tier } from './components/SessionCard'
import { Button } from './components/Button'
import { minutesUntil, isToday } from './lib/timeFormat'
import './styles/dashboard.css'

type LoadState =
  | { kind: 'loading' }
  | { kind: 'ready'; sessions: Session[] }
  | { kind: 'error'; lastSyncMin: number }

function tierFor(s: Session): Tier {
  if (s.isLive) return 'live'
  if (minutesUntil(s.startsAt) < 30) return 'featured'
  if (isToday(s.startsAt)) return 'featured'
  return 'regular'
}

export function App() {
  const [state, setState] = useState<LoadState>({ kind: 'loading' })

  async function load() {
    setState({ kind: 'loading' })
    try {
      const sessions = await getSessions()
      setState({ kind: 'ready', sessions })
    } catch {
      setState({ kind: 'error', lastSyncMin: 0 })
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="dashboard">
      <TopBar user={CURRENT_USER} hasUnread />
      <Body state={state} onRetry={load} />
    </div>
  )
}

function Body({
  state,
  onRetry,
}: {
  state: LoadState
  onRetry: () => void
}) {
  if (state.kind === 'loading') {
    return (
      <>
        <div className="hero-block">
          <Hero lead={null} />
        </div>
        <section className="section">
          <div className="feed">
            <div className="skeleton skeleton-live" />
            <div className="skeleton skeleton-featured" />
            <div className="skeleton skeleton-regular" />
            <div className="skeleton skeleton-regular" />
          </div>
        </section>
      </>
    )
  }

  if (state.kind === 'error') {
    return (
      <>
        <div className="hero-block">
          <Hero lead={null} />
        </div>
        <section className="section">
          <div className="error-banner">
            <span>
              Couldn&rsquo;t refresh. Last sync {state.lastSyncMin} min ago.
            </span>
            <Button variant="ghost" onClick={onRetry}>
              Retry
            </Button>
          </div>
        </section>
      </>
    )
  }

  const { sessions } = state

  if (sessions.length === 0) {
    return (
      <>
        <div className="hero-block">
          <Hero lead={null} />
        </div>
        <section className="section">
          <div className="empty-card">
            <p>
              No sessions on your schedule yet. Pick a subject, find some
              classmates, claim a time.
            </p>
            <Button variant="primary" onClick={() => console.log('browse')}>
              Browse study sessions
            </Button>
          </div>
        </section>
      </>
    )
  }

  const tiered = sessions.map((s) => ({ s, t: tierFor(s) }))
  const live = tiered.filter((x) => x.t === 'live').map((x) => x.s)
  const featured = tiered.filter((x) => x.t === 'featured').map((x) => x.s)
  const regular = tiered.filter((x) => x.t === 'regular').map((x) => x.s)

  const leadId = live[0]?.id ?? featured.find((s) => s.userStatus === 'invited')?.id ?? null
  const lead = sessions.find((s) => s.id === leadId) ?? sessions[0] ?? null

  return (
    <>
      <div className="hero-block">
        <Hero lead={lead} />
      </div>

      {live.length > 0 && (
        <section className="section">
          <div className="feed">
            {live.map((s) => (
              <SessionCard
                key={s.id}
                session={s}
                tier="live"
                isLead={s.id === leadId}
              />
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="section">
          <h2 className="section-title">Up next today</h2>
          <div className="feed">
            {featured.map((s) => (
              <SessionCard
                key={s.id}
                session={s}
                tier="featured"
                isLead={s.id === leadId}
              />
            ))}
          </div>
        </section>
      )}

      {regular.length > 0 && (
        <section className="section">
          <h2 className="section-title">This week</h2>
          <div className="feed week-grid">
            {regular.map((s) => (
              <SessionCard
                key={s.id}
                session={s}
                tier="regular"
                isLead={false}
              />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
