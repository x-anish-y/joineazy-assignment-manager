import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

const JWT_EXPIRY = '7d';

export const signToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: JWT_EXPIRY });
};

export const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};
