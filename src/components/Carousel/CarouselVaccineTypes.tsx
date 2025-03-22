import React, { useState, useEffect } from "react";
import "antd/dist/reset.css";
import { Input } from "antd";
import vaccineService from "../../service/vaccineService";
import diseaseService from "../../service/diseaseService";
import vaccineDiseaseService from "../../service/vaccineDiseaseService";
import { DiseaseResponseDTO } from "../../models/Disease";
import { VaccineResponseDTO } from "../../models/Vaccine";
import { VaccineDiseaseResponseDTO } from "../../models/VaccineDisease";

// Interface để hiển thị trên giao diện
interface VaccineDisplay {
  vaccineId: number;
  name: string;
  image: string;
  price: number;
  diseases: string[];
}

const CarouselVaccineTypes: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState(""); // Từ khóa tìm kiếm
  const [vaccines, setVaccines] = useState<VaccineResponseDTO[]>([]); // Danh sách vắc xin gốc
  const [filteredVaccines, setFilteredVaccines] = useState<VaccineDisplay[]>(
    []
  ); // Danh sách vắc xin đã lọc để hiển thị
  const [loading, setLoading] = useState(false); // Trạng thái tải dữ liệu
  const [hasSearched, setHasSearched] = useState(false); // Kiểm tra xem đã tìm kiếm chưa
  const [diseases, setDiseases] = useState<DiseaseResponseDTO[]>([]); // Danh sách bệnh
  const [vaccineDiseases, setVaccineDiseases] = useState<
    VaccineDiseaseResponseDTO[]
  >([]); // Danh sách mối quan hệ vắc xin-bệnh

  // Lấy dữ liệu từ API khi component được mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [vaccineData, diseaseData, vaccineDiseaseData] =
          await Promise.all([
            vaccineService.getAllVaccines(),
            diseaseService.getAllDiseases(),
            vaccineDiseaseService.getAllVaccineDiseases(),
          ]);

        setVaccines(vaccineData);
        setDiseases(diseaseData);
        setVaccineDiseases(vaccineDiseaseData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Xử lý logic tìm kiếm
  const handleSearch = async () => {
    setHasSearched(true); // Đánh dấu đã thực hiện tìm kiếm
    if (!searchQuery.trim()) {
      setFilteredVaccines([]); // Nếu từ khóa rỗng, không hiển thị kết quả
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();

    try {
      // Tìm kiếm vắc xin theo tên qua API
      const vaccinesByName = await vaccineService.getVaccineByName(searchQuery);

      // Tạo map để tra cứu nhanh tên bệnh theo diseaseId
      const diseaseMap = new Map<number, string>();
      diseases.forEach((disease) => {
        diseaseMap.set(disease.diseaseId, disease.name);
      });

      // Tạo map để nhóm các bệnh theo vaccineId
      const vaccineDiseaseMap = new Map<number, string[]>();
      vaccineDiseases.forEach((vd) => {
        const diseasesList = vaccineDiseaseMap.get(vd.vaccineId) || [];
        const diseaseName = diseaseMap.get(vd.diseaseId);
        if (diseaseName) {
          diseasesList.push(diseaseName);
        }
        vaccineDiseaseMap.set(vd.vaccineId, diseasesList);
      });

      // Lọc vắc xin theo tên và bệnh
      const filtered = vaccines.filter((vaccine) => {
        const nameMatch = vaccine.name.toLowerCase().includes(lowerQuery);
        const diseasesList = vaccineDiseaseMap.get(vaccine.vaccineId) || [];
        const diseaseMatch = diseasesList.some((disease) =>
          disease.toLowerCase().includes(lowerQuery)
        );
        return nameMatch || diseaseMatch;
      });

      // Kết hợp kết quả từ API và lọc thủ công
      const combinedResults: VaccineDisplay[] = [
        ...vaccinesByName.map((vaccine) => ({
          vaccineId: vaccine.vaccineId,
          name: vaccine.name,
          image: vaccine.image,
          price: vaccine.price,
          diseases: vaccineDiseaseMap.get(vaccine.vaccineId) || [],
        })),
        ...filtered.map((vaccine) => ({
          vaccineId: vaccine.vaccineId,
          name: vaccine.name,
          image: vaccine.image,
          price: vaccine.price,
          diseases: vaccineDiseaseMap.get(vaccine.vaccineId) || [],
        })),
      ];

      // Loại bỏ trùng lặp
      const uniqueResults = Array.from(
        new Map(combinedResults.map((v) => [v.vaccineId, v])).values()
      );

      setFilteredVaccines(uniqueResults);
    } catch (error) {
      console.error("Error during search:", error);
      setFilteredVaccines([]);
    }
  };

  return (
    <div className="w-full relative">
      {/* Hình nền và thanh tìm kiếm */}
      <div className="relative">
        <img
          src="image/loginBackground.png"
          alt="Các loại vắc xin cho trẻ em"
          className="w-full h-auto rounded-lg"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-30">
          <h2 className="text-white text-3xl font-semibold mb-4 mt-20">
            THÔNG TIN SẢN PHẨM VẮC XIN
          </h2>
          <div className="relative w-full max-w-lg mb-4">
            <Input.Search
              placeholder="Tìm kiếm theo tên vaccine hoặc tên bệnh…"
              onSearch={handleSearch} // Kích hoạt tìm kiếm khi nhấn nút hoặc Enter
              enterButton="Tìm kiếm" // Nút luôn hiển thị "Tìm kiếm"
              size="large"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Phần hiển thị kết quả tìm kiếm trực tiếp trên giao diện */}
      {hasSearched && (
        <div className="mt-6 max-w-7xl mx-auto p-4">
          <h2 className="text-2xl font-bold mb-6">
            CÁC LOẠI VẮC XIN CHO TRẺ EM
          </h2>
          {loading ? (
            <div className="text-center">Đang tải dữ liệu...</div>
          ) : filteredVaccines.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredVaccines.map((vaccine) => (
                <div
                  key={vaccine.vaccineId}
                  className="flex border rounded-lg overflow-hidden shadow-md"
                >
                  <div className="w-36 h-32 flex-shrink-0">
                    <img
                      src={vaccine.image}
                      alt={vaccine.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                  <div className="p-4 flex-1">
                    <h3 className="font-semibold text-lg">{vaccine.name}</h3>
                    <p className="text-sm text-gray-600">
                      <strong>Bệnh liên quan:</strong>{" "}
                      {vaccine.diseases.join(", ") || "Không xác định"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Giá:</strong> {vaccine.price.toLocaleString()} VNĐ
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">Không tìm thấy kết quả</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CarouselVaccineTypes;
