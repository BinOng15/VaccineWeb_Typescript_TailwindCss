// import React, { useEffect, useState } from "react";
// import { Row, Col, Card } from "antd";
// import paymentDetailService from "../../../service/paymentDetailService";
// import paymentService from "../../../service/paymentService";

// // Định nghĩa interface cho các chỉ số doanh thu
// interface RevenueStats {
//   totalRevenue: number;
//   dailyRevenue: { [key: string]: number };
//   monthlyRevenue: { [key: string]: number };
//   yearlyRevenue: { [key: string]: number };
// }

// // Thành phần CardWidget để hiển thị các thẻ thông tin
// const CardWidget: React.FC<{
//   title: string;
//   value: number | string;
//   percentage?: number;
//   color?: string;
// }> = ({ title, value, percentage, color = "blue" }) => {
//   return (
//     <div
//       className={`bg-white p-4 rounded-lg shadow-md border-l-4 border-${color}-500`}
//     >
//       <h3 className="text-sm text-gray-600">{title}</h3>
//       <p className="text-2xl font-bold text-gray-800">{value}</p>
//       {percentage && <p className="text-sm text-blue-500">{percentage}%</p>}
//     </div>
//   );
// };

// const AdminRevenue: React.FC = () => {
//   const [stats, setStats] = useState<RevenueStats>({
//     totalRevenue: 0,
//     dailyRevenue: {},
//     monthlyRevenue: {},
//     yearlyRevenue: {},
//   });

//   useEffect(() => {
//     const fetchRevenueData = async () => {
//       try {
//         // Lấy tất cả thanh toán
//         const payments = await paymentService.getAllPayments();
//         const paymentDetails =
//           await paymentDetailService.getAllPaymentDetails();

//         // Tính tổng doanh thu
//         const totalRevenue = payments.reduce(
//           (sum, payment) => sum + (payment.totalAmount || 0),
//           0
//         );

//         // Tính doanh thu theo ngày, tháng, năm
//         const dailyRevenue: { [key: string]: number } = {};
//         const monthlyRevenue: { [key: string]: number } = {};
//         const yearlyRevenue: { [key: string]: number } = {};

//         payments.forEach((payment) => {
//           if (payment.paymentDate) {
//             const date = new Date(payment.paymentDate);
//             const dayKey = date.toLocaleDateString();
//             const monthKey = date.toLocaleString("default", {
//               month: "long",
//               year: "numeric",
//             });
//             const yearKey = date.getFullYear().toString();

//             dailyRevenue[dayKey] =
//               (dailyRevenue[dayKey] || 0) + (payment.totalAmount || 0);
//             monthlyRevenue[monthKey] =
//               (monthlyRevenue[monthKey] || 0) + (payment.totalAmount || 0);
//             yearlyRevenue[yearKey] =
//               (yearlyRevenue[yearKey] || 0) + (payment.totalAmount || 0);
//           }
//         });

//         // Thêm doanh thu từ PaymentDetail (nếu có)
//         paymentDetails.forEach((detail) => {
//           const date = detail.administeredDate
//             ? new Date(detail.administeredDate)
//             : new Date();
//           const dayKey = date.toLocaleDateString();
//           const monthKey = date.toLocaleString("default", {
//             month: "long",
//             year: "numeric",
//           });
//           const yearKey = date.getFullYear().toString();

//           dailyRevenue[dayKey] =
//             (dailyRevenue[dayKey] || 0) + (detail.price || 0);
//           monthlyRevenue[monthKey] =
//             (monthlyRevenue[monthKey] || 0) + (detail.price || 0);
//           yearlyRevenue[yearKey] =
//             (yearlyRevenue[yearKey] || 0) + (detail.price || 0);
//         });

//         setStats({
//           totalRevenue,
//           dailyRevenue,
//           monthlyRevenue,
//           yearlyRevenue,
//         });
//       } catch (error) {
//         console.error("Error fetching revenue data:", error);
//       }
//     };

//     fetchRevenueData();
//   }, []);

//   // Tính giá trị doanh thu lớn nhất cho ngày, tháng, năm
//   const latestDailyRevenueValue = Object.values(stats.dailyRevenue).reduce(
//     (max, value) => (value > max ? value : max),
//     0
//   );
//   const latestMonthlyRevenueValue = Object.values(stats.monthlyRevenue).reduce(
//     (max, value) => (value > max ? value : max),
//     0
//   );
//   const latestYearlyRevenueValue = Object.values(stats.yearlyRevenue).reduce(
//     (max, value) => (value > max ? value : max),
//     0
//   );

//   return (
//     <section className="space-y-4 p-2 sm:space-y-6 sm:p-4">
//       <h1 className="text-lg font-bold sm:text-xl md:text-2xl">
//         Admin Revenue
//       </h1>
//       <div className="p-6 bg-gray-100 rounded-lg">
//         <Row gutter={[16, 16]} className="mb-6">
//           <Col xs={12} sm={8} md={6} lg={4}>
//             <CardWidget
//               title="Tổng doanh thu"
//               value={stats.totalRevenue.toLocaleString()}
//               color="blue"
//             />
//           </Col>
//           <Col xs={12} sm={8} md={6} lg={4}>
//             <CardWidget
//               title="Doanh thu theo ngày"
//               value={latestDailyRevenueValue.toLocaleString()}
//               color="green"
//             />
//           </Col>
//           <Col xs={12} sm={8} md={6} lg={4}>
//             <CardWidget
//               title="Doanh thu theo tháng"
//               value={latestMonthlyRevenueValue.toLocaleString()}
//               color="purple"
//             />
//           </Col>
//           <Col xs={12} sm={8} md={6} lg={4}>
//             <CardWidget
//               title="Doanh thu theo năm"
//               value={latestYearlyRevenueValue.toLocaleString()}
//               color="cyan"
//             />
//           </Col>
//         </Row>
//         {/* Phần My Contracts (danh sách hợp đồng mẫu) */}
//         <Row gutter={[16, 16]} className="mb-6">
//           <Col xs={24} lg={12}>
//             <Card title="My Contracts">
//               <div className="space-y-2">
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">SERIAL #</span>
//                   <span className="text-gray-600">NAME</span>
//                   <span className="text-gray-600">VALUE</span>
//                   <span className="text-gray-600">STATUS</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span>CNTR00039F</span>
//                   <span>Horizon Tech</span>
//                   <span>$48,292</span>
//                   <span className="bg-green-500 text-white px-2 py-1 rounded">
//                     Active
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span>CNTR00038F</span>
//                   <span>Flowtech Labs</span>
//                   <span>$20,550</span>
//                   <span className="bg-orange-500 text-white px-2 py-1 rounded">
//                     Draft
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span>CNTR00038F</span>
//                   <span>Servertech Inc.</span>
//                   <span>$72,402</span>
//                   <span className="bg-blue-500 text-white px-2 py-1 rounded">
//                     In Review
//                   </span>
//                 </div>
//               </div>
//             </Card>
//           </Col>
//           {/* Phần Average Cycle Time (thời gian chu kỳ trung bình mẫu) */}
//           <Col xs={24} lg={12}>
//             <Card title="Average Cycle Time">
//               <div className="space-y-2">
//                 <div className="flex justify-between items-center">
//                   <span className="text-gray-600">25 days</span>
//                   <span className="text-gray-600">45 days</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span>N/A</span>
//                   <span>Insurance</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span>18 days</span>
//                   <span>12 days</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span>Lease</span>
//                   <span>Purchase</span>
//                 </div>
//               </div>
//             </Card>
//           </Col>
//         </Row>
//       </div>
//     </section>
//   );
// };

// export default AdminRevenue;
