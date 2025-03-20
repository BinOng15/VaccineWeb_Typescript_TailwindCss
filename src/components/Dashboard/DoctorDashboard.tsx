import React, { useEffect, useState } from "react";
import { Row, Col, Card, message } from "antd";
import { Pie } from "@ant-design/charts";
import appointmentService from "../../service/appointmentService";
import vaccineService from "../../service/vaccineService"; // Import vaccineService để lấy dữ liệu vaccine
import { AppointmentStatus } from "../../models/Type/enum";

interface DoctorDashboardStats {
  injectedAppointments: number; // Số lượng lịch tiêm đã tiêm (Injected = 4)
  waitingForResponseAppointments: number; // Số lượng lịch tiêm chờ phản ứng (WaitingForResponse = 5)
  completedAppointments: number; // Số lượng lịch tiêm đã hoàn thành (Completed = 6)
  totalVaccineQuantity: number; // Tổng số vaccine (dựa trên quantity)
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

const DoctorDashboard = () => {
  const [stats, setStats] = useState<DoctorDashboardStats>({
    injectedAppointments: 0,
    waitingForResponseAppointments: 0,
    completedAppointments: 0,
    totalVaccineQuantity: 0,
  });
  const [loading, setLoading] = useState(false);

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

  // Dữ liệu cho biểu đồ Pie với 3 trạng thái
  const pieData = [
    { type: "Đã tiêm", value: stats.injectedAppointments },
    {
      type: "Đang chờ phản hồi",
      value: stats.waitingForResponseAppointments,
    },
    { type: "Hoàn tất", value: stats.completedAppointments },
  ];

  // Cấu hình cho biểu đồ Pie
  const pieConfig = {
    data: pieData,
    angleField: "value",
    colorField: "type",
    color: ["#FF6384", "#36A2EB", "#4CAF50"], // Đỏ, Xanh dương, Xanh lá cho 3 trạng thái
    height: 300,
    label: {
      type: "inner",
      offset: "-50%",
      content: "{value}",
      style: {
        textAlign: "center",
        fontSize: 14,
      },
    },
  };

  return (
    <section className="space-y-4 p-2 sm:space-y-6 sm:p-4">
      <h1 className="text-lg font-bold sm:text-xl md:text-2xl flex justify-center">
        Doctor Dashboard
      </h1>
      <div className="p-6 bg-gray-100 rounded-lg">
        {loading && <div className="text-center">Đang tải dữ liệu...</div>}
        {/* Hàng 1: 3 cột */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={8} lg={8}>
            <CardWidget
              title="Số lượng lịch tiêm đã tiêm"
              value={stats.injectedAppointments}
              color="blue"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <CardWidget
              title="Số lượng lịch tiêm chờ phản ứng"
              value={stats.waitingForResponseAppointments}
              color="orange"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <CardWidget
              title="Số lượng lịch tiêm đã hoàn thành"
              value={stats.completedAppointments}
              color="green"
            />
          </Col>
        </Row>
        {/* Hàng 2: 1 cột */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={8} lg={8}>
            <CardWidget
              title="Tổng số vaccine"
              value={stats.totalVaccineQuantity}
              color="teal"
            />
          </Col>
        </Row>
        {/* Hàng 3: Biểu đồ Pie */}
        <Row gutter={[16, 16]} justify="center">
          <Col xs={24} lg={12}>
            <Card title="Phân bố trạng thái lịch hẹn">
              <Pie {...pieConfig} />
            </Card>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default DoctorDashboard;
