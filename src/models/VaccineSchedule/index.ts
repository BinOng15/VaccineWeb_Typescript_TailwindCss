import { DiseaseResponseDTO } from "../Disease";

export interface CreateVaccineSchedule {
  diseaseId: number;
  ageInMonths: string;
  doseNumber: number;
}
export interface UpdateVaccineSchedule {
  diseaseId: number | null;
  ageInMonths: string | null;
  doseNumber: number | null;
}
export interface VaccineScheduleResponseDTO {
  vaccineScheduleId: number;
  diseaseId: number;
  ageInMonths: number;
  doseNumber: number;
  isActive: number;
  createdDate: string;
  createdBy: string;
  modifiedDate: string;
  modifiedBy: string;
  disease: DiseaseResponseDTO[];
}
