import { asyncHandler } from '../utils/asyncHandler.js';
import * as submissionService from '../services/submission.service.js';

export const confirmSubmission = asyncHandler(async (req, res) => {
  const submission = await submissionService.confirmSubmission(req.params.id, req.user.id);
  res.status(201).json({ success: true, data: { submission } });
});

export const getGroupProgress = asyncHandler(async (req, res) => {
  const progress = await submissionService.getGroupProgress(req.user.id);
  res.json({ success: true, data: { progress } });
});

export const getAssignmentGroupStatus = asyncHandler(async (req, res) => {
  const groups = await submissionService.getAssignmentGroupStatus(req.params.id);
  res.json({ success: true, data: { groups } });
});

export const getAssignmentStudentStatus = asyncHandler(async (req, res) => {
  const students = await submissionService.getAssignmentStudentStatus(req.params.id);
  res.json({ success: true, data: { students } });
});
