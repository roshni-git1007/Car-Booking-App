import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let refreshQueue = [];

function processQueue(error, token = null) {
  refreshQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);  
  });
  refreshQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // If token expired and we haven't retried yet
    if (error?.response?.status === 401 && !original._retry) {
      original._retry = true;

      // If refresh already happening, wait
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      isRefreshing = true;

      try {
        // call refresh endpoint (cookie will be sent because withCredentials true)
        const refreshRes = await api.post("/api/auth/refresh");
        const newAccessToken = refreshRes.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);
        processQueue(null, newAccessToken);

        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(original);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
