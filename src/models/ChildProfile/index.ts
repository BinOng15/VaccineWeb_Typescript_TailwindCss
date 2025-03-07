import { Gender, IsActive, Relationship } from "../Type/enum";

// Giao diện cho DTO tạo hồ sơ trẻ em
export interface CreateChildProfileDTO {
  userId: number; // ID người dùng (bắt buộc)
  fullName: string; // Họ và tên đầy đủ (bắt buộc)
  dateOfBirth: string; // Ngày sinh, định dạng ISO 8601 (ví dụ: "2025-03-03")
  gender: Gender; // Giới tính (bắt buộc)
  relationship: Relationship; // Quan hệ với người dùng (bắt buộc)
  profilePicture?: File; // Ảnh đại diện (tùy chọn, kiểu File cho việc tải lên)
}

// Giao diện cho DTO cập nhật hồ sơ trẻ em
export interface UpdateChildProfileDTO {
  fullName: string; // Họ và tên đầy đủ (bắt buộc)
  dateOfBirth?: string; // Ngày sinh (tùy chọn), định dạng ISO 8601
  gender?: Gender; // Giới tính (tùy chọn)
  relationship?: Relationship; // Quan hệ với người dùng (tùy chọn)
  profilePicture?: File; // Ảnh đại diện (tùy chọn, kiểu File cho việc tải lên)
}

// Giao diện cho dữ liệu hồ sơ trẻ em trả về từ API
export interface ChildProfileResponseDTO {
  childId: number; // ID hồ sơ trẻ em
  userId: number; // ID người dùng
  fullName: string; // Họ và tên đầy đủ
  imageUrl: string; // URL của ảnh đại diện
  dateOfBirth: string; // Ngày sinh, định dạng ISO 8601
  gender: Gender; // Giới tính
  relationship: Relationship; // Quan hệ với người dùng
  createdDate: string; // Ngày tạo, định dạng ISO 8601
  createdBy: string; // Người tạo
  modifiedDate: string; // Ngày sửa đổi, định dạng ISO 8601
  modifiedBy: string; // Người sửa đổi
  isActive: IsActive; // Trạng thái hoạt động (Active/Inactive)
}

// Giao diện cho phản hồi phân trang
export interface PagedChildProfileResponse {
  data: ChildProfileResponseDTO[]; // Danh sách hồ sơ trẻ em
  totalCount: number; // Tổng số lượng hồ sơ
}
