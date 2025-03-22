import { AxiosResponse } from "axios";
import { axiosInstance } from "./axiosInstance"; // Giả sử bạn có file axiosInstance.ts để cấu hình axios
import {
  CreateVaccineDTO,
  UpdateVaccineDTO,
  VaccineResponseDTO,
} from "../models/Vaccine";

// Các hàm gọi API cho Vaccine
const vaccineService = {
  // Lấy tất cả vaccine
  getAllVaccines: async (): Promise<VaccineResponseDTO[]> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        "api/Vaccine/get-all"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching all vaccines:", error);
      throw error;
    }
  },

  // Lấy vaccine theo ID
  getVaccineById: async (vaccineId: number): Promise<VaccineResponseDTO> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        `api/Vaccine/get-by-id/${vaccineId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching vaccine by ID ${vaccineId}:`, error);
      throw error;
    }
  },

  // Lấy danh sách vaccine phân trang
  getVaccinesPaged: async (
    pageNumber: number,
    pageSize: number
  ): Promise<{ Data: VaccineResponseDTO[]; TotalCount: number }> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        `api/Vaccine/get-vaccine-paged/${pageNumber}/${pageSize}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching paged vaccines:", error);
      throw error;
    }
  },

  // Tìm kiếm vaccine theo tên
  getVaccineByName: async (keyword: string): Promise<VaccineResponseDTO[]> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        `api/Vaccine/get-by-name/${keyword}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error searching vaccines by name ${keyword}:`, error);
      throw error;
    }
  },

  // Tạo vaccine mới
  createVaccine: async (
    vaccineData: CreateVaccineDTO
  ): Promise<VaccineResponseDTO> => {
    try {
      const response: AxiosResponse = await axiosInstance.post(
        "api/Vaccine/create-vaccine",
        vaccineData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Để hỗ trợ IFormFile (image)
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating vaccine:", error);
      throw error;
    }
  },

  // Cập nhật vaccine
  updateVaccine: async (
    id: number,
    vaccineData: UpdateVaccineDTO
  ): Promise<boolean> => {
    try {
      const response: AxiosResponse = await axiosInstance.put(
        `api/Vaccine/update-vaccine/${id}`,
        vaccineData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Để hỗ trợ IFormFile (image)
          },
        }
      );
      return response.data.success; // Trả về boolean từ backend
    } catch (error) {
      console.error(`Error updating vaccine ${id}:`, error);
      throw error;
    }
  },

  // Xóa vaccine
  deleteVaccine: async (vaccineId: number): Promise<boolean> => {
    try {
      const response: AxiosResponse = await axiosInstance.delete(
        `api/Vaccine/delete-vaccine/${vaccineId}`
      );
      return response.data.success; // Giả sử backend trả về boolean
    } catch (error) {
      console.error(`Error deleting vaccine ${vaccineId}:`, error);
      throw error;
    }
  },
};

export default vaccineService;
