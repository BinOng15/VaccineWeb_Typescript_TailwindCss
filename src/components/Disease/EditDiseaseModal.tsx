/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, message, Select } from "antd";
import { DiseaseResponseDTO } from "../../models/Disease";
import diseaseService from "../../service/diseaseService";
import { IsActive } from "../../models/Type/enum";

const { Option } = Select;

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
        isActive: disease.isActive, // Giả sử isActive từ backend là "Active"/"Inactive" hoặc 1/0
      });
    }
  }, [disease, visible, form]);

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

    if (!values.isActive) {
      message.error("Vui lòng chọn trạng thái!");
      setLoading(false);
      return;
    }

    // Chuẩn bị dữ liệu gửi lên backend bằng FormData
    const formData = new FormData();
    formData.append("name", values.name.trim());
    formData.append("description", values.description.trim());
    formData.append(
      "isActive",
      values.isActive === IsActive.Active ? IsActive.Active.toString() : IsActive.Inactive.toString()
    );

    // Debug FormData
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      await diseaseService.updateDisease(disease.diseaseId, formData);
      console.log("Cập nhật bệnh thành công");
      message.success("Bệnh đã được cập nhật thành công!");
      refreshDiseases();
      onClose();
    } catch (error: any) {
      console.error("Lỗi khi cập nhật bệnh:", error);
      message.error(
        `Cập nhật bệnh thất bại! ${
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
      title="CHỈNH SỬA BỆNH"
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
          <Input.TextArea placeholder="Nhập mô tả bệnh" />
        </Form.Item>

        <Form.Item
          name="isActive"
          label="Trạng thái"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
        >
          <Select>
            <Option value={IsActive.Active}>Hoạt động</Option>
            <Option value={IsActive.Inactive}>Không hoạt động</Option>
          </Select>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm"
          >
            {loading ? "Đang xử lý..." : "Cập nhật"}
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditDiseaseModal;