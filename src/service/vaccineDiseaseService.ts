import { AxiosResponse } from "axios";
import { axiosInstance } from "./axiosInstance"; // Giả sử bạn có file axiosInstance.ts để cấu hình axios
import {
  VaccineDiseaseResponseDTO,
  CreateVaccineDiseaseDTO,
  UpdateVaccineDiseaseDTO,
} from "../models/VaccineDisease";

// Các hàm gọi API cho VaccineDisease
const vaccineDiseaseService = {
  // Lấy tất cả vaccine-disease relationships
  getAllVaccineDiseases: async (): Promise<VaccineDiseaseResponseDTO[]> => {
    try {
      const response: AxiosResponse<VaccineDiseaseResponseDTO[]> =
        await axiosInstance.get("api/VaccineDisease/get-all");
      return response.data;
    } catch (error) {
      console.error("Error fetching all vaccine-disease relationships:", error);
      throw error;
    }
  },

  // Tạo mới vaccine-disease relationship
  createVaccineDisease: async (
    vaccineDiseaseData: CreateVaccineDiseaseDTO
  ): Promise<VaccineDiseaseResponseDTO> => {
    try {
      const response: AxiosResponse<VaccineDiseaseResponseDTO> =
        await axiosInstance.post(
          "api/VaccineDisease/create",
          vaccineDiseaseData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      return response.data;
    } catch (error) {
      console.error("Error creating vaccine-disease relationship:", error);
      throw error;
    }
  },

  // Cập nhật vaccine-disease relationship
  updateVaccineDisease: async (
    id: number,
    vaccineDiseaseData: UpdateVaccineDiseaseDTO
  ): Promise<boolean> => {
    try {
      const response: AxiosResponse<boolean> = await axiosInstance.put(
        `api/VaccineDisease/update/${id}`,
        vaccineDiseaseData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error updating vaccine-disease relationship ${id}:`,
        error
      );
      throw error;
    }
  },
};

export default vaccineDiseaseService;
