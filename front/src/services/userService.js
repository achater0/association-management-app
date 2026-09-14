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

// Fetch a single user by id
export const getUser = async (userId) => {
  const response = await API.get(`/users/${userId}`);
  return response.data; // { user }
};

// Upload CIN document for a user
export const uploadCIN = async (userId, file) => {
  const form = new FormData();
  form.append('cin', file);
  const response = await API.post(`/users/${userId}/upload-cin`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data; // { message, user }
};

export const uploadPaymentProof = async (userId, file) => {
  const form = new FormData();
  form.append('payment_proof', file);
  const response = await API.post(`/users/${userId}/upload-payment-proof`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};