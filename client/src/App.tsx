import { useMemo, useState } from 'react'
import type { Session, SessionStatus, Member } from './mocks/sessions'
import { Hero } from './components/Hero'
import { TopBar } from './components/TopBar'
import { SessionCard } from './components/SessionCard'
import type { Tier } from './components/SessionCard'
import { Button } from './components/Button'
import { Toast } from './components/Toast'
import { minutesUntil, isToday } from './lib/timeFormat'
import { Onboarding } from './onboarding/Onboarding'
import { loadProfile } from './onboarding/storage'
import { Propose } from './propose/Propose'
import { useCurrentUser } from './hooks/useCurrentUser'
import { useSessions } from './lib/sessionsStore'
import './styles/dashboard.css'

function tierFor(s: Session): Tier {
  if (s.isLive) return 'live'
  if (minutesUntil(s.startsAt) < 30) return 'featured'
  if (isToday(s.startsAt)) return 'featured'
  return 'regular'
}

type PendingUndo = {
  id: string
  subject: string
  prevStatus: SessionStatus
}

export function App() {
  const [hasProfile, setHasProfile] = useState<boolean>(
    () => loadProfile() !== null,
  )
  const currentUser = useCurrentUser()
  const sessions = useSessions()
  const [proposeOpen, setProposeOpen] = useState(false)
  const [newIds, setNewIds] = useState<Set<string>>(new Set())
  const [pendingUndo, setPendingUndo] = useState<PendingUndo | null>(null)

  function handleSessionCreated(s: Session) {
    setNewIds((prev) => {
      const next = new Set(prev)
      next.add(s.id)
      return next
    })
    window.setTimeout(() => {
      setNewIds((prev) => {
        const next = new Set(prev)
        next.delete(s.id)
        return next
      })
    }, 2400)
  }

  function handleAccept(id: string) {
    sessions.accept(id)
  }

  function handleJoin(id: string) {
    sessions.join(id)
  }

  function handleDecline(id: string) {
    if (sessions.state.kind !== 'ready') return
    const session = sessions.state.sessions.find((s) => s.id === id)
    if (!session) return
    const result = sessions.decline(id)
    if (!result) return
    setPendingUndo({
      id,
      subject: session.subject,
      prevStatus: result.prevStatus,
    })
  }

  if (!hasProfile) {
    return <Onboarding onComplete={() => setHasProfile(true)} />
  }

  if (proposeOpen) {
    return (
      <Propose
        onClose={() => setProposeOpen(false)}
        onCreate={handleSessionCreated}
      />
    )
  }

  return (
    <div className="dashboard">
      <TopBar
        user={currentUser}
        hasUnread
        onPropose={() => setProposeOpen(true)}
      />
      <Body
        state={sessions.state}
        onRetry={sessions.refresh}
        newIds={newIds}
        currentUser={currentUser}
        onAccept={handleAccept}
        onDecline={handleDecline}
        onJoin={handleJoin}
      />
      {pendingUndo && (
        <Toast
          key={pendingUndo.id}
          message={`Declined ${pendingUndo.subject}`}
          actionLabel="Undo"
          onAction={() =>
            sessions.undoDecline(pendingUndo.id, pendingUndo.prevStatus)
          }
          onDismiss={() => setPendingUndo(null)}
        />
      )}
    </div>
  )
}

type BodyProps = {
  state: ReturnType<typeof useSessions>['state']
  onRetry: () => void
  newIds: Set<string>
  currentUser: Member
  onAccept: (id: string) => void
  onDecline: (id: string) => void
  onJoin: (id: string) => void
}

function Body({
  state,
  onRetry,
  newIds,
  currentUser,
  onAccept,
  onDecline,
  onJoin,
}: BodyProps) {
  const sessions = useMemo(() => {
    if (state.kind !== 'ready') return null
    return state.sessions
      .filter((s) => s.userStatus !== 'declined')
      .map((s) => ({
        ...s,
        members: s.members.map((m) =>
          m.id === currentUser.id ? currentUser : m,
        ),
      }))
  }, [state, currentUser])

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
            <span>Couldn&rsquo;t load your sessions.</span>
            <Button variant="ghost" onClick={onRetry}>
              Retry
            </Button>
          </div>
        </section>
      </>
    )
  }

  if (!sessions || sessions.length === 0) {
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

  const leadId =
    live[0]?.id ??
    featured.find((s) => s.userStatus === 'invited')?.id ??
    null
  const lead = sessions.find((s) => s.id === leadId) ?? sessions[0] ?? null

  function cardWrap(s: Session, tier: Tier) {
    const className = newIds.has(s.id) ? 'card-wrap card-just-added' : 'card-wrap'
    return (
      <div key={s.id} className={className}>
        <SessionCard
          session={s}
          tier={tier}
          isLead={s.id === leadId}
          onAccept={onAccept}
          onDecline={onDecline}
          onJoin={onJoin}
        />
      </div>
    )
  }

  return (
    <>
      <div className="hero-block">
        <Hero lead={lead} />
      </div>

      {live.length > 0 && (
        <section className="section">
          <div className="feed">{live.map((s) => cardWrap(s, 'live'))}</div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="section">
          <h2 className="section-title">Up next today</h2>
          <div className="feed">{featured.map((s) => cardWrap(s, 'featured'))}</div>
        </section>
      )}

      {regular.length > 0 && (
        <section className="section">
          <h2 className="section-title">This week</h2>
          <div className="feed week-grid">
            {regular.map((s) => cardWrap(s, 'regular'))}
          </div>
        </section>
      )}
    </>
  )
}
