import { AppointmentStatus, IsActive } from "../Type/enum";

// Interface cho CreateAppointmentDTO
export interface CreateAppointmentDTO {
  userId: number;
  childId: number;
  paymentDetailId?: number | null;
  vaccineId?: number | null;
  vaccinePackageId?: number | null;
  appointmentDate: string; // Chuỗi định dạng YYYY-MM-DDTHH:mm:ss để tương thích với DateTime của backend
}

// Interface cho UpdateAppointmentDTO
export interface UpdateAppointmentDTO {
  userId?: number | null;
  paymentDetailId?: number | null;
  childId?: number | null;
  vaccineId?: number | null;
  vaccinePackageId?: number | null;
  reaction?: string | null;
  appointmentDate?: string | null; // Chuỗi định dạng YYYY-MM-DDTHH:mm:ss
  appointmentStatus?: AppointmentStatus | null;
}

// Interface cho AppointmentResponseDTO
export interface AppointmentResponseDTO {
  appointmentId: number;
  paymentDetailId: number | null;
  userId: number;
  childId: number;
  vaccineId: number | null;
  vaccinePackageId: number | null;
  reaction: string | null;
  appointmentDate: string; // Chuỗi định dạng YYYY-MM-DDTHH:mm:ss
  appointmentStatus: AppointmentStatus;
  isActive: IsActive;
  createdDate: string;
  createdBy: string;
  modifiedDate: string;
  modifiedBy: string;
}
