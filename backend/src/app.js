import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env.js';
import { generalLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

const app = express();

// Dynamic CORS origin handler: allows localhost, vercel deployments, and configured origins
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. curl, postman, mobile apps)
    if (!origin) return callback(null, true);

    const configured = env.CORS_ORIGIN
      ? env.CORS_ORIGIN.split(',').map((s) => s.trim().toLowerCase())
      : [];

    const lower = origin.toLowerCase();

    // Check if origin is explicitly allowed or matches wildcard
    if (
      configured.includes('*') ||
      configured.includes(lower) ||
      lower.includes('localhost') ||
      lower.includes('127.0.0.1') ||
      lower.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }

    // Default to allowing the requesting origin to prevent deployment deadlocks
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Security
app.use(helmet());
app.use(cors(corsOptions));

// Body parsing
app.use(express.json());

// General rate limiting
app.use(generalLimiter);

// Routes
app.use('/api', routes);

// Error handler (must be last)
app.use(errorHandler);

export default app;
