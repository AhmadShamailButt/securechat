import api from './api';

/**
 * Group Service
 * Handles all group-related API calls including messaging and encryption
 */

// ==================== Group Management ====================

export const createGroup = async (groupData) => {
  const response = await api.post('/api/groups', groupData);
  return response.data;
};

export const getGroups = async () => {
  const response = await api.get('/api/groups');
  return response.data;
};

export const getGroupDetails = async (groupId) => {
  const response = await api.get(`/api/groups/${groupId}`);
  return response.data;
};

export const addMemberToGroup = async (groupId, userId) => {
  const response = await api.post(`/api/groups/${groupId}/members`, { userId });
  return response.data;
};

export const sendGroupRequest = async (groupId, userId) => {
  const response = await api.post(`/api/groups/${groupId}/request/${userId}`);
  return response.data;
};

export const getGroupRequests = async () => {
  const response = await api.get('/api/groups/requests/all');
  return response.data;
};

export const acceptGroupRequest = async (requestId) => {
  const response = await api.post(`/api/groups/requests/${requestId}/accept`);
  return response.data;
};

export const rejectGroupRequest = async (requestId) => {
  const response = await api.post(`/api/groups/requests/${requestId}/reject`);
  return response.data;
};

// ==================== Group Messaging ====================

export const sendGroupMessage = async (groupId, messageData) => {
  const response = await api.post(`/api/groups/${groupId}/messages`, messageData);
  return response.data;
};

export const getGroupMessages = async (groupId, limit = 50, before = null) => {
  const params = { limit };
  if (before) {
    params.before = before;
  }
  const response = await api.get(`/api/groups/${groupId}/messages`, { params });
  return response.data;
};

export const markGroupMessageAsRead = async (groupId, messageId) => {
  const response = await api.post(`/api/groups/${groupId}/messages/${messageId}/read`);
  return response.data;
};

// ==================== Group Key Management ====================

export const storeGroupKey = async (groupId, keyData) => {
  const response = await api.post(`/api/groups/${groupId}/keys`, keyData);
  return response.data;
};

export const getGroupKey = async (groupId, userId) => {
  const response = await api.get(`/api/groups/${groupId}/keys/${userId}`);
  return response.data;
};

export default {
  // Group Management
  createGroup,
  getGroups,
  getGroupDetails,
  addMemberToGroup,
  sendGroupRequest,
  getGroupRequests,
  acceptGroupRequest,
  rejectGroupRequest,

  // Group Messaging
  sendGroupMessage,
  getGroupMessages,
  markGroupMessageAsRead,

  // Group Key Management
  storeGroupKey,
  getGroupKey,
};
