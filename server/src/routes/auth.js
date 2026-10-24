const { Router } = require('express');
const { randomUUID } = require('crypto');
const store = require('../lib/store');
const { hashPassword, verifyPassword } = require('../lib/password');
const { issueSession, endSession, requireAuth } = require('../middleware/auth');

const router = Router();
const MIN_PASSWORD_LENGTH = 6;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+$/;

/** Fields that are safe to send to the browser. */
function publicProfile(user) {
  return {
    userId: user.userId,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone || 0,
    iban: user.iban || '',
    bankName: user.bankName || '',
    userType: user.userType,
  };
}

router.post('/signup', (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !EMAIL_PATTERN.test(email || '')) {
    return res.status(400).send('A full name and a valid email are required.');
  }
  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).send(`Password must contain at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  const users = store.users.all();
  if (users.some(u => u.email === email)) return res.status(409).send('User already exists.');

  users.push({
    userId: randomUUID(),
    fullName,
    email,
    password: hashPassword(password),
    phone: 0,
    iban: '',
    bankName: '',
    userType: 'member',
  });
  store.users.save(users);
  res.status(201).send('User registered successfully.');
});

router.post('/signin', (req, res) => {
  const { email, password } = req.body;
  const user = store.users.all().find(u => u.email === email);

  if (!user || !verifyPassword(password, user.password)) {
    return res.status(401).send('Invalid credentials.');
  }

  issueSession(res, user);
  res.send('Login successful.');
});

router.post('/signout', requireAuth, (_req, res) => {
  endSession(res);
  res.send('Logged out successfully.');
});

// Returns the signed-in user and renews the session cookie.
router.get('/me', requireAuth, (req, res) => {
  const user = store.users.all().find(u => u.userId === req.user.userId);
  if (!user) return res.status(404).send('User not found.');

  issueSession(res, user);
  res.json(publicProfile(user));
});

module.exports = router;
module.exports.publicProfile = publicProfile;
