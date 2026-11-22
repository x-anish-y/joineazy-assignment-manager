import client from './client.js';

export const getAssignments = async () => {
  const response = await client.get('/assignments');
  return response.data;
};

export const getAssignment = async (id) => {
  const response = await client.get(`/assignments/${id}`);
  return response.data;
};

export const createAssignment = async (data) => {
  const response = await client.post('/assignments', data);
  return response.data;
};

export const updateAssignment = async (id, data) => {
  const response = await client.put(`/assignments/${id}`, data);
  return response.data;
};

export const deleteAssignment = async (id) => {
  const response = await client.delete(`/assignments/${id}`);
  return response.data;
};

export const confirmSubmission = async (assignmentId) => {
  const response = await client.post(`/assignments/${assignmentId}/confirm`);
  return response.data;
};
