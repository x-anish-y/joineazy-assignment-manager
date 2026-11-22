import { z } from 'zod';

export const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(255),
});

export const addMemberSchema = z.object({
  identifier: z.string().min(1, 'Email or student ID is required'),
});
