require('dotenv').config();
const crypto = require('crypto');
const path = require('path');

let jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret === 'change-me') {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set in production.');
  }
  // Development fallback: sessions simply reset on every restart.
  jwtSecret = crypto.randomBytes(48).toString('hex');
  console.warn('[config] JWT_SECRET not set - using a temporary random secret.');
}

module.exports = {
  port: Number(process.env.PORT) || 3000,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:4200',
  jwtSecret,
  sessionTtlMs: 2 * 60 * 60 * 1000, // 2 hours
  cookie: {
    name: 'authToken',
    secure: process.env.COOKIE_SECURE
      ? process.env.COOKIE_SECURE === 'true'
      : process.env.NODE_ENV === 'production',
  },
  dataDir: path.join(__dirname, '..', 'data'),
};
