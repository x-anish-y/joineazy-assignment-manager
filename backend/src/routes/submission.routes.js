import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import * as submissionCtrl from '../controllers/submission.controller.js';

const router = Router();

// Confirm submission — student only (mounted under /assignments/:id/confirm)
// This route is added in the main router

export default router;
