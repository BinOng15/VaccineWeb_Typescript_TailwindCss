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
  isActive: number;
  modifiedDate: string;
  modifiedBy: string;
}

export interface AppointmentResponseDTO {
  appointmentId: number;
  paymentId: number | null;
  childId: number;
  vaccineId: number | null;
  vaccinePackageId: number | null;
  appointmentDate: string;
  appointmentStatus: number;
  isActive: number;
  createdDate: string;
  createdBy: string;
  reaction: string;
  modifiedDate: string;
  modifiedBy: string;
}
