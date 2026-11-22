import client from './client.js';

export const getMyGroup = async () => {
  const response = await client.get('/groups/me');
  return response.data;
};

export const createGroup = async (name) => {
  const response = await client.post('/groups', { name });
  return response.data;
};

export const addMember = async (identifier) => {
  const response = await client.post('/groups/me/members', { identifier });
  return response.data;
};

export const removeMember = async (userId) => {
  const response = await client.delete(`/groups/me/members/${userId}`);
  return response.data;
};

export const deleteGroup = async () => {
  const response = await client.delete('/groups/me');
  return response.data;
};

export const getGroupProgress = async () => {
  const response = await client.get('/groups/me/progress');
  return response.data;
};
