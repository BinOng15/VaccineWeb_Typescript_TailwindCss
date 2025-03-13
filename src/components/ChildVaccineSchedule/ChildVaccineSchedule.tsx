import React, { useEffect, useState } from "react";
import { message, Select, Spin, Modal, Descriptions } from "antd";
import vaccineProfileService from "../../service/vaccineProfileService";
import childProfileService from "../../service/childProfileService";
import diseaseService from "../../service/diseaseService";
import { VaccineProfileResponseDTO } from "../../models/VaccineProfile";
import { ChildProfileResponseDTO } from "../../models/ChildProfile";
import { DiseaseResponseDTO } from "../../models/Disease";
import moment from "moment";
import { useAuth } from "../../context/AuthContext";

const { Option } = Select;

const ChildVaccineSchedule: React.FC = () => {
  const [scheduleData, setScheduleData] = useState<VaccineProfileResponseDTO[]>(
    []
  );
  const [children, setChildren] = useState<ChildProfileResponseDTO[]>([]);
  const [diseases, setDiseases] = useState<DiseaseResponseDTO[]>([]);
  const [selectedChild, setSelectedChild] = useState<number | undefined>(
    undefined
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<VaccineProfileResponseDTO | null>(null);
  const [childBirthDate, setChildBirthDate] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchChildren();
    fetchDiseases();
  }, [user]);

  useEffect(() => {
    if (selectedChild) {
      fetchScheduleData(selectedChild);
    } else {
      setScheduleData([]);
      setChildBirthDate(null);
    }
  }, [selectedChild]);

  const fetchScheduleData = async (childId: number) => {
    try {
      setLoading(true);
      const childProfile = children.find((child) => child.childId === childId);
      if (childProfile) {
        setChildBirthDate(childProfile.dateOfBirth);
      }
      const data = await vaccineProfileService.getVaccineProfileByChildId(
        childId
      );
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

  const handleCellClick = (schedule: VaccineProfileResponseDTO) => {
    setSelectedSchedule(schedule);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedSchedule(null);
  };

  const diseaseMap = diseases.reduce((acc, disease) => {
    acc[disease.diseaseId] = disease.name;
    return acc;
  }, {} as Record<number, string>);

  const childMap = children.reduce((acc, child) => {
    acc[child.childId] = child.fullName;
    return acc;
  }, {} as Record<number, string>);

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

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <h1 className="text-3xl font-bold text-[#102A83] mb-6 text-center">
        Lịch Tiêm Chủng Cá Nhân
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
                              <div>{schedules[0].doseNumber}</div>
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

      {/* Modal hiển thị chi tiết */}
      <Modal
        title="CHI TIẾT LỊCH TIÊM CHỦNG CÁ NHÂN"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        centered
      >
        {selectedSchedule && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Tên trẻ">
              {childMap[selectedSchedule.childId] || "Không tìm thấy"}
            </Descriptions.Item>
            <Descriptions.Item label="Tên bệnh">
              {diseaseMap[selectedSchedule.diseaseId] || "Không tìm thấy"}
            </Descriptions.Item>
            <Descriptions.Item label="Liều số">
              {selectedSchedule.doseNumber || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày đăng ký tiêm">
              {selectedSchedule.vaccinationDate
                ? moment(selectedSchedule.vaccinationDate).format("DD/MM/YYYY")
                : "Chưa đăng ký"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày dự kiến tiêm">
              {selectedSchedule.scheduledDate
                ? moment(selectedSchedule.scheduledDate).format("DD/MM/YYYY")
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Tình trạng tiêm">
              {selectedSchedule &&
              typeof selectedSchedule.isCompleted === "number"
                ? selectedSchedule.isCompleted === 0
                  ? "Chưa tiêm"
                  : "Đã tiêm"
                : "Không xác định"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default ChildVaccineSchedule;
