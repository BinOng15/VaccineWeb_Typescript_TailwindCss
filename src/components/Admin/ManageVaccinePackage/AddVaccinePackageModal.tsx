/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Modal, Form, Input, Button, notification } from "antd";
import { CreateVaccinePackageDTO } from "../../../models/VaccinePackage";
import vaccinePackageService from "../../../service/vaccinePackageService";

interface AddVaccinePackageModalProps {
  visible: boolean;
  onClose: () => void;
  refreshPackages: () => void;
}

const AddVaccinePackageModal: React.FC<AddVaccinePackageModalProps> = ({
  visible,
  onClose,
  refreshPackages,
}) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    try {
      const totalPrice = parseFloat(values.totalPrice);
      if (isNaN(totalPrice) || totalPrice < 0) {
        notification.error({
          message: "Error",
          description: "Giá tổng phải là một số hợp lệ và không âm!",
        });
        return;
      }

      if (!values.name.trim() || !values.description.trim()) {
        notification.error({
          message: "Error",
          description: "Tên và mô tả không được để trống!",
        });
        return;
      }

      const packageData: CreateVaccinePackageDTO = {
        name: values.name.trim(),
        description: values.description.trim(),
        totalPrice,
      };

      console.log("Vaccine Package Data to Send:", packageData); // Debug dữ liệu gửi lên
      await vaccinePackageService.createPackage(packageData);
      notification.success({
        message: "Success",
        description: "Vaccine package created successfully!",
      });

      form.resetFields();
      refreshPackages();
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
      open={visible}
      onCancel={handleCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Tên gói vaccine"
          name="name"
          rules={[{ required: true, message: "Hãy nhập tên của gói vaccine!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
          rules={[
            { required: true, message: "Hãy nhập mô tả của gói vaccine!" },
          ]}
        >
          <Input.TextArea />
        </Form.Item>

        <Form.Item
          label="Giá tổng"
          name="totalPrice"
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
