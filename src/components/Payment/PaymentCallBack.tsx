import { useEffect, useState } from "react";
import { Spin, Card, Descriptions, Result, Button, message } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import StaffLayout from "../Layout/StaffLayout";
import paymentService from "../../service/paymentService";
import paymentDetailService from "../../service/paymentDetailService";
import appointmentService from "../../service/appointmentService";
import { AppointmentStatus } from "../../models/Type/enum";

const Payment = () => {
  interface PaymentDetails {
    amount: string | null;
    bankCode: string | null;
    bankTranNo: string | null;
    cardType: string | null;
    orderInfo: string | null;
    payDate: string | null;
    responseCode: string | null;
    tmnCode: string | null;
    transactionNo: string | null;
    transactionStatus: string | null;
    txnRef: string | null;
    secureHash: string | null;
  }

  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    amount: null,
    bankCode: null,
    bankTranNo: null,
    cardType: null,
    orderInfo: null,
    payDate: null,
    responseCode: null,
    tmnCode: null,
    transactionNo: null,
    transactionStatus: null,
    txnRef: null,
    secureHash: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updatePaymentAndAppointment = async (paymentId: number) => {
      try {
        // Kiểm tra xem paymentId có hợp lệ không
        if (!Number.isInteger(paymentId) || paymentId <= 0) {
          throw new Error("Payment ID không hợp lệ");
        }

        // Cập nhật trạng thái thanh toán thành 2 (Đang xử lý)
        const updatedPayment = await paymentService.updatePayment(paymentId, {
          paymentStatus: 2, // Đang xử lý
        });
        console.log(
          `Trạng thái thanh toán đã được cập nhật thành 2 cho paymentId: ${paymentId}`,
          updatedPayment
        );

        // Lấy tất cả thông tin thanh toán để tìm payment tương ứng
        const allPayments = await paymentService.getAllPayments();
        const payment = allPayments.find((p) => p.paymentId === paymentId);
        if (!payment || !payment.appointmentId) {
          throw new Error("Không tìm thấy thông tin thanh toán hoặc appointmentId!");
        }

        // Lấy thông tin lịch hẹn bằng appointmentId
        const appointment = await appointmentService.getAppointmentById(payment.appointmentId);
        if (!appointment) {
          throw new Error("Không tìm thấy lịch hẹn liên quan đến paymentId này!");
        }

        // Kiểm tra xem appointment có vaccineId (vaccine lẻ) hay vaccinePackageId (gói vaccine)
        if (appointment.vaccineId) {
          // Trường hợp vaccine lẻ: Chỉ cần cập nhật trạng thái appointment thành Paid
          const updateAppointmentData = {
            appointmentStatus: AppointmentStatus.Paid, // Cập nhật thành Paid (3)
          };
          await appointmentService.updateAppointment(appointment.appointmentId, updateAppointmentData);
          console.log(`Trạng thái lịch hẹn đã được cập nhật thành Paid cho appointmentId: ${appointment.appointmentId} (Vaccine lẻ)`);
          message.success("Thanh toán vaccine lẻ và cập nhật lịch hẹn thành công!");
        } else if (appointment.vaccinePackageId) {
          // Trường hợp gói vaccine: Tạo chi tiết thanh toán và cập nhật trạng thái appointment
          const generatedDetails = await paymentDetailService.generatePaymentDetail(paymentId);
          console.log("Chi tiết thanh toán đã được tạo cho gói vaccine:", generatedDetails);

          const updateAppointmentData = {
            appointmentStatus: AppointmentStatus.Paid, // Cập nhật thành Paid (3)
          };
          await appointmentService.updateAppointment(appointment.appointmentId, updateAppointmentData);
          console.log(`Trạng thái lịch hẹn đã được cập nhật thành Paid cho appointmentId: ${appointment.appointmentId} (Gói vaccine)`);
          message.success("Thanh toán gói vaccine và cập nhật lịch hẹn thành công!");
        } else {
          throw new Error("Lịch hẹn không có vaccineId hoặc vaccinePackageId!");
        }
      } catch (error) {
        message.error(
          "Không thể xử lý thanh toán: " + (error as Error).message
        );
        console.error("Lỗi khi xử lý thanh toán:", error);
      }
    };

    // Lấy tham số từ URL redirect
    const currentUrl = window.location.href;
    const params = new URLSearchParams(currentUrl.split("?")[1]);

    const newPaymentDetails = {
      amount: params.get("vnp_Amount"),
      bankCode: params.get("vnp_BankCode"),
      bankTranNo: params.get("vnp_BankTranNo"),
      cardType: params.get("vnp_CardType"),
      orderInfo: params.get("vnp_OrderInfo"),
      payDate: params.get("vnp_PayDate"),
      responseCode: params.get("vnp_ResponseCode"),
      tmnCode: params.get("vnp_TmnCode"),
      transactionNo: params.get("vnp_TransactionNo"),
      transactionStatus: params.get("vnp_TransactionStatus"),
      txnRef: params.get("vnp_TxnRef"),
      secureHash: params.get("vnp_SecureHash"),
    };

    setPaymentDetails(newPaymentDetails);
    setLoading(false);

    // Kiểm tra nếu thanh toán thành công (responseCode === "00")
    if (newPaymentDetails.responseCode === "00") {
      // Lấy paymentId từ orderInfo
      let paymentId = 0;
      if (newPaymentDetails.orderInfo) {
        paymentId = parseInt(newPaymentDetails.orderInfo, 10);
      }

      // Kiểm tra và điều chỉnh paymentId
      if (paymentId && !isNaN(paymentId)) {
        // Đảm bảo paymentId nằm trong phạm vi hợp lệ (nếu cần)
        if (paymentId > 2147483647) {
          console.warn(
            "Payment ID vượt quá giới hạn int32, thử cắt bớt:",
            paymentId
          );
          paymentId = paymentId % 2147483647; // Cắt bớt nếu cần
        }
        updatePaymentAndAppointment(paymentId); // Cập nhật trạng thái thanh toán và lịch hẹn
      } else {
        message.error("Không tìm thấy paymentId để xử lý!");
        console.log("OrderInfo:", newPaymentDetails.orderInfo);
        console.log("TxnRef:", newPaymentDetails.txnRef);
      }
    } else {
      console.log(
        "Thanh toán không thành công, responseCode:",
        newPaymentDetails.responseCode
      );
      message.error("Thanh toán không thành công! Vui lòng thử lại.");
    }
  }, []);

  const formatAmount = (amount: string | null) => {
    if (!amount) return "N/A";
    const formattedAmount = (parseFloat(amount) / 100).toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
    return formattedAmount;
  };

  const formatPayDate = (payDate: string | null) => {
    if (!payDate) return "N/A";
    const date = new Date(
      payDate.slice(0, 4) +
      "-" +
      payDate.slice(4, 6) +
      "-" +
      payDate.slice(6, 8) +
      "T" +
      payDate.slice(8, 10) +
      ":" +
      payDate.slice(10, 12) +
      ":" +
      payDate.slice(12, 14)
    );
    return date.toLocaleString("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <StaffLayout>
      <div className="min-h-screen flex justify-center items-center py-10 bg-gray-100">
        {loading ? (
          <Spin size="large" />
        ) : (
          <div className="flex flex-col md:flex-row justify-center w-full px-4">
            <div className="md:w-6/12 w-full p-4">
              <Card className="shadow-lg" title="Thông tin thanh toán">
                <Descriptions column={1} bordered>
                  <Descriptions.Item label="Số tiền thanh toán">
                    {formatAmount(paymentDetails.amount)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngân hàng thanh toán">
                    {paymentDetails.bankCode || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Mã giao dịch ngân hàng">
                    {paymentDetails.bankTranNo || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Mã giao dịch">
                    {paymentDetails.transactionNo || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời gian giao dịch">
                    {formatPayDate(paymentDetails.payDate)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Giao dịch cho lịch hẹn số">
                    {paymentDetails.orderInfo || "N/A"}
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </div>

            <div className="md:w-4/12 w-full p-4">
              <Result
                status={
                  paymentDetails.responseCode === "00" ? "success" : "error"
                }
                icon={
                  <CheckCircleOutlined
                    style={{
                      color:
                        paymentDetails.responseCode === "00"
                          ? "#52c41a"
                          : "#ff4d4f",
                    }}
                  />
                }
                title={
                  paymentDetails.responseCode === "00"
                    ? "Thanh toán thành công!"
                    : "Thanh toán thất bại!"
                }
                subTitle={
                  paymentDetails.responseCode === "00"
                    ? `Bạn đã thanh toán thành công với số tiền ${formatAmount(
                      paymentDetails.amount
                    )} vào thời gian ${formatPayDate(
                      paymentDetails.payDate
                    )}.`
                    : "Đã có lỗi khi bạn thanh toán. Hãy thử lại!"
                }
                extra={[
                  <Button
                    type="primary"
                    key="dashboard"
                    href="/staff/manage-appointment"
                  >
                    Trở về trang quản lý danh sách đăng ký tiêm
                  </Button>,
                ]}
              />
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
};

export default Payment;