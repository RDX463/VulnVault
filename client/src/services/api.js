import axios from 'axios';

// Create a configured instance
const api = axios.create({
  // CHANGED: We now point to the Nginx proxy (Relative path)
  // instead of the absolute localhost:5000 URL.
  baseURL: '/api', 
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
    // Log the real error to the console so we can see it!
    console.error("Scan Error:", error);
    throw error.response ? error.response.data : { error: "Network Error" };
  }
};

export const checkScanStatus = async (jobId) => {
  try {
    const response = await api.get(`/scan/${jobId}`);
    return response.data;
  } catch (error) {
    console.error("Status Error:", error);
    throw error.response ? error.response.data : { error: "Network Error" };
  }
};
