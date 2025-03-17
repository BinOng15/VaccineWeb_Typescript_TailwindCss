/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Modal, Form, Select, InputNumber, Button, notification } from "antd";
import { CreateVaccinePackageDetailDTO } from "../../../models/VaccinePackageDetails";
import vaccinePackageDetailService from "../../../service/vaccinePackageDetailService";
import vaccinePackageService from "../../../service/vaccinePackageService";
import vaccineService from "../../../service/vaccineService";
import { VaccinePackageResponseDTO } from "../../../models/VaccinePackage";
import { VaccineResponseDTO } from "../../../models/Vaccine";

interface AddVaccinePackageDetailButtonProps {
  visible: boolean;
  onClose: () => void;
  refreshDetails: () => void;
}

const AddVaccinePackageDetailButton: React.FC<
  AddVaccinePackageDetailButtonProps
> = ({ visible, onClose, refreshDetails }) => {
  const [form] = Form.useForm();
  const [vaccinePackages, setVaccinePackages] = useState<
    VaccinePackageResponseDTO[]
  >([]);
  const [vaccines, setVaccines] = useState<VaccineResponseDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [packageDetails, setPackageDetails] = useState<any[]>([]); // Lưu trữ danh sách VaccinePackageDetail

  // Lấy danh sách gói vắc xin, vắc xin và chi tiết gói vắc xin khi modal mở
  useEffect(() => {
    const fetchData = async () => {
      try {
        const packages = await vaccinePackageService.getAllPackages();
        const vaccinesList = await vaccineService.getAllVaccines();
        const details =
          await vaccinePackageDetailService.getAllPackagesDetail();

        // Lọc các gói vắc xin có isActive = 1
        const activePackages = packages.filter((pkg) => pkg.isActive === 1);
        // Lọc các vắc xin có isActive = 1
        const activeVaccines = vaccinesList.filter(
          (vaccine) => vaccine.isActive === 1
        );

        setVaccinePackages(activePackages);
        setVaccines(activeVaccines);
        setPackageDetails(details); // Lưu trữ danh sách VaccinePackageDetail
      } catch (error) {
        notification.error({
          message: "Error",
          description: "Không thể lấy dữ liệu gói vắc xin hoặc vắc xin!",
        });
      }
    };

    if (visible) {
      fetchData();
    }
  }, [visible]);

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // Tìm gói vắc xin tương ứng để lấy totalDoses
      const selectedPackage = vaccinePackages.find(
        (pkg) => pkg.vaccinePackageId === values.vaccinePackageId
      );

      if (!selectedPackage) {
        throw new Error("Không tìm thấy gói vắc xin được chọn.");
      }

      const totalDoses = selectedPackage.totalDoses;

      // Đếm số lượng VaccinePackageDetail hiện tại của gói vắc xin được chọn
      const currentDetailsCount = packageDetails.filter(
        (detail) => detail.vaccinePackageId === values.vaccinePackageId
      ).length;

      // Kiểm tra xem số lượng VaccinePackageDetail hiện tại đã đạt totalDoses chưa
      if (currentDetailsCount >= totalDoses) {
        notification.error({
          message: "Error",
          description: `Số lượng chi tiết gói vắc xin đã đạt tối đa (${totalDoses}) cho gói "${selectedPackage.name}"!`,
        });
        setLoading(false);
        return;
      }

      const doseNumber = values.doseNumber;

      // Kiểm tra điều kiện: doseNumber không được vượt quá totalDoses
      if (doseNumber > totalDoses) {
        notification.error({
          message: "Error",
          description: `Số liều (${doseNumber}) vượt quá tổng số liều của gói (${totalDoses})!`,
        });
        setLoading(false);
        return;
      }

      const detailData: CreateVaccinePackageDetailDTO = {
        vaccinePackageId: values.vaccinePackageId,
        vaccineId: values.vaccineId,
        doseNumber: values.doseNumber,
      };

      console.log("Detail Data to Send:", detailData); // Debug dữ liệu gửi lên
      await vaccinePackageDetailService.createPackageDetail(detailData); // Gửi dữ liệu dưới dạng JSON
      notification.success({
        message: "Success",
        description: "Thêm chi tiết gói vắc xin thành công!",
      });

      form.resetFields();
      refreshDetails();
      onClose();
    } catch (error: any) {
      console.error(
        "Error creating vaccine package detail:",
        error.response?.data
      );
      notification.error({
        message: "Error",
        description:
          error?.response?.data?.message ||
          "Không thể thêm chi tiết gói vắc xin!",
      });
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
      title="Thêm chi tiết gói vắc xin"
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
              label: `${pkg.name} (Tổng số liều: ${pkg.totalDoses})`, // Hiển thị totalDoses trong label
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
          label="Liều số"
          name="doseNumber"
          rules={[{ required: true, message: "Vui lòng nhập số liều!" }]}
        >
          <InputNumber min={1} style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Xác nhận
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddVaccinePackageDetailButton;
