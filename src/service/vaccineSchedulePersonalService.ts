import { VaccineSchedulePersonalResponseDTO } from "../models/VaccineSchedulePersonal";
import { axiosInstance } from "./axiosInstance";

const vaccineSchedulePersonalService = {
  getAllVaccineSchedulePersonal: async (): Promise<
    VaccineSchedulePersonalResponseDTO[]
  > => {
    try {
      const response = await axiosInstance.get(
        "/api/VaccineSchedulePersonal/get-all-vaccine-schedule-personal"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching all vaccine schedule personal:", error);
      throw error;
    }
  },

  getVaccineSchedulePersonalByChildId: async (
    childId: number
  ): Promise<VaccineSchedulePersonalResponseDTO> => {
    try {
      const response = await axiosInstance.get(
        `/api/VaccineSchedulePersonal/get-vaccine-schedule-personal-by-childId/${childId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching vaccine schedule personal for child ID ${childId}:`,
        error
      );
      throw error;
    }
  },

  addVaccineScheduleForChild: async (childId: number): Promise<number> => {
    try {
      const response = await axiosInstance.post(
        `/api/VaccineSchedulePersonal/add-vaccine-schedule/${childId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error generating vaccine schedule for child ID ${childId}:`,
        error
      );
      throw error;
    }
  },

  deleteVaccineSchedulePersonal: async (id: number): Promise<boolean> => {
    try {
      const response = await axiosInstance.delete(
        `/api/VaccineSchedulePersonal/delete-vaccine-schedule-personal/${id}`
      );
      return response.data.success;
    } catch (error) {
      console.error(
        `Error deleting vaccine schedule personal with ID ${id}:`,
        error
      );
      throw error;
    }
  },
};

export default vaccineSchedulePersonalService;
