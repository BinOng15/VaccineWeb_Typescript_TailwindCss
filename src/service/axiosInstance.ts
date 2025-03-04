/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { APILink } from "../components/Const/ApiLink";
import store from "../redux/store";
import { startLoading, stopLoading } from "../redux/loadingSlice";
import { ROUTER_URL } from "../components/Const/Router.Const";

export const axiosInstance = axios.create({
  baseURL: APILink,
  headers: {
    "content-type": "application/json",
  },
  timeout: 300000,
  timeoutErrorMessage: `Connection is timeout exceeded`,
  responseEncoding: "utf8", // Đảm bảo response được decode bằng UTF-8
});

export const getState = (store: any) => {
  return store.getState();
};

// Biến trạng thái và queue để quản lý refresh token
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const logout = (navigate: (path: string) => void) => {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("user");
  navigate(ROUTER_URL.SIGN_IN); // Điều hướng đến /login mà không reload
};

axiosInstance.interceptors.request.use(
  (config) => {
    store.dispatch(startLoading());
    const token = sessionStorage.getItem("accessToken");
    if (config.headers === undefined) config.headers;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => {
    store.dispatch(stopLoading());
    return handleErrorByToast(err);
  },
);

axiosInstance.interceptors.response.use(
  (response) => {
    store.dispatch(stopLoading());
    return response;
  },
  async (err) => {
    store.dispatch(stopLoading());
    const { response } = err;
    const originalRequest = err.config;

    if (response && response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = sessionStorage.getItem("refreshToken");
      if (!refreshToken) {
        // Nếu không có refresh token, redirect đến trang đăng nhập
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
        setTimeout(() => {
          window.location.href = ROUTER_URL.SIGN_IN;
        }, 2000);
        return Promise.reject(err);
      }

      try {
        // Gọi API refresh token (giả sử backend có endpoint /api/auth/refresh-token)
        const refreshResponse = await axios.post(`${axiosInstance.defaults.baseURL}/auth/refresh-token`, {
          refreshToken: refreshToken,
        });

        const newAccessToken = refreshResponse.data.accessToken;
        const newRefreshToken = refreshResponse.data.refreshToken;

        // Lưu token mới vào sessionStorage
        sessionStorage.setItem("accessToken", newAccessToken);
        sessionStorage.setItem("refreshToken", newRefreshToken);

        // Cập nhật header cho request gốc
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        // Xử lý queue của các request bị lỗi
        processQueue(null, newAccessToken);

        // Reload trang để cập nhật giao diện với token mới
        window.location.reload();

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Lỗi khi làm mới token:", refreshError);
        // Xử lý khi refresh token thất bại (logout hoặc redirect)
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
        setTimeout(() => {
          window.location.href = ROUTER_URL.SIGN_IN;
        }, 2000);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return handleErrorByToast(err);
  }
);

const handleErrorByToast = (error: any) => {
  store.dispatch(stopLoading());
  return Promise.reject(error);
};