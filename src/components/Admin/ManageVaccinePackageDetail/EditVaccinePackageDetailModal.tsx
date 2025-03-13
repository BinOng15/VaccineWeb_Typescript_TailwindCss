/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Modal, Form, Select, InputNumber, Button, message } from "antd";
import vaccinePackageDetailService from "../../../service/vaccinePackageDetailService";
import vaccinePackageService from "../../../service/vaccinePackageService";
import vaccineService from "../../../service/vaccineService";
import {
  UpdateVaccinePackageDetailDTO,
  VaccinePackageDetailResponseDTO,
} from "../../../models/VaccinePackageDetails";
import { VaccinePackageResponseDTO } from "../../../models/VaccinePackage";
import { VaccineResponseDTO } from "../../../models/Vaccine";

interface EditVaccinePackageDetailModalProps {
  detail: VaccinePackageDetailResponseDTO;
  visible: boolean;
  onClose: () => void;
  refreshDetails: () => void;
}

const EditVaccinePackageDetailModal: React.FC<
  EditVaccinePackageDetailModalProps
> = ({ detail, visible, onClose, refreshDetails }) => {
  const [form] = Form.useForm();
  const [vaccinePackages, setVaccinePackages] = useState<
    VaccinePackageResponseDTO[]
  >([]);
  const [vaccines, setVaccines] = useState<VaccineResponseDTO[]>([]);

  // Lấy danh sách gói vắc xin và vắc xin khi modal mở
  useEffect(() => {
    const fetchData = async () => {
      try {
        const packages = await vaccinePackageService.getAllPackages();
        const vaccinesList = await vaccineService.getAllVaccines();
        setVaccinePackages(packages);
        setVaccines(vaccinesList);
      } catch (error) {
        message.error("Không thể lấy dữ liệu gói vắc xin hoặc vắc xin!");
      }
    };
    if (visible) {
      fetchData();
    }
  }, [visible]);

  // Điền giá trị mặc định khi modal mở
  useEffect(() => {
    if (visible && detail) {
      form.setFieldsValue({
        vaccinePackageId: detail.vaccinePackageId,
        vaccineId: detail.vaccineId,
        doseNumber: detail.doseNumber,
      });
    }
  }, [detail, visible, form]);

  const handleSubmit = async (values: any) => {
    try {
      const updatePackageDetail: UpdateVaccinePackageDetailDTO = {
        vaccinePackageId: values.vaccinePackageId,
        vaccineId: values.vaccineId,
        doseNumber: values.doseNumber,
      };

      await vaccinePackageDetailService.updatePackageDetail(
        detail.vaccinePackageDetailId,
        updatePackageDetail
      );
      message.success("Cập nhật chi tiết gói vắc xin thành công!");
      refreshDetails();
      onClose();
    } catch (error) {
      message.error("Không thể cập nhật chi tiết gói vắc xin!");
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title="Chỉnh sửa chi tiết gói vắc xin"
      visible={visible}
      onCancel={handleCancel}
      footer={null}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Gói vắc xin"
          name="vaccinePackageId"
          rules={[{ required: true, message: "Vui lòng chọn gói vắc xin!" }]}
        >
          <Select
            placeholder="Chọn gói vắc xin"
            style={{ width: "100%" }}
            options={vaccinePackages.map((pkg) => ({
              value: pkg.vaccinePackageId,
              label: pkg.name,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Vắc xin"
          name="vaccineId"
          rules={[{ required: true, message: "Vui lòng chọn vắc xin!" }]}
        >
          <Select
            placeholder="Chọn vắc xin"
            style={{ width: "100%" }}
            options={vaccines.map((vaccine) => ({
              value: vaccine.vaccineId,
              label: vaccine.name,
            }))}
          />
        </Form.Item>

        <Form.Item
          label="Số liều"
          name="doseNumber"
          rules={[{ required: true, message: "Vui lòng nhập số liều!" }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditVaccinePackageDetailModal;
