const jwt = require('jsonwebtoken');

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set. Copy .env.example to .env and set JWT_SECRET.');
  }
  return secret;
}

function signToken(user) {
  const secret = getJwtSecret();
  return jwt.sign(
    { sub: user.id, role: user.role },
    secret,
    { expiresIn: '30d' }
  );
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Missing Authorization Bearer token' });
  }

  try {
    const secret = getJwtSecret();
    const payload = jwt.verify(token, secret);
    req.auth = { userId: payload.sub, role: payload.role };
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.auth) return res.status(401).json({ message: 'Unauthorized' });
    if (req.auth.role !== role) return res.status(403).json({ message: 'Forbidden' });
    return next();
  };
}

module.exports = {
  signToken,
  authRequired,
  requireRole,
};
