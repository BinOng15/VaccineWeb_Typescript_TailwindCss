import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Result, Button, Descriptions } from "antd";

const PaymentResult: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const status = queryParams.get("status");
  const message = queryParams.get("message");
  const appointmentId = queryParams.get("appointmentId");
  const amount = queryParams.get("amount");
  const transactionNo = queryParams.get("transactionNo");

  useEffect(() => {
    localStorage.removeItem("currentAppointmentId");
  }, []);

  const handleGoBack = () => {
    navigate("/appointment-manage");
  };

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      {status === "success" ? (
        <Result
          status="success"
          title="Thanh toán thành công!"
          subTitle="Cảm ơn bạn đã thanh toán. Lịch hẹn của bạn đã được cập nhật."
          extra={[
            <Button type="primary" onClick={handleGoBack} key="back">
              Quay lại danh sách lịch hẹn
            </Button>,
          ]}
        >
          <Descriptions bordered column={1} style={{ marginTop: 20 }}>
            <Descriptions.Item label="Mã lịch hẹn">
              {appointmentId}
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền">
              {(parseInt(amount || "0") / 100).toLocaleString("vi-VN")} VNĐ
            </Descriptions.Item>
            <Descriptions.Item label="Mã giao dịch VNPay">
              {transactionNo}
            </Descriptions.Item>
          </Descriptions>
        </Result>
      ) : (
        <Result
          status="error"
          title="Thanh toán thất bại"
          subTitle={
            message ||
            "Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại."
          }
          extra={[
            <Button type="primary" onClick={handleGoBack} key="back">
              Quay lại danh sách lịch hẹn
            </Button>,
          ]}
        />
      )}
    </div>
  );
};

export default PaymentResult;
