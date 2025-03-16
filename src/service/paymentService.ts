import { AxiosResponse } from "axios";
import { axiosInstance } from "./axiosInstance"; // Giả sử bạn có file axiosInstance.ts để cấu hình axios
import {
  PaymentResponseDTO,
  CreatePaymentDTO,
  CallBackPaymentDTO,
  UpdatePaymentDTO,
  VnPaymentResponseModel,
} from "../models/Payment";

// Các hàm gọi API cho Payment
const paymentService = {
  // Lấy tất cả thông tin payment (GET /api/VNPay/get-all)
  getAllPayments: async (): Promise<PaymentResponseDTO[]> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        "api/VNPay/get-all"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching all payments:", error);
      throw error;
    }
  },

  // Tạo URL thanh toán (POST /api/VNPay/create-payment-url)
  createPaymentUrl: async (paymentData: CreatePaymentDTO): Promise<string> => {
    try {
      const response: AxiosResponse = await axiosInstance.post(
        "api/VNPay/create-payment-url",
        paymentData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data; // Giả sử backend trả về URL dưới dạng string
    } catch (error) {
      console.error("Error creating payment URL:", error);
      throw error;
    }
  },

  // Xử lý callback từ VNPay (GET /api/VNPay/payment-callback)
  paymentCallback: async (): Promise<CallBackPaymentDTO> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        "api/VNPay/payment-callback"
      );
      return response.data;
    } catch (error) {
      console.error("Error processing payment callback:", error);
      throw error;
    }
  },

  // Cập nhật payment (PUT /api/VNPay/update-payment/{id})
  updatePayment: async (
    id: number,
    paymentData: UpdatePaymentDTO
  ): Promise<boolean> => {
    try {
      const response: AxiosResponse = await axiosInstance.put(
        `api/VNPay/update-payment/${id}`,
        paymentData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.success; // Giả sử backend trả về boolean
    } catch (error) {
      console.error(`Error updating payment ${id}:`, error);
      throw error;
    }
  },

  // Thêm payment (POST /api/VNPay/add-payment)
  addPayment: async (
    paymentData: CreatePaymentDTO
  ): Promise<PaymentResponseDTO> => {
    try {
      const response: AxiosResponse = await axiosInstance.post(
        "api/VNPay/add-payment",
        paymentData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error adding payment:", error);
      throw error;
    }
  },

  // Callback URL từ VNPay (GET /api/VNPay/callbackUrl)
  callbackUrl: async (): Promise<VnPaymentResponseModel> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        "api/VNPay/callbackUrl"
      );
      return response.data;
    } catch (error) {
      console.error("Error processing callback URL:", error);
      throw error;
    }
  },
};

export default paymentService;
