import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD ? 'https://ihros-api.onrender.com/api' : 'http://localhost:5000/api');
const api = axios.create({ baseURL: apiBaseUrl, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ihros_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('ihros_token');
    localStorage.removeItem('ihros_user');
  }
  return Promise.reject(error);
});

export default api;
