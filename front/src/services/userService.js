import API from './api';

// Fetch all association members
export const getUsers = async () => {
  const response = await API.get('/users');
  return response.data; // Returns { users: [...] }
};

// Register a new member account
export const createUser = async (userData) => {
  const response = await API.post('/users', userData);
  return response.data;
};

// Update member role (Président, Trésorier, Secrétaire, Abonné, etc.)
export const updateUserRole = async (userId, role) => {
  const response = await API.patch(`/users/${userId}/role`, { role });
  return response.data;
};

// Fetch specific member financial status & balance
export const getUserBalance = async (userId) => {
  const response = await API.get(`/users/${userId}/balance`);
  return response.data; // Returns { user, financials }
};