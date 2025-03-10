import { AxiosResponse } from "axios";
import {
  CreateSystemUserDTO,
  PagedResponse,
  UpdateUserDTO,
  UserResponseDTO,
} from "../models/User";
import { axiosInstance } from "./axiosInstance";

// Các hàm gọi API
const userService = {
  // Lấy thông tin người dùng hiện tại
  getCurrentUser: async (): Promise<{
    userId: string;
    email: string;
    role: string;
  }> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        "api/User/current-user"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching current user:", error);
      throw error;
    }
  },

  // Lấy tất cả người dùng
  getAllUsers: async (): Promise<UserResponseDTO[]> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        "api/User/get-all-users"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw error;
    }
  },

  // Đăng ký người dùng mới (Customer)
  register: async (formData: FormData): Promise<UserResponseDTO> => {
    try {
      const response: AxiosResponse = await axiosInstance.post(
        "api/User/register",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error registering user:", error);
      throw error;
    }
  },

  // Lấy người dùng theo ID
  getUserById: async (id: number): Promise<UserResponseDTO> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        `api/User/get-user-by-id/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching user by id ${id}:`, error);
      throw error;
    }
  },
  // Lấy danh sách người dùng phân trang
  getUsersPaged: async (
    pageNumber: number,
    pageSize: number
  ): Promise<PagedResponse> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        `api/User/get-user-paged/${pageNumber}/${pageSize}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching paged users:", error);
      throw error;
    }
  },

  // Cập nhật thông tin người dùng
  updateUser: async (id: number, userData: UpdateUserDTO): Promise<boolean> => {
    try {
      const response: AxiosResponse = await axiosInstance.put(
        `api/User/update-user-by-id/${id}`,
        userData
      );
      return response.data.success;
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      throw error;
    }
  },

  // Xóa người dùng
  deleteUser: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`api/User/delete-user-by-id/${id}`);
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      throw error;
    }
  },

  // Lấy người dùng theo email
  getUserByEmail: async (email: string): Promise<UserResponseDTO> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        `api/User/get-user-by-email/${email}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching user by email ${email}:`, error);
      throw error;
    }
  },

  // Tìm kiếm người dùng theo tên
  getUserByName: async (keyword: string): Promise<UserResponseDTO[]> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        `api/User/get-user-by-name/${keyword}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error searching users by name ${keyword}:`, error);
      throw error;
    }
  },

  // Tạo người dùng hệ thống (Staff hoặc Doctor)
  createSystemUser: async (
    userData: CreateSystemUserDTO
  ): Promise<UserResponseDTO> => {
    try {
      const response: AxiosResponse = await axiosInstance.post(
        "api/User/create-system-user",
        userData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating system user:", error);
      throw error;
    }
  },
};

export default userService;
