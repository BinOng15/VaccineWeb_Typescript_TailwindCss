import { Gender, Relationship } from "../Type/enum";

// Giao diện cho DTO tạo hồ sơ trẻ em
export interface CreateChildProfileDTO {
  userId: number; // ID người dùng (bắt buộc)
  fullName: string; // Họ và tên đầy đủ (bắt buộc, max 50 ký tự)
  dateOfBirth: string; // Ngày sinh, định dạng "yyyy-MM-dd" (khớp với backend)
  gender: Gender; // Giới tính (bắt buộc, enum number)
  relationship: Relationship; // Quan hệ với người dùng (bắt buộc, enum number)
  profilePicture: File; // Ảnh đại diện (bắt buộc, kiểu File)
}

// Giao diện cho DTO cập nhật hồ sơ trẻ em
export interface UpdateChildProfileDTO {
  fullName: string; // Họ và tên đầy đủ (bắt buộc)
  dateOfBirth?: string; // Ngày sinh (tùy chọn), định dạng chuỗi
  gender?: Gender; // Giới tính (tùy chọn)
  relationship?: Relationship; // Quan hệ với người dùng (tùy chọn)
  profilePicture?: File; // Ảnh đại diện (tùy chọn, kiểu File cho việc tải lên)
}

// Giao diện cho dữ liệu hồ sơ trẻ em trả về từ API
export interface ChildProfileResponseDTO {
  childId: number; // ID hồ sơ trẻ em
  userId: number; // ID người dùng
  fullName: string; // Họ và tên đầy đủ
  imageUrl: string; // URL của ảnh đại diện (sau khi upload lên Cloudinary)
  dateOfBirth: string; // Ngày sinh, định dạng chuỗi
  gender: number; // Giới tính (số nguyên, ánh xạ sang Gender)
  relationship: number; // Quan hệ với người dùng (số nguyên, ánh xạ sang Relationship)
  createdDate: string; // Ngày tạo
  createdBy: string; // Người tạo
  modifiedDate: string; // Ngày sửa đổi
  modifiedBy: string; // Người sửa đổi
  isActive: number; // Trạng thái hoạt động
}

// Giao diện cho phản hồi phân trang
export interface PagedChildProfileResponse {
  data: ChildProfileResponseDTO[]; // Danh sách hồ sơ trẻ em
  totalCount: number; // Tổng số lượng hồ sơ
}
