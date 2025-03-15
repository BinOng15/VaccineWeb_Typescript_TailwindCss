import React, { useState, useEffect } from "react";
import { Select, Input, DatePicker, Button, notification } from "antd";
import dayjs from "dayjs";
import { CreateAppointmentDTO } from "../../models/Appointment";
import { AppointmentStatus, Gender, IsActive } from "../../models/Type/enum";
import { VaccineResponseDTO } from "../../models/Vaccine";
import { VaccinePackageResponseDTO } from "../../models/VaccinePackage";
import { ChildProfileResponseDTO } from "../../models/ChildProfile";
import appointmentService from "../../service/appointmentService";
import vaccinePackageService from "../../service/vaccinePackageService";
import vaccineService from "../../service/vaccineService";
import childProfileService from "../../service/childProfileService";
import { getCurrentUser } from "../../service/authService";

const { Option } = Select;

const VaccineRegistration: React.FC = () => {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [appointmentDate, setAppointmentDate] = useState<dayjs.Dayjs | null>(
    null
  );
  const [selectedVaccineId, setSelectedVaccineId] = useState<number | null>(
    null
  );
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(
    null
  );
  const [vaccines, setVaccines] = useState<VaccineResponseDTO[]>([]);
  const [packages, setPackages] = useState<VaccinePackageResponseDTO[]>([]);
  const [childProfiles, setChildProfiles] = useState<ChildProfileResponseDTO[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(false);

  // Lấy token để xác thực
  const getToken = () => {
    return (
      localStorage.getItem("token") || sessionStorage.getItem("accessToken")
    );
  };

  // Fetch danh sách vaccine, package, và child profiles khi component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getToken();
        if (!token) {
          console.error("No token found");
          return;
        }

        // Lấy thông tin người dùng hiện tại
        const userData = await getCurrentUser(token);
        if (!userData) {
          console.error("Failed to fetch user data");
          return;
        }
        const userId = parseInt(userData.userId.toString(), 10);
        const allChildProfiles =
          await childProfileService.getAllChildProfiles();

        // Lọc hồ sơ trẻ em dựa trên userId
        const userChildProfiles = allChildProfiles.filter(
          (profile) => profile.userId === userId
        );
        setChildProfiles(userChildProfiles);

        // Lấy danh sách vaccine
        const allVaccines = await vaccineService.getAllVaccines();
        setVaccines(allVaccines);

        // Lấy danh sách package
        const allPackages = await vaccinePackageService.getAllPackages();
        setPackages(allPackages);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, []);

  // Lấy thông tin trẻ dựa trên childId được chọn
  const selectedChildProfile = childProfiles.find(
    (profile) => profile.childId.toString() === selectedChildId
  );

  // Xử lý submit để tạo cuộc hẹn
  const handleSubmit = async () => {
    if (
      !selectedChildId ||
      !appointmentDate ||
      (!selectedVaccineId && !selectedPackageId)
    ) {
      notification.error({
        message: "Error",
        description:
          "Vui lòng điền đầy đủ thông tin (trẻ, ngày hẹn, và vaccine hoặc gói vaccine)!",
      });
      return;
    }

    setLoading(true);
    try {
      const childId = parseInt(selectedChildId, 10);
      const appointmentData: CreateAppointmentDTO = {
        paymentId: null, // Có thể để null nếu chưa thanh toán
        childId,
        vaccineId: selectedVaccineId || undefined, // Chỉ gửi nếu chọn vaccine
        vaccinePackageId: selectedPackageId || undefined, // Chỉ gửi nếu chọn package
        appointmentDate: appointmentDate.format("YYYY-MM-DD"), // Định dạng ngày
        appointmentStatus: AppointmentStatus.Pending, // Mặc định là Pending (1)
        isActive: IsActive.Active, // Mặc định là Active (1)
      };

      console.log("Appointment Data to Send:", appointmentData); // Debug dữ liệu
      await appointmentService.createAppointment(appointmentData);
      notification.success({
        message: "Success",
        description: "Đăng ký cuộc hẹn thành công!",
      });
      setAppointmentDate(null);
      setSelectedVaccineId(null);
      setSelectedPackageId(null);
    } catch (error) {
      console.error("Error creating appointment:", error);
      notification.error({
        message: "Error",
        description: "Đăng ký cuộc hẹn thất bại. Vui lòng thử lại!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold">ĐĂNG KÝ TIÊM CHỦNG</h2>
      <p className="mt-2 text-gray-700">
        Đăng ký thông tin tiêm chủng để tiết kiệm thời gian khi đến làm thủ tục
        tại quầy...
      </p>

      {/* Dropdown chọn trẻ tiêm dựa trên childId */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <span className="text-red-500">*</span> Đăng ký trẻ tiêm
        </label>
        <Select
          placeholder="Chọn"
          className="w-full"
          onChange={(value) => setSelectedChildId(value)}
          value={selectedChildId}
        >
          {childProfiles.map((child) => (
            <Option key={child.childId} value={child.childId.toString()}>
              {child.fullName}
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
            <Input
              value={selectedChildProfile?.fullName || ""}
              className="w-full"
              readOnly
            />
          </div>

          {/* Ngày sinh của trẻ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <span className="text-red-500">*</span> Ngày sinh của trẻ
            </label>
            <DatePicker
              className="w-full"
              value={
                selectedChildProfile?.dateOfBirth
                  ? dayjs(selectedChildProfile.dateOfBirth)
                  : undefined
              }
              placeholder="Ngày/tháng/năm"
              disabled
            />
          </div>

          {/* Giới tính */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <span className="text-red-500">*</span> Giới tính
            </label>
            <Select
              className="w-full"
              value={
                selectedChildProfile
                  ? getGenderLabel(selectedChildProfile.gender)
                  : "Không xác định"
              }
              disabled
            >
              <Option value="Nam">Nam</Option>
              <Option value="Nữ">Nữ</Option>
              <Option value="Không xác định">Không xác định</Option>
            </Select>
          </div>
        </div>
      </div>

      {/* Thông tin cuộc hẹn */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold">THÔNG TIN CUỘC HẸN</h3>
        <div className="space-y-6 mt-4">
          {/* Ngày hẹn */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <span className="text-red-500">*</span> Ngày hẹn
            </label>
            <DatePicker
              className="w-full"
              value={appointmentDate}
              onChange={(date) => setAppointmentDate(date)}
              placeholder="Chọn ngày hẹn"
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              } // Không chọn ngày quá khứ
            />
          </div>

          {/* Chọn vaccine hoặc gói vaccine */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <span className="text-red-500">*</span> Chọn vaccine hoặc gói
              vaccine
            </label>
            <Select
              className="w-full mb-2"
              placeholder="Chọn vaccine"
              onChange={(value) => {
                setSelectedVaccineId(value ? parseInt(value as string) : null);
                setSelectedPackageId(null); // Reset package khi chọn vaccine
              }}
              value={
                selectedVaccineId ? selectedVaccineId.toString() : undefined
              }
            >
              {vaccines.map((vaccine) => (
                <Option
                  key={vaccine.vaccineId}
                  value={vaccine.vaccineId.toString()}
                >
                  {vaccine.name}
                </Option>
              ))}
            </Select>
            <Select
              className="w-full"
              placeholder="Chọn gói vaccine"
              onChange={(value) => {
                setSelectedPackageId(value ? parseInt(value as string) : null);
                setSelectedVaccineId(null); // Reset vaccine khi chọn package
              }}
              value={
                selectedPackageId ? selectedPackageId.toString() : undefined
              }
            >
              {packages.map((pkg) => (
                <Option
                  key={pkg.vaccinePackageId}
                  value={pkg.vaccinePackageId.toString()}
                >
                  {pkg.name}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </div>

      {/* Nút submit */}
      <div className="mt-6 flex justify-end">
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={loading}
          disabled={
            !selectedChildId ||
            !appointmentDate ||
            (!selectedVaccineId && !selectedPackageId)
          }
        >
          Đăng ký
        </Button>
      </div>
    </div>
  );
};

// Hàm chuyển đổi enum Gender sang chuỗi hiển thị
const getGenderLabel = (gender: Gender): string => {
  switch (gender) {
    case Gender.Male:
      return "Nam";
    case Gender.Female:
      return "Nữ";
    case Gender.Unknown:
    default:
      return "Không xác định";
  }
};

// Hàm chuyển đổi enum Relationship sang chuỗi hiển thị (nếu cần)
// const getRelationshipLabel = (relationship: Relationship): string => {
//   switch (relationship) {
//     case Relationship.Mother:
//       return "Mẹ";
//     case Relationship.Father:
//       return "Bố";
//     case Relationship.Guardian:
//       return "Người giám hộ";
//     default:
//       return "Không xác định";
//   }
// };

export default VaccineRegistration;
