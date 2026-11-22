import { Router } from 'express';
import authRoutes from './auth.routes.js';
import groupRoutes from './group.routes.js';
import assignmentRoutes from './assignment.routes.js';
import analyticsRoutes from './analytics.routes.js';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import * as submissionCtrl from '../controllers/submission.controller.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Auth
router.use('/auth', authRoutes);

// Groups
router.use('/groups', groupRoutes);

// Assignments
router.use('/assignments', assignmentRoutes);

// Confirm submission (student)
router.post('/assignments/:id/confirm', auth, requireRole('student'), submissionCtrl.confirmSubmission);

// Admin routes
router.use('/admin', analyticsRoutes);

export default router;
