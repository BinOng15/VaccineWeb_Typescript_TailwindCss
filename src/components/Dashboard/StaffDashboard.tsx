import React, { useEffect, useState } from "react";
import { Row, Col, Card } from "antd";
import { Pie } from "@ant-design/charts";
import appointmentService from "../../service/appointmentService";
import childProfileService from "../../service/childProfileService";
import vaccinePackageService from "../../service/vaccinePackageService";
import vaccineScheduleService from "../../service/vaccineScheduleService";
import vaccineService from "../../service/vaccineService";
import { AppointmentStatus } from "../Appointment/CustomerAppointment";

// Định nghĩa interface cho dữ liệu dashboard
interface StaffDashboardStats {
  totalVaccines: number; // Số lượng vaccine lẻ (số loại vaccine)
  totalVaccineQuantity: number; // Tổng số vaccine (dựa trên quantity)
  totalVaccinePackages: number; // Số lượng gói vaccine
  totalRegisteredChildren: number; // Số lượng trẻ đăng ký tiêm
  totalChildProfiles: number; // Số lượng hồ sơ của trẻ
  totalVaccineSchedules: number; // Số lượng lịch tiêm chủng (từ VaccineSchedule)
  appointmentStatusCounts: { [key in AppointmentStatus]?: number };
}

// Định nghĩa interface cho dữ liệu biểu đồ Pie
interface PieDatum {
  type: string;
  value: number;
  color: string;
}

// Component CardWidget với giao diện mới và hiệu ứng
const CardWidget: React.FC<{
  title: string;
  value: number | string;
  color: string;
  icon: string;
}> = ({ title, value, color, icon }) => {
  return (
    <div
      className={`relative bg-gradient-to-r ${color} text-white p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fadeIn`}
    >
      <div className="absolute top-4 right-4 text-4xl opacity-30">
        <i className={icon}></i>
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};

// Component StaffDashboard
const StaffDashboard: React.FC = () => {
  const [stats, setStats] = useState<StaffDashboardStats>({
    totalVaccines: 0,
    totalVaccineQuantity: 0,
    totalVaccinePackages: 0,
    totalRegisteredChildren: 0,
    totalChildProfiles: 0,
    totalVaccineSchedules: 0,
    appointmentStatusCounts: {
      [AppointmentStatus.Pending]: 0,
      [AppointmentStatus.Checked]: 0,
      [AppointmentStatus.Paid]: 0,
      [AppointmentStatus.Injected]: 0,
      [AppointmentStatus.WaitingForResponse]: 0,
      [AppointmentStatus.Completed]: 0,
      [AppointmentStatus.Cancelled]: 0,
    },
  });
  const [loading, setLoading] = useState(false);

  // Hàm lấy dữ liệu từ các service
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Lấy số lượng vaccine lẻ và tổng số vaccine
      const allVaccines = await vaccineService.getAllVaccines();
      const totalVaccines = Array.isArray(allVaccines) ? allVaccines.length : 0;
      const totalVaccineQuantity = Array.isArray(allVaccines)
        ? allVaccines.reduce((sum, vaccine) => sum + (vaccine.quantity || 0), 0)
        : 0;

      // 2. Lấy số lượng gói vaccine
      const allVaccinePackages = await vaccinePackageService.getAllPackages();
      const totalVaccinePackages = Array.isArray(allVaccinePackages)
        ? allVaccinePackages.length
        : 0;

      // 3. Lấy số lượng trẻ đăng ký tiêm (dựa trên Appointment)
      const allAppointments = await appointmentService.getAllAppointments();
      const totalRegisteredChildren = Array.isArray(allAppointments)
        ? new Set(allAppointments.map((appt) => appt.childId)).size
        : 0;

      // Tính số lượng cho tất cả 7 trạng thái dựa trên enum AppointmentStatus
      const appointmentStatusCounts: { [key in AppointmentStatus]?: number } = {
        [AppointmentStatus.Pending]: 0,
        [AppointmentStatus.Checked]: 0,
        [AppointmentStatus.Paid]: 0,
        [AppointmentStatus.Injected]: 0,
        [AppointmentStatus.WaitingForResponse]: 0,
        [AppointmentStatus.Completed]: 0,
        [AppointmentStatus.Cancelled]: 0,
      };
      if (Array.isArray(allAppointments)) {
        allAppointments.forEach((appointment) => {
          const status = appointment.appointmentStatus as AppointmentStatus;
          if (appointmentStatusCounts[status] !== undefined) {
            appointmentStatusCounts[status]! += 1;
          }
        });
      }

      // 4. Lấy số lượng hồ sơ của trẻ
      const allChildProfiles = await childProfileService.getAllChildProfiles();
      const totalChildProfiles = Array.isArray(allChildProfiles)
        ? allChildProfiles.length
        : 0;

      // 5. Lấy số lượng lịch tiêm chủng (dựa trên VaccineSchedule)
      const allVaccineSchedules =
        await vaccineScheduleService.getAllVaccineSchedules();
      const totalVaccineSchedules = Array.isArray(allVaccineSchedules)
        ? allVaccineSchedules.length
        : 0;

      // Cập nhật state
      setStats({
        totalVaccines,
        totalVaccineQuantity,
        totalVaccinePackages,
        totalRegisteredChildren,
        totalChildProfiles,
        totalVaccineSchedules,
        appointmentStatusCounts,
      });
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu Staff Dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Định nghĩa thứ tự, nhãn và màu sắc cho tất cả 7 trạng thái
  const statuses = [
    {
      value: AppointmentStatus.Pending,
      label: "Chưa Check-in",
      color: "#FF6F61", // Cam đỏ
    },
    {
      value: AppointmentStatus.Checked,
      label: "Đã check-in",
      color: "#6B5B95", // Tím
    },
    {
      value: AppointmentStatus.Paid,
      label: "Đã thanh toán",
      color: "#88B04B", // Xanh lá
    },
    {
      value: AppointmentStatus.Injected,
      label: "Đã tiêm",
      color: "#F4A261", // Cam
    },
    {
      value: AppointmentStatus.WaitingForResponse,
      label: "Đang chờ phản ứng",
      color: "#92A8D1", // Xanh lam nhạt
    },
    {
      value: AppointmentStatus.Completed,
      label: "Đã hoàn tất",
      color: "#F7CAC9", // Hồng nhạt
    },
    {
      value: AppointmentStatus.Cancelled,
      label: "Đã hủy",
      color: "#E2D96C", // Vàng nhạt
    },
  ];

  // Tạo dữ liệu cho biểu đồ Pie với 7 trạng thái
  const pieData: PieDatum[] = statuses.map((s) => ({
    type: s.label,
    value: stats.appointmentStatusCounts[s.value] || 0,
    color: s.color,
  }));

  // Cấu hình biểu đồ Pie với màu sắc sặc sỡ
  const pieConfig = {
    data: pieData,
    angleField: "value",
    colorField: "type",
    color: (datum: PieDatum) => datum.color,
    height: 350,
    radius: 0.9,
    innerRadius: 0.6,
    label: {
      type: "inner",
      offset: "-30%",
      content: ({ type, value }: { type: string; value: number }) =>
        `${type}: ${value}`,
      style: {
        fontSize: 14,
        textAlign: "center",
        fill: "#fff",
        fontWeight: "bold",
      },
    },
    interactions: [{ type: "element-active" }],
    tooltip: false,
    statistic: {
      title: {
        content: "Tình trạng",
        style: { fontSize: 18, color: "#333" },
      },
      content: {
        style: { fontSize: 16, color: "#333" },
      },
    },
    legend: {
      custom: true,
      position: "bottom",
      items: statuses.map((s) => ({
        id: s.label,
        name: s.label,
        value: s.label,
        marker: {
          symbol: "circle",
          style: { fill: s.color, r: 5 },
        },
      })),
    },
  };

  // Render giao diện với background trắng
  return (
    <section className="space-y-6 p-4 sm:p-6 bg-white min-h-screen">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 drop-shadow-lg animate-pulse">
        TRANG CHÍNH CỦA NHÂN VIÊN
      </h1>
      <div className="p-8 rounded-2xl bg-white shadow-lg">
        {loading && (
          <div className="text-center text-gray-600">Đang tải dữ liệu...</div>
        )}
        {/* Hàng 1: 3 cột */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} sm={12} md={8} lg={8}>
            <CardWidget
              title="Số lượng vaccine lẻ"
              value={stats.totalVaccines}
              color="from-blue-400 to-cyan-500"
              icon="fas fa-vial"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <CardWidget
              title="Tổng số vaccine"
              value={stats.totalVaccineQuantity}
              color="from-green-400 to-teal-500"
              icon="fas fa-syringe"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <CardWidget
              title="Số lượng gói vaccine"
              value={stats.totalVaccinePackages}
              color="from-yellow-400 to-orange-500"
              icon="fas fa-box"
            />
          </Col>
        </Row>
        {/* Hàng 2: 3 cột */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} sm={12} md={8} lg={8}>
            <CardWidget
              title="Số lượng trẻ đăng ký tiêm"
              value={stats.totalRegisteredChildren}
              color="from-orange-400 to-red-500"
              icon="fas fa-child"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <CardWidget
              title="Số lượng hồ sơ của trẻ"
              value={stats.totalChildProfiles}
              color="from-purple-400 to-pink-500"
              icon="fas fa-address-book"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <CardWidget
              title="Số lượng lịch tiêm chủng"
              value={stats.totalVaccineSchedules}
              color="from-indigo-400 to-blue-500"
              icon="fas fa-calendar-alt"
            />
          </Col>
        </Row>
        {/* Hàng 3: Biểu đồ Pie */}
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} lg={12}>
            <Card
              title={<span className="text-gray-800 text-xl font-bold">Tình trạng lịch hẹn</span>}
              className="bg-white border-none rounded-xl shadow-xl"
              headStyle={{ background: "transparent", color: "#333", border: "none" }}
              bodyStyle={{ background: "transparent" }}
            >
              <Pie {...pieConfig} />
            </Card>
          </Col>
        </Row>
      </div>
    </section>
  );
};

// Thêm CSS cho hiệu ứng
const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fadeIn {
    animation: fadeIn 0.8s ease-out forwards;
  }

  .animate-pulse {
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }
`;

// Inject styles vào document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default StaffDashboard;