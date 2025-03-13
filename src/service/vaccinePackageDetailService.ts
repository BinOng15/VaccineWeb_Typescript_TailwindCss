import { UpdateVaccinePackageDetailDTO } from "./../models/VaccinePackageDetails/index";
import { AxiosResponse } from "axios";
import { axiosInstance } from "./axiosInstance";
import {
  VaccinePackageDetailResponseDTO,
  CreateVaccinePackageDetailDTO,
} from "../models/VaccinePackageDetails";

const vaccinePackageDetailService = {
  getAllPackagesDetail: async (): Promise<
    VaccinePackageDetailResponseDTO[]
  > => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        "api/VaccinePackageDetail/get-all"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching all vaccine packages:", error);
      throw error;
    }
  },
  getPackageDetailById: async (
    id: number
  ): Promise<VaccinePackageDetailResponseDTO> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        `api/VaccinePackageDetail/get-by-id/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching package by ID ${id}`, error);
      throw error;
    }
  },
  getPackageByVaccinePackageDetailID: async (
    vaccinePackageID: number
  ): Promise<VaccinePackageDetailResponseDTO> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        `api/VaccinePackageDetail/get-by-vaccine-package-id/${vaccinePackageID}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching package by vaccinePackageID ${vaccinePackageID}`,
        error
      );
      throw error;
    }
  },
  createPackageDetail: async (
    diseaseData: CreateVaccinePackageDetailDTO
  ): Promise<CreateVaccinePackageDetailDTO> => {
    try {
      const response: AxiosResponse = await axiosInstance.post(
        "api/VaccinePackageDetail/create",
        diseaseData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating VaccinePackageDetail:", error);
      throw error;
    }
  },
  updatePackageDetail: async (
    id: number,
    packageData: UpdateVaccinePackageDetailDTO // Thay đổi từ UpdateVaccinePackageDetailDTO thành FormData
  ): Promise<void> => {
    try {
      await axiosInstance.put(
        `api/VaccinePackageDetail/update/${id}`,
        packageData
      );
    } catch (error) {
      console.error(`Error updating VaccinePackageDetail ${id}:`, error);
      throw error;
    }
  },
  deletePackageDetail: async (packageId: number): Promise<boolean> => {
    try {
      const response: AxiosResponse = await axiosInstance.delete(
        `api/VaccinePackageDetail/delete/${packageId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting package ${packageId}:`, error);
      throw error;
    }
  },
  getPackageDetailPaged: async (
    pageNumber: number,
    pageSize: number
  ): Promise<VaccinePackageDetailResponseDTO> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        `api/VaccinePackageDetail/get-paged/${pageNumber}/${pageSize}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching paged package:", error);
      throw error;
    }
  },
};

export default vaccinePackageDetailService;
