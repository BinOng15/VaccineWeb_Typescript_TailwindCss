/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { DiseaseResponseDTO, UpdateDiseaseDTO } from "../../models/Disease";
import diseaseService from "../../service/diseaseService";

interface EditDiseaseModalProps {
  disease: DiseaseResponseDTO;
  visible: boolean;
  onClose: () => void;
  refreshDiseases: () => void;
}

const EditDiseaseModal: React.FC<EditDiseaseModalProps> = ({
  disease,
  visible,
  onClose,
  refreshDiseases,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && disease) {
      form.setFieldsValue({
        name: disease.name,
        description: disease.description,
      });
    }
  }, [disease, visible, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const diseaseData: UpdateDiseaseDTO = {
        name: values.name,
        description: values.description,
        isActive:
          disease.isActive === "Hoạt động" ? "Hoạt động" : "Không hoạt động", // Chuyển đổi từ string sang string
      };

      console.log("Dữ liệu bệnh đã cập nhật để gửi:", diseaseData);
      await diseaseService.updateDisease(disease.diseaseId, diseaseData);
      message.success("Bệnh đã được cập nhật thành công");
      refreshDiseases();
      onClose();
    } catch (error) {
      message.error("Không thể cập nhật bệnh: " + (error as Error).message);
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
      title="CHỈNH SỬA BỆNH"
      visible={visible}
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
          <Button type="primary" htmlType="submit" loading={loading}>
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditDiseaseModal;
