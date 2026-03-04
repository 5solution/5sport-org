import Axios, { AxiosError, AxiosRequestConfig } from "axios";
import { toast } from "sonner";

export const AXIOS_INSTANCE = Axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
AXIOS_INSTANCE.interceptors.request.use(
  (config) => {
    // You can add auth token from localStorage or session here
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor for error handling
AXIOS_INSTANCE.interceptors.response.use(
  (response) => {
    // Unwrap standard API envelope: { status: 'success', code, data }
    if (
      response.data &&
      typeof response.data === "object" &&
      "status" in response.data &&
      "data" in response.data
    ) {
      response.data = response.data.data;
    }
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const data = error.response?.data as any;
    const message = data?.message || data?.error || error.message;

    if (status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
      }
      toast.error("Session expired. Please log in again.");
    } else if (status === 400) {
      toast.error(message || "Invalid request.");
    } else if (status && status >= 500) {
      toast.error("Server error. Please try again later.");
    }

    return Promise.reject(error);
  },
);

export const defaultMutator = <T>(
  url: string,
  config?: RequestInit,
): Promise<T> => {
  return AXIOS_INSTANCE({
    url,
    method: config?.method as AxiosRequestConfig["method"],
    headers: config?.headers as AxiosRequestConfig["headers"],
    data: config?.body,
  }).then((res) => res.data);
};
