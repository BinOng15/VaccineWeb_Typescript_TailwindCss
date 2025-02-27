import { DatePicker, Input } from "antd";
import React from "react";

interface Vaccine {
  vaccine: string;
  schedule: string[];
}

// Dữ liệu danh sách vaccine với bảng trống
const vaccineData: Vaccine[] = [
  { vaccine: "Lao", schedule: Array(15).fill("") },
  { vaccine: "Viêm gan B", schedule: Array(15).fill("") },
  { vaccine: "Bạch hầu, ho gà, uốn ván", schedule: Array(15).fill("") },
  { vaccine: "Bại liệt", schedule: Array(15).fill("") },
  { vaccine: "Viêm phổi, viêm màng não do Hib", schedule: Array(15).fill("") },
  { vaccine: "Tiêu chảy do Rota Virus", schedule: Array(15).fill("") },
  { vaccine: "Viêm màng não, nhiễm trùng huyết do phế cầu", schedule: Array(15).fill("") },
  { vaccine: "Viêm màng não do não mô cầu nhóm B, C", schedule: Array(15).fill("") },
  { vaccine: "Cúm", schedule: Array(15).fill("") },
  { vaccine: "Sởi", schedule: Array(15).fill("") },
  { vaccine: "Viêm não Nhật Bản", schedule: Array(15).fill("") },
];

// Danh sách các cột tháng và tuổi
const columns: string[] = ["Sơ sinh", "2", "3", "4", "5", "6", "7", "8", "9", "10-11", "12", "2", "3-4", "5-6", "7-8"];

const VaccineProfile: React.FC = () => {
  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Tiêu đề */}
      <h2 className="text-2xl font-bold text-center p-2 rounded-t-lg">
        HỒ SƠ TIÊM CHỦNG CHO TRẺ
      </h2>

      {/* Phần nhập thông tin của trẻ */}
      <div className="mt-8 mb-12 bg-gray-200 rounded-t-lg p-2 ">
        <h3 className="font-semibold">THÔNG TIN CỦA TRẺ</h3>
        <div className="space-y-6 mt-4">
          {/* Họ tên của trẻ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <span className="text-red-500">*</span> Họ tên của trẻ
            </label>
            <Input placeholder="Nguyễn Văn A" className="w-full" />
          </div>

          {/* Ngày sinh của trẻ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 ">
              <span className="text-red-500">*</span> Ngày sinh của trẻ
            </label>
            <DatePicker className="w-full" placeholder="Ngày/tháng/năm" />
          </div>
        </div>
      </div>

      {/* Bảng lịch tiêm chủng */}
       <h2 className="text-xl font-bold text-center bg-gray-200 p-2 rounded-t-lg">
        LỊCH TIÊM CHỦNG CHO TRẺ
      </h2>
      <div className="overflow-x-auto border border-gray-300 mt-6">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-blue-900 text-white">
              <th className="border px-4 py-2" rowSpan={2}>
                Tuổi / Vaccine
              </th>
              <th className="border px-4 py-2" colSpan={9}>
                Tháng
              </th>
              <th className="border px-4 py-2" colSpan={6}>
                Tuổi
              </th>
            </tr>
            <tr className="bg-blue-900 text-white">
              {columns.map((month) => (
                <th key={month} className="border px-2 py-1">{month}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vaccineData.map((row, index) => (
              <tr key={index} className="odd:bg-gray-100">
                <td className="border px-4 py-2 font-medium">{row.vaccine}</td>
                {row.schedule.map((_, i) => (
                  <td key={i} className="border px-2 py-1 text-center"></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VaccineProfile;
