import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from 'react'
import styles from './Onboarding.module.css'
import { Combobox } from './Combobox'
import { searchCourses, searchSchools } from './data'
import type { DraftProfile, Grade } from './types'

type StepProps = {
  draft: DraftProfile
  onChange: (patch: Partial<DraftProfile>) => void
  onNext: () => void
  onBack?: () => void
}

// --- Welcome -----------------------------------------------------------------

type WelcomeProps = StepProps & {
  onInvitePaste: (token: string) => void
}

export function WelcomeStep({ draft, onNext, onInvitePaste }: WelcomeProps) {
  const [paneOpen, setPaneOpen] = useState(false)
  const [token, setToken] = useState('')
  const friend = draft.invitedBy

  if (friend) {
    return (
      <div className={styles.screen}>
        <span className={styles.inviteBanner}>
          {friend} invited you to Crew
        </span>
        <h1 className={styles.question}>
          A few quick things, under a minute.
        </h1>
        <p className={styles.lede}>
          We&rsquo;ll get you set up so you can study with{' '}
          {friend === 'A friend' ? 'them' : friend} and whoever else makes sense.
        </p>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cta}
            onClick={onNext}
          >
            Continue
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.screen}>
      <h1 className={styles.question}>Study with the right people.</h1>
      <p className={styles.lede}>
        Crew helps you find your people for what you&rsquo;re already studying.
        A few quick things, under a minute.
      </p>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cta}
          onClick={onNext}
        >
          Get started
        </button>
        {!paneOpen && (
          <button
            type="button"
            className={styles.back}
            onClick={() => setPaneOpen(true)}
          >
            I have an invite
          </button>
        )}
      </div>
      {paneOpen && (
        <div className={styles.invitePanel}>
          <p className={styles.invitePanelHint}>
            Paste the invite link a friend sent you.
          </p>
          <form
            className={styles.invitePasteRow}
            onSubmit={(e: FormEvent) => {
              e.preventDefault()
              if (token.trim()) onInvitePaste(token.trim())
            }}
          >
            <input
              type="text"
              className={styles.invitePasteInput}
              placeholder="crew.app/?invite=…"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
            <button type="submit" className={styles.invitePasteGo}>
              Open
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

// --- Account -----------------------------------------------------------------

function validateEmail(v: string): string | null {
  if (!v.trim()) return 'We need an email so we can reach you.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) {
    return 'That email doesn’t look right.'
  }
  return null
}

function ageFromBirthday(iso: string): number | null {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  const today = new Date()
  let age = today.getFullYear() - d.getFullYear()
  const m = today.getMonth() - d.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--
  return age
}

function validateBirthday(v: string): string | null {
  if (!v) return 'When’s your birthday?'
  const age = ageFromBirthday(v)
  if (age == null) return 'That date doesn’t look right.'
  if (age < 13) return 'Crew is for students 13 and up.'
  if (age > 25) return 'That date doesn’t look right.'
  return null
}

export function AccountStep({ draft, onChange, onNext, onBack }: StepProps) {
  const [touched, setTouched] = useState<{
    email?: boolean
    birthday?: boolean
    tos?: boolean
  }>({})

  const emailError = validateEmail(draft.email ?? '')
  const birthdayError = validateBirthday(draft.birthday ?? '')
  const tosError = !draft.acceptedTos ? 'Please agree to continue.' : null

  function submit(e: FormEvent) {
    e.preventDefault()
    setTouched({ email: true, birthday: true, tos: true })
    if (!emailError && !birthdayError && !tosError) onNext()
  }

  return (
    <form className={styles.screen} onSubmit={submit} noValidate>
      <h1 className={styles.question}>Make an account.</h1>
      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor="email" className={styles.fieldLabel}>
            Email
          </label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            className={`${styles.input} ${
              touched.email && emailError ? styles.inputInvalid : ''
            }`}
            value={draft.email ?? ''}
            onChange={(e) => onChange({ email: e.target.value })}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            aria-invalid={Boolean(touched.email && emailError)}
            aria-describedby={
              touched.email && emailError ? 'email-error' : undefined
            }
          />
          {touched.email && emailError && (
            <p id="email-error" className={styles.error}>
              {emailError}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label htmlFor="birthday" className={styles.fieldLabel}>
            Birthday
          </label>
          <input
            id="birthday"
            type="date"
            autoComplete="bday"
            className={`${styles.input} ${
              touched.birthday && birthdayError ? styles.inputInvalid : ''
            }`}
            value={draft.birthday ?? ''}
            onChange={(e) => onChange({ birthday: e.target.value })}
            onBlur={() => setTouched((t) => ({ ...t, birthday: true }))}
            aria-invalid={Boolean(touched.birthday && birthdayError)}
            aria-describedby={
              touched.birthday && birthdayError ? 'birthday-error' : undefined
            }
            max={new Date().toISOString().slice(0, 10)}
          />
          {touched.birthday && birthdayError && (
            <p id="birthday-error" className={styles.error}>
              {birthdayError}
            </p>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={draft.acceptedTos ?? false}
              onChange={(e) => onChange({ acceptedTos: e.target.checked })}
              onBlur={() => setTouched((t) => ({ ...t, tos: true }))}
              aria-invalid={Boolean(touched.tos && tosError)}
            />
            <span>
              I&rsquo;m 13 or older and I agree to the{' '}
              <a
                href="/terms"
                className={styles.checkboxLink}
                onClick={(e) => e.stopPropagation()}
              >
                terms
              </a>
              .
            </span>
          </label>
          {touched.tos && tosError && (
            <p className={styles.error}>{tosError}</p>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.cta}>
          Continue
        </button>
        {onBack && (
          <button type="button" className={styles.back} onClick={onBack}>
            Back
          </button>
        )}
      </div>
    </form>
  )
}

// --- Name --------------------------------------------------------------------

export function NameStep({ draft, onChange, onNext, onBack }: StepProps) {
  const [touched, setTouched] = useState(false)
  const firstName = draft.firstName ?? ''
  const error =
    firstName.trim().length === 0
      ? 'We need something to call you.'
      : firstName.trim().length < 2
        ? 'Just a little longer.'
        : null

  function submit(e: FormEvent) {
    e.preventDefault()
    setTouched(true)
    if (!error) onNext()
  }

  return (
    <form className={styles.screen} onSubmit={submit} noValidate>
      <h1 className={styles.question}>What should we call you?</h1>
      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor="firstName" className={styles.fieldLabel}>
            First name
          </label>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            autoFocus
            className={`${styles.input} ${
              touched && error ? styles.inputInvalid : ''
            }`}
            value={firstName}
            onChange={(e) => onChange({ firstName: e.target.value })}
            onBlur={() => setTouched(true)}
            aria-invalid={Boolean(touched && error)}
            aria-describedby={touched && error ? 'name-error' : undefined}
          />
          {touched && error && (
            <p id="name-error" className={styles.error}>
              {error}
            </p>
          )}
        </div>
        <div className={styles.field}>
          <label htmlFor="displayName" className={styles.fieldLabel}>
            Display name <span style={{ color: 'var(--ink-muted)' }}>(optional)</span>
          </label>
          <input
            id="displayName"
            type="text"
            autoComplete="nickname"
            className={styles.input}
            value={draft.displayName ?? ''}
            onChange={(e) => onChange({ displayName: e.target.value })}
            placeholder={firstName || 'Same as your first name'}
          />
          <p className={styles.fieldHint}>
            Shown to other students. Defaults to your first name.
          </p>
        </div>
      </div>
      <div className={styles.actions}>
        <button type="submit" className={styles.cta}>
          Continue
        </button>
        {onBack && (
          <button type="button" className={styles.back} onClick={onBack}>
            Back
          </button>
        )}
      </div>
    </form>
  )
}

// --- School ------------------------------------------------------------------

export function SchoolStep({ draft, onChange, onNext, onBack }: StepProps) {
  const inviteSchool = draft.inviteSchool
  const hasInviteHint =
    inviteSchool && draft.school === undefined
  const [editing, setEditing] = useState(!hasInviteHint && !draft.school)
  const [query, setQuery] = useState('')
  const options = useMemo(() => searchSchools(query), [query])

  function pick(name: string) {
    onChange({ school: name })
    setEditing(false)
    setQuery('')
  }

  function confirmInvite() {
    if (inviteSchool) onChange({ school: inviteSchool })
  }

  const chosen = draft.school

  return (
    <div className={styles.screen}>
      <h1 className={styles.question}>Where do you go to school?</h1>
      {!editing && hasInviteHint && !chosen && (
        <>
          <div className={styles.selectedSchool}>
            <div className={styles.selectedSchoolText}>
              <span className={styles.selectedSchoolLead}>You&rsquo;re at</span>
              <span className={styles.selectedSchoolName}>{inviteSchool}</span>
            </div>
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => setEditing(true)}
            >
              Change
            </button>
          </div>
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cta}
              onClick={() => {
                confirmInvite()
                onNext()
              }}
            >
              Yes, that&rsquo;s right
            </button>
            {onBack && (
              <button type="button" className={styles.back} onClick={onBack}>
                Back
              </button>
            )}
          </div>
        </>
      )}
      {!editing && chosen && (
        <>
          <div className={styles.selectedSchool}>
            <div className={styles.selectedSchoolText}>
              <span className={styles.selectedSchoolLead}>School</span>
              <span className={styles.selectedSchoolName}>{chosen}</span>
            </div>
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => {
                setEditing(true)
                onChange({ school: undefined })
              }}
            >
              Change
            </button>
          </div>
          <div className={styles.actions}>
            <button type="button" className={styles.cta} onClick={onNext}>
              Continue
            </button>
            {onBack && (
              <button type="button" className={styles.back} onClick={onBack}>
                Back
              </button>
            )}
          </div>
        </>
      )}
      {editing && (
        <>
          <Combobox
            label="Search for your school"
            placeholder="Start typing your school&rsquo;s name"
            query={query}
            onQueryChange={setQuery}
            options={options}
            onSelect={pick}
            emptyHint="Can&rsquo;t find your school? Type it as you&rsquo;d say it."
            onEmptyAccept={pick}
            autoFocus
          />
          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cta}
              disabled={!chosen}
              onClick={onNext}
            >
              Continue
            </button>
            {onBack && (
              <button type="button" className={styles.back} onClick={onBack}>
                Back
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// --- Grade -------------------------------------------------------------------

const GRADES: Grade[] = [9, 10, 11, 12]

export function GradeStep({ draft, onChange, onNext, onBack }: StepProps) {
  const selected = draft.grade
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  function pick(g: Grade) {
    onChange({ grade: g })
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => onNext(), 280)
  }

  return (
    <div className={styles.screen}>
      <h1 className={styles.question}>What grade are you in?</h1>
      <div className={styles.tiles} role="radiogroup" aria-label="Grade">
        {GRADES.map((g) => (
          <button
            key={g}
            type="button"
            role="radio"
            aria-checked={selected === g}
            className={`${styles.tile} ${selected === g ? styles.tileSelected : ''}`}
            onClick={() => pick(g)}
          >
            {g}
          </button>
        ))}
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cta}
          disabled={!selected}
          onClick={onNext}
        >
          Continue
        </button>
        {onBack && (
          <button type="button" className={styles.back} onClick={onBack}>
            Back
          </button>
        )}
      </div>
    </div>
  )
}

// --- Courses -----------------------------------------------------------------

const MIN_COURSES = 3
const MAX_COURSES = 7

type CoursesProps = StepProps & {
  onSkip: () => void
}

export function CoursesStep({
  draft,
  onChange,
  onNext,
  onBack,
  onSkip,
}: CoursesProps) {
  const selected = draft.courses ?? []
  const [query, setQuery] = useState('')
  const options = useMemo(
    () => searchCourses(query, selected),
    [query, selected],
  )

  function add(name: string) {
    if (selected.length >= MAX_COURSES) return
    if (selected.some((s) => s.toLowerCase() === name.toLowerCase())) return
    onChange({ courses: [...selected, name] })
    setQuery('')
  }

  function remove(name: string) {
    onChange({ courses: selected.filter((c) => c !== name) })
  }

  const canContinue = selected.length >= MIN_COURSES
  const atMax = selected.length >= MAX_COURSES

  const hint = atMax
    ? `That’s the max (${MAX_COURSES}). Remove one to add another.`
    : selected.length < MIN_COURSES
      ? `Add at least ${MIN_COURSES - selected.length} more.`
      : `We’ll use these to match you.`

  return (
    <div className={styles.screen}>
      <h1 className={styles.question}>What are you taking this term?</h1>
      <p className={styles.lede}>
        3 to 7 classes. We&rsquo;ll use these to match you with people in the same ones.
      </p>
      <div>
        <div className={styles.chipRow} aria-live="polite">
          {selected.map((c) => (
            <span key={c} className={styles.chip}>
              {c}
              <button
                type="button"
                className={styles.chipRemove}
                aria-label={`Remove ${c}`}
                onClick={() => remove(c)}
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </span>
          ))}
        </div>
        <Combobox
          label="Add a class"
          placeholder={atMax ? 'Max reached' : 'Add a class (e.g. AP Calc BC)'}
          query={query}
          onQueryChange={setQuery}
          options={atMax ? [] : options}
          onSelect={add}
          emptyHint="Don&rsquo;t see it? Add it as your school names it."
          onEmptyAccept={atMax ? undefined : add}
        />
        <p className={styles.fieldHint} style={{ marginTop: 10 }}>
          {hint}
        </p>
      </div>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.cta}
          disabled={!canContinue}
          onClick={onNext}
        >
          Continue
        </button>
        <button type="button" className={styles.back} onClick={onSkip}>
          I&rsquo;ll add these later
        </button>
        {onBack && (
          <button type="button" className={styles.back} onClick={onBack}>
            Back
          </button>
        )}
      </div>
    </div>
  )
}

// --- Complete ----------------------------------------------------------------

type CompleteProps = {
  firstName?: string
  onFinish: () => void
}

export function CompleteStep({ firstName, onFinish }: CompleteProps) {
  return (
    <div className={styles.screen}>
      <div className={styles.completeBlock}>
        <span className={styles.glyph} aria-hidden="true" />
        <h1 className={styles.completeTitle}>You&rsquo;re set.</h1>
        <p className={styles.completeLede}>
          {firstName
            ? `Nice to meet you, ${firstName}. Take a look at what’s happening.`
            : 'Take a look at what’s happening.'}
        </p>
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.cta} onClick={onFinish}>
          Go to dashboard
        </button>
      </div>
    </div>
  )
}
