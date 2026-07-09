export type SessionStatus = 'invited' | 'accepted' | 'declined'
export type SessionMode = 'remote' | 'in-person'

export type Member = {
  id: string
  name: string
}

export type Session = {
  id: string
  subject: string
  startsAt: Date
  durationMin: number
  members: Member[]
  hostId: string
  location?: string
  joinUrl?: string
  mode: SessionMode
  userStatus: SessionStatus
}
