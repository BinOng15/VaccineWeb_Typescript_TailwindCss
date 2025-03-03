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
        role: values.role === "Staff" ? 3 : 2, // Ánh xạ "Staff" -> 3, "Doctor" -> 2
      };

      console.log("User Data to Send:", userData); // Debug dữ liệu gửi lên
      await userService.createSystemUser(userData);
      notification.success({
        message: "Success",
        description: "User created successfully!",
      });

      form.resetFields();
      refreshUsers();
      onClose();
    } catch (error: any) {
      console.error("Error creating user:", error.response?.data);
      notification.error({
        message: "Error",
        description: error?.response?.data?.message || "Failed to create user!",
      });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Add User"
      open={visible}
      onCancel={handleCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please input the email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[
            { required: true, message: "Please input the password!" },
            { min: 6, message: "Password must be at least 6 characters!" },
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please input the name!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Phone Number"
          name="phoneNumber"
          rules={[
            { required: true, message: "Please input the phone number!" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Address"
          name="address"
          rules={[{ required: true, message: "Please input the address!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Date of Birth"
          name="dateOfBirth"
          rules={[
            { required: true, message: "Please select the date of birth!" },
          ]}
        >
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: "Please select a role!" }]}
        >
          <Select placeholder="Select a role">
            <Option value="Staff">Staff</Option>
            <Option value="Doctor">Doctor</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddUserModal;
