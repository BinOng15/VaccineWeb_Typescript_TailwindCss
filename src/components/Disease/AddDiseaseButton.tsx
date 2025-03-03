/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Modal, Form, Input, Button, notification } from "antd";
import { CreateDiseaseDTO } from "../../models/Disease";
import diseaseService from "../../service/diseaseService";

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

  const handleSubmit = async (values: any) => {
    try {
      const diseaseData: CreateDiseaseDTO = {
        name: values.name,
        description: values.description,
        isActive: "Hoạt động", // Mặc định Active (1)
      };

      console.log("Dữ liệu bệnh để gửi:", diseaseData);
      await diseaseService.createDisease(diseaseData);
      notification.success({
        message: "Thành công",
        description: "Bệnh đã được tạo thành công!",
      });

      form.resetFields();
      refreshDiseases();
      onClose();
    } catch (error: any) {
      console.error("Lỗi khi tạo bệnh:", error.response?.data);
      notification.error({
        message: "Lỗi",
        description: error?.response?.data?.message || "Không thể tạo bệnh!",
      });
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
          label="Tên"
          rules={[{ required: true, message: "Vui lòng nhập tên bệnh!" }]}
        >
          <Input placeholder="Nhập tên bệnh" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
        >
          <Input.TextArea placeholder="Nhập mô tả bệnh" />
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

export default AddDiseaseModal;
