import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import * as analyticsCtrl from '../controllers/analytics.controller.js';
import * as submissionCtrl from '../controllers/submission.controller.js';
import { getAllGroups } from '../services/group.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// All admin routes require auth + admin role
router.use(auth, requireRole('admin'));

// Analytics
router.get('/analytics/summary', analyticsCtrl.getSummary);
router.get('/analytics/assignments', analyticsCtrl.getPerAssignmentCompletion);
router.get('/analytics/groups', analyticsCtrl.getPerGroupCompletion);

// Tracking: group-wise and student-wise status per assignment
router.get('/assignments/:id/groups', submissionCtrl.getAssignmentGroupStatus);
router.get('/assignments/:id/students', submissionCtrl.getAssignmentStudentStatus);

// Admin: list all groups with members
router.get('/groups', asyncHandler(async (req, res) => {
  const groups = await getAllGroups();
  res.json({ success: true, data: { groups } });
}));

export default router;
