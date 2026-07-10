import { useEffect, useMemo, useState } from 'react'
import type { Session, SessionStatus, Member } from './lib/types'
import { Hero } from './components/Hero'
import { TopBar } from './components/TopBar'
import { SessionCard } from './components/SessionCard'
import type { Tier } from './components/SessionCard'
import { Button } from './components/Button'
import { Toast } from './components/Toast'
import { minutesUntil, isToday, isLiveNow, hasEnded } from './lib/timeFormat'
import { Onboarding } from './onboarding/Onboarding'
import { loadProfile } from './onboarding/storage'
import { Propose } from './propose/Propose'
import { useCurrentUser } from './hooks/useCurrentUser'
import { useSessions } from './lib/sessionsStore'
import { createUser } from './lib/api'
import { loadAuth, saveAuth } from './lib/auth'
import { CURRENT_USER as MOCK_ME } from './mocks/sessions'
import './styles/dashboard.css'

function tierFor(s: Session, now: Date): Tier {
  if (isLiveNow(s.startsAt, s.durationMin, now)) return 'live'
  const m = minutesUntil(s.startsAt, now)
  if (m >= 0 && (m < 30 || isToday(s.startsAt, now))) return 'featured'
  return 'regular'
}

function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), intervalMs)
    return () => window.clearInterval(t)
  }, [intervalMs])
  return now
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

  // Profiles that predate accounts get registered silently; failures are
  // fine (offline, server down) — we retry on the next load.
  useEffect(() => {
    if (!hasProfile || loadAuth()) return
    const profile = loadProfile()
    if (!profile) return
    createUser({
      firstName: profile.firstName,
      displayName: profile.displayName,
      email: profile.email,
      school: profile.school,
      grade: profile.grade,
      courses: profile.courses,
    })
      .then(({ user, token }) => saveAuth({ userId: user.id, token }))
      .catch(() => {})
  }, [hasProfile])

  function handleSessionCreated(s: Session) {
    sessions.add(s)
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
      <TopBar user={currentUser} onPropose={() => setProposeOpen(true)} />
      <Body
        state={sessions.state}
        onRetry={sessions.refresh}
        newIds={newIds}
        currentUser={currentUser}
        onAccept={handleAccept}
        onDecline={handleDecline}
        onJoin={handleJoin}
        onPropose={() => setProposeOpen(true)}
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
  onPropose: () => void
}

function Body({
  state,
  onRetry,
  newIds,
  currentUser,
  onAccept,
  onDecline,
  onJoin,
  onPropose,
}: BodyProps) {
  const now = useNow()
  const sessions = useMemo(() => {
    if (state.kind !== 'ready') return null
    return state.sessions
      .filter((s) => s.userStatus !== 'declined')
      .filter((s) => !hasEnded(s.startsAt, s.durationMin, now))
      .map((s) => ({
        ...s,
        // Mock sessions still carry the placeholder id for "you"; the alias
        // goes away with the mocks when the store switches to HTTP.
        members: s.members.map((m) =>
          m.id === currentUser.id || m.id === MOCK_ME.id ? currentUser : m,
        ),
      }))
  }, [state, currentUser, now])

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
            <Button variant="primary" onClick={onPropose}>
              Propose a session
            </Button>
          </div>
        </section>
      </>
    )
  }

  const tiered = sessions.map((s) => ({ s, t: tierFor(s, now) }))
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
        <Hero lead={lead} currentUserId={currentUser.id} />
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
