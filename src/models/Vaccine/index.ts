export interface CreateVaccineDTO {
  name: string;
  image: File | null; // Hoặc File nếu dùng trong frontend
  description: string;
  quantity: number;
  origin: string;
  manufacturer: string;
  price: number;
  dateOfManufacture: Date | string; // Có thể là Date hoặc string (ISO 8601)
  expiryDate: Date | string; // Có thể là Date hoặc string (ISO 8601)
}

export interface UpdateVaccineDTO {
  name?: string;
  image?: File | null; // Hoặc File nếu dùng trong frontend
  quantity: number;
  description?: string;
  origin?: string;
  manufacturer?: string;
  price?: number;
  dateOfManufacture?: Date | string;
  expiryDate?: Date | string;
}

export interface VaccineResponseDTO {
  vaccineId: number;
  name: string;
  image: string;
  description: string;
  origin: string;
  manufacturer: string;
  price: number;
  quantity: number;
  dateOfManufacture: Date | string;
  expiryDate: Date | string;
  createdDate: Date | string;
  createdBy: string;
  modifiedDate: Date | string;
  modifiedBy: string;
  isActive: number;
}
