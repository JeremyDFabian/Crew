const express = require('express');
const { db, id } = require('../db');
const { requireAuth } = require('../auth');

const router = express.Router();
router.use(requireAuth);

const getUser = db.prepare('SELECT * FROM users WHERE id = ?');
const getSession = db.prepare('SELECT * FROM sessions WHERE id = ?');
const getMembership = db.prepare(
  'SELECT status FROM memberships WHERE session_id = ? AND user_id = ?',
);
const listMembers = db.prepare(`
  SELECT u.id, u.name
  FROM memberships ms JOIN users u ON u.id = ms.user_id
  WHERE ms.session_id = ? AND ms.status != 'declined'
  ORDER BY ms.rowid
`);
const insertSession = db.prepare(`
  INSERT INTO sessions (id, subject, starts_at, duration_min, mode, location,
                        join_url, host_id, school, open_to_course)
  VALUES (@id, @subject, @startsAt, @durationMin, @mode, @location,
          @joinUrl, @hostId, @school, @openToCourse)
`);
const insertMembership = db.prepare(`
  INSERT INTO memberships (session_id, user_id, status) VALUES (?, ?, ?)
`);

function toApiSession(row, userStatus) {
  return {
    id: row.id,
    subject: row.subject,
    startsAt: row.starts_at,
    durationMin: row.duration_min,
    members: listMembers.all(row.id),
    hostId: row.host_id,
    location: row.location ?? undefined,
    joinUrl: row.join_url ?? undefined,
    mode: row.mode,
    userStatus,
  };
}

// --- demo sessions -----------------------------------------------------------

// The seven shapes the client used to seed from mocks, times relative to now,
// plus a few open sessions the caller is not in (these feed Browse).
const DEMO_SESSIONS = [
  { subject: 'AP Calc', offsetMin: -12, durationMin: 45, mode: 'remote', myStatus: 'accepted', host: 'Maya', others: ['Jordan', 'Priya'] },
  { subject: 'Spanish 3 review', offsetMin: 18, durationMin: 30, mode: 'in-person', location: 'Library, table 4', myStatus: 'invited', host: 'Omar', others: ['Grace'] },
  { subject: 'Bio reading group', offsetMin: 180, durationMin: 60, mode: 'remote', myStatus: 'accepted', host: 'Sam', others: ['Ren'] },
  { subject: 'US History essay outline', offsetMin: 60 * 24, durationMin: 90, mode: 'in-person', location: 'Coffeehouse on 3rd', myStatus: 'invited', host: 'Tomas', others: [] },
  { subject: 'Algebra 2, chapter 7', offsetMin: 60 * 48 + 15, durationMin: 45, mode: 'remote', myStatus: 'accepted', host: 'Mei', others: ['Noor', 'Tomas', 'Grace'] },
  { subject: 'AP Lit close reading', offsetMin: 60 * 72 + 30, durationMin: 60, mode: 'in-person', location: 'Senior commons', myStatus: 'invited', host: 'Priya', others: ['Ren'] },
  { subject: 'Chem lab prep', offsetMin: 60 * 96, durationMin: 45, mode: 'remote', myStatus: 'accepted', host: 'Noor', others: [] },
];

const DEMO_OPEN_SESSIONS = [
  { subject: 'AP Statistics problem set', offsetMin: 60 * 26, durationMin: 60, mode: 'remote', host: 'Omar', others: ['Grace'] },
  { subject: 'AP Biology unit review', offsetMin: 60 * 30, durationMin: 60, mode: 'in-person', location: 'Bio lab', host: 'Sam', others: ['Ren'] },
  { subject: 'Geometry homework club', offsetMin: 60 * 50, durationMin: 45, mode: 'in-person', location: 'Room 204', host: 'Leo', others: ['Mei'] },
  { subject: 'AP Chemistry lab writeup', offsetMin: 60 * 54, durationMin: 60, mode: 'remote', host: 'Ava', others: ['Noor'] },
];

const demoUserByFirstName = db.prepare(`
  SELECT id FROM users WHERE school = ? AND is_demo = 1 AND first_name = ?
`);
const markDemoSeeded = db.prepare(
  'UPDATE users SET demo_seeded = 1 WHERE id = ?',
);

const seedDemoSessions = db.transaction((user) => {
  const demoId = (firstName) =>
    demoUserByFirstName.get(user.school, firstName)?.id;

  function insertDemoSession(shape, { open, myStatus }) {
    const hostId = demoId(shape.host);
    if (!hostId) return;
    const sessionId = id('s-');
    insertSession.run({
      id: sessionId,
      subject: shape.subject,
      startsAt: new Date(Date.now() + shape.offsetMin * 60_000).toISOString(),
      durationMin: shape.durationMin,
      mode: shape.mode,
      location: shape.location ?? null,
      joinUrl: shape.mode === 'remote' ? `https://meet.example/${sessionId}` : null,
      hostId,
      school: user.school,
      openToCourse: open ? 1 : 0,
    });
    if (myStatus) insertMembership.run(sessionId, user.id, myStatus);
    insertMembership.run(sessionId, hostId, 'accepted');
    for (const other of shape.others) {
      const otherId = demoId(other);
      if (otherId) insertMembership.run(sessionId, otherId, 'accepted');
    }
  }

  for (const shape of DEMO_SESSIONS) {
    insertDemoSession(shape, { open: false, myStatus: shape.myStatus });
  }
  for (const shape of DEMO_OPEN_SESSIONS) {
    insertDemoSession(shape, { open: true, myStatus: null });
  }
  markDemoSeeded.run(user.id);
});

// --- routes ------------------------------------------------------------------

const listMySessions = db.prepare(`
  SELECT s.*, m.status AS user_status
  FROM sessions s JOIN memberships m ON m.session_id = s.id
  WHERE m.user_id = ?
    AND datetime(s.starts_at, '+' || (s.duration_min + 15) || ' minutes')
        > datetime('now')
  ORDER BY s.starts_at
`);

router.get('/api/sessions', (req, res) => {
  const user = getUser.get(req.userId);
  if (!user) return res.status(401).json({ error: 'Unknown user' });
  if (!user.is_demo && !user.demo_seeded) seedDemoSessions(user);
  const rows = listMySessions.all(user.id);
  res.json({ sessions: rows.map((r) => toApiSession(r, r.user_status)) });
});

router.post('/api/sessions', (req, res) => {
  const user = getUser.get(req.userId);
  if (!user) return res.status(401).json({ error: 'Unknown user' });

  const { subject, startsAt, durationMin, mode, location, inviteeIds, openToCourse } =
    req.body ?? {};

  const cleanSubject = typeof subject === 'string' ? subject.trim() : '';
  if (!cleanSubject) return res.status(400).json({ error: 'subject is required' });
  const starts = typeof startsAt === 'string' ? new Date(startsAt) : null;
  if (!starts || Number.isNaN(starts.getTime())) {
    return res.status(400).json({ error: 'startsAt must be an ISO date string' });
  }
  if (!Number.isInteger(durationMin) || durationMin <= 0) {
    return res.status(400).json({ error: 'durationMin must be a positive integer' });
  }
  if (mode !== 'remote' && mode !== 'in-person') {
    return res.status(400).json({ error: 'mode must be remote or in-person' });
  }
  const invitees = Array.isArray(inviteeIds)
    ? inviteeIds.filter((x) => typeof x === 'string' && x !== user.id)
    : [];

  const sessionId = id('s-');
  const create = db.transaction(() => {
    insertSession.run({
      id: sessionId,
      subject: cleanSubject,
      startsAt: starts.toISOString(),
      durationMin,
      mode,
      location:
        mode === 'in-person' && typeof location === 'string' && location.trim()
          ? location.trim()
          : null,
      joinUrl: mode === 'remote' ? `https://meet.example/${sessionId}` : null,
      hostId: user.id,
      school: user.school,
      openToCourse: openToCourse ? 1 : 0,
    });
    insertMembership.run(sessionId, user.id, 'accepted');
    for (const inviteeId of invitees) {
      const invitee = getUser.get(inviteeId);
      if (invitee && invitee.school === user.school) {
        insertMembership.run(sessionId, inviteeId, 'invited');
      }
    }
  });
  create();

  res.status(201).json({
    session: toApiSession(getSession.get(sessionId), 'accepted'),
  });
});

const updateMembership = db.prepare(`
  UPDATE memberships SET status = ? WHERE session_id = ? AND user_id = ?
`);

router.patch('/api/sessions/:id/rsvp', (req, res) => {
  const { status } = req.body ?? {};
  if (!['invited', 'accepted', 'declined'].includes(status)) {
    return res.status(400).json({ error: 'status must be invited, accepted, or declined' });
  }
  const session = getSession.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  const membership = getMembership.get(session.id, req.userId);
  if (!membership) return res.status(403).json({ error: 'Not a member of this session' });
  updateMembership.run(status, session.id, req.userId);
  res.json({ session: toApiSession(session, status) });
});

const updateSessionTime = db.prepare(`
  UPDATE sessions SET starts_at = @startsAt, duration_min = @durationMin
  WHERE id = @id
`);

router.patch('/api/sessions/:id', (req, res) => {
  const session = getSession.get(req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  const membership = getMembership.get(session.id, req.userId);
  if (!membership || membership.status === 'declined') {
    return res.status(403).json({ error: 'Not an active member of this session' });
  }

  const { startsAt, durationMin } = req.body ?? {};
  let nextStartsAt = session.starts_at;
  if (startsAt !== undefined) {
    const starts = typeof startsAt === 'string' ? new Date(startsAt) : null;
    if (!starts || Number.isNaN(starts.getTime())) {
      return res.status(400).json({ error: 'startsAt must be an ISO date string' });
    }
    nextStartsAt = starts.toISOString();
  }
  let nextDuration = session.duration_min;
  if (durationMin !== undefined) {
    if (!Number.isInteger(durationMin) || durationMin <= 0) {
      return res.status(400).json({ error: 'durationMin must be a positive integer' });
    }
    nextDuration = durationMin;
  }

  updateSessionTime.run({ id: session.id, startsAt: nextStartsAt, durationMin: nextDuration });
  res.json({
    session: toApiSession(getSession.get(session.id), membership.status),
  });
});

// --- candidates ----------------------------------------------------------------

const listSchoolmates = db.prepare(`
  SELECT id, name, grade, courses FROM users
  WHERE school = ? AND id != ?
`);

router.get('/api/candidates', (req, res) => {
  const user = getUser.get(req.userId);
  if (!user) return res.status(401).json({ error: 'Unknown user' });
  const subject = typeof req.query.subject === 'string' ? req.query.subject.trim() : '';
  const myCourses = new Set(
    JSON.parse(user.courses).map((c) => c.toLowerCase()),
  );

  const ranked = listSchoolmates
    .all(user.school, user.id)
    .map((row) => {
      const courses = JSON.parse(row.courses);
      const sharesSubject = subject
        ? courses.some((c) => c.toLowerCase() === subject.toLowerCase())
        : false;
      const matched = courses.filter(
        (c) =>
          c.toLowerCase() === subject.toLowerCase() ||
          myCourses.has(c.toLowerCase()),
      );
      return { id: row.id, name: row.name, grade: row.grade, sharesSubject, matched };
    })
    .sort(
      (a, b) =>
        Number(b.sharesSubject) - Number(a.sharesSubject) ||
        Number(b.grade === user.grade) - Number(a.grade === user.grade) ||
        a.name.localeCompare(b.name),
    )
    .slice(0, 8)
    .map(({ id: cid, name, matched }) => ({ id: cid, name, matched }));

  res.json({ candidates: ranked, source: 'fallback' });
});

module.exports = router;
