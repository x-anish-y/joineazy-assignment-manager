import { asyncHandler } from '../utils/asyncHandler.js';
import * as analyticsService from '../services/analytics.service.js';

export const getSummary = asyncHandler(async (req, res) => {
  const summary = await analyticsService.getSummary();
  res.json({ success: true, data: { summary } });
});

export const getPerAssignmentCompletion = asyncHandler(async (req, res) => {
  const assignments = await analyticsService.getPerAssignmentCompletion();
  res.json({ success: true, data: { assignments } });
});

export const getPerGroupCompletion = asyncHandler(async (req, res) => {
  const groups = await analyticsService.getPerGroupCompletion();
  res.json({ success: true, data: { groups } });
});
