import API from './api';

// Fetch all association projects
export const getProjects = async () => {
  const response = await API.get('/projects');
  return response.data; // Returns { projects: [...] }
};

// Initiate a new project
export const createProject = async (projectData) => {
  const response = await API.post('/projects', projectData);
  return response.data;
};