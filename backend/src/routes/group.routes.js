import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { createGroupSchema, addMemberSchema } from '../validators/group.schema.js';
import * as groupCtrl from '../controllers/group.controller.js';
import * as submissionCtrl from '../controllers/submission.controller.js';

const router = Router();

// All group routes require auth + student role
router.use(auth, requireRole('student'));

router.post('/', validate(createGroupSchema), groupCtrl.createGroup);
router.get('/me', groupCtrl.getMyGroup);
router.get('/me/progress', submissionCtrl.getGroupProgress);
router.post('/me/members', validate(addMemberSchema), groupCtrl.addMember);
router.delete('/me/members/:userId', groupCtrl.removeMember);
router.delete('/me', groupCtrl.deleteGroup);

export default router;
