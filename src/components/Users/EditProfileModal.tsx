/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Modal, Form, Input, DatePicker, message } from "antd";
import { UpdateUserDTO, UserResponseDTO } from "../../models/User";
import userService from "../../service/userService";
import moment from "moment";

const { Item } = Form;

interface EditUserModalProps {
  visible: boolean;
  onClose: () => void;
  user: UserResponseDTO;
}

const EditProfileModal: React.FC<EditUserModalProps> = ({
  visible,
  onClose,
  user,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  // Lấy token để xác thực
  const getToken = () => {
    return (
      localStorage.getItem("token") || sessionStorage.getItem("accessToken")
    );
  };

  // Điền dữ liệu vào form khi mở modal
  useEffect(() => {
    if (visible && user) {
      form.setFieldsValue({
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        dateOfBirth:
          user.dateOfBirth && user.dateOfBirth !== "Chưa có dữ liệu"
            ? moment(user.dateOfBirth)
            : null,
        address: user.address,
        image: user.image,
      });
    }
  }, [visible, user, form]);

  // Xử lý lưu chỉnh sửa
  const handleSaveEdit = async (values: any) => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token)
        throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại!");

      const updateProfile: UpdateUserDTO = {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        phoneNumber: values.phoneNumber,
        dateOfBirth: moment(values.dateOfBirth).format("YYYY-MM-DD HH:mm:ss"),
        address: values.address,
        image: user?.image || "", // Giữ nguyên ảnh đại diện cũ
        role: user?.role,
      };

      await userService.updateUser(user.userId, updateProfile);
      message.success("Cập nhật profile thành công!");
      form.resetFields();
      onClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật thông tin người dùng:", error);
      message.error(
        "Không thể cập nhật thông tin: " + (error as Error).message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Chỉnh sửa thông tin cá nhân"
      visible={visible}
      onCancel={() => {
        onClose();
      }}
      onOk={() => form.submit()}
      okText="Lưu"
      confirmLoading={loading}
    >
      <Form
        form={form}
        name="editUser"
        onFinish={handleSaveEdit}
        layout="vertical"
      >
        <Item
          name="fullName"
          label="Họ và tên"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
        >
          <Input />
        </Item>
        <Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Vui lòng nhập email!", type: "email" },
          ]}
        >
          <Input />
        </Item>
        <Item
          name="phoneNumber"
          label="Số điện thoại"
          rules={[{ required: true, message: "Vui lòng nhập số điện thoại!" }]}
        >
          <Input />
        </Item>
        <Item
          name="dateOfBirth"
          label="Ngày sinh"
          rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
        >
          <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
        </Item>
        <Item
          name="address"
          label="Địa chỉ"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
        >
          <Input />
        </Item>
      </Form>
    </Modal>
  );
};

export default EditProfileModal;
