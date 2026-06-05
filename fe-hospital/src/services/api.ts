import axios from 'axios';

const API_BASE_URL = 'http://localhost:1111';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the token to requests if it exists in localStorage
api.interceptors.request.use(
  (config) => {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const { state } = JSON.parse(authStorage);
      if (state.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle response errors, specifically 401 Unauthorized
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Dispatch a global custom event to trigger logout and redirect.
      // This design avoids circular dependencies between api service and authStore.
      window.dispatchEvent(new Event('unauthorized-api-call'));
    }
    return Promise.reject(error);
  }
);

export default api;
