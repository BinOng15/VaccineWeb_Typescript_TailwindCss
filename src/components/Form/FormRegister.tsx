import React, { useState } from "react";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { message, Upload, Button } from "antd";
import { UploadChangeParam } from "antd/es/upload";
import GoogleLoginButton from "../GoogleLoginButton";
import userService from "../../service/userService";
import { CreateUserDTO } from "../../models/User";

const FormRegister: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [image, setImage] = useState<File | null>(null); // State để lưu file
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Hàm xử lý upload ảnh
  const handleImageUpload = (info: UploadChangeParam) => {
    const file = info.file.originFileObj as File;
    if (file) {
      setImage(file); // Cập nhật state image với file từ Upload
    } else {
      setImage(null); // Đặt lại nếu không có file hợp lệ
    }
  };

  // Hàm đăng ký với API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Kiểm tra mật khẩu khớp
    if (password !== confirmPassword) {
      message.error("Mật khẩu và xác nhận mật khẩu không khớp!");
      setLoading(false);
      return;
    }

    // Kiểm tra các trường bắt buộc phía client
    const isAnyFieldEmpty =
      !email.trim() ||
      !password.trim() ||
      !fullName.trim() ||
      !phoneNumber.trim() ||
      !address.trim() ||
      !dateOfBirth ||
      !image;

    if (isAnyFieldEmpty) {
      message.error("Vui lòng điền đầy đủ tất cả các trường!");
      setLoading(false);
      return;
    }

    // Tạo đối tượng CreateUserDTO
    const userData: CreateUserDTO = {
      fullName: fullName.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      password: password.trim(),
      address: address.trim(),
      dateOfBirth,
      image, // Sử dụng image từ state
    };

    // Chuyển đổi sang FormData để gửi file
    const formData = new FormData();
    formData.append("FullName", userData.fullName);
    formData.append("Email", userData.email);
    formData.append("PhoneNumber", userData.phoneNumber);
    formData.append("Password", userData.password);
    formData.append("Address", userData.address);
    formData.append("DateOfBirth", userData.dateOfBirth);
    if (userData.image) {
      formData.append("Image", userData.image);
    }

    try {
      // Gửi FormData qua API
      const response = await userService.register(formData);
      console.log("Đăng ký thành công:", response);
      message.success(
        "Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản."
      );
      // Reset form sau khi thành công
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFullName("");
      setPhoneNumber("");
      setAddress("");
      setDateOfBirth("");
      setImage(null);
      // Có thể chuyển hướng đến trang đăng nhập sau khi thành công
      // history.push("/login");
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error);
      message.error(
        `Đăng ký thất bại! ${"Vui lòng kiểm tra lại thông tin hoặc liên hệ admin."}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Cấu hình Upload từ antd
  const uploadProps = {
    beforeUpload: () => false, // Ngăn upload tự động, xử lý thủ công
    onChange: handleImageUpload,
    maxCount: 1, // Chỉ cho phép 1 file
    accept: "image/*", // Chỉ chấp nhận file ảnh
    onRemove: () => setImage(null), // Đặt lại image khi xóa file
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url(/image/loginBackground.png)" }}
    >
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Đăng ký</h2>
        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập email"
              required
            />
          </div>

          {/* Full Name Input */}
          <div className="mb-5">
            <label
              htmlFor="fullName"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Họ và tên
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập họ và tên"
              required
            />
          </div>

          {/* Phone Number Input */}
          <div className="mb-5">
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Số điện thoại
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập số điện thoại"
              required
            />
          </div>

          {/* Address Input */}
          <div className="mb-5">
            <label
              htmlFor="address"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Địa chỉ
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập địa chỉ"
              required
            />
          </div>

          {/* Date of Birth Input */}
          <div className="mb-5">
            <label
              htmlFor="dateOfBirth"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Ngày sinh
            </label>
            <input
              type="date"
              id="dateOfBirth"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Image Upload */}
          <div className="mb-5">
            <label
              htmlFor="image"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Hình ảnh
            </label>
            <Upload {...uploadProps} showUploadList={{ showRemoveIcon: true }}>
              <Button icon={<UploadOutlined />}>Chọn hình ảnh</Button>
            </Upload>
            {image && (
              <p className="text-sm text-gray-600 mt-2">
                Đã chọn: {image.name}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập mật khẩu"
                required
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              </button>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Xác nhận mật khẩu"
                required
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-600"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeInvisibleOutlined />
                ) : (
                  <EyeOutlined />
                )}
              </button>
            </div>
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm"
            disabled={loading}
          >
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </button>
        </form>

        {/* Google Login Button */}
        <div className="mt-4 flex justify-center">
          <GoogleLoginButton />
        </div>

        {/* Bottom Links */}
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            Bạn đã có tài khoản?{" "}
            <a href="/login" className="text-blue-500">
              Đăng nhập ngay
            </a>
          </p>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <a href="/" className="text-blue-500">
            Trở lại trang chủ
          </a>
        </div>
      </div>
    </div>
  );
};

export default FormRegister;
