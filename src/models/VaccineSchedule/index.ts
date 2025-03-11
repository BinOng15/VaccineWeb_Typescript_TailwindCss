export interface CreateVaccineSchedule {
  diseaseId: number;
  vaccineId: number;
  ageInMonths: string;
  doseNumber: number;
}
export interface UpdateVaccineSchedule {
  diseaseId: number | null;
  vaccineId: number | null;
  ageInMonths: string | null;
  doseNumber: number | null;
}
export interface VaccineScheduleResponseDTO {
  vaccineScheduleId: number;
  diseaseId: number;
  vaccineId: number;
  ageInMonths: number;
  doseNumber: number;
  isActive: number;
  createdDate: string;
  createdBy: string;
  modifiedDate: string;
  modifiedBy: string;
  disease: string[];
  vaccine: string[];
}
