import type { SessionMode } from '../lib/types'

export type TimeMode = 'now' | 'today' | 'pick'

export type StepId = 'subject' | 'time' | 'people' | 'confirm'

export type DraftSession = {
  subject?: string
  subjectIsOther?: boolean
  timeMode?: TimeMode
  startsAt?: string
  durationMin?: number
  mode?: SessionMode
  location?: string
  inviteeIds?: string[]
  openToCourse?: boolean
}
