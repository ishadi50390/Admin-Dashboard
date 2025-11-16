import { verifyToken } from '../utils/jwt.js';
import { User } from '../models/index.js';

export async function authenticateJWT(req, res, next) {
  try {
    const isAdminLoginRoute =
      req.baseUrl === '/admin' && (req.path === '/login' || req.path.startsWith('/login/'));

    if (isAdminLoginRoute) {
      return next();
    }

    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication token missing' });
    }

    const decoded = verifyToken(token);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return next();
  };
}
