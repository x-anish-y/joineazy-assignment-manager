import { Router } from 'express';
import authRoutes from './auth.routes.js';
import groupRoutes from './group.routes.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Auth
router.use('/auth', authRoutes);

// Groups
router.use('/groups', groupRoutes);

export default router;
