import API from './api';

export const getProjects = async () => {
  const response = await API.get('/projects');
  return response.data; // Returns { projects: [...] }
};