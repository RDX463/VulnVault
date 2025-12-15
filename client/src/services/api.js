import axios from 'axios';

// Create a configured instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Pointing to your Node Backend
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const triggerScan = async (target, type) => {
  try {
    const response = await api.post('/scan', { target, scanType: type });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { error: "Network Error" };
  }
};
