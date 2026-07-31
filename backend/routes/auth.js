const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { read, write, id } = require('../jsonStore');
const { auth } = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();
const publicUser = ({ _id, name, email, role }) => ({ id: _id, _id, name, email, role });
const tokenFor = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
const googleStates = new Map();
const googleCallbackUrl = () => process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';
const frontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173';

router.get('/google', (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) return res.status(503).json({ message: 'Google login is not configured yet' });
  const state = crypto.randomBytes(32).toString('hex');
  googleStates.set(state, Date.now());
  const params = new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID, redirect_uri: googleCallbackUrl(), response_type: 'code', scope: 'openid email profile', state, prompt: 'select_account' });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

async function finishGoogleLogin(code, state) {
  const createdAt = googleStates.get(state);
  googleStates.delete(state);
  if (!createdAt || Date.now() - createdAt > 10 * 60 * 1000) throw new Error('Google sign-in was cancelled or expired');
  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: googleCallbackUrl(), grant_type: 'authorization_code' }) });
    if (!tokenResponse.ok) throw new Error('Google could not exchange the authorization code');
    const googleTokens = await tokenResponse.json();
    const profileResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', { headers: { Authorization: `Bearer ${googleTokens.access_token}` } });
    if (!profileResponse.ok) throw new Error('Google profile request failed');
    const profile = await profileResponse.json();
    if (!profile.email || profile.email_verified === false) throw new Error('A verified Google email address is required');
    const data = read(); let user = data.users.find((entry) => entry.email.toLowerCase() === profile.email.toLowerCase());
    if (!user) { user = { _id: id(), name: profile.name || profile.email.split('@')[0], email: profile.email, password: await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10), role: 'user', googleId: profile.sub, createdAt: new Date().toISOString() }; data.users.push(user); write(data); }
    return { user: publicUser(user), token: tokenFor(user) };
  } catch (error) { console.error('Google OAuth error:', error.message); throw error; }
}

router.post('/google/exchange', async (req, res) => {
  try {
    res.json(await finishGoogleLogin(req.body.code, req.body.state));
  } catch (error) {
    res.status(401).json({ message: error.message || 'Google sign-in failed' });
  }
});

router.get('/google/callback', (req, res) => {
  const params = new URLSearchParams({ code: req.query.code || '', state: req.query.state || '', error: req.query.error || '' });
  res.redirect(`${frontendUrl()}/auth/google/callback?${params}`);
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
