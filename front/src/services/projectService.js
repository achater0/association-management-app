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

// Add a member to a project's committee
export const addProjectMember = async (projectId, userId, committeeRole) => {
  const response = await API.post(`/projects/${projectId}/members`, { user_id: userId, committee_role: committeeRole });
  return response.data;
};

// Remove a member from a project's committee
export const removeProjectMember = async (projectId, userId) => {
  const response = await API.delete(`/projects/${projectId}/members/${userId}`);
  return response.data;
};

// Get end-of-project report (aggregated transactions)
export const getProjectReport = async (projectId) => {
  const response = await API.get(`/projects/${projectId}/report`);
  return response.data; // { report }
};

// Get annual report summary
export const getAnnualReport = async (year) => {
  const response = await API.get(`/projects/reports/annual?year=${year}`);
  return response.data; // { year, total_income, total_expense, net_balance, transactions }
};

export const getLatestAnnualReport = async () => {
  const response = await API.get('/projects/reports/annual/latest');
  return response.data; // { report }
};

// Publish an annual report file for subscribers
export const publishAnnualReport = async (year, file) => {
  const form = new FormData();
  form.append('year', year);
  form.append('report_file', file);
  const response = await API.post('/projects/reports/annual', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return response.data;
};