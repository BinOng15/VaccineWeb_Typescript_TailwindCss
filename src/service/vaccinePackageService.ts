import { AxiosResponse } from "axios";
import {
  CreateVaccinePackageDTO,
  UpdateVaccinePackageDTO,
  VaccinePackageResponseDTO,
} from "./../models/VaccinePackage/index";
import { axiosInstance } from "./axiosInstance";
const vaccinePackageService = {
  getAllPackages: async (): Promise<VaccinePackageResponseDTO[]> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        "api/VaccinePackage/get-all"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching all vaccine packages:", error);
      throw error;
    }
  },
  getPackageById: async (
    packageId: number
  ): Promise<VaccinePackageResponseDTO> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        `api/VaccinePackage/get-by-id/${packageId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching package by ID ${packageId}`, error);
      throw error;
    }
  },
  createPackage: async (
    packageData: CreateVaccinePackageDTO
  ): Promise<VaccinePackageResponseDTO> => {
    try {
      const response: AxiosResponse = await axiosInstance.post(
        "api/VaccinePackage/create-vaccine-package",
        packageData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating packages:", error);
      throw error;
    }
  },
  updatePackage: async (
    id: number,
    packageData: UpdateVaccinePackageDTO
  ): Promise<boolean> => {
    try {
      const response: AxiosResponse = await axiosInstance.put(
        `api/VaccinePackage/update-vaccine-package/${id}`,
        packageData
      );
      return response.data;
    } catch (error) {
      console.error(`Error updating packages ${id}:`, error);
      throw error;
    }
  },
  deletePackage: async (packageId: number): Promise<boolean> => {
    try {
      const response: AxiosResponse = await axiosInstance.delete(
        `api/VaccinePackage/delete-vaccine-package/${packageId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting package ${packageId}:`, error);
      throw error;
    }
  },
};
export default vaccinePackageService;
