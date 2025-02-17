import React, { useState } from "react";
import "antd/dist/reset.css";
import { Input } from "antd";

const CarouselVaccineTypes: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // Add your search functionality here (e.g., filter vaccines based on the query)
  };

  return (
    <div className="w-full relative">
      <div className="relative">
        <img
          src="image/loginBackground.png"
          alt="Các loại vắc xin cho trẻ em"
          className="w-full h-auto rounded-lg"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-30">
          {/* Tiêu đề "Thông tin sản phẩm vắc xin" */}
          <h2 className="text-white text-3xl font-semibold mb-4 mt-20">
            THÔNG TIN SẢN PHẨM VẮC XIN
          </h2>

          {/* Thanh tìm kiếm */}
          <div className="relative w-full max-w-lg mb-4">
            <Input.Search
              placeholder="Tìm kiếm vaccine..."
              onSearch={handleSearch}
              enterButton
              size="large"
            />
          </div>

          {/* Hai span "Vắc xin theo nhóm bệnh" và "Vắc xin theo độ tuổi" */}
          <div className="flex w-full max-w-lg justify-between gap-6">
            <span className="text-center w-1/2 py-2 border-white rounded-lg bg-white text-black">
              Vắc xin theo độ tuổi
            </span>
            <span className="text-white text-center w-1/2 py-2 rounded-lg bg-blue-600">
              Vắc xin theo nhóm bệnh
            </span>
          </div>

          {/* Hình ảnh */}
          <div className="mt-auto mb-4">
            <img src="logo/iconVaccineTypes.png" alt="icon" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarouselVaccineTypes;
