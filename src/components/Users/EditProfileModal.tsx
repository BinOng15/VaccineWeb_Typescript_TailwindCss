/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Modal, Form, Input, DatePicker, message } from "antd";
import { UserResponseDTO } from "../../models/User";
import moment from "moment";
import FileUploader from "../../util/FileUploader";

const { Item } = Form;

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user: UserResponseDTO;
  onSave: (formData: FormData) => void; // Callback để gửi FormData lên MyProfile
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
  user,
  onSave,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [newImage, setNewImage] = useState<File | null>(null); // State để lưu file ảnh mới

  // Điền dữ liệu vào form khi mở modal
  useEffect(() => {
    if (visible && user) {
      form.setFieldsValue({
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        dateOfBirth:
          user.dateOfBirth && user.dateOfBirth !== "Chưa có dữ liệu"
            ? moment(user.dateOfBirth, "DD/MM/YYYY")
            : null,
        address: user.address,
      });
    }
  }, [visible, user, form]);

  // Xử lý lưu chỉnh sửa
  const handleSaveEdit = async (values: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("FullName", values.fullName);
      formData.append("Email", values.email);
      formData.append("PhoneNumber", values.phoneNumber);
      formData.append(
        "DateOfBirth",
        moment(values.dateOfBirth).format("DD/MM/YYYY")
      );
      formData.append("Address", values.address);
      if (newImage) {
        formData.append("Image", newImage);
      }

      // Gửi FormData lên MyProfile để xử lý
      onSave(formData);
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
      open={visible}
      onCancel={() => {
        form.resetFields();
        setNewImage(null);
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
        <Item name="email" label="Email">
          <Input disabled /> {/* Email không nên chỉnh sửa */}
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
        <Item label="Hình ảnh">
          <FileUploader
            onUploadSuccess={(file: File) => setNewImage(file)}
            defaultImage={user.image}
          />
        </Item>
      </Form>
    </Modal>
  );
};

export default EditProfileModal;
