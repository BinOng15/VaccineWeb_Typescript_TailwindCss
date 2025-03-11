import { IsCompleted } from "../Type/enum";

export interface CreateVaccineProfileDTO {
  childId: number;
  diseaseId: number;
  vaccinationDate?: string | null;
  isCompleted: IsCompleted;
}

export interface UpdateVaccineProfileDTO {
  childId?: number | null;
  vaccinationDate?: Date | string;
  reaction?: string | null;
  vaccinatedDiseaseIds?: number[] | null;
  vaccinatedVaccineScheduleIds?: number[] | null;
}

export interface VaccineProfileResponseDTO {
  vaccineProfileId: number;
  appointmentId: number | null;
  childId: number;
  diseaseId: number;
  vaccinationDate: Date | string;
  isCompleted: number;
  isActive: number;
  createdDate: Date | string;
  modifiedDate: Date | string;
  createdBy: string;
  modifiedBy: string;
}
