import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { generalLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();

// Helper to parse single, multiple (comma-separated), or wildcard CORS origins
const parseCorsOrigin = (origin) => {
  if (!origin || origin === '*') return true;
  if (origin.includes(',')) {
    return origin.split(',').map((o) => o.trim());
  }
  return origin;
};

// Security
app.use(helmet());
app.use(cors({
  origin: parseCorsOrigin(env.CORS_ORIGIN),
  credentials: true,
}));

// Body parsing
app.use(express.json());

// General rate limiting
app.use(generalLimiter);

// Routes
app.use('/api', routes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
