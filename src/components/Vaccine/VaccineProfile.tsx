import { DatePicker, Input } from "antd";
import React, { useEffect, useState } from "react";
import MainLayout from "../Layout/MainLayout";
import moment from "moment"; // Để xử lý ngày tháng
import { axiosInstance } from "../../service/axiosInstance";

interface Vaccine {
  vaccine: string;
  schedule: string[];
}

interface ChildProfileResponseDTO {
  childId: number;
  userId: number;
  fullName: string;
  imageUrl: string;
  dateOfBirth: string;
  gender: number;
  relationship: number;
  createdDate: string;
  createdBy: string;
  modifiedDate: string;
  modifiedBy: string;
  isActive: number;
}

// Dữ liệu vaccine giữ nguyên
const vaccineData: Vaccine[] = [
  // ... giữ nguyên dữ liệu vaccine của bạn
];

// const columns: string[] = ["Sơ sinh", "2", "3", "4", "5", "6", "7", "8", "9", "10-11", "12", "2", "3-4", "5-6", "7-8"];

const VaccineProfile: React.FC = () => {
  const [childProfile, setChildProfile] = useState<ChildProfileResponseDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Hàm gọi API
  const getChildProfileById = async (childId: number) => {
    try {
      const response = await axiosInstance.get(`/get-by-id/${childId}`);
      console.log(response);
      setChildProfile(response.data);
      setLoading(false);
    } catch (error) {
      console.error(`Lỗi khi lấy hồ sơ trẻ em theo ID ${childId}:`, error);
      setLoading(false);
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    getChildProfileById(4); // Ví dụ với childId = 4 từ dữ liệu của bạn
  }, []);

  if (loading) {
    return <div>Đang tải dữ liệu...</div>;
  }

  return (
    <MainLayout>
      <div className="p-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center p-2 rounded-t-lg">
          HỒ SƠ TIÊM CHỦNG CHO TRẺ
        </h2>

        <div className="mt-8 mb-12 bg-gray-200 rounded-t-lg p-2">
          <h3 className="font-semibold">THÔNG TIN CỦA TRẺ</h3>
          <div className="space-y-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <span className="text-red-500">*</span> Họ tên của trẻ
              </label>
              <Input 
                value={childProfile?.fullName || ""} 
                readOnly 
                className="w-full" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <span className="text-red-500">*</span> Ngày sinh của trẻ
              </label>
              <DatePicker 
                value={childProfile?.dateOfBirth ? moment(childProfile.dateOfBirth, "DD/MM/YYYY HH:mm:ss") : null} 
                disabled 
                className="w-full" 
                format="DD/MM/YYYY"
              />
            </div>

            {/* Thêm các thông tin createdDate, createdBy, modifiedDate, modifiedBy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Ngày tạo
              </label>
              <Input 
                value={childProfile?.createdDate ? moment(childProfile.createdDate, "DD/MM/YYYY HH:mm:ss").format("DD/MM/YYYY HH:mm:ss") : ""} 
                readOnly 
                className="w-full" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Người tạo
              </label>
              <Input 
                value={childProfile?.createdBy || ""} 
                readOnly 
                className="w-full" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Ngày sửa
              </label>
              <Input 
                value={childProfile?.modifiedDate ? moment(childProfile.modifiedDate, "DD/MM/YYYY HH:mm:ss").format("DD/MM/YYYY HH:mm:ss") : ""} 
                readOnly 
                className="w-full" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Người sửa
              </label>
              <Input 
                value={childProfile?.modifiedBy || ""} 
                readOnly 
                className="w-full" 
              />
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-center bg-gray-200 p-2 rounded-t-lg">
          LỊCH TIÊM CHỦNG CHO TRẺ
        </h2>
        <div className="overflow-x-auto border border-gray-300 mt-6">
          <table className="w-full table-auto">
            <thead>
              {/* Giữ nguyên phần thead của bạn */}
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
    </MainLayout>
  );
};

export default VaccineProfile;

// <h2 className="text-xl font-bold text-center bg-gray-200 p-2 rounded-t-lg">
//           LỊCH TIÊM CHỦNG CHO TRẺ
//         </h2>
//         <div className="overflow-x-auto border border-gray-300 mt-6">
//           <table className="w-full table-auto">
//             <thead>
//               <tr className="bg-blue-900 text-white">
//                 <th className="border px-4 py-2" rowSpan={2}>
//                   Tuổi / Vaccine
//                 </th>
//                 <th className="border px-4 py-2" colSpan={9}>
//                   Tháng
//                 </th>
//                 <th className="border px-4 py-2" colSpan={6}>
//                   Tuổi
//                 </th>
//               </tr>
//               <tr className="bg-blue-900 text-white">
//                 {columns.map((month) => (
//                   <th key={month} className="border px-2 py-1">
//                     {month}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {vaccineData.map((row, index) => (
//                 <tr key={index} className="odd:bg-gray-100">
//                   <td className="border px-4 py-2 font-medium">{row.vaccine}</td>
//                   {row.schedule.map((_, i) => (
//                     <td key={i} className="border px-2 py-1 text-center"></td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>