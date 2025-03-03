/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Button, DatePicker, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import moment from "moment";
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

  // Khởi tạo form với dữ liệu vaccine khi modal mở
  useEffect(() => {
    if (visible && vaccine) {
      form.setFieldsValue({
        name: vaccine.name,
        description: vaccine.description,
        origin: vaccine.origin,
        manufacturer: vaccine.manufacturer,
        price: vaccine.price,
        dateOfManufacture: vaccine.dateOfManufacture
          ? moment(vaccine.dateOfManufacture)
          : null,
        expiryDate: vaccine.expiryDate ? moment(vaccine.expiryDate) : null,
      });
      setImageUrl(vaccine.image); // Sử dụng URL hình ảnh hiện tại từ backend
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
        image: values.image?.file || null, // Lấy file từ Upload nếu có
        description: values.description,
        origin: values.origin,
        manufacturer: values.manufacturer,
        price: parseFloat(values.price),
        dateOfManufacture: values.dateOfManufacture.toISOString(),
        expiryDate: values.expiryDate.toISOString(),
      };

      console.log("Updated Vaccine Data to Send:", vaccineData); // Debug dữ liệu gửi lên
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
    onClose();
  };

  return (
    <Modal
      title="Edit Vaccine"
      visible={visible}
      onCancel={handleCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <Form.Item
            label="Profile Picture"
            style={{ display: "inline-block" }}
          >
            <Upload
              beforeUpload={() => false} // Ngăn upload tự động
              maxCount={1}
              accept="image/*"
              defaultFileList={
                imageUrl
                  ? [
                      {
                        uid: `-${Date.now()}`, // Tạo uid duy nhất sử dụng timestamp
                        name: "current-image.jpg",
                        status: "done",
                        url: imageUrl,
                      },
                    ]
                  : []
              }
              onChange={({ file }) => {
                if (file.status === "done" && file.response) {
                  handleUploadSuccess(file.response.url); // Giả sử FileUploader trả về URL
                }
              }}
            >
              <Button icon={<UploadOutlined />}>Upload Image</Button>
            </Upload>
          </Form.Item>
        </div>

        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please input vaccine name!" }]}
        >
          <Input placeholder="Enter vaccine name" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please input description!" }]}
        >
          <Input.TextArea placeholder="Enter description" />
        </Form.Item>

        <Form.Item
          label="Origin"
          name="origin"
          rules={[{ required: true, message: "Please input origin!" }]}
        >
          <Input placeholder="Enter origin" />
        </Form.Item>

        <Form.Item
          label="Manufacturer"
          name="manufacturer"
          rules={[{ required: true, message: "Please input manufacturer!" }]}
        >
          <Input placeholder="Enter manufacturer" />
        </Form.Item>

        <Form.Item
          label="Price"
          name="price"
          rules={[{ required: true, message: "Please input price!" }]}
        >
          <Input type="number" placeholder="Enter price" />
        </Form.Item>

        <Form.Item
          label="Date of Manufacture"
          name="dateOfManufacture"
          rules={[
            { required: true, message: "Please select date of manufacture!" },
          ]}
        >
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Select date of manufacture"
          />
        </Form.Item>

        <Form.Item
          label="Expiry Date"
          name="expiryDate"
          rules={[{ required: true, message: "Please select expiry date!" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            placeholder="Select expiry date"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={imageUploading}
          >
            Update
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditVaccineModal;
