/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Modal, Form, Input, Button, message } from "antd";

import diseaseService from "../../service/diseaseService";
import { IsActive } from "../../models/Type/enum";

const { TextArea } = Input;

interface AddDiseaseModalProps {
  visible: boolean;
  onClose: () => void;
  refreshDiseases: () => void;
}

const AddDiseaseModal: React.FC<AddDiseaseModalProps> = ({
  visible,
  onClose,
  refreshDiseases,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);

    // Validation
    if (!values.name.trim()) {
      message.error("Vui lòng nhập tên bệnh!");
      setLoading(false);
      return;
    }

    if (values.name.trim().length > 255) {
      message.error("Tên bệnh không được dài quá 255 ký tự!");
      setLoading(false);
      return;
    }

    if (!values.description.trim()) {
      message.error("Vui lòng nhập mô tả bệnh!");
      setLoading(false);
      return;
    }

    if (values.description.trim().length > 1000) {
      message.error("Mô tả không được dài quá 1000 ký tự!");
      setLoading(false);
      return;
    }

    // Chuẩn bị dữ liệu gửi lên backend bằng FormData
    const formData = new FormData();
    formData.append("Name", values.name.trim());
    formData.append("Description", values.description.trim());
    formData.append("isActive", IsActive.Active.toString()); // Đặt isActive mặc định là Active (1)

    // Debug FormData
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await diseaseService.createDisease(formData);
      console.log("Tạo bệnh thành công:", response);
      message.success("Tạo bệnh thành công!");
      form.resetFields();
      refreshDiseases();
      onClose();
    } catch (error: any) {
      console.error("Lỗi khi tạo bệnh:", error);
      message.error(
        `Tạo bệnh thất bại! ${
          error.response?.data?.message ||
          "Vui lòng kiểm tra lại thông tin hoặc liên hệ admin."
        }`
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
      title="THÊM MỚI BỆNH"
      open={visible}
      onCancel={handleCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="Tên bệnh"
          rules={[
            { required: true, message: "Vui lòng nhập tên bệnh!" },
            { max: 255, message: "Tên bệnh không được dài quá 255 ký tự!" },
          ]}
        >
          <Input placeholder="Nhập tên bệnh" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[
            { required: true, message: "Vui lòng nhập mô tả!" },
            { max: 1000, message: "Mô tả không được dài quá 1000 ký tự!" },
          ]}
        >
          <TextArea placeholder="Nhập mô tả bệnh" />
        </Form.Item>

        {/* Loại bỏ Form.Item cho isActive vì đã đặt mặc định là Active */}

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm"
          >
            {loading ? "Đang xử lý..." : "Thêm mới"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddDiseaseModal;
