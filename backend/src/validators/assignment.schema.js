import { z } from 'zod';

export const createAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().optional().nullable(),
  due_date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format'),
  onedrive_link: z.string().url('Invalid URL').refine(
    (val) => val.startsWith('https://'),
    'OneDrive link must be an HTTPS URL'
  ),
  target: z.enum(['all', 'groups'], { errorMap: () => ({ message: 'Target must be "all" or "groups"' }) }),
  group_ids: z.array(z.string().uuid()).optional(),
}).refine(
  (data) => {
    if (data.target === 'groups') {
      return data.group_ids && data.group_ids.length > 0;
    }
    return true;
  },
  { message: 'group_ids required when target is "groups"', path: ['group_ids'] }
);

export const updateAssignmentSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().optional().nullable(),
  due_date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date format').optional(),
  onedrive_link: z.string().url('Invalid URL').refine(
    (val) => val.startsWith('https://'),
    'OneDrive link must be an HTTPS URL'
  ).optional(),
  target: z.enum(['all', 'groups']).optional(),
  group_ids: z.array(z.string().uuid()).optional(),
}).refine(
  (data) => {
    if (data.target === 'groups') {
      return data.group_ids && data.group_ids.length > 0;
    }
    return true;
  },
  { message: 'group_ids required when target is "groups"', path: ['group_ids'] }
);
