const { db, id } = require('./db');

// Mirrors the client's mock roster so seeded classmates look familiar, with
// course lists drawn from the onboarding course names so matching overlaps.
const DEMO_CLASSMATES = [
  { name: 'Maya P.', firstName: 'Maya', grade: 11, courses: ['AP Calculus BC', 'AP Physics 1', 'AP English Language'] },
  { name: 'Jordan T.', firstName: 'Jordan', grade: 11, courses: ['AP Calculus BC', 'AP US History', 'Spanish 3'] },
  { name: 'Priya S.', firstName: 'Priya', grade: 12, courses: ['AP Calculus BC', 'AP English Literature', 'AP Biology'] },
  { name: 'Omar K.', firstName: 'Omar', grade: 11, courses: ['Spanish 3', 'AP Statistics', 'US History'] },
  { name: 'Grace L.', firstName: 'Grace', grade: 10, courses: ['Spanish 3', 'Algebra 2', 'Honors Chemistry'] },
  { name: 'Sam D.', firstName: 'Sam', grade: 12, courses: ['AP Biology', 'AP Psychology', 'AP English Literature'] },
  { name: 'Ren A.', firstName: 'Ren', grade: 12, courses: ['AP Biology', 'AP English Literature', 'Music Theory'] },
  { name: 'Tomas V.', firstName: 'Tomas', grade: 10, courses: ['US History', 'Algebra 2', 'Spanish 2'] },
  { name: 'Mei W.', firstName: 'Mei', grade: 10, courses: ['Algebra 2', 'Honors Biology', 'World History'] },
  { name: 'Noor H.', firstName: 'Noor', grade: 11, courses: ['Honors Chemistry', 'Algebra 2', 'AP World History'] },
  { name: 'Leo M.', firstName: 'Leo', grade: 9, courses: ['Geometry', 'Honors Biology', 'World History'] },
  { name: 'Ava R.', firstName: 'Ava', grade: 12, courses: ['AP Calculus AB', 'AP Chemistry', 'Economics'] },
];

function schoolSlug(school) {
  return school
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const insertDemoUser = db.prepare(`
  INSERT INTO users (id, name, first_name, email, school, grade, courses, is_demo, demo_seeded)
  VALUES (@id, @name, @firstName, @email, @school, @grade, @courses, 1, 1)
  ON CONFLICT (email) DO NOTHING
`);

const seedSchool = db.transaction((school) => {
  const slug = schoolSlug(school);
  for (const mate of DEMO_CLASSMATES) {
    insertDemoUser.run({
      id: id('u-'),
      name: mate.name,
      firstName: mate.firstName,
      email: `${mate.firstName.toLowerCase()}.demo@${slug}.crew.invalid`,
      school,
      grade: mate.grade,
      courses: JSON.stringify(mate.courses),
    });
  }
});

// Seeds demo classmates the first time a school appears; no-op afterwards.
function seedDemoClassmates(school) {
  const existing = db
    .prepare('SELECT COUNT(*) AS n FROM users WHERE school = ? AND is_demo = 1')
    .get(school);
  if (existing.n > 0) return;
  seedSchool(school);
}

module.exports = { seedDemoClassmates };
