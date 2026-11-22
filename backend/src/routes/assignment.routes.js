import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { createAssignmentSchema, updateAssignmentSchema } from '../validators/assignment.schema.js';
import * as assignmentCtrl from '../controllers/assignment.controller.js';
import * as submissionCtrl from '../controllers/submission.controller.js';

const router = Router();

// All assignment routes require auth
router.use(auth);

// List & detail — both roles
router.get('/', assignmentCtrl.listAssignments);
router.get('/:id', assignmentCtrl.getAssignment);

// Confirm submission — student only
router.post('/:id/confirm', requireRole('student'), submissionCtrl.confirmSubmission);

// Admin only: create, update, delete
router.post('/', requireRole('admin'), validate(createAssignmentSchema), assignmentCtrl.createAssignment);
router.put('/:id', requireRole('admin'), validate(updateAssignmentSchema), assignmentCtrl.updateAssignment);
router.delete('/:id', requireRole('admin'), assignmentCtrl.deleteAssignment);

export default router;
