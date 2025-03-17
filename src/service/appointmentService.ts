import { AxiosResponse } from "axios";
import { axiosInstance } from "./axiosInstance";
import {
  AppointmentResponseDTO,
  CreateAppointmentDTO,
  UpdateAppointmentDTO,
} from "../models/Appointment";
import { AppointmentStatus } from "../models/Type/enum";

// Dịch vụ API cho cuộc hẹn
const appointmentService = {
  // Lấy tất cả cuộc hẹn
  getAllAppointments: async (): Promise<AppointmentResponseDTO[]> => {
    try {
      const response: AxiosResponse<AppointmentResponseDTO[]> =
        await axiosInstance.get("api/Appointment/get-all");
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy tất cả cuộc hẹn:", error);
      throw error;
    }
  },

  // Lấy cuộc hẹn theo ID
  getAppointmentById: async (
    appointmentId: number
  ): Promise<AppointmentResponseDTO> => {
    try {
      const response: AxiosResponse<AppointmentResponseDTO> =
        await axiosInstance.get(`api/Appointment/get-by-id/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy cuộc hẹn theo ID ${appointmentId}:`, error);
      throw error;
    }
  },

  // Lấy danh sách cuộc hẹn theo trạng thái
  getAppointmentsByStatus: async (
    appointmentStatus: AppointmentStatus
  ): Promise<AppointmentResponseDTO[]> => {
    try {
      const response: AxiosResponse<AppointmentResponseDTO[]> =
        await axiosInstance.get(
          `api/Appointment/get-by-status/${appointmentStatus}`
        );
      return response.data;
    } catch (error) {
      console.error(
        `Lỗi khi lấy cuộc hẹn theo trạng thái ${appointmentStatus}:`,
        error
      );
      throw error;
    }
  },

  // Lấy danh sách cuộc hẹn theo childId
  getAppointmentsByChildId: async (
    childId: number
  ): Promise<AppointmentResponseDTO[]> => {
    try {
      const response: AxiosResponse<AppointmentResponseDTO[]> =
        await axiosInstance.get(`api/Appointment/get-by-childId/${childId}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy cuộc hẹn theo childId ${childId}:`, error);
      throw error;
    }
  },

  // Lấy danh sách cuộc hẹn theo ngày
  getAppointmentsByDate: async (
    appointmentDate: string
  ): Promise<AppointmentResponseDTO[]> => {
    try {
      const response: AxiosResponse<AppointmentResponseDTO[]> =
        await axiosInstance.get(
          `api/Appointment/get-by-date/${appointmentDate}`
        );
      return response.data;
    } catch (error) {
      console.error(
        `Lỗi khi lấy cuộc hẹn theo ngày ${appointmentDate}:`,
        error
      );
      throw error;
    }
  },

  // Tạo cuộc hẹn mới
  createAppointment: async (
    appointmentData: CreateAppointmentDTO
  ): Promise<AppointmentResponseDTO> => {
    try {
      const response: AxiosResponse<AppointmentResponseDTO> =
        await axiosInstance.post("api/Appointment/create", appointmentData, {
          headers: { "Content-Type": "application/json" },
        });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo cuộc hẹn:", error);
      throw error;
    }
  },

  // Cập nhật thông tin cuộc hẹn
  updateAppointment: async (
    appointmentId: number,
    appointmentData: UpdateAppointmentDTO
  ): Promise<AppointmentResponseDTO> => {
    try {
      const response: AxiosResponse<AppointmentResponseDTO> =
        await axiosInstance.put(
          `api/Appointment/update/${appointmentId}`,
          appointmentData,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật cuộc hẹn ${appointmentId}:`, error);
      throw error;
    }
  },

  // // Cập nhật trạng thái cuộc hẹn
  // updateAppointmentStatus: async (
  //   appointmentId: number,
  //   status: AppointmentStatus
  // ): Promise<boolean> => {
  //   try {
  //     const response: AxiosResponse<{ message: string }> =
  //       await axiosInstance.put(
  //         `api/Appointment/update-status/${appointmentId}/${status}`
  //       );
  //     return (
  //       response.data.message === "Appointment status updated successfully."
  //     );
  //   } catch (error) {
  //     console.error(
  //       `Lỗi khi cập nhật trạng thái cuộc hẹn ${appointmentId}:`,
  //       error
  //     );
  //     throw error;
  //   }
  // },
};

export default appointmentService;
