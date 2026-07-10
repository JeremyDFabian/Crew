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
