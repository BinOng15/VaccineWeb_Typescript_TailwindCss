import React, { useEffect, useState } from "react";
import AdminLayout from "../../Layout/AdminLayout";
import { Row, Col, Card } from "antd";
import { Pie } from "@ant-design/charts";
import userService from "../../../service/userService";
import appointmentService from "../../../service/appointmentService";
import childProfileService from "../../../service/childProfileService";
import vaccinePackageService from "../../../service/vaccinePackageService";
import vaccinePackageDetailService from "../../../service/vaccinePackageDetailService";
import paymentService from "../../../service/paymentService";
import { AppointmentStatus } from "../../Appointment/CustomerAppointment";

// Define the AppointmentResponseDTO interface
interface AppointmentResponseDTO {
  appointmentStatus: AppointmentStatus;
}

// Define PaymentResponseDTO interface
export interface PaymentResponseDTO {
  paymentId: number;
  appointmentId: number;
  userId: number;
  vaccinePackageId?: number;
  vaccineId?: number;
  paymentType: string;
  totalAmount: number;
  paymentDate?: Date | string;
  paymentStatus: PaymentStatus;
  createdDate: Date | string;
  createdBy: string;
  url: string;
}

// Define PaymentStatus enum
export enum PaymentStatus {
  AwaitingPayment = 1,
  Paid = 2,
  Aborted = 3,
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
  appointmentStatusCounts: { [key in AppointmentStatus]: number };
}

// Pie chart data interface
interface PieData {
  type: string;
  value: number;
}

// CardWidget component for displaying stats with animations
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

// DetailedCardWidget component for additional stats with animations
const DetailedCardWidget: React.FC<{
  title: string;
  total: number;
  color: string;
}> = ({ title, total, color }) => {
  return (
    <div
      className={`bg-gradient-to-r ${color} text-white p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fadeIn`}
    >
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-3xl font-bold">{total}</p>
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
    appointmentStatusCounts: calculateAppointmentStatusCounts([]),
  });
  const [loading, setLoading] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);

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

      // Fetch and calculate total revenue based on Paid payments only
      try {
        const allPayments = await paymentService.getAllPayments();
        const paidPayments = Array.isArray(allPayments)
          ? allPayments.filter(
            (payment) => payment.paymentStatus === PaymentStatus.Paid
          )
          : [];

        totalRevenue = paidPayments.reduce(
          (sum, payment) => sum + (payment.totalAmount || 0),
          0
        );
      } catch (paymentError) {
        console.warn("Unable to fetch payment data:", paymentError);
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
        appointmentStatusCounts,
      });

      setDataFetched(true);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  // Pie chart configuration with enhanced visuals
  const pieConfig = {
    data: pieData,
    angleField: "value",
    colorField: "type",
    color: [
      "#FF6F61",
      "#6B5B95",
      "#88B04B",
      "#F7CAC9",
      "#92A8D1",
      "#F4A261",
      "#E2D96C",
    ],
    height: 350,
    radius: 0.9,
    innerRadius: 0.6,
    label: {
      type: "inner",
      offset: "-30%",
      content: ({ type, value }: PieData) => `${type}: ${value}`,
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
      layout: "horizontal",
      position: "bottom",
      itemName: {
        style: { fill: "#333", fontSize: 14 },
      },
    },
  };

  // Render the dashboard with white background
  return (
    <AdminLayout>
      <section className="space-y-6 p-4 sm:p-6 bg-white min-h-screen">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 drop-shadow-lg animate-pulse">
          TRANG CHÍNH CỦA ADMIN
        </h1>
        <div className="p-8 rounded-2xl bg-white shadow-lg">
          {loading && (
            <div className="text-center text-gray-600">Đang tải dữ liệu...</div>
          )}
          <Row gutter={[24, 24]} className="mb-8">
            <Col xs={24} sm={12} md={12} lg={6}>
              <CardWidget
                title="Tổng doanh thu"
                value={stats.totalRevenue.toLocaleString()}
                color="from-yellow-400 to-orange-500"
                icon="fas fa-money-bill-wave"
              />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <CardWidget
                title="Số lượng người dùng"
                value={stats.totalUsers}
                color="from-blue-400 to-cyan-500"
                icon="fas fa-users"
              />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <CardWidget
                title="Số lượng đăng ký tiêm"
                value={stats.totalAppointments}
                color="from-green-400 to-teal-500"
                icon="fas fa-syringe"
              />
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <CardWidget
                title="Số lượng hồ sơ tiêm chủng"
                value={stats.totalChildProfiles}
                color="from-purple-400 to-pink-500"
                icon="fas fa-address-book"
              />
            </Col>
          </Row>
          <Row gutter={[24, 24]} className="mb-8">
            <Col xs={24} sm={12} md={12} lg={12}>
              <DetailedCardWidget
                title="Số lượng gói vaccine trong hệ thống"
                total={stats.vaccinatedPackages + stats.pendingPackages}
                color="from-indigo-400 to-blue-500"
              />
            </Col>
            <Col xs={24} sm={12} md={12} lg={12}>
              <DetailedCardWidget
                title="Số lượng vaccine trong hệ thống"
                total={stats.vaccinatedCount + stats.unvaccinatedCount}
                color="from-red-400 to-pink-500"
              />
            </Col>
          </Row>
          <Row gutter={[24, 24]}>
            <Col xs={24}>
              <Card
                title={<span className="text-gray-800 text-xl font-bold">Tình trạng đăng ký tiêm</span>}
                className="bg-white border-none rounded-xl shadow-xl"
                headStyle={{ background: "transparent", color: "#333", border: "none" }}
                bodyStyle={{ background: "transparent" }}
              >
                {dataFetched ? (
                  <Pie {...pieConfig} />
                ) : (
                  <div className="text-center text-gray-600">Đang tải biểu đồ...</div>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      </section>
    </AdminLayout>
  );
};

// Add custom CSS for animations
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

// Inject styles into the document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default AdminDashboard;