/* eslint-disable @typescript-eslint/no-explicit-any */
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Form, Button, notification, Input } from "antd";
import GoogleLoginButton from "../GoogleLoginButton";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authServiceLogin, getCurrentUser } from "../../service/authService";

const FormLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAuth();

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      setLoading(true);
      const token = await authServiceLogin(values.email, values.password);
      if (token) {
        const userData = await getCurrentUser(token);
        if (userData) {
          setUser(userData);
          sessionStorage.setItem("user", JSON.stringify(userData));
          sessionStorage.setItem("accessToken", token); // Lưu token vào localStorage nếu cần
          notification.success({
            message: "Login Successful",
          });
          // Điều hướng một lần duy nhất với replace: true
          navigate("/", { replace: true });
        }
      }
    } catch (error: any) {
      notification.error({
        message: "Login Failed",
        description:
          error.message || "Invalid email or password. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Tối ưu useEffect để chỉ chạy khi user thay đổi, và dùng replace: true
  useEffect(() => {
    if (user) {
      let destination = "/";
      switch (user.role) {
        case "Admin":
          destination = "/admin/dashboard";
          break;
        case "Doctor":
          destination = "/doctor/dashboard";
          break;
        case "Staff":
          destination = "/staff/dashboard";
          break;
        case "Customer":
          destination = "/";
          break;
        default:
          console.log("Unknown role:", user.role);
          break;
      }
      navigate(destination, { replace: true }); // Sử dụng replace: true để tránh thêm vào history
    }
  }, [user, navigate]); // Chỉ phụ thuộc vào user và navigate

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url(/image/loginBackground.png)" }}
    >
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Đăng nhập</h2>
        <Form name="login_form" onFinish={handleLogin} layout="vertical">
          <div className="mb-5">
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Hãy nhập email của bạn!" },
                { type: "email", message: "Vui lòng nhập email hợp lệ!" },
              ]}
            >
              <Input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </Form.Item>
          </div>
          <div className="mb-4">
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[
                { required: true, message: "Mật khẩu không được để trống!" },
              ]}
            >
              <Input.Password
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                iconRender={(visible) =>
                  visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
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
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm"
          >
            Đăng nhập
          </Button>
        </Form>
        <div className="mt-4 flex justify-center">
          <GoogleLoginButton />
        </div>
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>
            Bạn chưa có tài khoản?{" "}
            <a
              href="/register"
              onClick={(e) => {
                e.preventDefault();
                navigate("/register", { replace: true });
              }}
              className="text-blue-500"
            >
              Đăng ký ngay
            </a>
          </p>
        </div>
        <div className="mt-4 text-center text-sm text-gray-600">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate("/", { replace: true });
            }}
            className="text-blue-500"
          >
            Trở lại trang chủ
          </a>
        </div>
      </div>
    </div>
  );
};

export default FormLogin;
