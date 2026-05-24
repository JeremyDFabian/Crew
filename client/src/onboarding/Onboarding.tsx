import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './Onboarding.module.css'
import {
  AccountStep,
  CompleteStep,
  CoursesStep,
  GradeStep,
  NameStep,
  SchoolStep,
  WelcomeStep,
} from './steps'
import {
  clearDraft,
  commitProfile,
  loadDraft,
  saveDraft,
} from './storage'
import { parseInvite } from './data'
import type { DraftProfile, Grade, StepId } from './types'

const STEPS: StepId[] = [
  'welcome',
  'account',
  'name',
  'school',
  'grade',
  'courses',
  'complete',
]

type Props = {
  onComplete: () => void
}

function readInitialDraft(): DraftProfile {
  const stored = loadDraft()
  if (typeof window === 'undefined') return stored
  const invite = parseInvite(window.location.search)
  if (!invite) return stored
  return {
    ...stored,
    invitedBy: invite.friendName,
    inviteSchool: invite.school ?? stored.inviteSchool,
  }
}

export function Onboarding({ onComplete }: Props) {
  const [draft, setDraft] = useState<DraftProfile>(readInitialDraft)
  const [step, setStep] = useState<StepId>('welcome')
  const [dir, setDir] = useState<'forward' | 'back'>('forward')
  const ignorePop = useRef(false)

  useEffect(() => {
    saveDraft(draft)
  }, [draft])

  useEffect(() => {
    window.history.replaceState({ crewStep: 'welcome' }, '')
    function onPop(e: PopStateEvent) {
      if (ignorePop.current) {
        ignorePop.current = false
        return
      }
      const next = (e.state?.crewStep as StepId | undefined) ?? 'welcome'
      setDir('back')
      setStep(next)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const patch = useCallback((p: Partial<DraftProfile>) => {
    setDraft((d) => ({ ...d, ...p }))
  }, [])

  const goTo = useCallback((next: StepId) => {
    setDir('forward')
    setStep(next)
    window.history.pushState({ crewStep: next }, '')
  }, [])

  const goBackOne = useCallback(() => {
    window.history.back()
  }, [])

  const goNext = useCallback(() => {
    const i = STEPS.indexOf(step)
    const next = STEPS[i + 1]
    if (next) goTo(next)
  }, [step, goTo])

  const handleInvitePaste = useCallback((tokenOrUrl: string) => {
    const search = tokenOrUrl.includes('?')
      ? tokenOrUrl.slice(tokenOrUrl.indexOf('?'))
      : `?invite=${tokenOrUrl}`
    const invite = parseInvite(search)
    if (!invite) return
    setDraft((d) => ({
      ...d,
      invitedBy: invite.friendName,
      inviteSchool: invite.school ?? d.inviteSchool,
    }))
  }, [])

  const finish = useCallback(() => {
    if (
      !draft.firstName ||
      !draft.email ||
      !draft.birthday ||
      !draft.school ||
      !draft.grade
    ) {
      return
    }
    commitProfile({
      firstName: draft.firstName.trim(),
      displayName: draft.displayName?.trim() || undefined,
      email: draft.email.trim(),
      birthday: draft.birthday,
      school: draft.school,
      grade: draft.grade as Grade,
      courses: draft.courses ?? [],
      invitedBy: draft.invitedBy,
    })
    onComplete()
  }, [draft, onComplete])

  const animClass =
    dir === 'back' ? styles.screenFadeBack : styles.screenFade

  return (
    <div className={styles.frame}>
      <span className={styles.mark}>Crew</span>
      <main className={styles.stage}>
        <div key={step} className={animClass} style={{ width: '100%', maxWidth: 520 }}>
          {step === 'welcome' && (
            <WelcomeStep
              draft={draft}
              onChange={patch}
              onNext={goNext}
              onInvitePaste={handleInvitePaste}
            />
          )}
          {step === 'account' && (
            <AccountStep
              draft={draft}
              onChange={patch}
              onNext={goNext}
              onBack={goBackOne}
            />
          )}
          {step === 'name' && (
            <NameStep
              draft={draft}
              onChange={patch}
              onNext={goNext}
              onBack={goBackOne}
            />
          )}
          {step === 'school' && (
            <SchoolStep
              draft={draft}
              onChange={patch}
              onNext={goNext}
              onBack={goBackOne}
            />
          )}
          {step === 'grade' && (
            <GradeStep
              draft={draft}
              onChange={patch}
              onNext={goNext}
              onBack={goBackOne}
            />
          )}
          {step === 'courses' && (
            <CoursesStep
              draft={draft}
              onChange={patch}
              onNext={goNext}
              onBack={goBackOne}
              onSkip={goNext}
            />
          )}
          {step === 'complete' && (
            <CompleteStep
              firstName={draft.firstName}
              onFinish={finish}
            />
          )}
        </div>
      </main>
    </div>
  )
}

export function resetOnboardingForTesting() {
  clearDraft()
}
