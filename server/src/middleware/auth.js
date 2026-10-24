const jwt = require('jsonwebtoken');
const { jwtSecret, sessionTtlMs, cookie } = require('../config');

const cookieOptions = {
  httpOnly: true,
  secure: cookie.secure,
  sameSite: 'strict',
};

function issueSession(res, user) {
  const token = jwt.sign({ userId: user.userId, userType: user.userType }, jwtSecret, {
    expiresIn: Math.floor(sessionTtlMs / 1000),
  });
  res.cookie(cookie.name, token, { ...cookieOptions, maxAge: sessionTtlMs });
}

function endSession(res) {
  res.clearCookie(cookie.name, cookieOptions);
}

/** Requires a valid session cookie and exposes the payload as req.user. */
function requireAuth(req, res, next) {
  const token = req.cookies?.[cookie.name];
  if (!token) return res.status(401).send('Not authenticated.');
  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(403).send('Invalid or expired session.');
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.userType === 'admin') return next();
  res.status(403).send('Administrator access required.');
}

module.exports = { issueSession, endSession, requireAuth, requireAdmin };
