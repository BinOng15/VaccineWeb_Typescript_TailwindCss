/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Modal, Form, Input, Button, notification } from "antd";
import { CreateVaccinePackageDTO } from "../../../models/VaccinePackage";
import vaccinePackageService from "../../../service/vaccinePackageService";

interface AddVaccinePackageModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddVaccinePackageModal: React.FC<AddVaccinePackageModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const packageData: CreateVaccinePackageDTO = {
        name: values.name,
        description: values.description,
        totalPrice: parseFloat(values.totalPrice),
      };
      console.log("Package Data to Send:", packageData); // Debug dữ liệu gửi lên
      await vaccinePackageService.createPackage(packageData);
      notification.success({
        message: "Success",
        description: "Vaccine package created successfully!",
      });

      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error creating vaccine package:", error.response?.data);
      notification.error({
        message: "Error",
        description:
          error?.response?.data?.message || "Failed to create vaccine package!",
      });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Tạo mới gói vaccine"
      visible={visible}
      onCancel={handleCancel}
      onOk={() => form.submit()}
      okText="Tạo mới"
      confirmLoading={loading}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="Tên gói vaccine"
          rules={[{ required: true, message: "Hãy nhập tên của gói vaccine!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[
            { required: true, message: "Hãy nhập mô tả của gói vaccine!" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="totalPrice"
          label="Giá tổng"
          rules={[{ required: true, message: "Hãy nhập giá tổng!" }]}
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Xác nhận
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddVaccinePackageModal;
