import { PaymentType, PaymentStatus } from "../Type/enum";

export interface CallBackPaymentDTO {
  success: boolean;
  paymentId: string;
}

export interface CreatePaymentDTO {
  appointmentId: number;
  userId: number;
  vaccinePackageId?: number;
  vaccineId?: number;
  paymentType: PaymentType;
}

export interface UpdatePaymentDTO {
  paymentStatus?: PaymentStatus;
}

export interface PaymentResponseDTO {
  paymentId: number;
  appointmentId: number;
  userId: number;
  vaccinePackageId?: number;
  vaccineId?: number;
  paymentType: string;
  totalAmount: number;
  paymentDate?: Date | string;
  paymentStatus: PaymentStatus;
  createdDate: Date | string;
  createdBy: string;
  url: string;
}

export interface VnPaymentResponseModel {
  success: boolean;
  paymentMethod: string;
  orderDescription: string;
  orderId: string;
  paymentId: string;
  transactionId: string;
  token: string;
  vnPayResponseCode: string;
}
export interface VnPaymentRequestModel {
  orderId: number;
  fullName: string;
  description: string;
  amount: number;
}
