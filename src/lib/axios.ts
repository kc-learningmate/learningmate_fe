import axios, { AxiosError } from 'axios';

const baseUrl = import.meta.env.VITE_BASE_URL;

export const publicApi = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

export const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

type FailedQueueItem = {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
};

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(null);
    }
  });

  failedQueue = [];
};

export const setInterceptors = (logout: () => void) => {
  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config;
      if (!originalRequest) {
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => {
            return api(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await axios.post(
            `${baseUrl}/auth/refresh-token`,
            {},
            {
              withCredentials: true,
            }
          );

          processQueue(null);

          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError);
          logout();

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );
};
