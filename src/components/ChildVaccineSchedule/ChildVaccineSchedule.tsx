import React, { useEffect, useState } from "react";
import { message, Select, Spin } from "antd";
import vaccineSchedulePersonalService from "../../service/vaccineSchedulePersonalService";
import childProfileService from "../../service/childProfileService";
import diseaseService from "../../service/diseaseService";
import { VaccineSchedulePersonalResponseDTO } from "../../models/VaccineSchedulePersonal";
import { ChildProfileResponseDTO } from "../../models/ChildProfile";
import { DiseaseResponseDTO } from "../../models/Disease";

const { Option } = Select;

const ChildVaccineSchedule: React.FC = () => {
  const [scheduleData, setScheduleData] = useState<
    VaccineSchedulePersonalResponseDTO[]
  >([]);
  const [children, setChildren] = useState<ChildProfileResponseDTO[]>([]);
  const [diseases, setDiseases] = useState<DiseaseResponseDTO[]>([]);
  const [selectedChild, setSelectedChild] = useState<number | undefined>(
    undefined
  );
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchChildren();
    fetchDiseases();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchScheduleData(selectedChild);
    } else {
      setScheduleData([]);
    }
  }, [selectedChild]);

  const fetchScheduleData = async (childId: number) => {
    try {
      setLoading(true);
      const data =
        await vaccineSchedulePersonalService.getVaccineSchedulePersonalByChildId(
          childId
        );
      setScheduleData(Array.isArray(data) ? data : []);
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
      setChildren(data);
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

  // Tạo map bệnh ID -> tên bệnh
  const diseaseMap = diseases.reduce((acc, disease) => {
    acc[disease.diseaseId] = disease.name;
    return acc;
  }, {} as Record<number, string>);

  // Nhóm dữ liệu theo bệnh và tháng tiêm
  const groupedSchedules = scheduleData.reduce((acc, item) => {
    if (!acc[item.diseaseId]) {
      acc[item.diseaseId] = {
        diseaseId: item.diseaseId,
        diseaseName: diseaseMap[item.diseaseId] || "Không xác định",
        schedule: {},
      };
    }
    acc[item.diseaseId].schedule[item.doseNumber] = true; // Đánh dấu tháng có tiêm
    return acc;
  }, {} as Record<number, { diseaseId: number; diseaseName: string; schedule: Record<number, boolean> }>);

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <h1 className="text-3xl font-bold text-[#102A83] mb-6 text-center">
        LỊCH TIÊM CHỦNG CÁ NHÂN
      </h1>

      {/* Chọn trẻ */}
      <div className="mb-6 flex flex-col items-center space-y-2 p-4 border border-blue-300 shadow-sm rounded-lg">
        <span className="text-lg font-bold">
          Lựa chọn trẻ để xem lịch tiêm phù hợp
        </span>
        <Select
          placeholder="Chọn trẻ"
          style={{ width: 220, fontWeight: "bold" }}
          onChange={(value: number) => setSelectedChild(value)}
        >
          {children.map((child) => (
            <Option key={child.childId} value={child.childId}>
              {child.fullName}
            </Option>
          ))}
        </Select>
      </div>

      {/* Bảng hiển thị lịch tiêm */}
      <div className="overflow-x-auto bg-white border border-gray-300">
        <Spin spinning={loading} size="large">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="border px-4 py-2">Bệnh</th>
                {[...Array(13).keys()].map((i) => (
                  <th key={i} className="border px-2 py-1">
                    {i === 0 ? "Sơ sinh" : `${i} tháng`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.values(groupedSchedules).length > 0 ? (
                Object.values(groupedSchedules).map((row) => (
                  <tr key={row.diseaseId} className="odd:bg-gray-100">
                    <td className="border px-4 py-2 font-medium">
                      {row.diseaseName}
                    </td>
                    {[...Array(13).keys()].map((i) => (
                      <td key={i} className="border px-2 py-1 text-center">
                        {row.schedule[i] ? "✔️" : ""}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={26} className="text-center py-4">
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
    </div>
  );
};

export default ChildVaccineSchedule;
