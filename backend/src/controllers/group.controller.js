import { asyncHandler } from '../utils/asyncHandler.js';
import * as groupService from '../services/group.service.js';

export const createGroup = asyncHandler(async (req, res) => {
  const { name } = req.validated;
  const group = await groupService.createGroup(name, req.user.id);
  res.status(201).json({ success: true, data: { group } });
});

export const getMyGroup = asyncHandler(async (req, res) => {
  const group = await groupService.getMyGroup(req.user.id);
  if (!group) {
    return res.json({ success: true, data: { group: null } });
  }
  res.json({ success: true, data: { group } });
});

export const addMember = asyncHandler(async (req, res) => {
  const { identifier } = req.validated;
  const member = await groupService.addMember(req.user.id, identifier);
  res.status(201).json({ success: true, data: { member } });
});

export const removeMember = asyncHandler(async (req, res) => {
  await groupService.removeMember(req.user.id, req.params.userId);
  res.json({ success: true, data: { message: 'Member removed' } });
});

export const deleteGroup = asyncHandler(async (req, res) => {
  await groupService.deleteGroup(req.user.id);
  res.json({ success: true, data: { message: 'Group deleted' } });
});
