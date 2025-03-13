/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  notification,
  Upload,
} from "antd";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import userService from "../../service/userService";
import moment from "moment";

const { Option } = Select;

interface AddUserModalProps {
  visible: boolean;
  onClose: () => void;
  refreshUsers: () => void;
}

const AddUserModal: React.FC<AddUserModalProps> = ({
  visible,
  onClose,
  refreshUsers,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [image, setImage] = useState<File | null>(null);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);

    // Validation
    if (!values.email.trim()) {
      notification.error({ message: "Vui lòng nhập email!" });
      setLoading(false);
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.email.trim())) {
      notification.error({ message: "Email không hợp lệ!" });
      setLoading(false);
      return;
    }

    if (!values.password.trim()) {
      notification.error({ message: "Vui lòng nhập mật khẩu!" });
      setLoading(false);
      return;
    }
    if (values.password.trim().length < 6) {
      notification.error({ message: "Mật khẩu phải có ít nhất 6 ký tự!" });
      setLoading(false);
      return;
    }

    if (!values.fullName.trim()) {
      notification.error({ message: "Vui lòng nhập họ và tên!" });
      setLoading(false);
      return;
    }

    if (!values.phoneNumber.trim()) {
      notification.error({ message: "Vui lòng nhập số điện thoại!" });
      setLoading(false);
      return;
    }
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(values.phoneNumber.trim())) {
      notification.error({ message: "Số điện thoại phải có đúng 10 chữ số!" });
      setLoading(false);
      return;
    }

    if (!values.address.trim()) {
      notification.error({ message: "Vui lòng nhập địa chỉ!" });
      setLoading(false);
      return;
    }

    if (!values.dateOfBirth) {
      notification.error({ message: "Vui lòng chọn ngày sinh!" });
      setLoading(false);
      return;
    }

    if (!image) {
      notification.error({ message: "Vui lòng tải lên hình ảnh!" });
      setLoading(false);
      return;
    }

    // Chuẩn bị dữ liệu gửi đi
    const formData = new FormData();
    formData.append("Email", values.email.trim());
    formData.append("Password", values.password.trim());
    formData.append("FullName", values.fullName.trim());
    formData.append("PhoneNumber", values.phoneNumber.trim());
    formData.append("Address", values.address.trim());
    formData.append(
      "DateOfBirth",
      moment(values.dateOfBirth).format("YYYY-MM-DD")
    ); // Định dạng phù hợp với backend
    formData.append("Role", values.role === "2" ? "Doctor" : "Staff"); // Chuyển đổi giá trị role
    if (image) {
      formData.append("Image", image);
    }

    // Debug FormData
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await userService.createSystemUser(formData); // Giả định service đã được cập nhật để xử lý FormData
      console.log("Tạo người dùng thành công:", response);
      notification.success({
        message: "Thành công",
        description: "Người dùng đã được tạo thành công!",
      });

      form.resetFields();
      setImage(null);
      refreshUsers();
      onClose();
    } catch (error: any) {
      console.error("Lỗi khi tạo người dùng:", error);
      notification.error({
        message: "Lỗi",
        description:
          error.response?.data?.message || "Không thể tạo người dùng!",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setImage(null);
    onClose();
  };

  const handleImageUpload = (info: any) => {
    const file = info.file.originFileObj || info.file;
    if (file) {
      setImage(file);
    }
  };

  return (
    <Modal
      title="THÊM MỚI NGƯỜI DÙNG"
      open={visible}
      onCancel={handleCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, message: "Vui lòng nhập email!" }]}
        >
          <Input placeholder="Nhập email của người dùng" />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
        >
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu của người dùng"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-sm text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </button>
          </div>
        </Form.Item>

        <Form.Item
          label="Tên đầy đủ"
          name="fullName"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
        >
          <Input placeholder="Nhập tên đầy đủ của người dùng" />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phoneNumber"
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
        >
          <Input placeholder="Nhập số điện thoại của người dùng" />
        </Form.Item>

        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
        >
          <Input placeholder="Nhập địa chỉ của người dùng" />
        </Form.Item>

        <Form.Item
          label="Ngày sinh"
          name="dateOfBirth"
          rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
        >
          <DatePicker
            placeholder="Chọn ngày sinh"
            style={{ width: "100%" }}
            format="YYYY-MM-DD"
          />
        </Form.Item>

        <Form.Item
          label="Vai trò"
          name="role"
          rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
        >
          <Select placeholder="Chọn vai trò">
            <Option value="2">Bác sĩ</Option>
            <Option value="3">Nhân viên</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Hình ảnh"
          name="image"
          rules={[{ required: true, message: "Vui lòng tải lên hình ảnh!" }]}
        >
          <Upload
            beforeUpload={() => false} // Ngăn upload tự động
            onChange={handleImageUpload}
            maxCount={1}
            accept="image/*"
            fileList={
              image ? [{ uid: "1", name: image.name, status: "done" }] : []
            }
          >
            <Button icon={<UploadOutlined />}>Tải lên</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            {loading ? "Đang xử lý..." : "Thêm mới"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddUserModal;
