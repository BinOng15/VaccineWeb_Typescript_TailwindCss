import React, { useEffect, useState } from "react";
import AdminLayout from "../../Layout/AdminLayout";
import { Row, Col, Card, message } from "antd";
import { Pie } from "@ant-design/charts";
import userService from "../../../service/userService";
import appointmentService from "../../../service/appointmentService";
import childProfileService from "../../../service/childProfileService";
import vaccinePackageService from "../../../service/vaccinePackageService";
import vaccinePackageDetailService from "../../../service/vaccinePackageDetailService";
import paymentService from "../../../service/paymentService";
import paymentDetailService from "../../../service/paymentDetailService";
import { AppointmentStatus } from "../../Appointment/CustomerAppointment";

// Define the AppointmentResponseDTO interface based on the service response
interface AppointmentResponseDTO {
  appointmentStatus: AppointmentStatus;
  // Add other properties as needed (e.g., date, userId, etc.)
}

// Dashboard stats interface
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
  appointmentStatusCounts: { [key in AppointmentStatus]: number };
}

// Pie chart data interface
interface PieData {
  type: string;
  value: number;
}

// CardWidget component for displaying stats
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

// DetailedCardWidget component for additional stats
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

// Function to calculate appointment status counts
const calculateAppointmentStatusCounts = (
  appointments: AppointmentResponseDTO[]
): { [key in AppointmentStatus]: number } => {
  const counts: { [key in AppointmentStatus]: number } = {
    [AppointmentStatus.Pending]: 0,
    [AppointmentStatus.Checked]: 0,
    [AppointmentStatus.Paid]: 0,
    [AppointmentStatus.Injected]: 0,
    [AppointmentStatus.WaitingForResponse]: 0,
    [AppointmentStatus.Completed]: 0,
    [AppointmentStatus.Cancelled]: 0,
  };

  appointments.forEach((appointment) => {
    const status = appointment.appointmentStatus;
    if (status in counts) {
      counts[status] += 1;
    }
  });

  return counts;
};

// Main AdminDashboard component
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
    appointmentStatusCounts: calculateAppointmentStatusCounts([]), // Initialize with empty array
  });
  const [loading, setLoading] = useState(false);
  const [dataFetched, setDataFetched] = useState(false); // Add a flag to track if data is fetched

  // Fetch data from services
  const fetchData = async () => {
    setLoading(true);
    try {
      const allUsers = await userService.getAllUsers();
      const totalUsers = Array.isArray(allUsers) ? allUsers.length : 0;

      const allAppointments = await appointmentService.getAllAppointments();
      const totalAppointments = Array.isArray(allAppointments)
        ? allAppointments.length
        : 0;

      // Calculate appointment status counts using the service response
      const appointmentStatusCounts =
        calculateAppointmentStatusCounts(allAppointments);

      const allChildProfiles = await childProfileService.getAllChildProfiles();
      const totalChildProfiles = Array.isArray(allChildProfiles)
        ? allChildProfiles.length
        : 0;

      const allVaccinePackages = await vaccinePackageService.getAllPackages();
      const vaccinatedPackages = Array.isArray(allVaccinePackages)
        ? allVaccinePackages.filter((p) => p.isActive === 1).length
        : 0;
      const pendingPackages = Array.isArray(allVaccinePackages)
        ? allVaccinePackages.length - vaccinatedPackages
        : 0;

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
        console.warn("Unable to fetch payment data:", paymentError);
      }

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
          "Unable to fetch payment detail data:",
          paymentDetailError
        );
      }

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

      setDataFetched(true); // Mark data as fetched
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      message.error(
        "Unable to load dashboard data: " + (error as Error).message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calculate latest revenue values
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

  // Pie chart data for appointment statuses
  const pieData: PieData[] = [
    {
      type: "Chưa Check-in",
      value: stats.appointmentStatusCounts[AppointmentStatus.Pending],
    },
    {
      type: "Đã check-in",
      value: stats.appointmentStatusCounts[AppointmentStatus.Checked],
    },
    {
      type: "Đã thanh toán",
      value: stats.appointmentStatusCounts[AppointmentStatus.Paid],
    },
    {
      type: "Đã tiêm",
      value: stats.appointmentStatusCounts[AppointmentStatus.Injected],
    },
    {
      type: "Đang chờ phản ứng",
      value:
        stats.appointmentStatusCounts[AppointmentStatus.WaitingForResponse],
    },
    {
      type: "Hoàn tất",
      value: stats.appointmentStatusCounts[AppointmentStatus.Completed],
    },
    {
      type: "Đã hủy",
      value: stats.appointmentStatusCounts[AppointmentStatus.Cancelled],
    },
  ];

  // Pie chart configuration (updated from the second code)
  const pieConfig = {
    data: pieData,
    angleField: "value",
    colorField: "type",
    color: [
      "#FFCE56",
      "#4BC0C0",
      "#36A2EB",
      "#FF6384",
      "#9966FF",
      "#FF9F40",
      "#E6A0C4",
    ],
    height: 300,
    label: {
      type: "inner",
      offset: "-50%",
      content: ({ type, value }: PieData) => `${type}: ${value}`, // Display both status name and count
      style: {
        textAlign: "center",
        fontSize: 14,
      },
    },
    interactions: [], // Disable all interactions (from second code)
    tooltip: false, // Disable tooltip on hover (from second code)
  };

  // Render the dashboard
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
            <Col xs={24}>
              <Card title="Tình trạng đăng ký tiêm">
                {dataFetched ? (
                  <Pie {...pieConfig} />
                ) : (
                  <div className="text-center">Đang tải biểu đồ...</div>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminDashboard;
