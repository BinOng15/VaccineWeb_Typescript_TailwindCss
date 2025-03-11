import { AxiosResponse } from "axios";
import { axiosInstance } from "./axiosInstance";
import {
  CreateVaccineProfileDTO,
  UpdateVaccineProfileDTO,
  VaccineProfileResponseDTO,
} from "../models/VaccineProfile";

const vaccineProfileService = {
  // Lấy tất cả hồ sơ vaccine
  getAllVaccineProfiles: async (): Promise<VaccineProfileResponseDTO[]> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        "api/VaccineProfile/get-all"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching all vaccine profiles:", error);
      throw error;
    }
  },

  // Lấy hồ sơ vaccine theo ID
  getVaccineProfileById: async (
    vaccineProfileId: number
  ): Promise<VaccineProfileResponseDTO> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        `api/VaccineProfile/get-by-id/${vaccineProfileId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching vaccine profile by ID ${vaccineProfileId}:`,
        error
      );
      throw error;
    }
  },

  // Tạo hồ sơ vaccine mới
  createVaccineProfile: async (
    profileData: CreateVaccineProfileDTO
  ): Promise<VaccineProfileResponseDTO> => {
    try {
      const response: AxiosResponse = await axiosInstance.post(
        "api/VaccineProfile/create",
        profileData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating vaccine profile:", error);
      throw error;
    }
  },

  // Cập nhật hồ sơ vaccine
  updateVaccineProfile: async (
    vaccineProfileId: number,
    profileData: UpdateVaccineProfileDTO
  ): Promise<boolean> => {
    try {
      const response: AxiosResponse = await axiosInstance.put(
        `api/VaccineProfile/update/${vaccineProfileId}`,
        profileData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.success;
    } catch (error) {
      console.error(
        `Error updating vaccine profile ${vaccineProfileId}:`,
        error
      );
      throw error;
    }
  },

  // Xóa hồ sơ vaccine
  deleteVaccineProfile: async (vaccineProfileId: number): Promise<boolean> => {
    try {
      const response: AxiosResponse = await axiosInstance.delete(
        `api/VaccineProfile/delete/${vaccineProfileId}`
      );
      return response.data.success;
    } catch (error) {
      console.error(
        `Error deleting vaccine profile ${vaccineProfileId}:`,
        error
      );
      throw error;
    }
  },
};

export default vaccineProfileService;
