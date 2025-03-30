import React, { useEffect, useState } from "react";
import { Row, Col, Card, message } from "antd";
import { Pie } from "@ant-design/charts";
import appointmentService from "../../service/appointmentService";
import childProfileService from "../../service/childProfileService";
import vaccinePackageService from "../../service/vaccinePackageService";
import vaccineScheduleService from "../../service/vaccineScheduleService";
import vaccineService from "../../service/vaccineService";
import { AppointmentStatus } from "../Appointment/CustomerAppointment";

interface StaffDashboardStats {
  totalVaccines: number; // Số lượng vaccine lẻ (số loại vaccine)
  totalVaccineQuantity: number; // Tổng số vaccine (dựa trên quantity)
  totalVaccinePackages: number; // Số lượng gói vaccine
  totalRegisteredChildren: number; // Số lượng trẻ đăng ký tiêm
  totalChildProfiles: number; // Số lượng hồ sơ của trẻ
  totalVaccineSchedules: number; // Số lượng lịch tiêm chủng (từ VaccineSchedule)
  appointmentStatusCounts: { [key in AppointmentStatus]?: number };
}

interface PieDatum {
  type: string;
  value: number;
  color: string;
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

  // Định nghĩa thứ tự, nhãn và màu sắc cho tất cả 7 trạng thái
  // (theo đúng thứ tự enum AppointmentStatus)
  const statuses = [
    {
      value: AppointmentStatus.Pending,
      label: "Chưa Check-in",
      color: "#FFA500",
    },
    {
      value: AppointmentStatus.Checked,
      label: "Đã check-in",
      color: "#4BC0C0",
    },
    { value: AppointmentStatus.Paid, label: "Đã thanh toán", color: "#FFD700" },
    { value: AppointmentStatus.Injected, label: "Đã tiêm", color: "#FF9F40" },
    {
      value: AppointmentStatus.WaitingForResponse,
      label: "Đang chờ phản ứng",
      color: "#36A2EB",
    },
    {
      value: AppointmentStatus.Completed,
      label: "Đã hoàn tất",
      color: "#FF6384",
    },
    { value: AppointmentStatus.Cancelled, label: "Đã hủy", color: "#8B0000" },
  ];

  // Tạo dữ liệu cho biểu đồ Pie với 7 trạng thái (theo đúng thứ tự)
  const pieData: PieDatum[] = statuses.map((s) => ({
    type: s.label,
    value: stats.appointmentStatusCounts[s.value] || 0,
    color: s.color,
  }));

  // Cấu hình biểu đồ Pie
  const pieConfig = {
    data: pieData,
    angleField: "value",
    colorField: "type",
    color: (datum: PieDatum) => datum.color,
    height: 300,
    label: {
      type: "inner",
      offset: "-50%",
      content: ({ type, value }: { type: string; value: number }) =>
        `${type}: ${value}`,
      style: {
        textAlign: "center",
        fontSize: 14,
      },
    },
    // Tắt các tương tác mặc định
    interactions: [],
    tooltip: false,
    // Tùy chỉnh legend để giữ nguyên thứ tự
    legend: {
      custom: true,
      position: "bottom",
      // items: là mảng hiển thị cho legend, ta map theo đúng thứ tự statuses
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
              title="Tổng số vaccine"
              value={stats.totalVaccineQuantity}
              color="teal"
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={8}>
            <CardWidget
              title="Số lượng gói vaccine"
              value={stats.totalVaccinePackages}
              color="green"
            />
          </Col>
        </Row>
        {/* Hàng 2: 3 cột */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={8} lg={8}>
            <CardWidget
              title="Số lượng trẻ đăng ký tiêm"
              value={stats.totalRegisteredChildren}
              color="orange"
            />
          </Col>
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
