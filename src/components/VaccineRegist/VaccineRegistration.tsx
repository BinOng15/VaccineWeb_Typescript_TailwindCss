import React, { useState } from "react";
import { Select, Input, DatePicker } from "antd";
import dayjs from "dayjs";

const { Option } = Select;

interface ChildInfo {
  name: string;
  dob: string;
  gender: string;
  birthplace: string;
}

const childrenData: Record<string, ChildInfo> = {
  "1": {
    name: "Nguyễn Văn A",
    dob: "2024-10-10",
    gender: "male",
    birthplace: "Lê Văn Việt, Thủ Đức, TP Hồ Chí Minh",
  },
  "2": {
    name: "Trần Thị B",
    dob: "2023-05-15",
    gender: "female",
    birthplace: "Hà Đông, Hà Nội",
  },
};

const VaccineRegistration: React.FC = () => {
  const [selectedChild, setSelectedChild] = useState<string | null>(null);

  const childInfo = selectedChild ? childrenData[selectedChild] : null;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold">ĐĂNG KÝ TIÊM CHỦNG</h2>
      <p className="mt-2 text-gray-700">
        Đăng ký thông tin tiêm chủng để tiết kiệm thời gian khi đến làm thủ tục
        tại quầy...
      </p>

      {/* Dropdown chọn trẻ tiêm */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <span className="text-red-500">*</span> Đăng ký trẻ tiêm
        </label>
        <Select
          placeholder="Chọn"
          className="w-full"
          onChange={(value) => setSelectedChild(value)}
        >
          {Object.keys(childrenData).map((key) => (
            <Option key={key} value={key}>
              {childrenData[key].name}
            </Option>
          ))}
        </Select>
      </div>

      {/* Thông tin của trẻ */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold">THÔNG TIN CỦA TRẺ</h3>
        <div className="space-y-6 mt-4">
          {/* Họ tên của trẻ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <span className="text-red-500">*</span> Họ tên của trẻ
            </label>
            <Input value={childInfo?.name || ""} className="w-full" readOnly />
          </div>

          {/* Ngày sinh của trẻ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <span className="text-red-500">*</span> Ngày sinh của trẻ
            </label>
            <DatePicker
              className="w-full"
              value={childInfo?.dob ? dayjs(childInfo.dob) : undefined}
              placeholder="Ngày/tháng/năm"
              disabled
            />
          </div>

          {/* Giới tính */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <span className="text-red-500">*</span> Giới tính
            </label>
            <Select className="w-full" value={childInfo?.gender} disabled>
              <Option value="male">Nam</Option>
              <Option value="female">Nữ</Option>
            </Select>
          </div>

          {/* Nơi sinh */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <span className="text-red-500">*</span> Nơi sinh
            </label>
            <Input
              value={childInfo?.birthplace || ""}
              className="w-full"
              readOnly
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VaccineRegistration;
