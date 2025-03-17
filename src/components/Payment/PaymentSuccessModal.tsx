import React from "react";
import { Modal, Descriptions } from "antd";
import moment from "moment";

interface PaymentSuccessModalProps {
  visible: boolean;
  callbackUrl: string | null;
  onClose: () => void;
}

const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  visible,
  callbackUrl,
  onClose,
}) => {
  // Hàm phân tích URL để lấy các tham số
  const parseCallbackUrl = (url: string | null) => {
    if (!url) return {};

    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    return {
      vnp_Amount: params.get("vnp_Amount") || "N/A",
      vnp_BankCode: params.get("vnp_BankCode") || "N/A",
      vnp_BankTranNo: params.get("vnp_BankTranNo") || "N/A",
      vnp_CardType: params.get("vnp_CardType") || "N/A",
      vnp_OrderInfo: params.get("vnp_OrderInfo") || "N/A",
      vnp_PayDate: params.get("vnp_PayDate") || "N/A",
      vnp_ResponseCode: params.get("vnp_ResponseCode") || "N/A",
      vnp_TmnCode: params.get("vnp_TmnCode") || "N/A",
      vnp_TransactionNo: params.get("vnp_TransactionNo") || "N/A",
      vnp_TransactionStatus: params.get("vnp_TransactionStatus") || "N/A",
      vnp_TxnRef: params.get("vnp_TxnRef") || "N/A",
      vnp_SecureHash: params.get("vnp_SecureHash") || "N/A",
    };
  };

  const paymentDetails = parseCallbackUrl(callbackUrl);

  return (
    <Modal
      title="CHI TIẾT THANH TOÁN THÀNH CÔNG"
      visible={visible}
      onCancel={onClose}
      footer={null}
      centered
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item label="Số tiền">
          {paymentDetails.vnp_Amount && paymentDetails.vnp_Amount !== "N/A"
            ? `${parseInt(paymentDetails.vnp_Amount) / 100} VND`
            : "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Mã ngân hàng">
          {paymentDetails.vnp_BankCode}
        </Descriptions.Item>
        <Descriptions.Item label="Số giao dịch ngân hàng">
          {paymentDetails.vnp_BankTranNo}
        </Descriptions.Item>
        <Descriptions.Item label="Loại thẻ">
          {paymentDetails.vnp_CardType}
        </Descriptions.Item>
        <Descriptions.Item label="Thông tin đơn hàng">
          {paymentDetails.vnp_OrderInfo}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày thanh toán">
          {paymentDetails.vnp_PayDate && paymentDetails.vnp_PayDate !== "N/A"
            ? moment(paymentDetails.vnp_PayDate, "YYYYMMDDHHmmss").format(
                "DD/MM/YYYY HH:mm:ss"
              )
            : "N/A"}
        </Descriptions.Item>
        <Descriptions.Item label="Mã phản hồi">
          {paymentDetails.vnp_ResponseCode}
        </Descriptions.Item>
        <Descriptions.Item label="Mã Tmn">
          {paymentDetails.vnp_TmnCode}
        </Descriptions.Item>
        <Descriptions.Item label="Số giao dịch">
          {paymentDetails.vnp_TransactionNo}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái giao dịch">
          {paymentDetails.vnp_TransactionStatus === "00"
            ? "Thành công"
            : "Thất bại"}
        </Descriptions.Item>
        <Descriptions.Item label="Mã tham chiếu giao dịch">
          {paymentDetails.vnp_TxnRef}
        </Descriptions.Item>
        <Descriptions.Item label="Mã bảo mật">
          {paymentDetails.vnp_SecureHash}
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default PaymentSuccessModal;
