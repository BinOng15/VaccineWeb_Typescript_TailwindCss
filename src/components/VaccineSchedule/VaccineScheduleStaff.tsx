/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { message, Spin, Modal, Button, Select, Form } from "antd";
import vaccineScheduleService from "../../service/vaccineScheduleService";
import diseaseService from "../../service/diseaseService";
import {
  VaccineScheduleResponseDTO,
  CreateVaccineSchedule,
  UpdateVaccineSchedule,
} from "../../models/VaccineSchedule";
import { DiseaseResponseDTO } from "../../models/Disease";

const { Option } = Select;

// Modal để thêm lịch tiêm mới
const AddScheduleModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onAdd: (data: CreateVaccineSchedule) => void;
  diseases: DiseaseResponseDTO[];
  existingSchedules: VaccineScheduleResponseDTO[];
}> = ({ visible, onClose, onAdd, diseases, existingSchedules }) => {
  const [form] = Form.useForm();

  const getNextDoseNumber = (diseaseId: number) => {
    const schedulesForDisease = existingSchedules.filter(
      (schedule) => schedule.diseaseId === diseaseId
    );
    if (schedulesForDisease.length === 0) return 1; // Bắt đầu từ 1 nếu chưa có lịch nào
    const maxDoseNumber = Math.max(
      ...schedulesForDisease.map((schedule) => schedule.doseNumber)
    );
    return maxDoseNumber + 1; // Tăng dần từ giá trị lớn nhất
  };

  const handleDiseaseChange = (diseaseId: number) => {
    const nextDoseNumber = getNextDoseNumber(diseaseId);
    form.setFieldsValue({ doseNumber: nextDoseNumber });
  };

  const handleFinish = (values: any) => {
    let ageInMonths: number;
    if (values.ageInMonths === "24-36") {
      ageInMonths = 24;
    } else if (values.ageInMonths === "48-72") {
      ageInMonths = 48;
    } else {
      ageInMonths = parseInt(values.ageInMonths);
    }

    const newSchedule: CreateVaccineSchedule = {
      diseaseId: values.diseaseId,
      ageInMonths: ageInMonths.toString(),
      doseNumber: getNextDoseNumber(values.diseaseId), // Thêm doseNumber vào đây
    };
    onAdd(newSchedule);
    form.resetFields();
    onClose();
  };

  const ageOptions = [
    { label: "0 tháng", value: "0" },
    ...Array(12)
      .fill(0)
      .map((_, i) => ({ label: `${i + 1} tháng`, value: (i + 1).toString() })),
    { label: "2-3 tuổi", value: "24-36" },
    { label: "4-6 tuổi", value: "48-72" },
  ];

  return (
    <Modal
      title="Thêm mới lịch tiêm chủng"
      visible={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
    >
      <Form form={form} onFinish={handleFinish} layout="vertical">
        <Form.Item
          name="diseaseId"
          label="Bệnh"
          rules={[{ required: true, message: "Vui lòng chọn bệnh!" }]}
        >
          <Select placeholder="Chọn bệnh" onChange={handleDiseaseChange}>
            {diseases.map((disease) => (
              <Option key={disease.diseaseId} value={disease.diseaseId}>
                {disease.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="ageInMonths"
          label="Độ tuổi (tháng)"
          rules={[{ required: true, message: "Vui lòng chọn độ tuổi!" }]}
        >
          <Select placeholder="Chọn độ tuổi">
            {ageOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="doseNumber" label="Liều thứ" initialValue={1}>
          <Select disabled>
            <Option value={form.getFieldValue("doseNumber")}>
              {form.getFieldValue("doseNumber") || 1}
            </Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

// Modal để chỉnh sửa lịch tiêm
const EditScheduleModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onUpdate: (data: UpdateVaccineSchedule) => void;
  selectedSchedule: VaccineScheduleResponseDTO | null;
  diseases: DiseaseResponseDTO[];
  existingSchedules: VaccineScheduleResponseDTO[];
}> = ({ visible, onClose, onUpdate, selectedSchedule, diseases, existingSchedules }) => {
  const [form] = Form.useForm();

  const getNextDoseNumber = (diseaseId: number, currentScheduleId?: number) => {
    const schedulesForDisease = existingSchedules.filter(
      (schedule) => schedule.diseaseId === diseaseId && schedule.vaccineScheduleId !== currentScheduleId
    );
    if (schedulesForDisease.length === 0) return 1;
    const maxDoseNumber = Math.max(
      ...schedulesForDisease.map((schedule) => schedule.doseNumber)
    );
    return maxDoseNumber + 1;
  };

  useEffect(() => {
    if (selectedSchedule) {
      let ageValue: string = selectedSchedule.ageInMonths.toString();
      if (selectedSchedule.ageInMonths >= 24 && selectedSchedule.ageInMonths <= 36) {
        ageValue = "24-36";
      } else if (selectedSchedule.ageInMonths >= 48 && selectedSchedule.ageInMonths <= 72) {
        ageValue = "48-72";
      }
      form.setFieldsValue({
        diseaseId: selectedSchedule.diseaseId,
        ageInMonths: ageValue,
        doseNumber: selectedSchedule.doseNumber,
      });
    }
  }, [selectedSchedule, form]);

  const handleDiseaseChange = (diseaseId: number) => {
    const nextDoseNumber = getNextDoseNumber(diseaseId, selectedSchedule?.vaccineScheduleId);
    form.setFieldsValue({ doseNumber: nextDoseNumber });
  };

  const handleFinish = (values: any) => {
    let ageInMonths: number;
    if (values.ageInMonths === "24-36") {
      ageInMonths = 24;
    } else if (values.ageInMonths === "48-72") {
      ageInMonths = 48;
    } else {
      ageInMonths = parseInt(values.ageInMonths);
    }

    const updatedSchedule: UpdateVaccineSchedule = {
      diseaseId: values.diseaseId,
      ageInMonths: ageInMonths.toString(),
      doseNumber: values.doseNumber,
    };
    onUpdate(updatedSchedule);
    form.resetFields();
    onClose();
  };

  const ageOptions = [
    { label: "0 tháng", value: "0" }, // Thêm 0 tháng
    ...Array(12)
      .fill(0)
      .map((_, i) => ({ label: `${i + 1} tháng`, value: (i + 1).toString() })),
    { label: "2-3 tuổi", value: "24-36" },
    { label: "4-6 tuổi", value: "48-72" },
  ];

  return (
    <Modal
      title="Chỉnh sửa lịch tiêm chủng"
      visible={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
    >
      <Form form={form} onFinish={handleFinish} layout="vertical">
        <Form.Item
          name="diseaseId"
          label="Bệnh"
          rules={[{ required: true, message: "Vui lòng chọn bệnh!" }]}
        >
          <Select placeholder="Chọn bệnh" onChange={handleDiseaseChange}>
            {diseases.map((disease) => (
              <Option key={disease.diseaseId} value={disease.diseaseId}>
                {disease.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="ageInMonths"
          label="Độ tuổi (tháng)"
          rules={[{ required: true, message: "Vui lòng chọn độ tuổi!" }]}
        >
          <Select placeholder="Chọn độ tuổi">
            {ageOptions.map((option) => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="doseNumber" label="Liều thứ" initialValue={1}>
          <Select disabled>
            <Option value={form.getFieldValue("doseNumber")}>
              {form.getFieldValue("doseNumber") || 1}
            </Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const VaccineScheduleStaff: React.FC = () => {
  const [scheduleData, setScheduleData] = useState<VaccineScheduleResponseDTO[]>([]);
  const [diseases, setDiseases] = useState<DiseaseResponseDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
  const [selectedSchedule, setSelectedSchedule] = useState<VaccineScheduleResponseDTO | null>(null);

  useEffect(() => {
    fetchScheduleData();
    fetchDiseases();
  }, []);

  const fetchScheduleData = async () => {
    try {
      setLoading(true);
      const data = await vaccineScheduleService.getAllVaccineSchedules();
      setScheduleData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi tải lịch tiêm chủng:", error);
      message.error("Không thể tải lịch tiêm chủng");
    } finally {
      setLoading(false);
    }
  };

  const fetchDiseases = async () => {
    try {
      const data = await diseaseService.getAllDiseases();
      setDiseases(data);
    } catch (error) {
      console.error("Lỗi tải danh sách bệnh:", error);
      message.error("Không thể tải danh sách bệnh");
    }
  };

  const handleAddSchedule = async (data: CreateVaccineSchedule) => {
    try {
      const newSchedule = await vaccineScheduleService.createVaccineSchedule(data);
      setScheduleData([...scheduleData, newSchedule]);
      message.success("Thêm lịch tiêm chủng thành công!");
    } catch (error) {
      message.error("Không thể thêm lịch tiêm chủng!");
    }
  };

  const handleUpdateSchedule = async (data: UpdateVaccineSchedule) => {
    if (!selectedSchedule) return;
    try {
      await vaccineScheduleService.updateVaccineSchedule(
        selectedSchedule.vaccineScheduleId,
        data
      );
      await fetchScheduleData(); // Làm mới toàn bộ dữ liệu từ server
      message.success("Cập nhật lịch tiêm chủng thành công!");
      setIsEditModalVisible(false); // Đóng modal chỉnh sửa
      setSelectedSchedule(null); // Xóa lựa chọn hiện tại
      setIsDetailModalVisible(false); // Đóng modal chi tiết
    } catch (error) {
      message.error("Không thể cập nhật lịch tiêm chủng!");
    }
  };

  const handleDeleteSchedule = async () => {
    if (!selectedSchedule) return;
    try {
      await vaccineScheduleService.deleteVaccineSchedule(selectedSchedule.vaccineScheduleId);
      setScheduleData(
        scheduleData.filter(
          (schedule) => schedule.vaccineScheduleId !== selectedSchedule.vaccineScheduleId
        )
      );
      message.success("Xóa lịch tiêm chủng thành công!");
      setSelectedSchedule(null);
      setIsDetailModalVisible(false)
    } catch (error) {
      message.error("Không thể xóa lịch tiêm chủng!");
    }
  };

  const handleCellClick = async (diseaseId: number, ageIndex: number) => {
    let ageInMonthsRange: number[] = [];
    if (ageIndex === 0) {
      ageInMonthsRange = [0]; // Xử lý 0 tháng
    } else if (ageIndex < 13) {
      ageInMonthsRange = [ageIndex]; // Từ 1 đến 12 tháng
    } else if (ageIndex === 13) {
      ageInMonthsRange = Array.from({ length: 13 }, (_, i) => 24 + i); // 2-3 tuổi
    } else if (ageIndex === 14) {
      ageInMonthsRange = Array.from({ length: 25 }, (_, i) => 48 + i); // 4-6 tuổi
    }

    const schedules = scheduleData.filter(
      (item) =>
        item.diseaseId === diseaseId && ageInMonthsRange.includes(item.ageInMonths)
    );

    if (schedules.length > 0) {
      const schedule = schedules[0];
      try {
        const detailedSchedule = await vaccineScheduleService.getVaccineScheduleById(
          schedule.vaccineScheduleId
        );
        setSelectedSchedule(detailedSchedule);
        setIsDetailModalVisible(true);
      } catch (error) {
        message.error("Không thể lấy chi tiết lịch tiêm chủng!");
      }
    }
  };

  const diseaseMap = diseases.reduce((acc, disease) => {
    acc[disease.diseaseId] = disease.name;
    return acc;
  }, {} as Record<number, string>);

  const ageColumns = [0, ...Array(12).keys()]
    .map((i) => `${i + 1} tháng`)
    .concat(["2-3 tuổi", "4-6 tuổi"]);
  const displayAgeColumns = ageColumns.map((age, index) =>
    index === 0 ? "Sơ sinh" : age
  );

  const scheduleMap = scheduleData.reduce((acc, item) => {
    const age = item.ageInMonths;
    let columnIndex: number;
    if (age === 0) {
      columnIndex = 0; // Xử lý 0 tháng
    } else if (age <= 12) {
      columnIndex = age; // Từ 1 đến 12 tháng
    } else if (age >= 24 && age <= 36) {
      columnIndex = 13; // 2-3 tuổi
    } else if (age >= 48 && age <= 72) {
      columnIndex = 14; // 4-6 tuổi
    } else {
      return acc;
    }

    if (!acc[item.diseaseId]) acc[item.diseaseId] = {};
    acc[item.diseaseId][columnIndex] = acc[item.diseaseId][columnIndex] || [];
    acc[item.diseaseId][columnIndex].push(item);
    return acc;
  }, {} as Record<number, Record<number, VaccineScheduleResponseDTO[]>>);

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">
        LỊCH TIÊM CHỦNG CỦA HỆ THỐNG PEDIVAX
      </h1>

      <div className="flex justify-center space-x-4 mb-6">
        <Button
          type="primary"
          onClick={() => setIsAddModalVisible(true)}
          className="bg-blue-600 text-white"
        >
          Thêm mới
        </Button>
      </div>

      <div className="overflow-x-auto bg-white border border-gray-300">
        <Spin spinning={loading} size="large">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="border px-4 py-2">Bệnh</th>
                {displayAgeColumns.map((age, index) => (
                  <th key={index} className="border px-4 py-2">
                    {age}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(diseaseMap).length > 0 ? (
                Object.entries(diseaseMap).map(([diseaseId]) => {
                  const schedulesForDisease = scheduleMap[parseInt(diseaseId)] || {};
                  let scheduleIndex = 1;
                  return (
                    <tr key={diseaseId} className="odd:bg-gray-100">
                      <td className="border px-4 py-2 font-medium">
                        {diseaseMap[parseInt(diseaseId)]}
                      </td>
                      {ageColumns.map((_, columnIndex) => {
                        const schedules = schedulesForDisease[columnIndex] || [];
                        const displayNumber = schedules.length > 0 ? scheduleIndex++ : "";
                        return (
                          <td
                            key={columnIndex}
                            className="border px-4 py-2 text-center cursor-pointer hover:bg-gray-200"
                            onClick={() =>
                              schedules.length > 0 && handleCellClick(parseInt(diseaseId), columnIndex)
                            }
                          >
                            {displayNumber}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={ageColumns.length + 1} className="text-center py-4">
                    Không có lịch tiêm chủng nào được tìm thấy
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Spin>
      </div>

      <Modal
        title="CHI TIẾT LỊCH TIÊM CHỦNG"
        visible={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={null}
        style={{ textAlign: "center" }}
      >
        {selectedSchedule && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              textAlign: "center",
              padding: "20px",
            }}
          >
            <p>
              <strong>Tên bệnh:</strong> {diseaseMap[selectedSchedule.diseaseId]}
            </p>
            <p>
              <strong>Độ tuổi (tháng):</strong> {selectedSchedule.ageInMonths}
            </p>
            <p>
              <strong>Liều thứ:</strong> {selectedSchedule.doseNumber}
            </p>
            <div style={{ marginTop: "20px" }}>
              <Button
                type="default"
                onClick={() => selectedSchedule && setIsEditModalVisible(true)}
                disabled={!selectedSchedule}
                className="bg-yellow-500 text-white mr-5"
              >
                Chỉnh sửa
              </Button>
              <Button
                type="default"
                onClick={handleDeleteSchedule}
                disabled={!selectedSchedule}
                className="bg-red-500 text-white"
              >
                Xóa
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <AddScheduleModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onAdd={handleAddSchedule}
        diseases={diseases}
        existingSchedules={scheduleData}
      />

      <EditScheduleModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onUpdate={handleUpdateSchedule}
        selectedSchedule={selectedSchedule}
        diseases={diseases}
        existingSchedules={scheduleData}
      />
    </div>
  );
};

export default VaccineScheduleStaff;