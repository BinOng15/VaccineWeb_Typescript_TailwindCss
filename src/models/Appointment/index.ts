import { AppointmentStatus, IsActive } from "../Type/enum";

export interface CreateAppointmentDTO {
  paymentId: number | null;
  childId: number;
  vaccineId?: number;
  vaccinePackageId?: number;
  appointmentDate: string;
  appointmentStatus: AppointmentStatus;
  isActive: IsActive;
}

export interface UpdateAppointmentDTO {
  paymentId: number;
  childId: number;
  vaccineId: number;
  vaccinePackageId: number;
  appointmentDate: string;
  appointmentStatus: AppointmentStatus;
  isActive: IsActive;
  modifiedDate: string;
  modifiedBy: string;
}

export interface AppointmentResponseDTO {
  appointmentId: number;
  paymentId: number | null;
  vaccineId: number;
  vaccinePackageId: number;
  appointmentDate: string;
  appointmentStatus: AppointmentStatus;
  isActive: IsActive;
  createdDate: string;
  createdBy: string;
  modifiedDate: string;
  modifiedBy: string;
}
