import React, { useEffect, useState } from "react";
import AdminLayout from "../../Layout/AdminLayout";
import { Row, Col, Card, message } from "antd";
import { Line, Pie } from "@ant-design/charts"; // Loại bỏ Bar
import userService from "../../../service/userService";
import appointmentService from "../../../service/appointmentService";
import childProfileService from "../../../service/childProfileService";
import vaccinePackageService from "../../../service/vaccinePackageService";
import vaccinePackageDetailService from "../../../service/vaccinePackageDetailService";
import paymentService from "../../../service/paymentService";
import paymentDetailService from "../../../service/paymentDetailService";

interface DashboardStats {
  totalUsers: number;
  totalAppointments: number;
  totalChildProfiles: number;
  vaccinatedCount: number;
  unvaccinatedCount: number;
  vaccinatedPackages: number;
  pendingPackages: number;
  totalRevenue: number;
  dailyRevenue: { [key: string]: number };
  monthlyRevenue: { [key: string]: number };
  yearlyRevenue: { [key: string]: number };
  appointmentStatusCounts: { [key: string]: number }; // Thêm để lưu số lượng theo trạng thái
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

const DetailedCardWidget: React.FC<{
  title: string;
  total: number;
}> = ({ title, total }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
      <h3 className="text-sm text-gray-600">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{total}</p>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAppointments: 0,
    totalChildProfiles: 0,
    vaccinatedCount: 0,
    unvaccinatedCount: 0,
    vaccinatedPackages: 0,
    pendingPackages: 0,
    totalRevenue: 0,
    dailyRevenue: {},
    monthlyRevenue: {},
    yearlyRevenue: {},
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
      // Lấy dữ liệu người dùng
      const allUsers = await userService.getAllUsers();
      const totalUsers = Array.isArray(allUsers) ? allUsers.length : 0;

      // Lấy dữ liệu lịch hẹn
      const allAppointments = await appointmentService.getAllAppointments();
      const totalAppointments = Array.isArray(allAppointments)
        ? allAppointments.length
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

      // Lấy dữ liệu hồ sơ trẻ
      const allChildProfiles = await childProfileService.getAllChildProfiles();
      const totalChildProfiles = Array.isArray(allChildProfiles)
        ? allChildProfiles.length
        : 0;

      // Lấy dữ liệu gói vaccine
      const allVaccinePackages = await vaccinePackageService.getAllPackages();
      const vaccinatedPackages = Array.isArray(allVaccinePackages)
        ? allVaccinePackages.filter((p) => p.isActive === 1).length
        : 0;
      const pendingPackages = Array.isArray(allVaccinePackages)
        ? allVaccinePackages.length - vaccinatedPackages
        : 0;

      // Lấy dữ liệu chi tiết gói vaccine để tính vaccinatedCount và unvaccinatedCount
      const allVaccinePackageDetails =
        await vaccinePackageDetailService.getAllPackagesDetail();
      const vaccinatedCount = Array.isArray(allVaccinePackageDetails)
        ? allVaccinePackageDetails.filter(
          (d) => d.isActive === "true" || d.isActive === "1"
        ).length
        : 0;
      const unvaccinatedCount = Array.isArray(allVaccinePackageDetails)
        ? allVaccinePackageDetails.length - vaccinatedCount
        : 0;

      // Lấy dữ liệu thanh toán
      let totalRevenue = 0;
      const dailyRevenue: { [key: string]: number } = {};
      const monthlyRevenue: { [key: string]: number } = {};
      const yearlyRevenue: { [key: string]: number } = {};

      try {
        const allPayments = await paymentService.getAllPayments();
        totalRevenue = Array.isArray(allPayments)
          ? allPayments.reduce(
            (sum, payment) => sum + (payment.totalAmount || 0),
            0
          )
          : 0;

        if (Array.isArray(allPayments)) {
          allPayments.forEach((payment) => {
            if (payment.paymentDate) {
              const date = new Date(payment.paymentDate);
              const dayKey = date.toLocaleDateString();
              const monthKey = date.toLocaleString("default", {
                month: "long",
                year: "numeric",
              });
              const yearKey = date.getFullYear().toString();

              dailyRevenue[dayKey] =
                (dailyRevenue[dayKey] || 0) + (payment.totalAmount || 0);
              monthlyRevenue[monthKey] =
                (monthlyRevenue[monthKey] || 0) + (payment.totalAmount || 0);
              yearlyRevenue[yearKey] =
                (yearlyRevenue[yearKey] || 0) + (payment.totalAmount || 0);
            }
          });
        }
      } catch (paymentError) {
        console.warn("Không thể lấy dữ liệu thanh toán:", paymentError);
      }

      // Lấy dữ liệu chi tiết thanh toán
      try {
        const allPaymentDetails =
          await paymentDetailService.getAllPaymentDetails();
        if (Array.isArray(allPaymentDetails)) {
          allPaymentDetails.forEach((detail) => {
            const date = detail.administeredDate
              ? new Date(detail.administeredDate)
              : new Date();
            const dayKey = date.toLocaleDateString();
            const monthKey = date.toLocaleString("default", {
              month: "long",
              year: "numeric",
            });
            const yearKey = date.getFullYear().toString();

            dailyRevenue[dayKey] =
              (dailyRevenue[dayKey] || 0) + (detail.price || 0);
            monthlyRevenue[monthKey] =
              (monthlyRevenue[monthKey] || 0) + (detail.price || 0);
            yearlyRevenue[yearKey] =
              (yearlyRevenue[yearKey] || 0) + (detail.price || 0);
          });
        }
      } catch (paymentDetailError) {
        console.warn(
          "Không thể lấy dữ liệu chi tiết thanh toán:",
          paymentDetailError
        );
      }

      // Cập nhật state với dữ liệu lấy được
      setStats({
        totalUsers,
        totalAppointments,
        totalChildProfiles,
        vaccinatedCount,
        unvaccinatedCount,
        vaccinatedPackages,
        pendingPackages,
        totalRevenue,
        dailyRevenue,
        monthlyRevenue,
        yearlyRevenue,
        appointmentStatusCounts,
      });
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu dashboard:", error);
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

  const latestDailyRevenueValue = Object.values(stats.dailyRevenue).reduce(
    (max, value) => (value > max ? value : max),
    0
  );
  const latestMonthlyRevenueValue = Object.values(stats.monthlyRevenue).reduce(
    (max, value) => (value > max ? value : max),
    0
  );
  const latestYearlyRevenueValue = Object.values(stats.yearlyRevenue).reduce(
    (max, value) => (value > max ? value : max),
    0
  );

  const lineData = [
    { month: "Jan", value: 12 },
    { month: "Feb", value: 19 },
    { month: "Mar", value: 3 },
    { month: "Apr", value: 5 },
    { month: "May", value: 2 },
    { month: "Jun", value: 3 },
    { month: "Jul", value: 7 },
    { month: "Aug", value: 15 },
    { month: "Sep", value: 10 },
    { month: "Oct", value: 8 },
    { month: "Nov", value: 12 },
  ];

  // Dữ liệu cho biểu đồ Pie "Tình trạng đăng ký tiêm"
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

  const lineConfig = {
    data: lineData,
    xField: "month",
    yField: "value",
    smooth: true,
    color: "#36A2EB",
    height: 300,
  };

  const pieConfig = {
    data: pieData,
    angleField: "value",
    colorField: "type",
    color: ["#FFCE56", "#4BC0C0", "#36A2EB", "#FF6384", "#9966FF"], // 5 màu cho 5 trạng thái
    height: 300,
  };

  return (
    <AdminLayout>
      <section className="space-y-4 p-2 sm:space-y-6 sm:p-4">
        <h1 className="text-lg font-bold sm:text-xl md:text-2xl text-center">
          TRANG CHÍNH CỦA ADMIN
        </h1>
        <div className="p-6 bg-gray-100 rounded-lg">
          {loading && <div className="text-center">Đang tải dữ liệu...</div>}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={6} lg={6}>
              <CardWidget
                title="Tổng doanh thu"
                value={stats.totalRevenue.toLocaleString()}
                color="orange"
              />
            </Col>
            <Col xs={24} sm={12} md={6} lg={6}>
              <CardWidget
                title="Doanh thu theo ngày"
                value={latestDailyRevenueValue.toLocaleString()}
                color="pink"
              />
            </Col>
            <Col xs={24} sm={12} md={6} lg={6}>
              <CardWidget
                title="Doanh thu theo tháng"
                value={latestMonthlyRevenueValue.toLocaleString()}
                color="indigo"
              />
            </Col>
            <Col xs={24} sm={12} md={6} lg={6}>
              <CardWidget
                title="Doanh thu theo năm"
                value={latestYearlyRevenueValue.toLocaleString()}
                color="gray"
              />
            </Col>
          </Row>
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={8} lg={8}>
              <CardWidget
                title="Số lượng người dùng"
                value={stats.totalUsers}
                color="blue"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={8}>
              <CardWidget
                title="Số lượng đăng ký tiêm"
                value={stats.totalAppointments}
                color="green"
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={8}>
              <CardWidget
                title="Số lượng hồ sơ tiêm chủng"
                value={stats.totalChildProfiles}
                color="purple"
              />
            </Col>
          </Row>
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={12} lg={12}>
              <DetailedCardWidget
                title="Số lượng gói vaccine trong hệ thống"
                total={stats.vaccinatedPackages + stats.pendingPackages}
              />
            </Col>
            <Col xs={24} sm={12} md={12} lg={12}>
              <DetailedCardWidget
                title="Số lượng vaccine trong hệ thống"
                total={stats.vaccinatedCount + stats.unvaccinatedCount}
              />
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Số lượng đăng ký tiêm theo tháng">
                <Line {...lineConfig} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              {" "}
              {/* Tăng width từ lg={6} lên lg={12} để thay thế vị trí của Bar */}
              <Card title="Tình trạng đăng ký tiêm">
                <Pie {...pieConfig} />
              </Card>
            </Col>
          </Row>
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminDashboard;
