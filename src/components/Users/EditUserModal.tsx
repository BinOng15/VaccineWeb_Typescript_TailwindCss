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
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import moment from "moment";
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

  // Khởi tạo form với dữ liệu user khi modal mở
  useEffect(() => {
    if (visible && user) {
      form.setFieldsValue({
        fullName: user.fullName,
        email: user.email,
        dateOfBirth: user.dateOfBirth ? moment(user.dateOfBirth) : null,
        address: user.address,
        phoneNumber: user.phoneNumber,
        role: user.role, // Sử dụng role từ dữ liệu (2 hoặc 3)
      });
      setImageUrl(undefined); // Backend không trả imgUrl, để trống (nếu cần, bạn có thể lấy từ API nếu có)
    }
  }, [user, visible, form]);

  const handleUploadSuccess = async (url: string) => {
    setImageUploading(true);
    try {
      setImageUrl(url);
      message.success("Hình ảnh đã được tải lên thành công");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
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

      console.log("Dữ liệu người dùng đã cập nhật để gửi:", updatedData); // Debug dữ liệu gửi lên
      const success = await userService.updateUser(user.id, updatedData); // Giả sử updateUser trả về boolean
      if (success) {
        message.success("Người dùng đã được cập nhật thành công");
        refreshUsers();
        onClose();
      } else {
        message.error("Không thể cập nhật người dùng");
      }
    } catch (error) {
      message.error(
        "Không thể cập nhật người dùng: " + (error as Error).message
      );
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
      title="Chỉnh sửa Người dùng"
      visible={visible}
      onCancel={handleCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <Form.Item label="Hình ảnh Hồ sơ" style={{ display: "inline-block" }}>
            <Upload
              beforeUpload={() => false} // Ngăn upload tự động
              maxCount={1}
              accept="image/*"
              defaultFileList={
                imageUrl
                  ? [
                      {
                        uid: `-${Date.now()}`, // Tạo uid duy nhất sử dụng timestamp
                        name: "current-image.jpg",
                        status: "done",
                        url: imageUrl,
                      },
                    ]
                  : []
              }
              onChange={({ file }) => {
                if (file.status === "done" && file.response) {
                  handleUploadSuccess(file.response.url); // Giả sử FileUploader trả về URL
                }
              }}
            >
              <Button icon={<UploadOutlined />}>Tải lên Hình ảnh</Button>
            </Upload>
          </Form.Item>
        </div>

        <Form.Item
          label="Họ và Tên"
          name="fullName"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
        >
          <Input placeholder="Nhập họ và tên của bạn" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Vui lòng nhập email hợp lệ!" },
          ]}
        >
          <Input placeholder="Nhập email của bạn" disabled />{" "}
          {/* Có thể disable nếu email không được chỉnh sửa */}
        </Form.Item>

        <Form.Item
          label="Ngày Sinh"
          name="dateOfBirth"
          rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Chọn ngày sinh của bạn"
          />
        </Form.Item>

        <Form.Item
          label="Địa chỉ"
          name="address"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
        >
          <Input placeholder="Nhập địa chỉ của bạn" />
        </Form.Item>

        <Form.Item
          label="Số điện thoại"
          name="phoneNumber"
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
        >
          <Input placeholder="Nhập số điện thoại của bạn" />
        </Form.Item>

        <Form.Item
          label="Vai trò"
          name="role"
          rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
        >
          <Select placeholder="Chọn vai trò của bạn">
            <Option value={2}>Nhân viên</Option>
            <Option value={3}>Bác sĩ</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={imageUploading}
          >
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditUserModal;
