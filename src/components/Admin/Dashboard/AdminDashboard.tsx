import React, { useEffect, useState } from "react";
import AdminLayout from "../../Layout/AdminLayout";
import { Row, Col, Card, message } from "antd"; // Thêm message để hiển thị lỗi
import { Line, Bar, Pie } from "@ant-design/charts";
import userService from "../../../service/userService";
import appointmentService from "../../../service/appointmentService";
import childProfileService from "../../../service/childProfileService";
import vaccinationRecordService from "../../../service/vaccinationRecordService";
import vaccinePackageService from "../../../service/vaccinePackageService";
import paymentService from "../../../service/paymentService";
import paymentDetailService from "../../../service/paymentDetailService";

// Định nghĩa interface cho các chỉ số của dashboard
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
}

// Thành phần CardWidget để hiển thị các thẻ thông tin cơ bản
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

// Thành phần DetailedCardWidget để hiển thị thẻ thông tin chi tiết cho vaccine và gói vaccine
const DetailedCardWidget: React.FC<{
  title: string;
  total: number;
  details: { label: string; value: number; color: string }[];
}> = ({ title, total, details }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
      <h3 className="text-sm text-gray-600">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{total}</p>
      <div className="mt-2">
        {details.map((detail, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{detail.label}</span>
            <span className={`text-sm font-bold text-${detail.color}-500`}>
              {detail.value}
            </span>
          </div>
        ))}
      </div>
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
  });
  const [loading, setLoading] = useState(false); // Thêm trạng thái loading

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Bắt đầu loading
      try {
        // Lấy dữ liệu người dùng
        const users = await userService.getAllUsers();
        const totalUsers = Array.isArray(users) ? users.length : 0;

        // Lấy dữ liệu lịch hẹn
        const appointments = await appointmentService.getAllAppointments();
        const totalAppointments = Array.isArray(appointments)
          ? appointments.length
          : 0;

        // Lấy dữ liệu hồ sơ trẻ
        const childProfiles = await childProfileService.getAllChildProfiles();
        const totalChildProfiles = Array.isArray(childProfiles)
          ? childProfiles.length
          : 0;

        // Lấy dữ liệu vaccine
        const vaccinationRecords =
          await vaccinationRecordService.getAllVaccinationRecord();
        const vaccinatedCount = Array.isArray(vaccinationRecords)
          ? vaccinationRecords.filter((r) => r.isActive === 1).length
          : 0;
        const unvaccinatedCount = Array.isArray(vaccinationRecords)
          ? vaccinationRecords.length - vaccinatedCount
          : 0;

        // Lấy dữ liệu gói vaccine
        const vaccinePackages = await vaccinePackageService.getAllPackages();
        const vaccinatedPackages = Array.isArray(vaccinePackages)
          ? vaccinePackages.filter((p) => p.isActive === 1).length
          : 0;
        const pendingPackages = Array.isArray(vaccinePackages)
          ? vaccinePackages.length - vaccinatedPackages
          : 0;

        // Lấy dữ liệu doanh thu
        const payments = await paymentService.getAllPayments();
        const paymentDetails =
          await paymentDetailService.getAllPaymentDetails();

        const totalRevenue = Array.isArray(payments)
          ? payments.reduce(
              (sum, payment) => sum + (payment.totalAmount || 0),
              0
            )
          : 0;

        const dailyRevenue: { [key: string]: number } = {};
        const monthlyRevenue: { [key: string]: number } = {};
        const yearlyRevenue: { [key: string]: number } = {};

        if (Array.isArray(payments)) {
          payments.forEach((payment) => {
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

        if (Array.isArray(paymentDetails)) {
          paymentDetails.forEach((detail) => {
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

        // Cập nhật state
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
        });
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu dashboard:", error);
        message.error(
          "Không thể tải dữ liệu dashboard: " + (error as Error).message
        );
      } finally {
        setLoading(false); // Kết thúc loading
      }
    };

    fetchData();
  }, []);

  // Tính giá trị doanh thu lớn nhất
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

  // Dữ liệu cho biểu đồ
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

  const barData = [
    { type: "Đã tiêm", value: stats.vaccinatedCount },
    { type: "Chưa tiêm", value: stats.unvaccinatedCount },
  ];

  const pieData = [
    { type: "Đã tiêm", value: stats.vaccinatedPackages },
    { type: "Chưa tiêm", value: stats.pendingPackages },
  ];

  const lineConfig = {
    data: lineData,
    xField: "month",
    yField: "value",
    smooth: true,
    color: "#36A2EB",
    height: 300,
  };

  const barConfig = {
    data: barData,
    xField: "type",
    yField: "value",
    seriesField: "type",
    color: ["#36A2EB", "#FF6384"],
    height: 300,
  };

  const pieConfig = {
    data: pieData,
    angleField: "value",
    colorField: "type",
    color: ["#FFCE56", "#4BC0C0"],
    height: 300,
  };

  return (
    <AdminLayout>
      <section className="space-y-4 p-2 sm:space-y-6 sm:p-4">
        <h1 className="text-lg font-bold sm:text-xl md:text-2xl">
          Admin Dashboard
        </h1>
        <div className="p-6 bg-gray-100 rounded-lg">
          {loading && <div className="text-center">Đang tải dữ liệu...</div>}
          {/* Hàng 1: Tổng doanh thu, Doanh thu theo ngày, Doanh thu theo tháng, Doanh thu theo năm */}
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

          {/* Hàng 2: Số lượng người dùng, Số lượng đăng ký tiêm, Số lượng hồ sơ tiêm chủng */}
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

          {/* Hàng 3: Số lượng gói vaccine trong hệ thống, Số lượng vaccine trong hệ thống */}
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={12} lg={12}>
              <DetailedCardWidget
                title="Số lượng gói vaccine trong hệ thống"
                total={stats.vaccinatedPackages + stats.pendingPackages}
                details={[
                  {
                    label: "Đã tiêm",
                    value: stats.vaccinatedPackages,
                    color: "green",
                  },
                  {
                    label: "Chưa tiêm",
                    value: stats.pendingPackages,
                    color: "red",
                  },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} md={12} lg={12}>
              <DetailedCardWidget
                title="Số lượng vaccine trong hệ thống"
                total={stats.vaccinatedCount + stats.unvaccinatedCount}
                details={[
                  {
                    label: "Đã tiêm",
                    value: stats.vaccinatedCount,
                    color: "green",
                  },
                  {
                    label: "Chưa tiêm",
                    value: stats.unvaccinatedCount,
                    color: "red",
                  },
                ]}
              />
            </Col>
          </Row>

          {/* Các biểu đồ */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title="Số lượng đăng ký tiêm theo tháng">
                <Line {...lineConfig} />
              </Card>
            </Col>
            <Col xs={24} lg={6}>
              <Card title="Tình trạng vaccine">
                <Bar {...barConfig} />
              </Card>
            </Col>
            <Col xs={24} lg={6}>
              <Card title="Tình trạng gói vaccine">
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
