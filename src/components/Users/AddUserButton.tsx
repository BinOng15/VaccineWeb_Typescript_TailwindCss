/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Modal,
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  notification,
} from "antd";
import { CreateSystemUserDTO } from "../../models/User";
import userService from "../../service/userService";
import moment from "moment"; // Để xử lý định dạng ngày

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

  const handleSubmit = async (values: any) => {
    try {
      // Chuyển đổi dateOfBirth từ DatePicker thành định dạng ISO 8601
      const dateOfBirth = values.dateOfBirth
        ? moment(values.dateOfBirth).toISOString()
        : moment().toISOString(); // Giá trị mặc định nếu không chọn

      const userData: CreateSystemUserDTO = {
        email: values.email,
        password: values.password,
        fullName: values.name,
        phoneNumber: values.phoneNumber,
        address: values.address,
        dateOfBirth: dateOfBirth, // Định dạng ISO 8601
        role: values.role === "Nhân viên" ? 3 : 2, // Ánh xạ "Nhân viên" -> 3, "Bác sĩ" -> 2
      };

      console.log("Dữ liệu người dùng để gửi:", userData); // Debug dữ liệu gửi lên
      await userService.createSystemUser(userData);
      notification.success({
        message: "Thành công",
        description: "Người dùng đã được tạo thành công!",
      });

      form.resetFields();
      refreshUsers();
      onClose();
    } catch (error: any) {
      console.error("Lỗi khi tạo người dùng:", error.response?.data);
      notification.error({
        message: "Lỗi",
        description:
          error?.response?.data?.message || "Không thể tạo người dùng!",
      });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
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
          rules={[
            { required: true, message: "Vui lòng nhập email của người dùng!" },
            { type: "email", message: "Vui lòng nhập email hợp lệ!" },
          ]}
        >
          <Input placeholder="Nhập email của người dùng" />
        </Form.Item>
        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập mật khẩu của người dùng!",
            },
            { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
          ]}
        >
          <Input.Password placeholder="Nhập mật khẩu của người dùng" />
        </Form.Item>
        <Form.Item
          label="Tên đầy đủ"
          name="name"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập tên đầy đủ của người dùng!",
            },
          ]}
        >
          <Input placeholder="Nhập tên đầy đủ của người dùng" />
        </Form.Item>
        <Form.Item
          label="Số điện thoại"
          name="phoneNumber"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập số điện thoại của người dùng!",
            },
          ]}
        >
          <Input placeholder="Nhập số điện thoại của người dùng" />
        </Form.Item>
        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập địa chỉ của người dùng!",
            },
          ]}
        >
          <Input placeholder="Nhập địa chỉ của người dùng" />
        </Form.Item>
        <Form.Item
          label="Ngày sinh"
          name="dateOfBirth"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn ngày sinh của người dùng!",
            },
          ]}
        >
          <DatePicker placeholder="Chọn ngày sinh" style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="Vai trò"
          name="role"
          rules={[
            {
              required: true,
              message: "Vui lòng chọn vai trò của người dùng!",
            },
          ]}
        >
          <Select placeholder="Chọn vai trò">
            <Option value="Nhân viên">Nhân viên</Option>
            <Option value="Bác sĩ">Bác sĩ</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Thêm mới
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddUserModal;
