export type AuthContextType = {
  user: User | null;
  login: (token: string, userData: User) => void;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  getRole: () => string | null; // Thay string thành number để khớp với role của backend
};

export type User = {
  userId: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  role: string;
  dateOfBirth: string;
  isActive: string;
  createdDate: string;
  createdBy: string;
  modifiedDate: string;
  modifiedBy: string;
  image: string;
};

// Interface cho DTO tạo người dùng thông thường (Customer)
export interface CreateUserDTO {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  address?: string;
  dateOfBirth: string;
}

// Interface cho DTO tạo người dùng hệ thống (Staff hoặc Doctor)
export interface CreateSystemUserDTO {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  address?: string;
  dateOfBirth: string;
  role: number;
}

// Interface cho DTO cập nhật người dùng
export interface UpdateUserDTO {
  fullName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  dateOfBirth: string;
  role: number;
}

// Interface cho dữ liệu người dùng trả về từ API
export interface UserResponseDTO {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  dateOfBirth: string;
  role: number;
  createdDate: string;
  modifiedDate: string;
  modifiedBy: string;
  isActive: string;
}

// Interface cho phản hồi phân trang
export interface PagedResponse {
  data: UserResponseDTO[];
  totalCount: number;
}
