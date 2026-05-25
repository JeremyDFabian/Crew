import { useCallback, useEffect, useState } from 'react'
import shell from '../onboarding/Onboarding.module.css'
import local from './Propose.module.css'
import { useProfile } from '../hooks/useProfile'
import { useCurrentUser } from '../hooks/useCurrentUser'
import {
  ConfirmStep,
  PeopleStep,
  SubjectStep,
  TimeStep,
} from './steps'
import { clearDraft, isDraftTouched, loadDraft, saveDraft } from './storage'
import { classmatesFor, sendInvites } from './data'
import type { Member, Session } from '../mocks/sessions'
import type { DraftSession, StepId } from './types'

const STEPS: StepId[] = ['subject', 'time', 'people', 'confirm']

type Props = {
  onClose: () => void
  onCreate: (session: Session) => void
}

export function Propose({ onClose, onCreate }: Props) {
  const profile = useProfile()
  const currentUser = useCurrentUser()
  const [draft, setDraft] = useState<DraftSession>(() => loadDraft())
  const [step, setStep] = useState<StepId>('subject')
  const [dir, setDir] = useState<'forward' | 'back'>('forward')
  const [discardOpen, setDiscardOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  useEffect(() => {
    saveDraft(draft)
  }, [draft])

  const patch = useCallback((p: Partial<DraftSession>) => {
    setDraft((d) => ({ ...d, ...p }))
  }, [])

  const goNext = useCallback(() => {
    setDir('forward')
    setStep((s) => {
      const i = STEPS.indexOf(s)
      return STEPS[i + 1] ?? s
    })
  }, [])

  const goBack = useCallback(() => {
    setDir('back')
    setStep((s) => {
      const i = STEPS.indexOf(s)
      return STEPS[Math.max(0, i - 1)]
    })
  }, [])

  const goTo = useCallback((next: StepId) => {
    const order: Record<StepId, number> = {
      subject: 0,
      time: 1,
      people: 2,
      confirm: 3,
    }
    setDir(order[next] >= order[step] ? 'forward' : 'back')
    setStep(next)
  }, [step])

  function attemptClose() {
    if (isDraftTouched(draft) || sending) {
      setDiscardOpen(true)
      return
    }
    clearDraft()
    onClose()
  }

  function confirmDiscard() {
    clearDraft()
    setDiscardOpen(false)
    onClose()
  }

  function keepDraft() {
    setDiscardOpen(false)
  }

  async function send() {
    if (sending) return
    setSending(true)
    setSendError(null)
    try {
      await sendInvites()
      const session = buildSession(draft, currentUser)
      onCreate(session)
      clearDraft()
      onClose()
    } catch {
      setSendError('Couldn’t send. Check your connection and try again.')
      setSending(false)
    }
  }

  const animClass =
    dir === 'back' ? shell.screenFadeBack : shell.screenFade

  const courses = profile?.courses ?? []

  return (
    <div className={shell.frame}>
      <span className={shell.mark}>Crew</span>
      <button
        type="button"
        className={local.close}
        onClick={attemptClose}
        aria-label="Close"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      {discardOpen && (
        <div className={local.discardPanel} role="dialog">
          <p>Discard this draft?</p>
          <div className={local.discardRow}>
            <button
              type="button"
              className={local.discardKeep}
              onClick={keepDraft}
            >
              Keep
            </button>
            <button
              type="button"
              className={local.discardGo}
              onClick={confirmDiscard}
            >
              Discard
            </button>
          </div>
        </div>
      )}
      <main className={shell.stage}>
        <div
          key={step}
          className={animClass}
          style={{ width: '100%', maxWidth: 560 }}
        >
          {step === 'subject' && (
            <SubjectStep
              draft={draft}
              onChange={patch}
              onNext={goNext}
              onBack={attemptClose}
              courses={courses}
            />
          )}
          {step === 'time' && (
            <TimeStep
              draft={draft}
              onChange={patch}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {step === 'people' && (
            <PeopleStep
              draft={draft}
              onChange={patch}
              onNext={goNext}
              onBack={goBack}
            />
          )}
          {step === 'confirm' && (
            <ConfirmStep
              draft={draft}
              onChange={patch}
              onBack={goBack}
              onEdit={goTo}
              onSend={send}
              sending={sending}
              error={sendError}
            />
          )}
        </div>
      </main>
    </div>
  )
}

function buildSession(draft: DraftSession, host: Member): Session {
  const suggestions = classmatesFor(draft.subject ?? '')
  const invitees = suggestions.filter((m) =>
    (draft.inviteeIds ?? []).includes(m.id),
  )
  const startsAt =
    draft.timeMode === 'now'
      ? new Date()
      : draft.startsAt
        ? new Date(draft.startsAt)
        : new Date()
  const isLive = draft.timeMode === 'now'
  const mode = draft.mode ?? 'remote'
  return {
    id: `s-new-${Date.now()}`,
    subject: draft.subject ?? 'Study session',
    startsAt,
    durationMin: draft.durationMin ?? 60,
    members: [host, ...invitees],
    hostId: host.id,
    location: mode === 'in-person' ? draft.location || undefined : undefined,
    joinUrl: mode === 'remote' ? 'https://meet.example/new' : undefined,
    mode,
    isLive,
    userStatus: 'accepted',
  }
}
