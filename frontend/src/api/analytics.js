import client from './client.js';

export const getSummary = async () => {
  const response = await client.get('/admin/analytics/summary');
  return response.data;
};

export const getPerAssignmentCompletion = async () => {
  const response = await client.get('/admin/analytics/assignments');
  return response.data;
};

export const getPerGroupCompletion = async () => {
  const response = await client.get('/admin/analytics/groups');
  return response.data;
};

export const getAssignmentGroupStatus = async (assignmentId) => {
  const response = await client.get(`/admin/assignments/${assignmentId}/groups`);
  return response.data;
};

export const getAssignmentStudentStatus = async (assignmentId) => {
  const response = await client.get(`/admin/assignments/${assignmentId}/students`);
  return response.data;
};

export const getAllGroups = async () => {
  const response = await client.get('/admin/groups');
  return response.data;
};
