import bcrypt from 'bcrypt';
import { query } from '../config/db.js';
import { signToken } from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const SALT_ROUNDS = 12;

export const register = asyncHandler(async (req, res) => {
  const { name, email, student_id, password } = req.validated;

  // Check if email already exists
  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw ApiError.conflict('Email already registered');
  }

  // Check if student_id already exists (if provided)
  if (student_id) {
    const existingSid = await query('SELECT id FROM users WHERE student_id = $1', [student_id]);
    if (existingSid.rows.length > 0) {
      throw ApiError.conflict('Student ID already registered');
    }
  }

  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

  const { rows } = await query(
    `INSERT INTO users (name, email, student_id, password_hash, role)
     VALUES ($1, $2, $3, $4, 'student')
     RETURNING id, name, email, student_id, role, created_at`,
    [name, email, student_id || null, password_hash]
  );

  const user = rows[0];
  const token = signToken({ id: user.id, role: user.role });

  res.status(201).json({
    success: true,
    data: { user, token },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.validated;

  const { rows } = await query(
    'SELECT id, name, email, student_id, password_hash, role FROM users WHERE email = $1',
    [email]
  );

  if (rows.length === 0) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const user = rows[0];
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = signToken({ id: user.id, role: user.role });

  // Don't send password_hash
  delete user.password_hash;

  res.json({
    success: true,
    data: { user, token },
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
});
