import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import GoogleLoginButton from "../GoogleLoginButton";

const FormLogin: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  // Hàm đăng nhập (chưa thực hiện chức năng)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("Remember Me:", rememberMe);
  };

  // Hàm callback khi đăng nhập Google thành công
  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url(/image/loginBackground.png)" }}
    >
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Đăng nhập</h2>
        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="mb-5">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Email hoặc số điện thoại
            </label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập email hoặc số điện thoại"
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

          {/* Remember me and Forgot password */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="mr-2"
              />
              <label htmlFor="remember" className="text-sm text-gray-700">
                Ghi nhớ tài khoản
              </label>
            </div>
            <a href="#" className="text-sm text-blue-500">
              Quên mật khẩu?
            </a>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm"
          >
            Đăng nhập
          </button>
        </form>

        <div className="mt-4 flex justify-center">
          <GoogleLoginButton />
        </div>

        {/* Bottom Links */}
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            Bạn chưa có tài khoản?{" "}
            <a href="/register" className="text-blue-500">
              Đăng ký ngay
            </a>
          </p>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <a href="/" className="text-blue-500">
            Trở lại trang chủ
          </a>
        </div>

        {/* Google reCAPTCHA (for real apps, uncomment and integrate) */}
        {/* <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            This page is protected by Google reCAPTCHA to ensure you're not a
            bot. <a href="#">Learn more.</a>
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default FormLogin;
