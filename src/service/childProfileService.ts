/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosResponse } from "axios";
import { axiosInstance } from "./axiosInstance"; // Giả sử bạn có file cấu hình axios
import {
  ChildProfileResponseDTO,
  PagedChildProfileResponse,
  CreateChildProfileDTO,
  UpdateChildProfileDTO,
} from "../models/ChildProfile";

// Dịch vụ API cho hồ sơ trẻ em
const childProfileService = {
  // Lấy tất cả hồ sơ trẻ em
  getAllChildProfiles: async (): Promise<ChildProfileResponseDTO[]> => {
    try {
      const response: AxiosResponse = await axiosInstance.get("get-all");
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy tất cả hồ sơ trẻ em:", error);
      throw error;
    }
  },

  // Lấy hồ sơ trẻ em theo ID
  getChildProfileById: async (
    childId: number
  ): Promise<ChildProfileResponseDTO> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        `/get-by-id/${childId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy hồ sơ trẻ em theo ID ${childId}:`, error);
      throw error;
    }
  },

  // Lấy danh sách hồ sơ trẻ em phân trang
  getChildProfilesPaged: async (
    pageNumber: number,
    pageSize: number
  ): Promise<PagedChildProfileResponse> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        `api/get-child-paged/${pageNumber}/${pageSize}`
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách hồ sơ trẻ em phân trang:", error);
      throw error;
    }
  },

  // Tìm kiếm hồ sơ trẻ em theo tên
  getChildProfileByName: async (
    keyword: string
  ): Promise<ChildProfileResponseDTO[]> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        `/get-by-name/${keyword}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Lỗi khi tìm kiếm hồ sơ trẻ em theo tên ${keyword}:`,
        error
      );
      throw error;
    }
  },

  // Tạo hồ sơ trẻ em mới
  createChildProfile: async (
    childData: CreateChildProfileDTO
  ): Promise<ChildProfileResponseDTO> => {
    try {
      const formData = new FormData();
      formData.append("UserId", childData.userId.toString()); // Khớp với backend
      formData.append("FullName", childData.fullName); // Khớp với backend
      formData.append("DateOfBirth", childData.dateOfBirth); // Phải là "dd/MM/yyyy"
      formData.append("Gender", childData.gender.toString()); // Khớp với backend
      formData.append("Relationship", childData.relationship.toString()); // Khớp với backend
      formData.append("ProfilePicture", childData.profilePicture); // Khớp với backend

      console.log("Sending formData:", Object.fromEntries(formData)); // Log dữ liệu gửi đi

      const response: AxiosResponse = await axiosInstance.post(
        "/create-child-profile",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error("Lỗi khi tạo hồ sơ trẻ em:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      throw error;
    }
  },
  // Cập nhật hồ sơ trẻ em
  updateChildProfile: async (
    id: number,
    childData: UpdateChildProfileDTO
  ): Promise<ChildProfileResponseDTO> => {
    try {
      const formData = new FormData();
      formData.append("fullName", childData.fullName);
      if (childData.dateOfBirth)
        formData.append("DateOfBirth", childData.dateOfBirth); // Khớp với backend

      if (childData.gender)
        formData.append("gender", childData.gender.toString());
      if (childData.relationship)
        formData.append("relationship", childData.relationship.toString());
      if (childData.profilePicture)
        formData.append("profilePicture", childData.profilePicture);

      const response: AxiosResponse = await axiosInstance.put(
        `/update-child-profile/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật hồ sơ trẻ em ${id}:`, error);
      throw error;
    }
  },

  // Xóa hồ sơ trẻ em
  deleteChildProfile: async (childProfileId: number): Promise<void> => {
    try {
      const response: AxiosResponse = await axiosInstance.delete(
        `/delete-child-profile/${childProfileId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa hồ sơ trẻ em ${childProfileId}:`, error);
      throw error;
    }
  },
};

export default childProfileService;
