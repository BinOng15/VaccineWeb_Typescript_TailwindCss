import { IsActive } from "../Type/enum";
export interface CreatePaymentDetailDTO {
  paymentId: number;
  vaccinePackageDetailId: number;
  scheduledDate?: Date | string;
}

export interface UpdatePaymentDetailDTO {
  isCompleted: IsActive;
  administeredDate?: Date | string;
  notes?: string;
  scheduledDate?: Date | string;
  appointmentId?: number;
}

export interface PaymentDetailResponseDTO {
  paymentDetailId: number;
  paymentId: number;
  vaccinePackageDetailId: number;
  isCompleted: IsActive;
  administeredDate?: Date | string;
  notes: string;
  doseSequence: number;
  scheduledDate?: Date | string;
  price: number;
}
