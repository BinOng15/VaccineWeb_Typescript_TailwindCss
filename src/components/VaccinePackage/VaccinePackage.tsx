import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { message, Input, Space, Row, Col, Button } from "antd";

import vaccinePackageService from "../../service/vaccinePackageService";
import vaccinePackageDetailService from "../../service/vaccinePackageDetailService";
import vaccineService from "../../service/vaccineService";
import { VaccinePackageResponseDTO } from "../../models/VaccinePackage";

const { Search } = Input;

interface VaccinePackage extends VaccinePackageResponseDTO {
  vaccinePackageId: number;
  vaccineNames: string[]; // Thay diseases thành vaccineNames
}

const VaccinePackage: React.FC = () => {
  const [vaccinePackages, setVaccinePackages] = useState<VaccinePackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [searchKeyword, setSearchKeyword] = useState("");

  const fetchVaccinePackages = async (
    page: number = 1,
    pageSize: number = 5
  ) => {
    setLoading(true);
    try {
      const packages = await vaccinePackageService.getAllPackages();
      const packageDetails =
        await vaccinePackageDetailService.getAllPackagesDetail();
      const vaccines = await vaccineService.getAllVaccines();

      const filteredPackages = packages
        .filter((pkg) => pkg.isActive === 1)
        .map((pkg) => ({ ...pkg, vaccinePackageId: pkg.vaccinePackageId }));

      const packagesWithVaccines = filteredPackages.map((pkg) => {
        const relatedDetails = packageDetails.filter(
          (detail) => detail.vaccinePackageId === pkg.vaccinePackageId
        );
        const vaccineIds = relatedDetails.map((detail) => detail.vaccineId);
        const vaccineNames = vaccineIds.map((vaccineId) => {
          const vaccine = vaccines.find((v) => v.vaccineId === vaccineId);
          return vaccine ? vaccine.name : "Unknown";
        });

        return {
          ...pkg,
          vaccineNames: [...new Set(vaccineNames)], // Loại bỏ trùng lặp
        };
      });

      const searchedPackages = packagesWithVaccines.filter((pkg) =>
        searchKeyword
          ? pkg.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            pkg.description
              .toLowerCase()
              .includes(searchKeyword.toLowerCase()) ||
            pkg.vaccineNames.some((vaccine) =>
              vaccine.toLowerCase().includes(searchKeyword.toLowerCase())
            )
          : true
      );

      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedPackages = searchedPackages.slice(start, end);

      setVaccinePackages(paginatedPackages);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: searchedPackages.length,
      });
    } catch (error) {
      console.error("Error fetching vaccine packages:", error);
      message.error(
        "Không thể tải dữ liệu bảng giá gói vaccine: " +
          (error as Error).message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccinePackages();
  }, []);

  const handleTableChange = (page: number, pageSize: number) => {
    fetchVaccinePackages(page, pageSize);
  };

  const onSearch = (value: string) => {
    setSearchKeyword(value);
    fetchVaccinePackages(1, pagination.pageSize);
  };

  const handleReset = () => {
    setSearchKeyword("");
    fetchVaccinePackages(1, pagination.pageSize);
  };

  const formatAge = (ageInMonths: number) => {
    return ageInMonths === 0 ? "Sơ sinh" : `${ageInMonths} tháng`;
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="w-full">
        <nav className="text-sm text-gray-600 mb-4 mt-2">
          <Link to="/" className="text-blue-500">
            Trang chủ
          </Link>
          {">"} Gói vắc xin cho trẻ em
        </nav>
        <h2 className="text-2xl font-bold mb-6">GÓI VẮC XIN CHO TRẺ EM</h2>

        <Row justify="space-between" style={{ marginBottom: 16 }}>
          <Col>
            <Space>
              <Search
                placeholder="Tìm kiếm theo tên, mô tả hoặc vaccine"
                onSearch={onSearch}
                enterButton
                allowClear
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <Button onClick={handleReset}>Làm mới</Button>
            </Space>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center">Đang tải dữ liệu...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 text-center">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-4">STT</th>
                  <th className="border p-4">Tên Gói Vaccine</th>
                  <th className="border p-4">Vaccine Trong Gói</th>{" "}
                  {/* Thay đổi tiêu đề */}
                  <th className="border p-4">Mô Tả</th>
                  <th className="border p-4">Độ Tuổi</th>
                  <th className="border p-4">Tổng Số Liều</th>
                  <th className="border p-4">Giá Gói (VNĐ)</th>
                </tr>
              </thead>
              <tbody>
                {vaccinePackages.map((pkg, index) => (
                  <tr key={pkg.vaccinePackageId} className="border">
                    <td className="border p-4">
                      {(pagination.current - 1) * pagination.pageSize +
                        index +
                        1}
                    </td>
                    <td className="border p-4">{pkg.name}</td>
                    <td className="border p-4">
                      {pkg.vaccineNames.length > 0
                        ? pkg.vaccineNames.join(", ")
                        : "N/A"}
                    </td>
                    <td className="border p-4">{pkg.description}</td>
                    <td className="border p-4">{formatAge(pkg.ageInMonths)}</td>
                    <td className="border p-4">{pkg.totalDoses || "N/A"}</td>
                    <td className="border p-4">
                      {pkg.totalPrice ? pkg.totalPrice.toLocaleString() : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Space>
            <Button
              disabled={pagination.current === 1}
              onClick={() =>
                handleTableChange(pagination.current - 1, pagination.pageSize)
              }
            >
              Trang trước
            </Button>
            <span>
              Trang {pagination.current} /{" "}
              {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <Button
              disabled={
                pagination.current ===
                Math.ceil(pagination.total / pagination.pageSize)
              }
              onClick={() =>
                handleTableChange(pagination.current + 1, pagination.pageSize)
              }
            >
              Trang sau
            </Button>
          </Space>
        </div>

        <div className="mt-10 bg-white p-4 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Thông Tin Phí Đặt Giữ</h3>
          <p className="text-xl font-semibold">
            Lưu ý: Tổng Giá trị Gói vắc xin = Tổng giá trị các mũi tiêm lẻ (hoặc
            giá ưu đãi nếu có) + Khoảng 10% phí đặt giữ theo yêu cầu*
          </p>
          <p className="text-xl text-gray-600 mt-4">
            <strong>(*) Phí đặt giữ bao gồm:</strong>
            <ul className="list-disc ml-6 mt-2 space-y-2">
              <li>
                <strong>
                  Phí bảo quản, lưu trữ vắc xin theo tiêu chuẩn Quốc tế;
                </strong>
              </li>
              <li>
                <strong>Phí chống trượt giá vắc xin:</strong> Khách hàng sẽ
                không phải thanh toán thêm bất cứ khoản chi phí phát sinh nào
                trong suốt quá trình đặt giữ...
              </li>
              {/* Các mục khác giữ nguyên */}
            </ul>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VaccinePackage;
