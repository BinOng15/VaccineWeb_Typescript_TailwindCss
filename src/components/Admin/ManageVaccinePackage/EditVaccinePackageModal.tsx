/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import {
  UpdateVaccinePackageDTO,
  VaccinePackageResponseDTO,
} from "../../../models/VaccinePackage";
import vaccinePackageService from "../../../service/vaccinePackageService";

interface EditVaccinePackageModalProps {
  packageData: VaccinePackageResponseDTO;
  visible: boolean;
  onClose: () => void;
  refreshPackages: () => void;
}

const EditVaccinePackageModal: React.FC<EditVaccinePackageModalProps> = ({
  packageData,
  visible,
  onClose,
  refreshPackages,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Khởi tạo form với dữ liệu gói vaccine khi modal mở
  useEffect(() => {
    if (visible && packageData) {
      form.setFieldsValue({
        name: packageData.name,
        description: packageData.description,
        totalPrice: packageData.totalPrice,
      });
    }
  }, [packageData, visible, form]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const updatedData: UpdateVaccinePackageDTO = {
        name: values.name !== packageData.name ? values.name : undefined,
        description:
          values.description !== packageData.description
            ? values.description
            : undefined,
      };

      // Chỉ gửi các trường có thay đổi
      if (!updatedData.name && !updatedData.description) {
        message.info("Không có thay đổi để cập nhật.");
        handleCancel();
        return;
      }

      console.log("Updated Vaccine Package Data to Send:", updatedData); // Debug dữ liệu gửi lên
      const success = await vaccinePackageService.updatePackage(
        packageData.packageId,
        updatedData
      );
      if (success) {
        message.success("Vaccine package updated successfully");
        refreshPackages();
        onClose();
      } else {
        message.error("Failed to update vaccine package");
      }
    } catch (error) {
      message.error(
        "Failed to update vaccine package: " + (error as Error).message
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
      title="Chỉnh sửa gói vaccine"
      visible={visible}
      onCancel={handleCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Tên gói vaccine"
          name="name"
          rules={[{ required: true, message: "Hãy nhập tên của gói vaccine!" }]}
        >
          <Input placeholder="Nhập tên gói vaccine" />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
          rules={[
            { required: true, message: "Hãy nhập mô tả của gói vaccine!" },
          ]}
        >
          <Input.TextArea placeholder="Nhập mô tả" />
        </Form.Item>

        <Form.Item
          label="Giá tổng"
          name="totalPrice"
          rules={[{ required: true, message: "Hãy nhập giá tổng!" }]}
        >
          <Input type="number" placeholder="Nhập giá tổng" disabled />
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

export default EditVaccinePackageModal;
