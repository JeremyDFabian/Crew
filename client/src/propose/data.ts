import type { Member } from '../lib/types'

const POOL: Member[] = [
  { id: 'p-maya', name: 'Maya P.' },
  { id: 'p-jordan', name: 'Jordan T.' },
  { id: 'p-priya', name: 'Priya S.' },
  { id: 'p-omar', name: 'Omar K.' },
  { id: 'p-grace', name: 'Grace L.' },
  { id: 'p-sam', name: 'Sam D.' },
  { id: 'p-ren', name: 'Ren A.' },
  { id: 'p-tomas', name: 'Tomas V.' },
  { id: 'p-mei', name: 'Mei W.' },
  { id: 'p-noor', name: 'Noor H.' },
  { id: 'p-leo', name: 'Leo M.' },
  { id: 'p-cam', name: 'Cam B.' },
  { id: 'p-iris', name: 'Iris G.' },
  { id: 'p-theo', name: 'Theo R.' },
  { id: 'p-hana', name: 'Hana C.' },
]

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

export function classmatesFor(subject: string): Member[] {
  const h = hash(subject || 'default')
  const count = 3 + (h % 4)
  const start = h % POOL.length
  const out: Member[] = []
  for (let i = 0; i < count; i++) {
    out.push(POOL[(start + i * 3) % POOL.length])
  }
  const seen = new Set<string>()
  return out.filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)))
}

export type TimeChip = {
  label: string
  date: Date
}

function fmtHour(d: Date): string {
  let h = d.getHours()
  const m = d.getMinutes()
  const suffix = h >= 12 ? 'pm' : 'am'
  h = h % 12 || 12
  if (m === 0) return `${h}${suffix}`
  return `${h}:${m.toString().padStart(2, '0')}${suffix}`
}

export function todayTimeChips(now: Date = new Date()): TimeChip[] {
  const chips: TimeChip[] = []

  const in30 = new Date(now.getTime() + 30 * 60_000)
  if (sameDay(in30, now)) chips.push({ label: 'in 30 min', date: in30 })

  const in60 = new Date(now.getTime() + 60 * 60_000)
  if (sameDay(in60, now)) chips.push({ label: 'in 1 hour', date: in60 })

  const cutoff = new Date(now.getTime() + 90 * 60_000)
  for (const hour of [16, 18, 19, 20, 21]) {
    const t = new Date(now)
    t.setHours(hour, 0, 0, 0)
    if (t > cutoff && sameDay(t, now)) {
      chips.push({ label: fmtHour(t), date: t })
    }
    if (chips.length >= 5) break
  }

  return chips
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export async function sendInvites(): Promise<void> {
  await new Promise((r) => setTimeout(r, 480))
}
