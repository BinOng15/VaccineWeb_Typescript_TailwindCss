import {
  VaccineScheduleResponseDTO,
  CreateVaccineSchedule,
  UpdateVaccineSchedule,
} from "../models/VaccineSchedule";
import { axiosInstance } from "./axiosInstance";

const BASE_URL = "/api/VaccineSchedule";

const vaccineScheduleService = {
  getAllVaccineSchedules: async (): Promise<VaccineScheduleResponseDTO[]> => {
    try {
      const response = await axiosInstance.get(`${BASE_URL}/get-all`);
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch vaccine schedules");
    }
  },

  getVaccineScheduleById: async (
    vaccineScheduleId: number
  ): Promise<VaccineScheduleResponseDTO> => {
    try {
      const response = await axiosInstance.get(
        `${BASE_URL}/get-by-id/${vaccineScheduleId}`
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch vaccine schedule by ID");
    }
  },

  createVaccineSchedule: async (
    data: CreateVaccineSchedule
  ): Promise<VaccineScheduleResponseDTO> => {
    try {
      const response = await axiosInstance.post(`${BASE_URL}/create`, data);
      return response.data;
    } catch (error) {
      throw new Error("Failed to create vaccine schedule");
    }
  },

  updateVaccineSchedule: async (
    vaccineScheduleId: number,
    data: UpdateVaccineSchedule
  ): Promise<VaccineScheduleResponseDTO> => {
    try {
      const response = await axiosInstance.put(
        `${BASE_URL}/update/${vaccineScheduleId}`,
        data
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to update vaccine schedule");
    }
  },

  deleteVaccineSchedule: async (vaccineScheduleId: number): Promise<void> => {
    try {
      await axiosInstance.delete(`${BASE_URL}/delete/${vaccineScheduleId}`);
    } catch (error) {
      throw new Error("Failed to delete vaccine schedule");
    }
  },
};

export default vaccineScheduleService;
