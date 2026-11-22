import { asyncHandler } from '../utils/asyncHandler.js';
import * as assignmentService from '../services/assignment.service.js';

export const createAssignment = asyncHandler(async (req, res) => {
  const assignment = await assignmentService.createAssignment(req.validated, req.user.id);
  res.status(201).json({ success: true, data: { assignment } });
});

export const updateAssignment = asyncHandler(async (req, res) => {
  const assignment = await assignmentService.updateAssignment(req.params.id, req.validated);
  res.json({ success: true, data: { assignment } });
});

export const deleteAssignment = asyncHandler(async (req, res) => {
  await assignmentService.deleteAssignment(req.params.id);
  res.json({ success: true, data: { message: 'Assignment deleted' } });
});

export const getAssignment = asyncHandler(async (req, res) => {
  const assignment = await assignmentService.getAssignmentById(req.params.id, req.user);
  res.json({ success: true, data: { assignment } });
});

export const listAssignments = asyncHandler(async (req, res) => {
  let assignments;
  if (req.user.role === 'admin') {
    assignments = await assignmentService.listAssignmentsAdmin();
  } else {
    assignments = await assignmentService.listAssignmentsStudent(req.user.id);
  }
  res.json({ success: true, data: { assignments } });
});
