export type Grade = 9 | 10 | 11 | 12

export type Profile = {
  firstName: string
  displayName?: string
  email: string
  birthday: string
  school: string
  grade: Grade
  courses: string[]
  invitedBy?: string
}

export type DraftProfile = {
  firstName?: string
  displayName?: string
  email?: string
  birthday?: string
  acceptedTos?: boolean
  school?: string
  grade?: Grade
  courses?: string[]
  invitedBy?: string
  inviteSchool?: string
}

export type StepId =
  | 'welcome'
  | 'account'
  | 'name'
  | 'school'
  | 'grade'
  | 'courses'
  | 'complete'

export type InvitePayload = {
  friendName: string
  school?: string
}
