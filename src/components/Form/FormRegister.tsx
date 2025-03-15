/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { message, Button } from "antd";
import userService from "../../service/userService";
import GoogleLoginButton from "../GoogleLoginButton";
import { useNavigate } from "react-router-dom";

const FormRegister: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [fullName, setFullName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (password !== confirmPassword) {
      message.error("Mật khẩu và xác nhận mật khẩu không khớp!");
      setLoading(false);
      return;
    }

    if (!email.trim()) {
      message.error("Vui lòng nhập email!");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      message.error("Email không hợp lệ!");
      setLoading(false);
      return;
    }

    if (!password.trim()) {
      message.error("Vui lòng nhập mật khẩu!");
      setLoading(false);
      return;
    }

    if (password.trim().length < 6) {
      message.error("Mật khẩu phải có ít nhất 6 ký tự!");
      setLoading(false);
      return;
    }

    if (!fullName.trim()) {
      message.error("Vui lòng nhập họ và tên!");
      setLoading(false);
      return;
    }

    if (!phoneNumber.trim()) {
      message.error("Vui lòng nhập số điện thoại!");
      setLoading(false);
      return;
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phoneNumber.trim())) {
      message.error("Số điện thoại phải có đúng 10 chữ số!");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("Email", email.trim());
    formData.append("Password", password.trim());
    formData.append("FullName", fullName.trim());
    formData.append("PhoneNumber", phoneNumber.trim());

    // Debug FormData
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await userService.register(formData);
      console.log("Đăng ký thành công:", response);
      message.success("Đăng ký thành công! Vui lòng đăng nhập để tiếp tục!");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFullName("");
      setPhoneNumber("");
      navigate("/login");
    } catch (error: any) {
      console.error("Lỗi khi đăng ký:", error);
      message.error(
        `Đăng ký thất bại! ${
          error.response?.data?.message ||
          "Vui lòng kiểm tra lại thông tin hoặc liên hệ admin."
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url(/image/loginBackground.png)" }}
    >
      <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">
          Đăng ký người dùng
        </h2>
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
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm"
          >
            {loading ? "Đang xử lý..." : "Đăng ký"}
          </Button>
        </form>

        {/* Google Login Button */}
        <div className="mt-4 flex justify-center">
          <GoogleLoginButton />
        </div>

        {/* Bottom Links */}
        <div className="mt-4 text-center text-sm text-gray-700">
          <p>
            Bạn đã có tài khoản?{" "}
            <a href="/login" className="text-blue-500">
              Đăng nhập ngay
            </a>
          </p>
        </div>

        <div className="mt-4 text-center text-sm text-gray-700">
          <a href="/" className="text-blue-500">
            Trở lại trang chủ
          </a>
        </div>
      </div>
    </div>
  );
};

export default FormRegister;
