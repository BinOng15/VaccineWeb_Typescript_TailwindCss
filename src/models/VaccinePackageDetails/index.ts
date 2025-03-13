import { VaccineResponseDTO } from "../Vaccine";
import { VaccinePackageResponseDTO } from "../VaccinePackage";

export interface CreateVaccinePackageDetailDTO {
  vaccinePackageId: number;
  vaccineId: number;
  doseNumber: number; 
}

export interface UpdateVaccinePackageDetailDTO {
  vaccinePackageId?: number; 
  vaccineId?: number; 
  doseNumber?: number; 
}

export interface VaccinePackageDetailResponseDTO {
  vaccinePackageDetailId: number; 
  vaccinePackageId: number; 
  vaccineId: number; 
  doseNumber: number; 
  isActive: string; 
  vaccinePackage: VaccinePackageResponseDTO; 
  vaccine: VaccineResponseDTO; 
}