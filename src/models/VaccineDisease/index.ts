export interface CreateVaccineDiseaseDTO {
  vaccineId: number;
  diseaseId: number;
}

export interface UpdateVaccineDiseaseDTO {
  vaccineId: number;
  diseaseId: number;
}

export interface VaccineDiseaseResponseDTO {
  vaccineDiseaseId: number;
  vaccineId: number;
  diseaseId: number;
  createdDate: string | Date; // Hoặc Date nếu bạn muốn parse
  createdBy: string;
  modifiedDate: string | Date; // Hoặc Date nếu bạn muốn parse
}
