// CreateVaccinationRecordDTO - DTO để tạo mới bản ghi tiêm chủng
export interface CreateVaccinationRecordDTO {
  appointmentId: number; // ID lịch hẹn (bắt buộc)
  reaction: string; // Phản ứng sau tiêm (bắt buộc)
  notes: string; // Ghi chú (bắt buộc)
}

// UpdateVaccinationRecordDTO - DTO để cập nhật bản ghi tiêm chủng
export interface UpdateVaccinationRecordDTO {
  reaction?: string; // Phản ứng sau tiêm (không bắt buộc)
  notes?: string; // Ghi chú (không bắt buộc)
  isActive?: number; // Trạng thái hoạt động (0 hoặc 1, không bắt buộc)
}

// VaccinationRecordResponseDTO - DTO phản hồi từ API khi lấy thông tin bản ghi tiêm chủng
export interface VaccinationRecordResponseDTO {
  recordId: number; // ID bản ghi tiêm chủng
  appointmentId: number; // ID lịch hẹn
  administeredDate: Date | string; // Ngày tiêm (có thể là Date hoặc chuỗi ISO 8601)
  reaction: string; // Phản ứng sau tiêm
  notes: string; // Ghi chú
  isActive: number; // Trạng thái hoạt động (0 hoặc 1)
  createdDate: Date | string; // Ngày tạo
  createdBy: string; // Người tạo
  modifiedDate: Date | string; // Ngày sửa
  modifiedBy: string; // Người sửa
}