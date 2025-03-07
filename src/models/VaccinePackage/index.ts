import { IsActive } from "../Type/enum";

export interface CreateVaccinePackageDTO {
  name: string;
  description: string;
  totalPrice: number;
}

export interface UpdateVaccinePackageDTO {
  name?: string;
  description?: string;
}

export interface VaccinePackageResponseDTO {
  packageId: number;
  name: string;
  description: string;
  totalPrice: number;
  isActive: IsActive;
  createdDate: string;
  createdBy: string;
  modifiedDate: string;
  modifiedBy: string;
}
