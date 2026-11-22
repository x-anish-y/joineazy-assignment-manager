import { verifyToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import { query } from '../config/db.js';

export const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Missing or invalid authorization header');
    }

    const token = header.split(' ')[1];
    const decoded = verifyToken(token);

    // Fetch fresh user data
    const { rows } = await query('SELECT id, name, email, student_id, role FROM users WHERE id = $1', [decoded.id]);
    if (rows.length === 0) {
      throw ApiError.unauthorized('User not found');
    }

    req.user = rows[0];
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(ApiError.unauthorized('Invalid or expired token'));
  }
};
