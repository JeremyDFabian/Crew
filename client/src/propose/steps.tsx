import { useEffect, useMemo, useRef, useState } from 'react'
import shell from '../onboarding/Onboarding.module.css'
import local from './Propose.module.css'
import { avatarColor } from '../lib/colorFromId'
import { isToday, timeOfDay, weekday } from '../lib/timeFormat'
import { classmatesFor, todayTimeChips } from './data'
import type { DraftSession, StepId, TimeMode } from './types'
import type { SessionMode } from '../mocks/sessions'

type StepProps = {
  draft: DraftSession
  onChange: (patch: Partial<DraftSession>) => void
  onNext: () => void
  onBack: () => void
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('')
}

// --- Subject -----------------------------------------------------------------

type SubjectProps = StepProps & {
  courses: string[]
}

export function SubjectStep({
  draft,
  onChange,
  onNext,
  onBack,
  courses,
}: SubjectProps) {
  const [otherText, setOtherText] = useState(
    draft.subjectIsOther ? (draft.subject ?? '') : '',
  )
  const showOther = draft.subjectIsOther === true

  function pickCourse(name: string) {
    onChange({ subject: name, subjectIsOther: false })
  }

  function pickOther() {
    onChange({ subjectIsOther: true, subject: otherText.trim() || undefined })
  }

  function changeOther(v: string) {
    setOtherText(v)
    onChange({ subject: v.trim() || undefined, subjectIsOther: true })
  }

  const canContinue = Boolean(draft.subject?.trim())

  return (
    <div className={shell.screen}>
      <h1 className={shell.question}>What are you studying?</h1>
      {courses.length === 0 && (
        <p className={shell.lede}>
          Add your courses in Profile to see suggestions here. For now, use Other.
        </p>
      )}
      <div className={local.subjectChips}>
        {courses.map((c) => {
          const selected = !showOther && draft.subject === c
          return (
            <button
              key={c}
              type="button"
              className={`${local.subjectChip} ${
                selected ? local.subjectChipSelected : ''
              }`}
              onClick={() => pickCourse(c)}
            >
              {c}
            </button>
          )
        })}
        <button
          type="button"
          className={`${local.subjectChip} ${
            showOther ? local.subjectChipSelected : ''
          }`}
          onClick={pickOther}
        >
          Other
        </button>
      </div>
      {showOther && (
        <input
          type="text"
          className={local.otherInput}
          placeholder="What are you studying?"
          value={otherText}
          onChange={(e) => changeOther(e.target.value)}
          autoFocus
        />
      )}
      <div className={shell.actions}>
        <button
          type="button"
          className={shell.cta}
          disabled={!canContinue}
          onClick={onNext}
        >
          Continue
        </button>
        <button type="button" className={shell.back} onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  )
}

// --- Time --------------------------------------------------------------------

const TIME_MODES: { id: TimeMode; label: string; hint: string }[] = [
  { id: 'now', label: 'Now', hint: 'Starts right away' },
  { id: 'today', label: 'Today', hint: 'Sometime later today' },
  { id: 'pick', label: 'Pick a time', hint: 'Any date and time' },
]

export function TimeStep({ draft, onChange, onNext, onBack }: StepProps) {
  const timerRef = useRef<number | null>(null)
  const chips = useMemo(() => todayTimeChips(new Date()), [])
  const [pickDate, setPickDate] = useState(() => {
    if (draft.timeMode === 'pick' && draft.startsAt) {
      return draft.startsAt.slice(0, 10)
    }
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 10)
  })
  const [pickTime, setPickTime] = useState(() => {
    if (draft.timeMode === 'pick' && draft.startsAt) {
      return draft.startsAt.slice(11, 16)
    }
    return '19:00'
  })

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current)
    }
  }, [])

  function pickMode(m: TimeMode) {
    if (m === 'now') {
      onChange({ timeMode: 'now', startsAt: new Date().toISOString() })
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => onNext(), 280)
      return
    }
    if (m === 'today') {
      onChange({
        timeMode: 'today',
        startsAt: draft.timeMode === 'today' ? draft.startsAt : undefined,
      })
      return
    }
    const composed = composePickDate(pickDate, pickTime)
    onChange({ timeMode: 'pick', startsAt: composed.toISOString() })
  }

  function pickTodayChip(d: Date) {
    onChange({ timeMode: 'today', startsAt: d.toISOString() })
  }

  function changePickDate(v: string) {
    setPickDate(v)
    if (draft.timeMode === 'pick') {
      onChange({ startsAt: composePickDate(v, pickTime).toISOString() })
    }
  }

  function changePickTime(v: string) {
    setPickTime(v)
    if (draft.timeMode === 'pick') {
      onChange({ startsAt: composePickDate(pickDate, v).toISOString() })
    }
  }

  const pickInPast =
    draft.timeMode === 'pick' &&
    draft.startsAt !== undefined &&
    new Date(draft.startsAt).getTime() < Date.now()

  const canContinue =
    draft.timeMode === 'now' ||
    (draft.timeMode === 'today' && !!draft.startsAt) ||
    (draft.timeMode === 'pick' && !!draft.startsAt && !pickInPast)

  return (
    <div className={shell.screen}>
      <h1 className={shell.question}>When?</h1>
      <div className={local.timeTiles} role="radiogroup" aria-label="Time mode">
        {TIME_MODES.map((m) => {
          const selected = draft.timeMode === m.id
          return (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`${local.timeTile} ${
                selected ? local.timeTileSelected : ''
              }`}
              onClick={() => pickMode(m.id)}
            >
              {m.label}
              <small>{m.hint}</small>
            </button>
          )
        })}
      </div>

      {draft.timeMode === 'today' && (
        <div className={local.subSection}>
          <p className={local.subSectionLabel}>How soon?</p>
          {chips.length === 0 ? (
            <p className={shell.fieldHint}>
              Nothing left today. Try Pick a time.
            </p>
          ) : (
            <div className={local.timeChipRow}>
              {chips.map((c) => {
                const selected =
                  draft.startsAt === c.date.toISOString()
                return (
                  <button
                    key={c.label}
                    type="button"
                    className={`${local.timeChip} ${
                      selected ? local.timeChipSelected : ''
                    }`}
                    onClick={() => pickTodayChip(c.date)}
                  >
                    {c.label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {draft.timeMode === 'pick' && (
        <div className={local.subSection}>
          <p className={local.subSectionLabel}>When works?</p>
          <div className={local.pickRow}>
            <input
              type="date"
              className={shell.input}
              value={pickDate}
              onChange={(e) => changePickDate(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
            />
            <input
              type="time"
              className={shell.input}
              value={pickTime}
              onChange={(e) => changePickTime(e.target.value)}
            />
          </div>
          {pickInPast && <p className={shell.error}>That’s already past.</p>}
        </div>
      )}

      <div className={shell.actions}>
        <button
          type="button"
          className={shell.cta}
          disabled={!canContinue}
          onClick={onNext}
        >
          Continue
        </button>
        <button type="button" className={shell.back} onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  )
}

function composePickDate(date: string, time: string): Date {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1, hh ?? 0, mm ?? 0, 0, 0)
}

// --- People ------------------------------------------------------------------

export function PeopleStep({ draft, onChange, onNext, onBack }: StepProps) {
  const suggestions = useMemo(
    () => classmatesFor(draft.subject ?? ''),
    [draft.subject],
  )
  const selectedIds = draft.inviteeIds ?? []
  const openTo = draft.openToCourse ?? false

  function toggle(id: string) {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id]
    onChange({ inviteeIds: next })
  }

  function toggleOpen() {
    onChange({ openToCourse: !openTo })
  }

  const canContinue = selectedIds.length > 0 || openTo

  return (
    <div className={shell.screen}>
      <h1 className={shell.question}>Who’s in?</h1>
      <p className={shell.lede}>
        We picked classmates in {draft.subject ?? 'this subject'}. Tap to add.
      </p>
      <div className={local.peopleList}>
        {suggestions.map((m) => {
          const selected = selectedIds.includes(m.id)
          const { fill, ink } = avatarColor(m.id)
          return (
            <button
              key={m.id}
              type="button"
              role="checkbox"
              aria-checked={selected}
              className={`${local.personRow} ${
                selected ? local.personRowSelected : ''
              }`}
              onClick={() => toggle(m.id)}
            >
              <span
                className={local.personAvatar}
                style={{ background: fill, color: ink }}
                aria-hidden="true"
              >
                {initialsOf(m.name)}
              </span>
              <span className={local.personName}>{m.name}</span>
              <span className={local.personCheck} aria-hidden="true">
                {selected && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </span>
            </button>
          )
        })}
      </div>

      <div className={local.openToggle}>
        <div className={local.openToggleText}>
          <span className={local.openToggleLabel}>
            Open to anyone in {draft.subject ?? 'the class'}
          </span>
          <span className={local.openToggleHint}>
            Other classmates can join without an invite.
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={openTo}
          className={`${local.switch} ${openTo ? local.switchOn : ''}`}
          onClick={toggleOpen}
          aria-label="Open to anyone in this class"
        />
      </div>

      <div className={shell.actions}>
        <button
          type="button"
          className={shell.cta}
          disabled={!canContinue}
          onClick={onNext}
        >
          Continue
        </button>
        <button type="button" className={shell.back} onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  )
}

// --- Confirm -----------------------------------------------------------------

type ConfirmProps = {
  draft: DraftSession
  onChange: (patch: Partial<DraftSession>) => void
  onBack: () => void
  onEdit: (step: StepId) => void
  onSend: () => Promise<void> | void
  sending: boolean
  error: string | null
}

const DURATIONS: { min: number; label: string }[] = [
  { min: 30, label: '30m' },
  { min: 45, label: '45m' },
  { min: 60, label: '1h' },
  { min: 90, label: '1.5h' },
  { min: 120, label: '2h' },
]

const MODES: { id: SessionMode; label: string }[] = [
  { id: 'remote', label: 'Remote' },
  { id: 'in-person', label: 'In person' },
]

export function ConfirmStep({
  draft,
  onChange,
  onBack,
  onEdit,
  onSend,
  sending,
  error,
}: ConfirmProps) {
  const duration = draft.durationMin ?? 60
  const mode = draft.mode ?? 'remote'
  const startsAt = draft.startsAt ? new Date(draft.startsAt) : null
  const suggestions = classmatesFor(draft.subject ?? '')
  const invitees = suggestions.filter((m) =>
    (draft.inviteeIds ?? []).includes(m.id),
  )
  const openTo = draft.openToCourse ?? false

  const whenLabel = (() => {
    if (draft.timeMode === 'now') return 'Right now'
    if (!startsAt) return '—'
    const day = isToday(startsAt) ? 'Today' : weekday(startsAt)
    return `${day}, ${timeOfDay(startsAt)}`
  })()

  const whoLabel = (() => {
    if (invitees.length === 0 && openTo) {
      return `Open to ${draft.subject ?? 'the class'}`
    }
    if (invitees.length === 0) return '—'
    const names = invitees.map((m) => m.name.split(' ')[0])
    let label =
      names.length <= 3
        ? names.join(', ')
        : `${names.slice(0, 2).join(', ')} & ${names.length - 2} more`
    if (openTo) label += ' · open to others'
    return label
  })()

  const ctaLabel =
    draft.timeMode === 'now'
      ? 'Start now'
      : invitees.length === 0 && openTo
        ? 'Open it up'
        : 'Send invites'

  return (
    <div className={shell.screen}>
      <h1 className={shell.question}>Looks good?</h1>
      <div className={local.summary}>
        <div className={local.summaryRow}>
          <span className={local.summaryLabel}>Subject</span>
          <span className={local.summaryValue}>{draft.subject ?? '—'}</span>
          <button
            type="button"
            className={local.summaryEdit}
            onClick={() => onEdit('subject')}
          >
            Edit
          </button>
        </div>
        <div className={local.summaryRow}>
          <span className={local.summaryLabel}>When</span>
          <span className={local.summaryValue}>{whenLabel}</span>
          <button
            type="button"
            className={local.summaryEdit}
            onClick={() => onEdit('time')}
          >
            Edit
          </button>
        </div>
        <div className={local.summaryRow}>
          <span className={local.summaryLabel}>Who</span>
          <span className={local.summaryValue}>{whoLabel}</span>
          <button
            type="button"
            className={local.summaryEdit}
            onClick={() => onEdit('people')}
          >
            Edit
          </button>
        </div>
      </div>

      <div className={local.detailGroup}>
        <div>
          <p className={local.detailLabel}>Duration</p>
          <div className={local.durationChips}>
            {DURATIONS.map((d) => (
              <button
                key={d.min}
                type="button"
                className={`${local.durationChip} ${
                  duration === d.min ? local.durationChipSelected : ''
                }`}
                onClick={() => onChange({ durationMin: d.min })}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className={local.detailLabel}>Mode</p>
          <div className={local.modeRow}>
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`${local.modeOption} ${
                  mode === m.id ? local.modeOptionSelected : ''
                }`}
                onClick={() => onChange({ mode: m.id })}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {mode === 'in-person' && (
          <div>
            <p className={local.detailLabel}>Where</p>
            <input
              type="text"
              className={shell.input}
              placeholder="Library, table 4"
              value={draft.location ?? ''}
              onChange={(e) => onChange({ location: e.target.value })}
            />
          </div>
        )}
      </div>

      {error && <p className={local.sendError}>{error}</p>}

      <div className={shell.actions}>
        <button
          type="button"
          className={shell.cta}
          disabled={sending}
          onClick={() => onSend()}
        >
          {sending ? 'Sending…' : ctaLabel}
        </button>
        <button
          type="button"
          className={shell.back}
          onClick={onBack}
          disabled={sending}
        >
          Back
        </button>
      </div>
    </div>
  )
}
