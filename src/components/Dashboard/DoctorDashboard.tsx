import React, { useEffect, useState } from "react";
import { Row, Col, Card } from "antd";
import { Pie } from "@ant-design/charts";
import appointmentService from "../../service/appointmentService";
import vaccineService from "../../service/vaccineService";
import { AppointmentStatus } from "../../models/Type/enum";

// Định nghĩa interface cho dữ liệu dashboard
interface DoctorDashboardStats {
  injectedAppointments: number; // Số lượng lịch tiêm đã tiêm (Injected = 4)
  waitingForResponseAppointments: number; // Số lượng lịch tiêm chờ phản ứng (WaitingForResponse = 5)
  completedAppointments: number; // Số lượng lịch tiêm đã hoàn thành (Completed = 6)
  totalVaccineQuantity: number; // Tổng số vaccine (dựa trên quantity)
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

// Component DoctorDashboard
const DoctorDashboard = () => {
  const [stats, setStats] = useState<DoctorDashboardStats>({
    injectedAppointments: 0,
    waitingForResponseAppointments: 0,
    completedAppointments: 0,
    totalVaccineQuantity: 0,
  });
  const [loading, setLoading] = useState(false);

  // Hàm lấy dữ liệu từ các service
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Lấy tất cả lịch hẹn từ API
      const allAppointments = await appointmentService.getAllAppointments();

      // Khởi tạo biến đếm cho lịch hẹn
      let injectedAppointments = 0;
      let waitingForResponseAppointments = 0;
      let completedAppointments = 0;

      // Tính toán dựa trên dữ liệu lịch hẹn
      if (Array.isArray(allAppointments)) {
        allAppointments.forEach((appointment) => {
          switch (appointment.appointmentStatus) {
            case AppointmentStatus.Injected:
              injectedAppointments += 1; // Đếm số lịch đã tiêm
              break;
            case AppointmentStatus.WaitingForResponse:
              waitingForResponseAppointments += 1; // Đếm số lịch chờ phản ứng
              break;
            case AppointmentStatus.Completed:
              completedAppointments += 1; // Đếm số lịch đã hoàn thành
              break;
            default:
              break;
          }
        });
      }

      // 2. Lấy tổng số vaccine từ API
      const allVaccines = await vaccineService.getAllVaccines();
      const totalVaccineQuantity = Array.isArray(allVaccines)
        ? allVaccines.reduce((sum, vaccine) => sum + (vaccine.quantity || 0), 0)
        : 0;

      // Cập nhật state
      setStats({
        injectedAppointments,
        waitingForResponseAppointments,
        completedAppointments,
        totalVaccineQuantity,
      });
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu Doctor Dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Dữ liệu cho biểu đồ Pie với 3 trạng thái
  const pieData = [
    { type: "Đã tiêm", value: stats.injectedAppointments, color: "#FF6F61" },
    {
      type: "Đang chờ phản hồi",
      value: stats.waitingForResponseAppointments,
      color: "#36A2EB",
    },
    { type: "Hoàn tất", value: stats.completedAppointments, color: "#4CAF50" },
  ];

  // Cấu hình cho biểu đồ Pie với màu sắc sặc sỡ
  const pieConfig = {
    data: pieData,
    angleField: "value",
    colorField: "type",
    color: (datum: { type: string; color: string }) => datum.color,
    height: 350,
    radius: 0.9,
    innerRadius: 0.6,
    label: {
      type: "inner",
      offset: "-30%",
      content: "{value}",
      style: {
        fontSize: 14,
        textAlign: "center",
        fill: "#fff",
        fontWeight: "bold",
      },
    },
    interactions: [{ type: "element-active" }],
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
      position: "bottom",
      itemName: {
        style: { fill: "#333", fontSize: 14 },
      },
    },
  };

  // Render giao diện với background trắng
  return (
    <section className="space-y-6 p-4 sm:p-6 bg-white min-h-screen">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 drop-shadow-lg animate-pulse">
        TRANG CHÍNH CỦA BÁC SĨ
      </h1>
      <div className="p-8 rounded-2xl bg-white shadow-lg">
        {loading && (
          <div className="text-center text-gray-600">Đang tải dữ liệu...</div>
        )}
        {/* Hàng 1: 3 cột */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} sm={12} md={8} lg={8}>
            <CardWidget
              title="Số lượng lịch tiêm đã tiêm"
              value={stats.injectedAppointments}
              color="from-red-400 to-pink-500"
              icon="fas fa-syringe"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <CardWidget
              title="Số lượng lịch tiêm chờ phản ứng"
              value={stats.waitingForResponseAppointments}
              color="from-blue-400 to-cyan-500"
              icon="fas fa-hourglass-half"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <CardWidget
              title="Số lượng lịch tiêm đã hoàn thành"
              value={stats.completedAppointments}
              color="from-green-400 to-teal-500"
              icon="fas fa-check-circle"
            />
          </Col>
        </Row>
        {/* Hàng 2: 1 cột */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} sm={12} md={8} lg={8}>
            <CardWidget
              title="Tổng số vaccine"
              value={stats.totalVaccineQuantity}
              color="from-yellow-400 to-orange-500"
              icon="fas fa-vial"
            />
          </Col>
        </Row>
        {/* Hàng 3: Biểu đồ Pie */}
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} lg={12}>
            <Card
              title={<span className="text-gray-800 text-xl font-bold">Phân bố trạng thái lịch hẹn</span>}
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

export default DoctorDashboard;