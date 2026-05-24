export function minutesUntil(date: Date, now: Date = new Date()): number {
  return Math.round((date.getTime() - now.getTime()) / 60000)
}

export function isToday(date: Date, now: Date = new Date()): boolean {
  return date.toDateString() === now.toDateString()
}

export function isThisWeek(date: Date, now: Date = new Date()): boolean {
  const diff = date.getTime() - now.getTime()
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000
}

export function weekday(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'long' })
}

export function timeOfDay(date: Date): string {
  return date
    .toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
    .toLowerCase()
    .replace(/\s/g, '')
}

export function formatRelative(date: Date, now: Date = new Date()): string {
  const m = minutesUntil(date, now)
  if (m < 0 && m > -60) return 'started'
  if (m === 0) return 'now'
  if (m > 0 && m < 60) return `in ${m} min`
  if (isToday(date, now)) return `today ${timeOfDay(date)}`
  if (isThisWeek(date, now)) return `${weekday(date)} ${timeOfDay(date)}`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
