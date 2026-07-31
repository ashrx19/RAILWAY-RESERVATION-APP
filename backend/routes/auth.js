const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { read, write, id } = require('../jsonStore');
const { auth } = require('../middleware/auth');
const crypto = require('crypto');
const passport = require('passport');

const router = express.Router();
const publicUser = ({ _id, name, email, role }) => ({ id: _id, _id, name, email, role });
const tokenFor = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
const frontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';

router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return res.status(503).json({ message: 'Google login is not configured yet' });
  passport.authenticate('google', { scope: ['profile', 'email'], prompt: 'select_account' })(req, res, next);
});

router.get('/google/callback', passport.authenticate('google', { failureRedirect: `${frontendUrl()}/auth/google/callback?error=Google%20sign-in%20failed` }), async (req, res) => {
  try {
    const profile = req.user;
    const email = profile.emails?.[0]?.value;
    if (!email) throw new Error('A Google email address is required');
    const data = read(); let user = data.users.find((entry) => entry.email.toLowerCase() === email.toLowerCase());
    if (!user) { user = { _id: id(), name: profile.displayName || email.split('@')[0], email, password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10), role: 'user', googleId: profile.id, createdAt: new Date().toISOString() }; data.users.push(user); write(data); }
    res.redirect(`${frontendUrl()}/auth/google/callback?token=${encodeURIComponent(tokenFor(user))}`);
  } catch (error) { console.error('Google OAuth error:', error.message); res.redirect(`${frontendUrl()}/auth/google/callback?error=Google%20sign-in%20failed`); }
});

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const data = read();
  if (data.users.some((user) => user.email.toLowerCase() === String(email).toLowerCase())) return res.status(400).json({ message: 'Email already exists' });
  const user = { _id: id(), name, email, password: await bcrypt.hash(password, 10), role: 'user', createdAt: new Date().toISOString() };
  data.users.push(user); write(data);
  res.json({ user: publicUser(user), token: tokenFor(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = read().users.find((entry) => entry.email.toLowerCase() === String(email).toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ user: publicUser(user), token: tokenFor(user) });
});

router.get('/me', auth, (req, res) => {
  const user = read().users.find((entry) => entry._id === req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(publicUser(user));
});

module.exports = router;
