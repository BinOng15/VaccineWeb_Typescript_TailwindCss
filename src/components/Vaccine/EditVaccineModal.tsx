/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, DatePicker, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs"; // Thay moment bằng dayjs
import vaccineService from "../../service/vaccineService";
import { UpdateVaccineDTO, VaccineResponseDTO } from "../../models/Vaccine";

interface EditVaccineModalProps {
  vaccine: VaccineResponseDTO;
  visible: boolean;
  onClose: () => void;
  refreshVaccines: () => void;
}

const EditVaccineModal: React.FC<EditVaccineModalProps> = ({
  vaccine,
  visible,
  onClose,
  refreshVaccines,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [imageUploading, setImageUploading] = useState<boolean>(false);
  const [dateOfManufacture, setDateOfManufacture] = useState<Dayjs | null>(null);

  useEffect(() => {
    if (visible && vaccine) {
      const dateOfManufactureDayjs = dayjs(vaccine.dateOfManufacture);
      const expiryDateDayjs = dayjs(vaccine.expiryDate);
      form.setFieldsValue({
        name: vaccine.name,
        description: vaccine.description,
        origin: vaccine.origin,
        manufacturer: vaccine.manufacturer,
        price: vaccine.price,
        quantity: vaccine.quantity,
        dateOfManufacture: dateOfManufactureDayjs.isValid() ? dateOfManufactureDayjs : null,
        expiryDate: expiryDateDayjs.isValid() ? expiryDateDayjs : null,
      });
      setImageUrl(vaccine.image);
      setDateOfManufacture(dateOfManufactureDayjs.isValid() ? dateOfManufactureDayjs : null);
    }
  }, [vaccine, visible, form]);

  const handleUploadSuccess = async (url: string) => {
    setImageUploading(true);
    try {
      setImageUrl(url);
      message.success("Image uploaded successfully");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      const vaccineData: UpdateVaccineDTO = {
        name: values.name,
        image: values.image?.file || null,
        description: values.description,
        origin: values.origin,
        manufacturer: values.manufacturer,
        quantity: parseFloat(values.quantity),
        price: parseFloat(values.price),
        dateOfManufacture: values.dateOfManufacture.toISOString(),
        expiryDate: values.expiryDate.toISOString(),
      };

      console.log("Updated Vaccine Data to Send:", vaccineData);
      const success = await vaccineService.updateVaccine(
        vaccine.vaccineId,
        vaccineData
      );
      if (success) {
        message.success("Vaccine updated successfully");
        refreshVaccines();
        onClose();
      } else {
        message.error("Failed to update vaccine");
      }
    } catch (error) {
      message.error("Failed to update vaccine: " + (error as Error).message);
    } finally {
      setLoading(false);
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
      title="Chỉnh sửa vắc xin"
      visible={visible}
      onCancel={handleCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <Form.Item label="Hình ảnh" style={{ display: "inline-block" }}>
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              accept="image/*"
              defaultFileList={
                imageUrl
                  ? [
                    {
                      uid: `-${Date.now()}`,
                      name: "current-image.jpg",
                      status: "done",
                      url: imageUrl,
                    },
                  ]
                  : []
              }
              onChange={({ file }) => {
                if (file.status === "done" && file.response) {
                  handleUploadSuccess(file.response.url);
                }
              }}
            >
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
          </Form.Item>
        </div>

        <Form.Item
          label="Tên vắc xin"
          name="name"
          rules={[{ required: true, message: "Hãy nhập tên của vắc xin!" }]}
        >
          <Input placeholder="Nhập tên của vắc xin" />
        </Form.Item>

        <Form.Item
          label="Mô tả"
          name="description"
          rules={[{ required: true, message: "Hãy nhập mô tả của vắc xin!" }]}
        >
          <Input.TextArea placeholder="Nhập mô tả" />
        </Form.Item>

        <Form.Item
          label="Xuất xứ"
          name="origin"
          rules={[{ required: true, message: "Hãy nhập xuất xứ của vắc xin!" }]}
        >
          <Input placeholder="Nhập xuất xứ" />
        </Form.Item>

        <Form.Item
          label="Nhà sản xuất"
          name="manufacturer"
          rules={[
            { required: true, message: "Hãy nhập nhà sản xuất của vắc xin!" },
          ]}
        >
          <Input placeholder="Nhập nhà sản xuất" />
        </Form.Item>

        <Form.Item
          label="Giá"
          name="price"
          rules={[{ required: true, message: "Hãy nhập giá của vắc xin!" }]}
        >
          <Input type="number" placeholder="Nhập giá" />
        </Form.Item>
        <Form.Item
          label="Số lượng"
          name="quantity"
          rules={[
            { required: true, message: "Hãy nhập số lượng của vắc xin!" },
          ]}
        >
          <Input type="number" placeholder="Nhập số lượng" />
        </Form.Item>
        <Form.Item
          label="Ngày sản xuất"
          name="dateOfManufacture"
          rules={[
            { required: true, message: "Hãy chọn ngày sản xuất của vắc xin!" },
          ]}
        >
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Chọn ngày sản xuất"
            onChange={(date) => setDateOfManufacture(date)}
          />
        </Form.Item>

        <Form.Item
          label="Hạn sử dụng"
          name="expiryDate"
          rules={[
            { required: true, message: "Hãy chọn hạn sử dụng của vắc xin!" },
          ]}
        >
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Chọn hạn sử dụng"
            disabledDate={disabledExpiryDate}
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={imageUploading}
          >
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditVaccineModal;