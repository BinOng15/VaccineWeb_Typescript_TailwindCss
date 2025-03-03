/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { APILink } from "../components/Const/ApiLink";
import store from "../redux/store";
import { startLoading, stopLoading } from "../redux/loadingSlice";
import { ROUTER_URL } from "../components/Const/Router.Const";

export const axiosInstance = axios.create({
  baseURL: APILink,
  headers: {
    "content-type": "application/json; charset=UTF-8",
  },
  timeout: 300000,
  timeoutErrorMessage: `Connection is timeout exceeded`,
});

export const getState = (store: any) => {
  return store.getState();
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
  (err) => {
    store.dispatch(stopLoading());
    const { response } = err;
    if (response && response.status === 401) {
      setTimeout(() => {
        sessionStorage.removeItem("token");
        window.location.href = ROUTER_URL.SIGN_IN;
      }, 2000);
    }
    return handleErrorByToast(err);
  }
);

const handleErrorByToast = (error: any) => {
  store.dispatch(stopLoading());
  return Promise.reject(error);
};
