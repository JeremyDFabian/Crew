import type { Session } from '../lib/types'

export const CURRENT_USER = { id: 'u-jeremy', name: 'Jeremy F.' }

function rel(minutes: number, now: Date = new Date()): Date {
  return new Date(now.getTime() + minutes * 60000)
}

export async function getSessions(now: Date = new Date()): Promise<Session[]> {
  await new Promise((r) => setTimeout(r, 350))
  return [
    {
      id: 's-1',
      subject: 'AP Calc',
      startsAt: rel(-12, now),
      durationMin: 45,
      members: [
        { id: 'u-jeremy', name: 'Jeremy F.' },
        { id: 'u-maya', name: 'Maya P.' },
        { id: 'u-jordan', name: 'Jordan T.' },
        { id: 'u-priya', name: 'Priya S.' },
      ],
      hostId: 'u-maya',
      joinUrl: 'https://meet.example/abc',
      mode: 'remote',
      userStatus: 'accepted',
    },
    {
      id: 's-2',
      subject: 'Spanish 3 review',
      startsAt: rel(18, now),
      durationMin: 30,
      members: [
        { id: 'u-jeremy', name: 'Jeremy F.' },
        { id: 'u-omar', name: 'Omar K.' },
        { id: 'u-grace', name: 'Grace L.' },
      ],
      hostId: 'u-omar',
      location: 'Library, table 4',
      mode: 'in-person',
      userStatus: 'invited',
    },
    {
      id: 's-3',
      subject: 'Bio reading group',
      startsAt: rel(180, now),
      durationMin: 60,
      members: [
        { id: 'u-jeremy', name: 'Jeremy F.' },
        { id: 'u-sam', name: 'Sam D.' },
        { id: 'u-ren', name: 'Ren A.' },
      ],
      hostId: 'u-sam',
      joinUrl: 'https://meet.example/bio',
      mode: 'remote',
      userStatus: 'accepted',
    },
    {
      id: 's-4',
      subject: 'US History essay outline',
      startsAt: rel(60 * 24, now),
      durationMin: 90,
      members: [
        { id: 'u-jeremy', name: 'Jeremy F.' },
        { id: 'u-tomas', name: 'Tomas V.' },
      ],
      hostId: 'u-tomas',
      location: 'Coffeehouse on 3rd',
      mode: 'in-person',
      userStatus: 'invited',
    },
    {
      id: 's-5',
      subject: 'Algebra 2, chapter 7',
      startsAt: rel(60 * 48 + 15, now),
      durationMin: 45,
      members: [
        { id: 'u-jeremy', name: 'Jeremy F.' },
        { id: 'u-mei', name: 'Mei W.' },
        { id: 'u-noor', name: 'Noor H.' },
        { id: 'u-tomas', name: 'Tomas V.' },
        { id: 'u-grace', name: 'Grace L.' },
      ],
      hostId: 'u-mei',
      joinUrl: 'https://meet.example/algebra',
      mode: 'remote',
      userStatus: 'accepted',
    },
    {
      id: 's-6',
      subject: 'AP Lit close reading',
      startsAt: rel(60 * 72 + 30, now),
      durationMin: 60,
      members: [
        { id: 'u-jeremy', name: 'Jeremy F.' },
        { id: 'u-priya', name: 'Priya S.' },
        { id: 'u-ren', name: 'Ren A.' },
      ],
      hostId: 'u-priya',
      location: 'Senior commons',
      mode: 'in-person',
      userStatus: 'invited',
    },
    {
      id: 's-7',
      subject: 'Chem lab prep',
      startsAt: rel(60 * 96, now),
      durationMin: 45,
      members: [
        { id: 'u-jeremy', name: 'Jeremy F.' },
        { id: 'u-noor', name: 'Noor H.' },
      ],
      hostId: 'u-noor',
      joinUrl: 'https://meet.example/chem',
      mode: 'remote',
      userStatus: 'accepted',
    },
  ]
}
