/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Modal, Form, Input, Select, Button, DatePicker, message } from "antd";
import moment from "moment";
import FileUploader from "../../util/FileUploader";
import userService from "../../service/userService";
import { UpdateUserDTO, UserResponseDTO } from "../../models/User";

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
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [imageUploading, setImageUploading] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData: UserResponseDTO = await userService.getUserById(
          user.id
        );
        console.log("Fetched User Data:", userData); // Debug dữ liệu từ API
        form.setFieldsValue({
          fullName: userData.fullName,
          email: userData.email,
          dateOfBirth: userData.dateOfBirth
            ? moment(userData.dateOfBirth)
            : null,
          address: userData.address,
          phoneNumber: userData.phoneNumber,
          role: userData.role, // Sử dụng role từ dữ liệu (2 hoặc 3)
        });
        setImageUrl(undefined); // Backend không trả imgUrl, để trống
      } catch (error) {
        message.error("Failed to fetch user data: " + (error as Error).message);
      }
    };

    if (visible) {
      fetchUserData();
    }
  }, [user, visible, form]);

  const handleUploadSuccess = async (url: string) => {
    setImageUploading(true);
    try {
      setImageUrl(url);
      message.success("Image uploaded successfully");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Chuyển đổi dateOfBirth từ DatePicker thành định dạng ISO 8601
      const dateOfBirth = values.dateOfBirth
        ? moment(values.dateOfBirth).toISOString()
        : moment().toISOString();

      const updatedData: UpdateUserDTO = {
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        address: values.address,
        dateOfBirth: dateOfBirth,
        role: values.role, // Sử dụng role từ form (2 hoặc 3)
      };

      console.log("Updated Data to Send:", updatedData); // Debug dữ liệu gửi lên
      await userService.updateUser(user.id, updatedData);
      message.success("User updated successfully");
      refreshUsers();
      onClose();
    } catch (error) {
      message.error("Failed to update user: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Edit User"
      visible={visible}
      onCancel={handleCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <Form.Item
            label="Profile Picture"
            style={{ display: "inline-block" }}
          >
            <FileUploader
              onUploadSuccess={handleUploadSuccess}
              defaultImage={imageUrl}
            />
          </Form.Item>
        </div>

        <Form.Item
          label="Full Name"
          name="fullName"
          rules={[{ required: true, message: "Please input the full name!" }]}
        >
          <Input placeholder="Enter your full name" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please input the email!" },
            { type: "email", message: "Please enter a valid email!" },
          ]}
        >
          <Input placeholder="Enter your email" disabled />{" "}
          {/* Có thể disable nếu email không được chỉnh sửa */}
        </Form.Item>

        <Form.Item
          label="Date of Birth"
          name="dateOfBirth"
          rules={[
            { required: true, message: "Please select the date of birth!" },
          ]}
        >
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Select your date of birth"
          />
        </Form.Item>

        <Form.Item
          label="Address"
          name="address"
          rules={[{ required: true, message: "Please input the address!" }]}
        >
          <Input placeholder="Enter your address" />
        </Form.Item>

        <Form.Item
          label="Phone Number"
          name="phoneNumber"
          rules={[
            { required: true, message: "Please input the phone number!" },
          ]}
        >
          <Input placeholder="Enter your phone number" />
        </Form.Item>

        <Form.Item
          label="Role"
          name="role"
          rules={[{ required: true, message: "Please select a role!" }]}
        >
          <Select placeholder="Select your role">
            <Option value={2}>Staff</Option>
            <Option value={3}>Doctor</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={imageUploading}
          >
            Update
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditUserModal;
