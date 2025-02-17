import React from "react";
import { Select, Input, DatePicker} from "antd";

const { Option } = Select;

const VaccineRegistration: React.FC = () => (
  <div className="p-6 max-w-3xl mx-auto">
    <h2 className="text-2xl font-bold">ĐĂNG KÝ TIÊM CHỦNG</h2>
    <p className="mt-2 text-gray-700">
      Đăng ký thông tin tiêm chủng để tiết kiệm thời gian khi đến làm thủ tục tại quầy...
    </p>

    {/* Dropdown chọn trẻ tiêm */}
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-3">*Đăng ký trẻ tiêm</label>
      <Select placeholder="Chọn" className="w-full">
        <Option value="1">Trẻ em</Option>
      </Select>
    </div>

    {/* Thông tin của trẻ */}
    <div className="mt-8">
      <h3 className="text-xl font-semibold">THÔNG TIN CỦA TRẺ</h3>
      <div className="space-y-6 mt-4">
        {/* Họ tên của trẻ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">*Họ tên của trẻ</label>
          <Input placeholder="Nguyễn Văn A" className="w-full" />
        </div>

        {/* Ngày sinh của trẻ */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">*Ngày sinh của trẻ</label>
          <DatePicker className="w-full" placeholder="Ngày/tháng/năm" />
        </div>

        {/* Giới tính */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">*Giới tính</label>
          <Select className="w-full">
            <Option value="male">Nam</Option>
            <Option value="female">Nữ</Option>
          </Select>
        </div>

        {/* Nơi sinh */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">*Nơi sinh</label>
          <Input placeholder="Trần Phú, Hà Đông, Hà Nội" className="w-full" />
        </div>
      </div>
    </div>
  </div>
);

export default VaccineRegistration;
