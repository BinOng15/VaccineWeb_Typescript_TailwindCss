// models/DiseaseDTO.ts
export interface CreateDiseaseDTO {
    name: string;
    description: string;
    isActive: string; // Sử dụng number (0/1) để khớp với Enum.EnumList.IsActive
  }
  
  export interface UpdateDiseaseDTO {
    name: string;
    description: string;
    isActive: string; // Sử dụng number (0/1) để khớp với Enum.EnumList.IsActive
  }
  
  export interface DiseaseResponseDTO {
    diseaseId: number;
    name: string;
    description: string;
    isActive: string; // Theo backend, IsActive có thể là string ("Active"/"Inactive") hoặc number (0/1)
    createdDate: Date | string; // Có thể là Date hoặc string (ISO 8601)
    createdBy: string;
    modifiedDate: Date | string; // Có thể là Date hoặc string (ISO 8601)
    modifiedBy: string;
  }