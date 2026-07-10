const express = require('express');
const { db, id } = require('../db');
const { signToken, requireAuth } = require('../auth');
const { seedDemoClassmates } = require('../seed');

const router = express.Router();

function toApiUser(row) {
  return {
    id: row.id,
    name: row.name,
    firstName: row.first_name,
    email: row.email,
    school: row.school,
    grade: row.grade,
    courses: JSON.parse(row.courses),
  };
}

const getByEmail = db.prepare('SELECT * FROM users WHERE email = ?');
const getById = db.prepare('SELECT * FROM users WHERE id = ?');
const insertUser = db.prepare(`
  INSERT INTO users (id, name, first_name, email, school, grade, courses)
  VALUES (@id, @name, @firstName, @email, @school, @grade, @courses)
`);

router.post('/api/users', (req, res) => {
  const { firstName, displayName, email, school, grade, courses } =
    req.body ?? {};

  const cleanFirst = typeof firstName === 'string' ? firstName.trim() : '';
  const cleanEmail =
    typeof email === 'string' ? email.trim().toLowerCase() : '';
  const cleanSchool = typeof school === 'string' ? school.trim() : '';
  const cleanCourses = Array.isArray(courses)
    ? courses.filter((c) => typeof c === 'string' && c.trim()).map((c) => c.trim())
    : [];

  if (!cleanFirst || !cleanEmail || !cleanSchool) {
    return res
      .status(400)
      .json({ error: 'firstName, email, and school are required' });
  }
  if (![9, 10, 11, 12].includes(grade)) {
    return res.status(400).json({ error: 'grade must be 9-12' });
  }

  const existing = getByEmail.get(cleanEmail);
  if (existing) {
    return res
      .status(200)
      .json({ user: toApiUser(existing), token: signToken(existing.id) });
  }

  const name =
    (typeof displayName === 'string' && displayName.trim()) || cleanFirst;
  const userId = id('u-');
  insertUser.run({
    id: userId,
    name,
    firstName: cleanFirst,
    email: cleanEmail,
    school: cleanSchool,
    grade,
    courses: JSON.stringify(cleanCourses),
  });
  seedDemoClassmates(cleanSchool);

  const row = getById.get(userId);
  res.status(201).json({ user: toApiUser(row), token: signToken(userId) });
});

router.get('/api/me', requireAuth, (req, res) => {
  const row = getById.get(req.userId);
  if (!row) return res.status(401).json({ error: 'Unknown user' });
  res.json({ user: toApiUser(row) });
});

module.exports = router;
