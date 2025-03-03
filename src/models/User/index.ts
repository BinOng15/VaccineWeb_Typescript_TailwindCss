export type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  setUser: (user: User) => void;
  getRole: () => string | null; // Thay string thành number để khớp với role của backend
};

export type User = {
  userId: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  role: string; // Thay string thành number để khớp với backend (ví dụ: 1, 2, 3)
  dateOfBirth: string; // Thay Date thành string để khớp với định dạng ISO 8601 (ví dụ: "2025-03-03T11:13:12.522Z")
  isActive: string; // Thay string thành number (0/1) để khớp với yêu cầu backend (dựa trên logic trước, có thể là 0/1)
  createdDate: string; // Thay Date thành string cho định dạng ISO 8601
  createdBy: string;
  modifiedDate: string; // Thay Date thành string cho định dạng ISO 8601
  modifiedBy: string;
};

// Interface cho DTO tạo người dùng thông thường (Customer)
export interface CreateUserDTO {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  address?: string;
  dateOfBirth: string; // Thay Date thành string cho định dạng ISO 8601
}

// Interface cho DTO tạo người dùng hệ thống (Staff hoặc Doctor)
export interface CreateSystemUserDTO {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  address?: string;
  dateOfBirth: string; // Thay Date thành string cho định dạng ISO 8601
  role: number; // Đảm bảo khớp với backend (ví dụ: 1, 2, 3)
}

// Interface cho DTO cập nhật người dùng
export interface UpdateUserDTO {
  fullName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  dateOfBirth: string; // Thay Date thành string cho định dạng ISO 8601
  role: number; // Đảm bảo khớp với backend (ví dụ: 1, 2, 3)
}

// Interface cho dữ liệu người dùng trả về từ API
export interface UserResponseDTO {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  dateOfBirth: string; // Thay Date thành string cho định dạng ISO 8601
  role: number; // Thay string thành number để khớp với backend (ví dụ: 1, 2, 3)
  createdDate: string; // Đảm bảo định dạng ISO 8601
  modifiedDate: string; // Đảm bảo định dạng ISO 8601
  modifiedBy: string;
  isActive: string; // Thay string thành number (0/1) để khớp với yêu cầu backend
}

// Interface cho phản hồi phân trang
export interface PagedResponse {
  data: UserResponseDTO[];
  totalCount: number;
}