import React, { useEffect, useState } from "react";
import { Row, Col, Card, message } from "antd";
import { Pie } from "@ant-design/charts";
import appointmentService from "../../service/appointmentService";
import childProfileService from "../../service/childProfileService";
import vaccinePackageService from "../../service/vaccinePackageService";
import vaccineScheduleService from "../../service/vaccineScheduleService";
import vaccineService from "../../service/vaccineService";

interface StaffDashboardStats {
  totalVaccines: number; // Số lượng vaccine lẻ
  totalVaccinePackages: number; // Số lượng gói vaccine
  totalRegisteredChildren: number; // Số lượng trẻ đăng ký tiêm
  totalChildProfiles: number; // Số lượng hồ sơ của trẻ
  totalVaccineSchedules: number; // Số lượng lịch tiêm chủng (từ VaccineSchedule)
  appointmentStatusCounts: { [key: string]: number }; // Trạng thái lịch hẹn
}

const CardWidget: React.FC<{
  title: string;
  value: number | string;
  color?: string;
}> = ({ title, value, color = "blue" }) => {
  return (
    <div
      className={`bg-white p-4 rounded-lg shadow-md border-l-4 border-${color}-500`}
    >
      <h3 className="text-sm text-gray-600">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
};

const StaffDashboard: React.FC = () => {
  const [stats, setStats] = useState<StaffDashboardStats>({
    totalVaccines: 0,
    totalVaccinePackages: 0,
    totalRegisteredChildren: 0,
    totalChildProfiles: 0,
    totalVaccineSchedules: 0,
    appointmentStatusCounts: {
      "Đang chờ": 0,
      "Đang chờ tiêm": 0,
      "Đang chờ phản hồi": 0,
      "Đã hoàn tất": 0,
      "Đã hủy": 0,
    },
  });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Số lượng vaccine lẻ
      const allVaccines = await vaccineService.getAllVaccines();
      const totalVaccines = Array.isArray(allVaccines) ? allVaccines.length : 0;

      // 2. Số lượng gói vaccine
      const allVaccinePackages = await vaccinePackageService.getAllPackages();
      const totalVaccinePackages = Array.isArray(allVaccinePackages)
        ? allVaccinePackages.length
        : 0;

      // 3. Số lượng trẻ đăng ký tiêm (dựa trên Appointment)
      const allAppointments = await appointmentService.getAllAppointments();
      const totalRegisteredChildren = Array.isArray(allAppointments)
        ? new Set(allAppointments.map((appt) => appt.childId)).size // Đếm số trẻ duy nhất
        : 0;

      // Tính số lượng theo trạng thái lịch hẹn
      const appointmentStatusCounts = {
        "Đang chờ": 0,
        "Đang chờ tiêm": 0,
        "Đang chờ phản hồi": 0,
        "Đã hoàn tất": 0,
        "Đã hủy": 0,
      };
      if (Array.isArray(allAppointments)) {
        allAppointments.forEach((appointment) => {
          switch (appointment.appointmentStatus) {
            case 1:
              appointmentStatusCounts["Đang chờ"] += 1;
              break;
            case 2:
              appointmentStatusCounts["Đang chờ tiêm"] += 1;
              break;
            case 3:
              appointmentStatusCounts["Đang chờ phản hồi"] += 1;
              break;
            case 4:
              appointmentStatusCounts["Đã hoàn tất"] += 1;
              break;
            case 5:
              appointmentStatusCounts["Đã hủy"] += 1;
              break;
            default:
              break;
          }
        });
      }

      // 4. Số lượng hồ sơ của trẻ
      const allChildProfiles = await childProfileService.getAllChildProfiles();
      const totalChildProfiles = Array.isArray(allChildProfiles)
        ? allChildProfiles.length
        : 0;

      // 5. Số lượng lịch tiêm chủng (dựa trên VaccineSchedule)
      const allVaccineSchedules =
        await vaccineScheduleService.getAllVaccineSchedules();
      const totalVaccineSchedules = Array.isArray(allVaccineSchedules)
        ? allVaccineSchedules.length
        : 0;

      // Cập nhật state
      setStats({
        totalVaccines,
        totalVaccinePackages,
        totalRegisteredChildren,
        totalChildProfiles,
        totalVaccineSchedules,
        appointmentStatusCounts,
      });
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu Staff Dashboard:", error);
      message.error(
        "Không thể tải dữ liệu dashboard: " + (error as Error).message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Dữ liệu cho biểu đồ Pie "Tình trạng lịch hẹn"
  const pieData = [
    { type: "Đang chờ", value: stats.appointmentStatusCounts["Đang chờ"] },
    {
      type: "Đang chờ tiêm",
      value: stats.appointmentStatusCounts["Đang chờ tiêm"],
    },
    {
      type: "Đang chờ phản hồi",
      value: stats.appointmentStatusCounts["Đang chờ phản hồi"],
    },
    {
      type: "Đã hoàn tất",
      value: stats.appointmentStatusCounts["Đã hoàn tất"],
    },
    { type: "Đã hủy", value: stats.appointmentStatusCounts["Đã hủy"] },
  ];

  const pieConfig = {
    data: pieData,
    angleField: "value",
    colorField: "type",
    color: ["#FFCE56", "#4BC0C0", "#36A2EB", "#FF6384", "#9966FF"], // 5 màu cho 5 trạng thái
    height: 300,
  };

  return (
    <section className="space-y-4 p-2 sm:space-y-6 sm:p-4">
      <div className="p-6 bg-gray-100 rounded-lg">
        {loading && <div className="text-center">Đang tải dữ liệu...</div>}
        {/* Hàng 1: 3 cột */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={8} lg={8}>
            <CardWidget
              title="Số lượng vaccine lẻ"
              value={stats.totalVaccines}
              color="blue"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <CardWidget
              title="Số lượng gói vaccine"
              value={stats.totalVaccinePackages}
              color="green"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <CardWidget
              title="Số lượng trẻ đăng ký tiêm"
              value={stats.totalRegisteredChildren}
              color="orange"
            />
          </Col>
        </Row>
        {/* Hàng 2: 2 cột */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={8} lg={8}>
            <CardWidget
              title="Số lượng hồ sơ của trẻ"
              value={stats.totalChildProfiles}
              color="purple"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <CardWidget
              title="Số lượng lịch tiêm chủng"
              value={stats.totalVaccineSchedules}
              color="pink"
            />
          </Col>
        </Row>
        {/* Hàng 3: Biểu đồ Pie */}
        <Row gutter={[16, 16]} justify="center">
          <Col xs={24} lg={12}>
            <Card title="Tình trạng lịch hẹn">
              <Pie {...pieConfig} />
            </Card>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default StaffDashboard;
