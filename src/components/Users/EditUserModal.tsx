/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  Upload,
  notification,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import moment from "moment";
import userService from "../../service/userService";
import { UserResponseDTO } from "../../models/User";

const { Option } = Select;

interface EditUserModalProps {
  user: UserResponseDTO;
  visible: boolean;
  onClose: () => void;
  refreshUsers: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  visible,
  onClose,
  refreshUsers,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  // Initialize form with user data when modal opens
  useEffect(() => {
    if (visible && user) {
      form.setFieldsValue({
        fullName: user.fullName,
        email: user.email,
        dateOfBirth: user.dateOfBirth ? moment(user.dateOfBirth) : null,
        address: user.address,
        phoneNumber: user.phoneNumber,
        role: user.role === "Doctor" ? "2" : "3", // Map role to match AddUserModal
      });
      setImage(null); // Reset image
    }
  }, [user, visible, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);

    // Validation (similar to AddUserModal)
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

    // Prepare data to send (matching AddUserModal)
    const formData = new FormData();
    formData.append("Email", values.email.trim());
    formData.append("FullName", values.fullName.trim());
    formData.append("PhoneNumber", values.phoneNumber.trim());
    formData.append("Address", values.address.trim());
    formData.append(
      "DateOfBirth",
      moment(values.dateOfBirth).format("YYYY-MM-DD")
    ); // Format consistent with AddUserModal
    formData.append("Role", values.role === "2" ? "Doctor" : "Staff"); // Match role mapping

    // Only append password if provided (optional for edit)
    if (values.password && values.password.trim()) {
      if (values.password.trim().length < 6) {
        notification.error({ message: "Mật khẩu phải có ít nhất 6 ký tự!" });
        setLoading(false);
        return;
      }
      formData.append("Password", values.password.trim());
    }

    // Append image if a new one is uploaded
    if (image) {
      formData.append("Image", image);
    }

    // Debug FormData
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await userService.updateUser(user.userId, formData); // Assume updateUser accepts FormData
      console.log("Cập nhật người dùng thành công:", response);
      notification.success({
        message: "Thành công",
        description: "Người dùng đã được cập nhật thành công!",
      });

      form.resetFields();
      setImage(null);
      refreshUsers();
      onClose();
    } catch (error: any) {
      console.error("Lỗi khi cập nhật người dùng:", error);
      notification.error({
        message: "Lỗi",
        description:
          error.response?.data?.message || "Không thể cập nhật người dùng!",
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
      title="Chỉnh sửa Người dùng"
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
          <Input placeholder="Nhập email của người dùng" disabled />
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[
            { required: false }, // Optional for edit
          ]}
        >
          <Input placeholder="Nhập mật khẩu mới (nếu muốn thay đổi)" />
        </Form.Item>

        <Form.Item
          label="Họ và Tên"
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

        <Form.Item label="Hình ảnh" name="image">
          <Upload
            beforeUpload={() => false} // Prevent auto-upload
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
            {loading ? "Đang xử lý..." : "Cập nhật"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditUserModal;
