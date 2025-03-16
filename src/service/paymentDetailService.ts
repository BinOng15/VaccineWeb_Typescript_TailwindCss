import { AxiosResponse } from "axios";
import { axiosInstance } from "./axiosInstance"; // Giả sử bạn có file axiosInstance.ts để cấu hình axios
import {
  PaymentDetailResponseDTO,
  CreatePaymentDetailDTO,
  UpdatePaymentDetailDTO,
} from "../models/PaymentDetail";

// Các hàm gọi API cho PaymentDetail
const paymentDetailService = {
  // Lấy tất cả thông tin payment detail (GET /api/PaymentDetail/get-all)
  getAllPaymentDetails: async (): Promise<PaymentDetailResponseDTO[]> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        "api/PaymentDetail/get-all"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching all payment details:", error);
      throw error;
    }
  },

  // Lấy payment detail theo ID (GET /api/PaymentDetail/get-by-id/{paymentDetailId})
  getPaymentDetailById: async (
    paymentDetailId: number
  ): Promise<PaymentDetailResponseDTO> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        `api/PaymentDetail/get-by-id/${paymentDetailId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching payment detail by ID ${paymentDetailId}:`,
        error
      );
      throw error;
    }
  },

  // Lấy payment detail theo Payment ID (GET /api/PaymentDetail/get-by-payment-id/{paymentId})
  getPaymentDetailsByPaymentId: async (
    paymentId: number
  ): Promise<PaymentDetailResponseDTO[]> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        `api/PaymentDetail/get-by-payment-id/${paymentId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching payment details by payment ID ${paymentId}:`,
        error
      );
      throw error;
    }
  },

  // Lấy payment detail chưa hoàn thành theo Payment ID (GET /api/PaymentDetail/get-uncompleted-by-payment-id/{paymentId})
  getUncompletedPaymentDetailsByPaymentId: async (
    paymentId: number
  ): Promise<PaymentDetailResponseDTO[]> => {
    try {
      const response: AxiosResponse = await axiosInstance.get(
        `api/PaymentDetail/get-uncompleted-by-payment-id/${paymentId}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error fetching uncompleted payment details by payment ID ${paymentId}:`,
        error
      );
      throw error;
    }
  },

  // Tạo payment detail (POST /api/PaymentDetail/generate/{paymentId})
  generatePaymentDetail: async (
    paymentId: number,
    paymentDetailData: CreatePaymentDetailDTO
  ): Promise<PaymentDetailResponseDTO> => {
    try {
      const response: AxiosResponse = await axiosInstance.post(
        `api/PaymentDetail/generate/${paymentId}`,
        paymentDetailData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error generating payment detail for payment ID ${paymentId}:`,
        error
      );
      throw error;
    }
  },

  // Cập nhật payment detail (PUT /api/PaymentDetail/update/{paymentDetailId})
  updatePaymentDetail: async (
    paymentDetailId: number,
    paymentDetailData: UpdatePaymentDetailDTO
  ): Promise<boolean> => {
    try {
      const response: AxiosResponse = await axiosInstance.put(
        `api/PaymentDetail/update/${paymentDetailId}`,
        paymentDetailData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.success; // Giả sử backend trả về boolean
    } catch (error) {
      console.error(`Error updating payment detail ${paymentDetailId}:`, error);
      throw error;
    }
  },
};

export default paymentDetailService;
