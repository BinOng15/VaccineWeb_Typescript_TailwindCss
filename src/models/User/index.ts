export type AuthContextType = {
  user: UserResponseDTO | null;
  login: (token: string, userData: UserResponseDTO) => void;
  logout: () => Promise<void>;
  setUser: (user: UserResponseDTO) => void;
  getRole: () => string | null; // Thay string thành number để khớp với role của backend
};

// export type User = {
//   userId: number;
//   email: string;
//   fullName: string;
//   phoneNumber: string;
//   address: string;
//   role: string;
//   dateOfBirth: string;
//   isActive: string;
//   createdDate: string;
//   createdBy: string;
//   modifiedDate: string;
//   modifiedBy: string;
//   image: string;
// };

// Interface cho DTO tạo người dùng thông thường (Customer)
export interface CreateUserDTO {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  address: string; // Bắt buộc theo backend
  dateOfBirth: string;
  image: File; // Thay string bằng File để xử lý upload
}

// Interface cho DTO tạo người dùng hệ thống (Staff hoặc Doctor)
export interface CreateSystemUserDTO {
  fullName: string;
  email: string;
  phoneNumber: string;
  image: File | null;
  password: string;
  address: string;
  dateOfBirth: string;
  role: string;
}

// Interface cho DTO cập nhật người dùng
export interface UpdateUserDTO {
  fullName: string | null;
  email: string | null;
  password: string | null;
  phoneNumber: string | null;
  image: File | null;
  address?: string | null;
  dateOfBirth: string | null;
  role: string | null;
}

// Interface cho dữ liệu người dùng trả về từ API
export interface UserResponseDTO {
  userId: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  image: string;
  dateOfBirth: string;
  role: string;
  createdDate: string;
  createdBy: string;
  modifiedDate: string;
  modifiedBy: string;
  isActive: string;
}

// Interface cho phản hồi phân trang
export interface PagedResponse {
  data: UserResponseDTO[];
  totalCount: number;
}
