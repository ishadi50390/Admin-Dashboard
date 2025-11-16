import jwt from 'jsonwebtoken';

const DEFAULT_EXPIRY = '1h';

export function signToken(payload, options = {}) {
  const secret = process.env.JWT_SECRET || 'supersecret';
  return jwt.sign(payload, secret, { expiresIn: DEFAULT_EXPIRY, ...options });
}

export function verifyToken(token) {
  const secret = process.env.JWT_SECRET || 'supersecret';
  return jwt.verify(token, secret);
}
