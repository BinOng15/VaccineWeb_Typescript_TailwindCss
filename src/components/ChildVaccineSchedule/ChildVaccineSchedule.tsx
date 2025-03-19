/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { message, Select, Spin, Modal, Button } from "antd";
import { CheckOutlined } from "@ant-design/icons";
import vaccineProfileService from "../../service/vaccineProfileService";
import childProfileService from "../../service/childProfileService";
import diseaseService from "../../service/diseaseService";
import vaccineScheduleService from "../../service/vaccineScheduleService";
import {
  UpdateVaccineProfileDTO,
  VaccineProfileResponseDTO,
} from "../../models/VaccineProfile";
import { ChildProfileResponseDTO } from "../../models/ChildProfile";
import { DiseaseResponseDTO } from "../../models/Disease";
import { AppointmentResponseDTO } from "../../models/Appointment";
import { VaccineScheduleResponseDTO } from "../../models/VaccineSchedule";
import moment from "moment";
import { useAuth } from "../../context/AuthContext";
import appointmentService from "../../service/appointmentService";
import { AppointmentStatus } from "../../models/Type/enum";
import { VaccineResponseDTO } from "../../models/Vaccine";
import vaccineService from "../../service/vaccineService";

const { Option } = Select;

const ChildVaccineSchedule: React.FC = () => {
  const [scheduleData, setScheduleData] = useState<VaccineProfileResponseDTO[]>([]);
  const [children, setChildren] = useState<ChildProfileResponseDTO[]>([]);
  const [diseases, setDiseases] = useState<DiseaseResponseDTO[]>([]);
  const [vaccines, setVaccines] = useState<VaccineResponseDTO[]>([]);
  const [vaccineSchedules, setVaccineSchedules] = useState<VaccineScheduleResponseDTO[]>([]);
  const [selectedChild, setSelectedChild] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedSchedule, setSelectedSchedule] = useState<VaccineProfileResponseDTO | null>(null);
  const [childBirthDate, setChildBirthDate] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [appointments, setAppointments] = useState<AppointmentResponseDTO[]>([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponseDTO | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchChildren();
    fetchDiseases();
    fetchVaccines();
    fetchVaccineSchedules();
  }, [user]);

  useEffect(() => {
    if (selectedChild) {
      fetchScheduleData(selectedChild);
    } else {
      setScheduleData([]);
      setChildBirthDate(null);
    }
  }, [selectedChild]);

  const fetchVaccines = async () => {
    try {
      const data = await vaccineService.getAllVaccines();
      setVaccines(data);
    } catch (error) {
      console.error("Lỗi tải danh sách vaccine:", error);
      message.error("Không thể tải danh sách vaccine");
    }
  };

  const fetchScheduleData = async (childId: number) => {
    try {
      setLoading(true);
      const childProfile = children.find((child) => child.childId === childId);
      if (childProfile) {
        setChildBirthDate(childProfile.dateOfBirth);
      }
      const data = await vaccineProfileService.getVaccineProfileByChildId(childId);
      setScheduleData(Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error("Lỗi tải lịch tiêm chủng:", error);
      message.error("Không thể tải lịch tiêm chủng");
    } finally {
      setLoading(false);
    }
  };

  const fetchChildren = async () => {
    try {
      const data = await childProfileService.getAllChildProfiles();
      if (user?.userId) {
        const filteredChildren = data.filter(
          (child) => child.userId === user.userId
        );
        setChildren(filteredChildren);
        if (filteredChildren.length === 1) {
          setSelectedChild(filteredChildren[0].childId);
        }
      } else {
        setChildren([]);
        message.warning("Không thể xác định người dùng hiện tại!");
      }
    } catch (error) {
      console.error("Lỗi tải danh sách trẻ:", error);
      message.error("Không thể tải danh sách trẻ");
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

  const fetchVaccineSchedules = async () => {
    try {
      const data = await vaccineScheduleService.getAllVaccineSchedules();
      setVaccineSchedules(data);
    } catch (error) {
      console.error("Lỗi tải danh sách vaccine schedule:", error);
      message.error("Không thể tải danh sách vaccine schedule");
    }
  };

  const fetchAppointments = async (childId: number) => {
    try {
      const data = await appointmentService.getAppointmentsByChildId(childId);

      console.log("All appointments for childId", childId, ":", data);

      const completedSingleVaccinations = data.filter((app) => {
        const isCompleted = app.appointmentStatus === AppointmentStatus.Completed;
        const isSingleVaccination =
          app.vaccineId !== null &&
          app.vaccineId !== undefined &&
          (app.vaccinePackageId === null || app.vaccinePackageId === 0);
        return isCompleted && isSingleVaccination;
      });

      console.log("Filtered completed single vaccinations:", completedSingleVaccinations);

      setAppointments(completedSingleVaccinations);
      if (completedSingleVaccinations.length > 0) {
        setSelectedAppointmentId(completedSingleVaccinations[0].appointmentId);
      } else {
        setSelectedAppointmentId(null);
        message.warning(
          "Không có cuộc hẹn tiêm lẻ nào đã hoàn thành cho trẻ này! (Chỉ các cuộc hẹn tiêm lẻ được hiển thị)"
        );
      }
    } catch (error) {
      console.error("Lỗi tải danh sách cuộc hẹn:", error);
      message.error("Không thể tải danh sách cuộc hẹn");
      setAppointments([]);
      setSelectedAppointmentId(null);
    }
  };

  const fetchAppointmentForVaccineProfile = async (appointmentId: number) => {
    try {
      const appointment = await appointmentService.getAppointmentById(appointmentId);
      setSelectedAppointment(appointment);
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin cuộc hẹn ${appointmentId}:`, error);
      message.error("Không thể tải thông tin cuộc hẹn");
      setSelectedAppointment(null);
    }
  };

  const handleCellClick = (schedule: VaccineProfileResponseDTO) => {
    setSelectedSchedule(schedule);
    setIsModalVisible(true);
    setAppointments([]);
    setSelectedAppointmentId(null);
    setSelectedAppointment(null);

    if (schedule.isCompleted === 1 && schedule.appointmentId) {
      fetchAppointmentForVaccineProfile(schedule.appointmentId);
    }

    fetchAppointments(schedule.childId);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedSchedule(null);
    setAppointments([]);
    setSelectedAppointmentId(null);
    setSelectedAppointment(null);
    if (selectedChild) {
      fetchScheduleData(selectedChild);
    }
  };

  const handleUpdateVaccineProfile = async () => {
    if (!selectedSchedule || !selectedAppointmentId) return;

    try {
      setIsUpdating(true);

      const selectedAppointment = appointments.find(
        (app) => app.appointmentId === selectedAppointmentId
      );
      if (!selectedAppointment) {
        message.error("Không tìm thấy cuộc hẹn được chọn!");
        setIsUpdating(false);
        return;
      }
      const formattedDate = moment(
        selectedAppointment.appointmentDate,
        "DD/MM/YYYY"
      ).format("DD/MM/YYYY");

      const updateData: UpdateVaccineProfileDTO = {
        childId: selectedSchedule.childId,
        appointmentId: selectedAppointmentId,
        vaccinationDate: formattedDate,
        diseaseId: selectedSchedule.diseaseId,
      };

      console.log("Payload gửi đi:", JSON.stringify(updateData, null, 2));

      await vaccineProfileService.updateVaccineProfile(
        selectedSchedule.vaccineProfileId,
        updateData
      );

      setScheduleData((prev) =>
        prev.map((item) =>
          item.vaccineProfileId === selectedSchedule.vaccineProfileId
            ? {
              ...item,
              vaccinationDate: formattedDate,
              isCompleted: 1,
              appointmentId: selectedAppointmentId,
            }
            : item
        )
      );

      setSelectedSchedule((prev) =>
        prev
          ? {
            ...prev,
            vaccinationDate: formattedDate,
            isCompleted: 1,
            appointmentId: selectedAppointmentId,
          }
          : null
      );

      fetchAppointmentForVaccineProfile(selectedAppointmentId);

      message.success("Cập nhật lịch tiêm chủng thành công");
    } catch (error: any) {
      console.error("Lỗi cập nhật lịch tiêm:", error);
      const errorMessage =
        error.response?.data?.detail || "Không thể cập nhật lịch tiêm chủng";
      message.error(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const vaccineMap = vaccines.reduce((acc, vaccine) => {
    acc[vaccine.vaccineId] = vaccine.name;
    return acc;
  }, {} as Record<number, string>);

  const diseaseMap = diseases.reduce((acc, disease) => {
    acc[disease.diseaseId] = disease.name;
    return acc;
  }, {} as Record<number, string>);

  const childMap = children.reduce((acc, child) => {
    acc[child.childId] = child.fullName;
    return acc;
  }, {} as Record<number, string>);

  // Tính số liều tối đa cho mỗi bệnh từ vaccineSchedule
  const maxDoseMap = vaccineSchedules.reduce((acc, schedule) => {
    const diseaseId = schedule.diseaseId;
    if (!acc[diseaseId] || schedule.doseNumber > acc[diseaseId]) {
      acc[diseaseId] = schedule.doseNumber;
    }
    return acc;
  }, {} as Record<number, number>);

  // Đếm số liều đã hoàn thành cho mỗi bệnh
  const completedDosesMap = scheduleData.reduce((acc, profile) => {
    const diseaseId = profile.diseaseId;
    if (profile.isCompleted === 1) {
      if (!acc[diseaseId]) {
        acc[diseaseId] = 0;
      }
      acc[diseaseId]++;
    }
    return acc;
  }, {} as Record<number, number>);

  const uniqueMonths: {
    monthsDiff: number;
    scheduledDate: string;
    range?: string;
  }[] = [];
  scheduleData.forEach((item) => {
    const birthDate = moment(childBirthDate, "DD/MM/YYYY");
    const scheduledDate = moment(item.scheduledDate, "DD/MM/YYYY");
    const monthsDiff = scheduledDate.diff(birthDate, "months");
    const scheduledDateStr = scheduledDate.format("DD/MM/YYYY");

    let range: string | undefined;
    if (monthsDiff >= 24 && monthsDiff <= 36) {
      range = "2-3 tuổi";
    } else if (monthsDiff >= 48 && monthsDiff <= 72) {
      range = "4-6 tuổi";
    }

    if (!range) {
      if (
        !uniqueMonths.some(
          (m) =>
            m.monthsDiff === monthsDiff && m.scheduledDate === scheduledDateStr
        )
      ) {
        uniqueMonths.push({ monthsDiff, scheduledDate: scheduledDateStr });
      }
    } else {
      if (!uniqueMonths.some((m) => m.range === range)) {
        uniqueMonths.push({
          monthsDiff,
          scheduledDate: scheduledDateStr,
          range,
        });
      }
    }
  });

  uniqueMonths.sort((a, b) => a.monthsDiff - b.monthsDiff);

  const ageColumns = uniqueMonths.map((month) => {
    if (month.range) {
      return month.range;
    }
    return `Tháng ${month.monthsDiff} (${month.scheduledDate})`;
  });

  const scheduleMap = scheduleData.reduce((acc, item) => {
    const birthDate = moment(childBirthDate, "DD/MM/YYYY");
    const scheduledDate = moment(item.scheduledDate, "DD/MM/YYYY");
    const monthsDiff = scheduledDate.diff(birthDate, "months");

    let columnIndex = -1;
    if (monthsDiff >= 24 && monthsDiff <= 36) {
      columnIndex = uniqueMonths.findIndex((m) => m.range === "2-3 tuổi");
    } else if (monthsDiff >= 48 && monthsDiff <= 72) {
      columnIndex = uniqueMonths.findIndex((m) => m.range === "4-6 tuổi");
    } else {
      const scheduledDateStr = scheduledDate.format("DD/MM/YYYY");
      columnIndex = uniqueMonths.findIndex(
        (m) =>
          m.monthsDiff === monthsDiff && m.scheduledDate === scheduledDateStr
      );
    }

    if (columnIndex === -1) return acc;

    if (!acc[item.diseaseId]) acc[item.diseaseId] = {};
    acc[item.diseaseId][columnIndex] = acc[item.diseaseId][columnIndex] || [];
    acc[item.diseaseId][columnIndex].push(item);
    return acc;
  }, {} as Record<number, Record<number, VaccineProfileResponseDTO[]>>);

  // Kiểm tra xem bệnh đã hoàn thành đủ liều chưa
  const isDiseaseFullyCompleted = (diseaseId: number) => {
    const maxDoses = maxDoseMap[diseaseId] || 0;
    const completedDoses = completedDosesMap[diseaseId] || 0;
    return completedDoses >= maxDoses;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <h1 className="text-3xl font-bold text-[#102A83] mb-6 text-center">
        Hồ Sơ Tiêm Chủng Cá Nhân
      </h1>

      <div className="mb-6 flex flex-col items-center space-y-2 p-4 border border-blue-300 shadow-sm rounded-lg">
        <span className="text-lg font-bold">
          Lựa chọn trẻ để xem lịch tiêm phù hợp
        </span>
        <Select
          placeholder="Chọn trẻ"
          style={{ width: 220, fontWeight: "bold" }}
          onChange={(value: number) => setSelectedChild(value)}
          value={selectedChild}
          disabled={children.length === 0}
        >
          {children.map((child) => (
            <Option key={child.childId} value={child.childId}>
              {child.fullName}
            </Option>
          ))}
        </Select>
      </div>

      <div className="overflow-x-auto bg-white border border-gray-300">
        <Spin spinning={loading} size="large">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="border px-20 py-2">Bệnh</th>
                {ageColumns.map((age, index) => (
                  <th key={index} className="border px-2 py-2">
                    {age}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.keys(diseaseMap).length > 0 ? (
                Object.entries(diseaseMap).map(([diseaseId]) => {
                  const schedulesForDisease =
                    scheduleMap[parseInt(diseaseId)] || {};
                  return (
                    <tr key={diseaseId} className="odd:bg-gray-100">
                      <td className="border px-4 py-2 font-medium">
                        {diseaseMap[parseInt(diseaseId)]}
                      </td>
                      {ageColumns.map((_, columnIndex) => {
                        const schedules =
                          schedulesForDisease[columnIndex] || [];
                        return (
                          <td
                            key={columnIndex}
                            className="border px-4 py-2 text-center cursor-pointer hover:bg-gray-200"
                            onClick={() =>
                              schedules.length > 0 &&
                              handleCellClick(schedules[0])
                            }
                          >
                            {schedules.length > 0 ? (
                              <div>
                                {schedules[0].doseNumber}
                                {schedules[0].isCompleted === 1 && (
                                  <CheckOutlined
                                    style={{
                                      color: "green",
                                      marginLeft: 4,
                                      verticalAlign: "middle",
                                    }}
                                  />
                                )}
                              </div>
                            ) : (
                              ""
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={ageColumns.length + 1}
                    className="text-center py-4"
                  >
                    {selectedChild
                      ? "Không có lịch tiêm"
                      : "Vui lòng chọn trẻ để xem lịch tiêm"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Spin>
      </div>

      <Modal
        title={<div className="text-xl font-bold text-blue-900">Chi Tiết Hồ Sơ Tiêm Chủng Cá Nhân</div>}
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Đóng
          </Button>,
          selectedSchedule?.isCompleted === 0 && !isDiseaseFullyCompleted(selectedSchedule?.diseaseId) && (
            <Button
              key="submit"
              type="primary"
              loading={isUpdating}
              onClick={handleUpdateVaccineProfile}
              disabled={!selectedAppointmentId || appointments.length === 0}
            >
              Cập nhật
            </Button>
          ),
        ]}
        centered
        width={600}
        bodyStyle={{
          maxHeight: "50vh",
          overflowY: "auto",
          padding: "24px",
        }}
      >
        {selectedSchedule && (
          <div className="space-y-6">
            {/* Phần 1: Thông tin trẻ */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2 mb-4">
                Thông Tin Trẻ
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-40">Tên trẻ:</span>
                  <span className="text-gray-900">
                    {childMap[selectedSchedule.childId] || "Không tìm thấy"}
                  </span>
                </div>
              </div>
            </div>

            {/* Phần 2: Thông tin tiêm chủng */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2 mb-4">
                Thông Tin Tiêm Chủng
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-40">Tên bệnh:</span>
                  <span className="text-gray-900">
                    {diseaseMap[selectedSchedule.diseaseId] || "Không tìm thấy"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-40">Liều số:</span>
                  <span className="text-gray-900">
                    {selectedSchedule.doseNumber || "N/A"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-40">Ngày dự kiến tiêm:</span>
                  <span className="text-gray-900">
                    {selectedSchedule.scheduledDate
                      ? moment(selectedSchedule.scheduledDate, "DD/MM/YYYY").format("DD/MM/YYYY")
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-40">Ngày tiêm thực tế:</span>
                  <span className="text-gray-900 flex items-center">
                    {selectedSchedule.vaccinationDate ? (
                      <>
                        {moment(selectedSchedule.vaccinationDate, "DD/MM/YYYY").format("DD/MM/YYYY")}
                        <CheckOutlined
                          style={{
                            color: "green",
                            marginLeft: 8,
                            verticalAlign: "middle",
                          }}
                        />
                      </>
                    ) : selectedSchedule.isCompleted === 0 ? (
                      selectedAppointmentId && appointments.length > 0 ? (
                        moment(
                          appointments.find(
                            (app) => app.appointmentId === selectedAppointmentId
                          )?.appointmentDate,
                          "DD/MM/YYYY"
                        ).format("DD/MM/YYYY") || "Chưa chọn cuộc hẹn"
                      ) : (
                        "Chưa chọn cuộc hẹn"
                      )
                    ) : (
                      "Chưa có"
                    )}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-40">Vắc xin đã sử dụng:</span>
                  <span className="text-gray-900">
                    {selectedSchedule.isCompleted === 0 ? (
                      selectedAppointmentId && appointments.length > 0 ? (
                        appointments.find(
                          (app) => app.appointmentId === selectedAppointmentId
                        )?.vaccineId
                          ? vaccineMap[
                          appointments.find(
                            (app) => app.appointmentId === selectedAppointmentId
                          )!.vaccineId!
                          ] || "Không xác định"
                          : "Không xác định"
                      ) : (
                        "Chưa chọn cuộc hẹn"
                      )
                    ) : selectedAppointment && selectedAppointment.vaccineId ? (
                      vaccineMap[selectedAppointment.vaccineId] || "Không xác định"
                    ) : (
                      "Không xác định"
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Phần 3: Trạng thái và cuộc hẹn */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-2 mb-4">
                Trạng Thái và Cuộc Hẹn
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-40">Tình trạng tiêm:</span>
                  <span className="text-gray-900">
                    {selectedSchedule.isCompleted === 0
                      ? "Chưa tiêm"
                      : selectedSchedule.isCompleted === 1
                        ? "Đã tiêm"
                        : "Không xác định"}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 w-40">Số liều đã hoàn thành:</span>
                  <span className="text-gray-900">
                    {completedDosesMap[selectedSchedule.diseaseId] || 0} / {maxDoseMap[selectedSchedule.diseaseId] || 0}
                  </span>
                </div>
                {isDiseaseFullyCompleted(selectedSchedule.diseaseId) && (
                  <div className="flex items-center">
                    <span className="font-medium text-red-600 w-40">Thông báo:</span>
                    <span className="text-red-600">
                      Trẻ đã hoàn thành đủ liều cho bệnh này, không thể đăng ký thêm!
                    </span>
                  </div>
                )}
                <div className="flex items-start">
                  <span className="font-medium text-gray-700 w-40">Cuộc hẹn:</span>
                  <div className="flex-1">
                    {selectedSchedule.isCompleted === 0 ? (
                      <Select
                        placeholder="Chọn cuộc hẹn"
                        style={{ width: "100%" }}
                        onChange={(value: number) => setSelectedAppointmentId(value)}
                        value={selectedAppointmentId}
                        disabled={appointments.length === 0 || isDiseaseFullyCompleted(selectedSchedule.diseaseId)}
                      >
                        {appointments.map((appointment) => {
                          const relatedVaccineProfile = scheduleData.find(
                            (vp) => vp.appointmentId === appointment.appointmentId
                          );
                          const diseaseName = relatedVaccineProfile
                            ? diseaseMap[relatedVaccineProfile.diseaseId] || "Không xác định"
                            : "Không xác định";

                          return (
                            <Option
                              key={appointment.appointmentId}
                              value={appointment.appointmentId}
                            >
                              {`${moment(
                                appointment.appointmentDate,
                                "DD/MM/YYYY"
                              ).format("DD/MM/YYYY")} - Vắc xin: ${appointment.vaccineId !== null
                                ? vaccineMap[appointment.vaccineId] || "Không xác định"
                                : "Không xác định"
                                } - Bệnh: ${diseaseName}`}
                            </Option>
                          );
                        })}
                      </Select>
                    ) : (
                      <span className="text-gray-900">
                        {selectedSchedule.appointmentId || "Không có"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChildVaccineSchedule;