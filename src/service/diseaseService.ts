import { AxiosResponse } from "axios";
import { axiosInstance } from "./axiosInstance"; // Giả sử bạn có file axiosInstance.ts để cấu hình axios
import {
  CreateDiseaseDTO,
  DiseaseResponseDTO,
  UpdateDiseaseDTO,
} from "../models/Disease";

// Các hàm gọi API cho Disease
const diseaseService = {
  // Lấy tất cả diseases
  getAllDiseases: async (): Promise<DiseaseResponseDTO[]> => {
    try {
      const response: AxiosResponse<DiseaseResponseDTO[]> = await axiosInstance.get(
        "api/Disease/get-all"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching all diseases:", error);
      throw error;
    }
  },

  // Lấy disease theo ID
  getDiseaseById: async (diseaseId: number): Promise<DiseaseResponseDTO> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        `api/Disease/get-disease-by-id/${diseaseId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching disease by ID ${diseaseId}:`, error);
      throw error;
    }
  },

  // Lấy danh sách diseases phân trang
  getDiseasesPaged: async (
    pageNumber: number,
    pageSize: number
  ): Promise<{ Data: DiseaseResponseDTO[]; TotalCount: number }> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        `api/Disease/get-disease-paged/${pageNumber}/${pageSize}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching paged diseases:", error);
      throw error;
    }
  },

  // Tạo disease mới
  createDisease: async (
    diseaseData: CreateDiseaseDTO
  ): Promise<DiseaseResponseDTO> => {
    try {
      const response: AxiosResponse = await axiosInstance.post(
        "api/Disease/create-disease",
        diseaseData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating disease:", error);
      throw error;
    }
  },

  // Cập nhật disease
  updateDisease: async (
    id: number,
    diseaseData: UpdateDiseaseDTO
  ): Promise<void> => {
    try {
      await axiosInstance.put(
        `api/Disease/update-disease-by-id/${id}`,
        diseaseData
      );
    } catch (error) {
      console.error(`Error updating disease ${id}:`, error);
      throw error;
    }
  },

  // Xóa disease
  deleteDisease: async (diseaseId: number): Promise<void> => {
    try {
      await axiosInstance.delete(
        `api/Disease/delete-disease-by-id/${diseaseId}`
      );
    } catch (error) {
      console.error(`Error deleting disease ${diseaseId}:`, error);
      throw error;
    }
  },
};

export default diseaseService;
