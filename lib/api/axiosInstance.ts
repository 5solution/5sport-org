import Axios, { AxiosError, AxiosRequestConfig } from 'axios';

export const AXIOS_INSTANCE = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
AXIOS_INSTANCE.interceptors.request.use(
  (config) => {
    // You can add auth token from localStorage or session here
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
AXIOS_INSTANCE.interceptors.response.use(
  (response) => {
    // Unwrap standard API envelope: { status: 'success', code, data }
    if (
      response.data &&
      typeof response.data === 'object' &&
      'status' in response.data &&
      'data' in response.data
    ) {
      response.data = response.data.data;
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        // Optionally redirect to login page
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const defaultMutator = <T>(
  url: string,
  config?: RequestInit
): Promise<T> => {
  return AXIOS_INSTANCE({
    url,
    method: config?.method as AxiosRequestConfig['method'],
    headers: config?.headers as AxiosRequestConfig['headers'],
    data: config?.body,
  }).then((res) => res.data);
};
