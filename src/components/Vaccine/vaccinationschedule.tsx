/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { message, Spin } from "antd";
import vaccineScheduleService from "../../service/vaccineScheduleService";
import diseaseService from "../../service/diseaseService";
import { VaccineScheduleResponseDTO } from "../../models/VaccineSchedule";
import { DiseaseResponseDTO } from "../../models/Disease";
import MainLayout from "../Layout/MainLayout";

const VaccinationSchedule: React.FC = () => {
  const [scheduleData, setScheduleData] = useState<
    VaccineScheduleResponseDTO[]
  >([]);
  const [diseases, setDiseases] = useState<DiseaseResponseDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

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

  // Tạo bản đồ bệnh ID -> tên bệnh và vaccine ID -> tên vaccine
  const diseaseMap = diseases.reduce((acc, disease) => {
    acc[disease.diseaseId] = disease.name;
    return acc;
  }, {} as Record<number, string>);

  // Tạo danh sách các cột tuổi (1 tháng, 2 tháng, ..., 12 tháng, 2 tuổi)
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
    <MainLayout>
      <div className="min-h-screen bg-gray-100 py-10 p-20">
        <h1 className="text-3xl font-bold mb-6 text-center">
          LỊCH TIÊM CHỦNG CHO TRẺ TỪ 1 THÁNG TỚI 6 TUỔI
        </h1>

        {/* Bảng hiển thị lịch tiêm */}
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
                    const schedulesForDisease =
                      scheduleMap[parseInt(diseaseId)] || {};
                    let scheduleIndex = 1; // Bắt đầu số thứ tự từ 1

                    return (
                      <tr key={diseaseId} className="odd:bg-gray-100">
                        <td className="border px-4 py-2 font-medium">
                          {diseaseMap[parseInt(diseaseId)]}
                        </td>
                        {ageColumns.map((_, columnIndex) => {
                          const schedules =
                            schedulesForDisease[columnIndex] || [];
                          const displayNumber =
                            schedules.length > 0 ? scheduleIndex++ : "";

                          return (
                            <td
                              key={columnIndex}
                              className="border px-4 py-2 text-center cursor-pointer hover:bg-gray-200"
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
                    <td
                      colSpan={ageColumns.length + 1}
                      className="text-center py-4"
                    >
                      Không có lịch tiêm chủng nào được tìm thấy
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Spin>
        </div>
      </div>
    </MainLayout>
  );
};

export default VaccinationSchedule;
