// Các enum được định nghĩa dựa trên EnumList từ backend C#

// Trạng thái hoạt động
export enum IsActive {
  Active = 1,
  Inactive = 0,
}

// Trạng thái cuộc hẹn
export enum AppointmentStatus {
  Pending = 1,
  Checked = 2,
  Paid = 3,
  Injected = 4,
  WaitingForResponse = 5,
  Completed = 6,
  Cancelled = 7,
}

// Giới tính
export enum Gender {
  Unknown = 0,
  Male = 1,
  Female = 2,
}

// Quan hệ với người dùng
export enum Relationship {
  Mother = 1,
  Father = 2,
  Guardian = 3,
}

// Loại thanh toán
export enum PaymentType {
  Cash = 1,
  BankTransfer = 2,
}

// Trạng thái thanh toán
export enum PaymentStatus {
  AwaitingPayment = 1,
  Paid = 2,
  Aborted = 3,
}

// Vai trò người dùng
export enum Role {
  Admin = 1,
  Doctor = 2,
  Staff = 3,
  Customer = 4,
}

export enum IsCompleted {
  Yes = 1,
  No = 0,
  Pending = 2,
}
