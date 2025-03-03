/* eslint-disable @typescript-eslint/no-explicit-any */
import { defaultAxiosInstance, axiosWithoutLoading } from "./axios.customize";

// Định nghĩa các interface cho request/response DTO (dựa trên code backend)
interface LoginRequestDTO {
  email: string;
  password: string;
}

interface CreateUserDTO {
  email: string;
  password: string;
  role?: string;
  [key: string]: any;
}

interface UpdateUserDTO {
  email?: string;
  role?: string;
  [key: string]: any;
}

interface CreateSystemUserDTO {
  email: string;
  password: string;
  role: string;
  [key: string]: any;
}

interface UserResponse {
  userId: string;
  email: string;
  role: string;
}

// Auth APIs
export const login = async (data: LoginRequestDTO) => {
  const response = await defaultAxiosInstance.post("/api/auth/login", data);
  return response.data;
};

// User APIs
export const getCurrentUser = async () => {
  const response = await defaultAxiosInstance.get<UserResponse>(
    "/api/user/current-user"
  );
  return response.data;
};

export const getAllUsers = async () => {
  const response = await defaultAxiosInstance.get("/api/user/get-all-users");
  return response.data;
};

export const registerUser = async (data: CreateUserDTO) => {
  const response = await defaultAxiosInstance.post("/api/user/register", data);
  return response.data;
};

export const getUserById = async (id: number) => {
  const response = await defaultAxiosInstance.get(
    `/api/user/get-user-by-id/${id}`
  );
  return response.data;
};

export const getUsersPaged = async (pageNumber: number, pageSize: number) => {
  const response = await defaultAxiosInstance.get(
    `/api/user/get-user-paged/${pageNumber}/${pageSize}`
  );
  return response.data;
};

export const updateUser = async (id: number, data: UpdateUserDTO) => {
  const response = await defaultAxiosInstance.put(
    `/api/user/update-user-by-id/${id}`,
    data
  );
  return response.data;
};

export const deleteUser = async (id: number) => {
  const response = await defaultAxiosInstance.delete(
    `/api/user/delete-user-by-id/${id}`
  );
  return response.data;
};

export const getUserByEmail = async (email: string) => {
  const response = await defaultAxiosInstance.get(
    `/api/user/get-user-by-email/${email}`
  );
  return response.data;
};

export const getUserByName = async (keyword: string) => {
  const response = await defaultAxiosInstance.get(
    `/api/user/get-user-by-name/${keyword}`
  );
  return response.data;
};

export const createSystemUser = async (data: CreateSystemUserDTO) => {
  const response = await defaultAxiosInstance.post(
    "/api/user/create-system-user",
    data
  );
  return response.data;
};

export const getCurrentUserWithoutLoading = async () => {
  const response = await axiosWithoutLoading.get<UserResponse>(
    "/api/user/current-user"
  );
  return response.data;
};
