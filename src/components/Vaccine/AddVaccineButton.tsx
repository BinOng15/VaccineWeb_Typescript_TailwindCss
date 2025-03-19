/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  DatePicker,
  Upload,
  notification,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import vaccineService from "../../service/vaccineService";
import { CreateVaccineDTO } from "../../models/Vaccine";
import { Dayjs } from "dayjs"; // Thay moment bằng dayjs

interface AddVaccineModalProps {
  visible: boolean;
  onClose: () => void;
  refreshVaccines: () => void;
}

const AddVaccineModal: React.FC<AddVaccineModalProps> = ({
  visible,
  onClose,
  refreshVaccines,
}) => {
  const [form] = Form.useForm();
  const [dateOfManufacture, setDateOfManufacture] = useState<Dayjs | null>(null);

  const handleSubmit = async (values: any) => {
    try {
      const vaccineData: CreateVaccineDTO = {
        name: values.name,
        image: values.image?.file || null,
        description: values.description,
        origin: values.origin,
        manufacturer: values.manufacturer,
        price: parseFloat(values.price),
        quantity: parseFloat(values.quantity),
        dateOfManufacture: values.dateOfManufacture.toISOString(),
        expiryDate: values.expiryDate.toISOString(),
      };

      console.log("Vaccine Data to Send:", vaccineData);
      await vaccineService.createVaccine(vaccineData);
      notification.success({
        message: "Success",
        description: "Vaccine created successfully!",
      });

      form.resetFields();
      setDateOfManufacture(null);
      refreshVaccines();
      onClose();
    } catch (error: any) {
      console.error("Error creating vaccine:", error.response?.data);
      notification.error({
        message: "Error",
        description:
          error?.response?.data?.message || "Failed to create vaccine!",
      });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setDateOfManufacture(null);
    onClose();
  };

  // Hàm vô hiệu hóa ngày trước dateOfManufacture trong expiryDate
  const disabledExpiryDate = (current: Dayjs) => {
    return dateOfManufacture ? current.isBefore(dateOfManufacture, "day") : false;
  };

  return (
    <Modal
      title="Tạo mới vắc xin"
      open={visible}
      onCancel={handleCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Tên vắc xin"
          name="name"
          rules={[{ required: true, message: "Hãy nhập tên của vắc xin!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Hình ảnh"
          name="image"
          rules={[
            { required: true, message: "Hãy tải lên hình ảnh của vắc xin!" },
          ]}
        >
          <Upload
            beforeUpload={() => false}
            maxCount={1}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Tải lên</Button>
          </Upload>
        </Form.Item>

        <Form.Item
          label="Thông tin vắc xin"
          name="description"
          rules={[
            { required: true, message: "Hãy nhập thông tin về vắc xin!" },
          ]}
        >
          <Input.TextArea />
        </Form.Item>

        <Form.Item
          label="Xuất xứ"
          name="origin"
          rules={[{ required: true, message: "Hãy nhập xuất xứ của vắc xin!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Nhà sản xuất"
          name="manufacturer"
          rules={[{ required: true, message: "Hãy nhập vào nhà sản xuất!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Giá"
          name="price"
          rules={[{ required: true, message: "Hãy nhập giá!" }]}
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          label="Số lượng"
          name="quantity"
          rules={[{ required: true, message: "Hãy nhập số lượng!" }]}
        >
          <Input type="number" />
        </Form.Item>

        <Form.Item
          label="Ngày sản xuất"
          name="dateOfManufacture"
          rules={[{ required: true, message: "Hãy nhập vào ngày sản xuất!" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            onChange={(date) => setDateOfManufacture(date)}
          />
        </Form.Item>

        <Form.Item
          label="Hạn sử dụng"
          name="expiryDate"
          rules={[{ required: true, message: "Hãy nhập vào hạn sử dụng!" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            disabledDate={disabledExpiryDate}
          />
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

export default AddVaccineModal;