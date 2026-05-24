import type { InvitePayload } from './types'

export const SCHOOLS: string[] = [
  'Westridge High School',
  'Lincoln High School',
  'Roosevelt High School',
  'Jefferson High School',
  'Madison High School',
  'Brookline Senior High',
  'Oak Park & River Forest High School',
  'Mission San Jose High School',
  'Cupertino High School',
  'Mountain View High School',
  'Palo Alto High School',
  'Gunn Senior High',
  'Lowell High School',
  'Stuyvesant High School',
  'Bronx High School of Science',
  'Brooklyn Technical High School',
  'Hunter College High School',
  'Thomas Jefferson School for Science & Tech',
  'Phillips Academy Andover',
  'New Trier Township High School',
  'Boston Latin School',
  'Walnut Hills High School',
  'Liberal Arts & Science Academy',
  'BASIS Scottsdale',
  'Lakota East High School',
]

export const COURSES: string[] = [
  'AP Calculus AB',
  'AP Calculus BC',
  'AP Statistics',
  'Algebra 2',
  'Precalculus',
  'Geometry',
  'AP Biology',
  'AP Chemistry',
  'AP Physics 1',
  'AP Physics C',
  'AP Environmental Science',
  'AP US History',
  'AP World History',
  'AP European History',
  'AP US Government',
  'AP Psychology',
  'AP English Language',
  'AP English Literature',
  'AP Computer Science A',
  'AP Computer Science Principles',
  'AP Spanish Language',
  'AP French Language',
  'Spanish 2',
  'Spanish 3',
  'French 2',
  'French 3',
  'Latin 2',
  'Mandarin 2',
  'Honors Chemistry',
  'Honors Biology',
  'Honors Pre-Calc',
  'US History',
  'World History',
  'Civics',
  'Studio Art',
  'Music Theory',
  'Economics',
]

export function searchSchools(query: string): string[] {
  const q = query.trim().toLowerCase()
  if (!q) return SCHOOLS.slice(0, 8)
  return SCHOOLS.filter((s) => s.toLowerCase().includes(q)).slice(0, 8)
}

export function searchCourses(query: string, selected: string[]): string[] {
  const q = query.trim().toLowerCase()
  const sel = new Set(selected.map((s) => s.toLowerCase()))
  const base = q
    ? COURSES.filter((c) => c.toLowerCase().includes(q))
    : COURSES
  return base.filter((c) => !sel.has(c.toLowerCase())).slice(0, 8)
}

export function parseInvite(search: string): InvitePayload | null {
  const params = new URLSearchParams(search)
  const token = params.get('invite')
  if (!token) return null
  const FIXTURES: Record<string, InvitePayload> = {
    'maria-westridge': {
      friendName: 'Maria',
      school: 'Westridge High School',
    },
    'jordan-lincoln': {
      friendName: 'Jordan',
      school: 'Lincoln High School',
    },
  }
  return (
    FIXTURES[token] ?? { friendName: 'A friend' }
  )
}
