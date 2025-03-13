import { AppointmentResponseDTO } from "../Appointment";

export interface CreateVaccineProfileDTO {
  childId: number;
}

export interface UpdateVaccineProfileDTO {
  childId?: number | null;
  appointmentId?: number | null;
  vaccinationDate?: Date | string;
  diseaseId: number;
}

export interface VaccineProfileResponseDTO {
  vaccineProfileId: number;
  vaccineScheduleId: number;
  appointmentId: number | null;
  childId: number;
  diseaseId: number;
  vaccinationDate: Date | string;
  scheduledDate: Date | string;
  doseNumber: number;
  isCompleted: number;
  isActive: number;
  createdDate: Date | string;
  modifiedDate: Date | string;
  createdBy: string;
  modifiedBy: string;
  appointment: AppointmentResponseDTO[];
}
