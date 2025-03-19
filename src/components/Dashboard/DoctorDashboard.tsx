import React, { useEffect, useState } from "react";
import { Row, Col, Card, message } from "antd";
import { Pie } from "@ant-design/charts";
import appointmentService from "../../service/appointmentService";
import { AppointmentStatus } from "../../models/Type/enum";

interface DoctorDashboardStats {
  injectedAppointments: number; // Số lượng lịch tiêm đã tiêm (Injected = 4)
  waitingForResponseAppointments: number; // Số lượng lịch tiêm chờ phản ứng (WaitingForResponse = 5)
  completedAppointments: number; // Số lượng lịch tiêm đã hoàn thành (Completed = 6)
  totalAppointments: number; // Tổng số lịch hẹn
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
    totalAppointments: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Lấy tất cả lịch hẹn từ API
      const allAppointments = await appointmentService.getAllAppointments();

      // Khởi tạo biến đếm
      let injectedAppointments = 0;
      let waitingForResponseAppointments = 0;
      let completedAppointments = 0;
      const totalAppointments = Array.isArray(allAppointments)
        ? allAppointments.length
        : 0;

      // Tính toán dựa trên dữ liệu trả về
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

      // Cập nhật state
      setStats({
        injectedAppointments,
        waitingForResponseAppointments,
        completedAppointments,
        totalAppointments,
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

  // Dữ liệu cho 3 biểu đồ Pie
  const injectedPieData = [
    { type: "Đã tiêm", value: stats.injectedAppointments },
    {
      type: "Khác",
      value: stats.totalAppointments - stats.injectedAppointments,
    },
  ];

  const waitingForResponsePieData = [
    {
      type: "Đang chờ phản hồi",
      value: stats.waitingForResponseAppointments,
    },
    {
      type: "Khác",
      value: stats.totalAppointments - stats.waitingForResponseAppointments,
    },
  ];

  const completedPieData = [
    { type: "Hoàn tất", value: stats.completedAppointments },
    {
      type: "Khác",
      value: stats.totalAppointments - stats.completedAppointments,
    },
  ];

  // Cấu hình cho các biểu đồ Pie
  const pieConfig = {
    angleField: "value",
    colorField: "type",
    height: 200, // Giảm chiều cao để vừa với 3 biểu đồ
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

  const injectedPieConfig = {
    ...pieConfig,
    data: injectedPieData,
    color: ["#FF6384", "#E0E0E0"], // Đỏ cho "Đã tiêm", xám cho "Khác"
  };

  const waitingForResponsePieConfig = {
    ...pieConfig,
    data: waitingForResponsePieData,
    color: ["#36A2EB", "#E0E0E0"], // Xanh dương cho "Đang chờ phản hồi", xám cho "Khác"
  };

  const completedPieConfig = {
    ...pieConfig,
    data: completedPieData,
    color: ["#4CAF50", "#E0E0E0"], // Xanh lá cho "Hoàn tất", xám cho "Khác"
  };

  return (
    <section className="space-y-4 p-2 sm:space-y-6 sm:p-4">
      <h1 className="text-lg font-bold sm:text-xl md:text-2xl flex justify-center">
        Doctor Dashboard
      </h1>
      <div className="p-6 bg-gray-100 rounded-lg">
        {loading && <div className="text-center">Đang tải dữ liệu...</div>}
        {/* Hàng 1: 3 cột cho CardWidget */}
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
        {/* Hàng 2: 3 biểu đồ Pie */}
        <Row gutter={[16, 16]} justify="space-between">
          <Col xs={24} sm={12} md={8} lg={8}>
            <Card title="Trạng thái: Đã tiêm">
              <Pie {...injectedPieConfig} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <Card title="Trạng thái: Đang chờ phản hồi">
              <Pie {...waitingForResponsePieConfig} />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <Card title="Trạng thái: Hoàn tất">
              <Pie {...completedPieConfig} />
            </Card>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default DoctorDashboard;
