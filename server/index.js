const express = require('express');
const cors = require('cors');
require('dotenv').config();

const usersRouter = require('./routes/users');
const sessionsRouter = require('./routes/sessions');

const app = express();
app.use(
  cors({ origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173' }),
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'crew-api' });
});

app.use(usersRouter);
app.use(sessionsRouter);

// Express 5 forwards async route errors here on its own.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
