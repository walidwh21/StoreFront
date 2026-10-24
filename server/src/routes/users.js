const { Router } = require('express');
const { randomUUID } = require('crypto');
const store = require('../lib/store');
const { hashPassword } = require('../lib/password');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { publicProfile } = require('./auth');

const router = Router();
const EDITABLE_FIELDS = ['fullName', 'email', 'iban', 'bankName', 'phone'];

router.get('/', requireAuth, requireAdmin, (_req, res) => {
  res.json(store.users.all().map(publicProfile));
});

router.post('/', requireAuth, requireAdmin, (req, res) => {
  const { fullName, email, password, iban, bankName, phone, userType } = req.body;
  if (!fullName || !email || !password) return res.status(400).send('Required fields are missing.');

  const users = store.users.all();
  if (users.some(u => u.email === email)) return res.status(409).send('Email already in use.');

  const user = {
    userId: randomUUID(),
    fullName,
    email,
    password: hashPassword(password),
    iban: iban || '',
    bankName: bankName || '',
    phone: phone || 0,
    userType: userType === 'admin' ? 'admin' : 'member',
  };
  users.push(user);
  store.users.save(users);
  res.status(201).json(publicProfile(user));
});

// A user may edit their own profile; administrators may edit anyone's.
router.put('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  if (req.user.userType !== 'admin' && req.user.userId !== id) {
    return res.status(403).send('Access denied.');
  }

  const users = store.users.all();
  const user = users.find(u => u.userId === id);
  if (!user) return res.status(404).send('User not found.');

  for (const field of EDITABLE_FIELDS) {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  }
  store.users.save(users);
  res.json(publicProfile(user));
});

router.delete('/:id', requireAuth, requireAdmin, (req, res) => {
  const users = store.users.all();
  const index = users.findIndex(u => u.userId === req.params.id);
  if (index === -1) return res.status(404).send('User not found.');

  users.splice(index, 1);
  store.users.save(users);
  res.status(204).send();
});

module.exports = router;
