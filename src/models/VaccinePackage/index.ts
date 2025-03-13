import { IsActive } from "../Type/enum";

export interface CreateVaccinePackageDTO {
  name: string;
  description: string;
  ageInMonths: number;
  totalDoses: number;
}

export interface UpdateVaccinePackageDTO {
  name?: string;
  description?: string;
  totalDoses?: number;
  ageInMonths?: number;
}

export interface VaccinePackageResponseDTO {
  vaccinePackageId: number;
  name: string;
  description: string;
  totalPrice: number;
  ageInMonths: number;
  totalDoses: number;
  isActive: IsActive;
  createdDate: string;
  createdBy: string;
  modifiedDate: string;
  modifiedBy: string;
}
