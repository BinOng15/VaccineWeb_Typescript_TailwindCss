import React, { useState, useEffect } from "react";
import "antd/dist/reset.css";
import { Input, Pagination } from "antd";
import { Link } from "react-router-dom";
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
  description: string;
  price: number;
  diseases: string[];
}

const VaccineTypes: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState(""); // Từ khóa tìm kiếm
  const [vaccines, setVaccines] = useState<VaccineResponseDTO[]>([]); // Danh sách vắc xin gốc
  const [filteredVaccines, setFilteredVaccines] = useState<VaccineDisplay[]>(
    []
  ); // Danh sách vắc xin đã lọc để hiển thị
  const [diseases, setDiseases] = useState<DiseaseResponseDTO[]>([]); // Danh sách bệnh
  const [vaccineDiseases, setVaccineDiseases] = useState<
    VaccineDiseaseResponseDTO[]
  >([]); // Danh sách mối quan hệ vắc xin-bệnh
  const [loading, setLoading] = useState(false); // Trạng thái tải dữ liệu
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const vaccinesPerPage = 10; // Số vắc xin mỗi trang

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

        console.log("Vaccines:", vaccineData); // Log để kiểm tra dữ liệu vắc xin
        console.log("Diseases:", diseaseData); // Log để kiểm tra dữ liệu bệnh
        console.log("VaccineDiseases:", vaccineDiseaseData); // Log để kiểm tra mối quan hệ vắc xin-bệnh

        setVaccines(vaccineData);
        setDiseases(diseaseData);
        setVaccineDiseases(vaccineDiseaseData);

        // Tạo map để tra cứu nhanh tên bệnh theo diseaseId
        const diseaseMap = new Map<number, string>();
        diseaseData.forEach((disease) => {
          diseaseMap.set(disease.diseaseId, disease.name);
        });

        // Tạo map để nhóm các bệnh theo vaccineId
        const vaccineDiseaseMap = new Map<number, string[]>();
        vaccineDiseaseData.forEach((vd) => {
          const diseasesList = vaccineDiseaseMap.get(vd.vaccineId) || [];
          const diseaseName = diseaseMap.get(vd.diseaseId);
          if (diseaseName) {
            diseasesList.push(diseaseName);
          }
          vaccineDiseaseMap.set(vd.vaccineId, diseasesList);
        });

        console.log("VaccineDiseaseMap:", vaccineDiseaseMap); // Log để kiểm tra vaccineDiseaseMap

        // Ánh xạ dữ liệu vắc xin với danh sách bệnh
        const mappedVaccines: VaccineDisplay[] = vaccineData.map((vaccine) => ({
          vaccineId: vaccine.vaccineId,
          name: vaccine.name,
          image: vaccine.image,
          description: vaccine.description,
          price: vaccine.price,
          diseases: vaccineDiseaseMap.get(vaccine.vaccineId) || [],
        }));

        setFilteredVaccines(mappedVaccines); // Hiển thị tất cả vắc xin ban đầu
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Xử lý logic tìm kiếm
  const handleSearch = () => {
    setCurrentPage(1); // Reset về trang đầu tiên khi tìm kiếm
    if (!searchQuery.trim()) {
      // Nếu từ khóa rỗng, hiển thị lại toàn bộ danh sách vắc xin
      const diseaseMap = new Map<number, string>();
      diseases.forEach((disease) => {
        diseaseMap.set(disease.diseaseId, disease.name);
      });

      const vaccineDiseaseMap = new Map<number, string[]>();
      vaccineDiseases.forEach((vd) => {
        const diseasesList = vaccineDiseaseMap.get(vd.vaccineId) || [];
        const diseaseName = diseaseMap.get(vd.diseaseId);
        if (diseaseName) {
          diseasesList.push(diseaseName);
        }
        vaccineDiseaseMap.set(vd.vaccineId, diseasesList);
      });

      const mappedVaccines: VaccineDisplay[] = vaccines.map((vaccine) => ({
        vaccineId: vaccine.vaccineId,
        name: vaccine.name,
        image: vaccine.image,
        description: vaccine.description,
        price: vaccine.price,
        diseases: vaccineDiseaseMap.get(vaccine.vaccineId) || [],
      }));

      setFilteredVaccines(mappedVaccines);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();

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

    console.log("Search Query:", lowerQuery); // Log từ khóa tìm kiếm
    console.log("VaccineDiseaseMap in Search:", vaccineDiseaseMap); // Log để kiểm tra vaccineDiseaseMap

    // Lọc vắc xin theo tên và bệnh
    const filtered = vaccines.filter((vaccine) => {
      const nameMatch = vaccine.name.toLowerCase().includes(lowerQuery);
      const diseasesList = vaccineDiseaseMap.get(vaccine.vaccineId) || [];
      const diseaseMatch = diseasesList.some((disease) =>
        disease.toLowerCase().includes(lowerQuery)
      );
      console.log(
        `Vaccine: ${vaccine.name}, Diseases: ${diseasesList}, Name Match: ${nameMatch}, Disease Match: ${diseaseMatch}`
      ); // Log để kiểm tra từng vắc xin
      return nameMatch || diseaseMatch;
    });

    // Ánh xạ dữ liệu vắc xin đã lọc với danh sách bệnh
    const mappedFilteredVaccines: VaccineDisplay[] = filtered.map(
      (vaccine) => ({
        vaccineId: vaccine.vaccineId,
        name: vaccine.name,
        image: vaccine.image,
        description: vaccine.description,
        price: vaccine.price,
        diseases: vaccineDiseaseMap.get(vaccine.vaccineId) || [],
      })
    );

    console.log("Filtered Vaccines:", mappedFilteredVaccines); // Log để kiểm tra kết quả lọc
    setFilteredVaccines(mappedFilteredVaccines);
  };

  // Logic phân trang
  const indexOfLastVaccine = currentPage * vaccinesPerPage;
  const indexOfFirstVaccine = indexOfLastVaccine - vaccinesPerPage;
  const currentVaccines = filteredVaccines.slice(
    indexOfFirstVaccine,
    indexOfLastVaccine
  );

  // Thay đổi trang khi người dùng chọn phân trang
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

      {/* Phần hiển thị danh sách vắc xin */}
      <div className="max-w-7xl mx-auto mt-4 p-4">
        <nav className="text-sm text-gray-600 mb-4">
          <Link to="/" className="text-blue-500">
            Trang chủ
          </Link>{" "}
          Các loại vắc xin cho trẻ em
        </nav>
        <h2 className="text-2xl font-bold mb-6">CÁC LOẠI VẮC XIN CHO TRẺ EM</h2>

        {loading ? (
          <div className="text-center">Đang tải dữ liệu...</div>
        ) : filteredVaccines.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {currentVaccines.map((vaccine) => (
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
                  <p className="text-sm text-gray-600">{vaccine.description}</p>
                  <p className="text-sm font-medium text-blue-600">
                    Giá: {vaccine.price.toLocaleString()} VNĐ
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">Không tìm thấy kết quả</p>
        )}

        {/* Pagination của Ant Design */}
        <div className="flex justify-center mt-4">
          <Pagination
            current={currentPage}
            pageSize={vaccinesPerPage}
            total={filteredVaccines.length}
            onChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default VaccineTypes;
