import { useEffect, useState } from "react";
import { Spin, Card, Descriptions, Result, Button, message } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import StaffLayout from "../Layout/StaffLayout";
import paymentService from "../../service/paymentService";
import paymentDetailService from "../../service/paymentDetailService";

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
    const updatePaymentStatusAndGenerateDetails = async (paymentId: number) => {
      try {
        // Kiểm tra xem paymentId có hợp lệ không
        if (!Number.isInteger(paymentId) || paymentId <= 0) {
          throw new Error("Payment ID không hợp lệ");
        }

        // Cập nhật trạng thái thanh toán thành 3 (Paid)
        const updatedPayment = await paymentService.updatePayment(paymentId, {
          paymentStatus: 3,
        });
        console.log(
          `Payment status updated to 2 for paymentId: ${paymentId}`,
          updatedPayment
        );

        // Gọi API generatePaymentDetail để tạo chi tiết thanh toán
        const generatedDetails =
          await paymentDetailService.generatePaymentDetail(paymentId);
        console.log("Generated Payment Details:", generatedDetails);
        message.success("Tạo chi tiết thanh toán thành công!");
      } catch (error) {
        message.error(
          "Không thể xử lý thanh toán: " + (error as Error).message
        );
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
        updatePaymentStatusAndGenerateDetails(paymentId); // Cập nhật trạng thái và tạo chi tiết thanh toán
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
