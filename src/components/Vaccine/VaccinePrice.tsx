import React, { useEffect, useState } from "react";
import MainLayout from "../Layout/MainLayout";
import { message } from "antd";
import vaccineService from "../../service/vaccineService";
import diseaseService from "../../service/diseaseService";
import vaccineDiseaseService from "../../service/vaccineDiseaseService";
import { VaccineResponseDTO } from "../../models/Vaccine";
import { DiseaseResponseDTO } from "../../models/Disease";
import { VaccineDiseaseResponseDTO } from "../../models/VaccineDisease";

const VaccinePrice: React.FC = () => {
  const [vaccines, setVaccines] = useState<VaccineResponseDTO[]>([]);
  const [diseases, setDiseases] = useState<DiseaseResponseDTO[]>([]);
  const [vaccineDiseases, setVaccineDiseases] = useState<
    VaccineDiseaseResponseDTO[]
  >([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Gọi các API song song để tối ưu hiệu suất
      const [vaccineData, diseaseData, vaccineDiseaseData] = await Promise.all([
        vaccineService.getAllVaccines(),
        diseaseService.getAllDiseases(),
        vaccineDiseaseService.getAllVaccineDiseases(),
      ]);

      // Kiểm tra dữ liệu trả về
      if (
        Array.isArray(vaccineData) &&
        Array.isArray(diseaseData) &&
        Array.isArray(vaccineDiseaseData)
      ) {
        setVaccines(vaccineData);
        setDiseases(diseaseData);
        setVaccineDiseases(vaccineDiseaseData);
      } else {
        throw new Error("Dữ liệu không đúng định dạng mảng");
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu bảng giá vaccine:", error);
      message.error(
        "Không thể tải dữ liệu bảng giá: " + (error as Error).message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Hàm lấy tên bệnh từ vaccineId
  const getDiseaseName = (vaccineId: number): string => {
    if (!vaccineDiseases || !diseases) return "Không xác định";
    const relatedDiseases = vaccineDiseases
      .filter((vd) => vd.vaccineId === vaccineId)
      .map((vd) => diseases.find((d) => d.diseaseId === vd.diseaseId)?.name)
      .filter(Boolean); // Loại bỏ undefined
    return relatedDiseases.length > 0
      ? relatedDiseases.join(", ")
      : "Không xác định";
  };

  // Hàm định dạng giá
  const formatPrice = (price: number): string => {
    if (price === 0) return "Miễn phí";
    return price.toLocaleString("vi-VN"); // Định dạng số với dấu chấm (VD: 950.000)
  };

  // Hàm xác định tình trạng
  const getAvailability = (quantity: number): string => {
    return quantity > 0 ? "Có" : "Hết";
  };

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <h2 className="text-xl font-bold text-center p-2 rounded-t-lg">
          Bảng Giá Vắc-Xin Lẻ
        </h2>
        {loading ? (
          <div className="text-center">Đang tải dữ liệu...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border bg-white border-gray-300">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border px-4 py-2">STT</th>
                  <th className="border px-4 py-2">Tên Vắc-Xin</th>
                  <th className="border px-4 py-2">Phòng Bệnh</th>
                  <th className="border px-4 py-2">Mô tả</th>
                  <th className="border px-4 py-2">Đơn Giá (VNĐ)</th>
                  <th className="border px-4 py-2">Tình Trạng</th>
                </tr>
              </thead>
              <tbody>
                {vaccines.map((vaccine, index) => (
                  <tr key={vaccine.vaccineId} className="hover:bg-gray-100">
                    <td className="border px-4 py-2 text-center">
                      {index + 1}
                    </td>
                    <td className="border px-4 py-2">{vaccine.name}</td>
                    <td className="border px-4 py-2">
                      {getDiseaseName(vaccine.vaccineId)}
                    </td>
                    <td className="border px-4 py-2">{vaccine.description}</td>
                    <td className="border px-4 py-2 text-right">
                      {formatPrice(vaccine.price)}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {getAvailability(vaccine.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default VaccinePrice;
