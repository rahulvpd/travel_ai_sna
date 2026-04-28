import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  register: (email, password, fullName) => 
    api.post('/auth/register', { email, password, full_name: fullName }),
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
};

export const placeService = {
  getPlaces: (district) => api.get(`/places/${district}`),
};

export const itineraryService = {
  generatePlan: (params) => api.post('/itinerary/generate', params),
  getHistory: () => api.get('/itinerary/list'),
};

export const aiService = {
  nvidiaChat: (params) => api.post('/ai/nvidia/chat', params),
};

export default api;
