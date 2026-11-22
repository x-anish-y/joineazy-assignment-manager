import { Router } from 'express';
import authRoutes from './auth.routes.js';
import groupRoutes from './group.routes.js';
import assignmentRoutes from './assignment.routes.js';
import analyticsRoutes from './analytics.routes.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Auth routes (/api/auth)
router.use('/auth', authRoutes);

// Group routes (/api/groups)
router.use('/groups', groupRoutes);

// Assignment & Confirmation routes (/api/assignments)
router.use('/assignments', assignmentRoutes);

// Admin Analytics & Tracking routes (/api/admin)
router.use('/admin', analyticsRoutes);

export default router;
