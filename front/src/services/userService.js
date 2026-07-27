import API from './api';

export const getUserBalance = async (userId) => {
  const response = await API.get(`/users/${userId}/balance`);
  return response.data; // Returns { user, financials }
};