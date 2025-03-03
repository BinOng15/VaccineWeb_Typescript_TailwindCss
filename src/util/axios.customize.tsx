import axios, { AxiosInstance, AxiosError, AxiosResponse } from "axios";
import { notification } from "antd";

interface ErrorResponse {
  message?: string;
  errors?: { message?: string }[];
}

let setLoading: (loading: boolean) => void = () => {};

export const setGlobalLoadingHandler = (
  loadingHandler: (loading: boolean) => void
) => {
  setLoading = loadingHandler;
};

// Default Axios instance with loading effect
// const defaultAxiosInstance: AxiosInstance = axios.create({
//   baseURL: import.meta.env.VITE_BACKEND_URL,
//   headers: {
//     "content-type": "application/json; charset=UTF-8",
//   },
//   timeout: 300000,
//   timeoutErrorMessage: "Connection timeout exceeded",
// });
const defaultAxiosInstance: AxiosInstance = axios.create({
  baseURL: "https://localhost:7105", // URL của API của bạn
  headers: {
    "Content-Type": "application/json",
    Accept: "*/*",
  },
});
defaultAxiosInstance.interceptors.request.use(
  (config) => {
    setLoading(true);
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    setLoading(false);
    return Promise.reject(error);
  }
);

defaultAxiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    setLoading(false);
    return response.data;
  },
  (err: AxiosError<ErrorResponse>) => {
    setLoading(false);
    const { response } = err;
    if (response) {
      handleErrorByNotification(err);
    }
    return Promise.reject(err);
  }
);

// Separate Axios instance without loading effect for getCurrentLogin
// const axiosWithoutLoading: AxiosInstance = axios.create({
//   baseURL: import.meta.env.VITE_BACKEND_URL,
//   headers: {
//     "content-type": "application/json; charset=UTF-8",
//   },
//   timeout: 300000,
//   timeoutErrorMessage: "Connection timeout exceeded",
// });
const axiosWithoutLoading: AxiosInstance = axios.create({
  baseURL: "https://localhost:7105/api",
  headers: { "Content-Type": "application/json; charset=UTF-8" },
});

axiosWithoutLoading.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosWithoutLoading.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  (err: AxiosError<ErrorResponse>) => {
    const { response } = err;
    if (response) {
      handleErrorByNotification(err);
    }
    return Promise.reject(err);
  }
);

// Error handler
const handleErrorByNotification = (errors: AxiosError<ErrorResponse>) => {
  const data = errors.response?.data as ErrorResponse | undefined;

  let message: string | undefined =
    data?.message ?? errors.message ?? "An error occurred";

  if (!data?.message && data?.errors?.length) {
    const errorMessages = data.errors
      .map((error) => error.message)
      .filter(Boolean);
    if (errorMessages.length) {
      message = errorMessages.join(", ");
    }
  }

  // Kiểm tra nếu message là "Cart null!" hoặc lỗi 404 thì không hiển thị thông báo
  if (
    message === "Cart null!." ||
    message === "Request failed with status code 404"
  ) {
    return Promise.reject(data?.errors ?? { message });
  }

  // Hiển thị thông báo lỗi nếu có
  if (message) {
    notification.error({
      message: "Error",
      description: message,
      duration: 5,
    });
  }

  return Promise.reject(data?.errors ?? { message });
};

export { defaultAxiosInstance, axiosWithoutLoading };
