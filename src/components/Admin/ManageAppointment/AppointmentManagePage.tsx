/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Space,
  Row,
  Col,
  Modal,
  message,
  Descriptions,
  Select,
  Button,
} from "antd";
import {
  ReloadOutlined,
  EyeOutlined,
  CheckOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import moment from "moment";
import {
  AppointmentResponseDTO,
  UpdateAppointmentDTO,
} from "../../../models/Appointment";
import { ChildProfileResponseDTO } from "../../../models/ChildProfile";
import { VaccineResponseDTO } from "../../../models/Vaccine";
import { VaccinePackageResponseDTO } from "../../../models/VaccinePackage";
import { PaymentResponseDTO, CreatePaymentDTO } from "../../../models/Payment";
import {
  PaymentDetailResponseDTO,
  UpdatePaymentDetailDTO,
} from "../../../models/PaymentDetail"; // Import PaymentDetail models
import vaccineService from "../../../service/vaccineService";
import vaccinePackageService from "../../../service/vaccinePackageService";
import childProfileService from "../../../service/childProfileService";
import appointmentService from "../../../service/appointmentService";
import paymentService from "../../../service/paymentService";
import paymentDetailService from "../../../service/paymentDetailService";
import { ColumnType } from "antd/es/table";
import { PaymentType } from "../../../models/Type/enum";

const { Search } = Input;
const { Option } = Select;

const AppointmentManagePage: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentResponseDTO[]>(
    []
  );
  const [originalAppointments, setOriginalAppointments] = useState<
    AppointmentResponseDTO[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [isConfirmPaymentModalVisible, setIsConfirmPaymentModalVisible] =
    useState(false);
  const [isSelectDoseModalVisible, setIsSelectDoseModalVisible] =
    useState(false); // State cho modal chọn mũi tiêm
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentResponseDTO | null>(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState<number | null>(
    null
  );
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState<
    PaymentDetailResponseDTO[]
  >([]); // State lưu danh sách mũi tiêm
  const [childProfiles, setChildProfiles] = useState<ChildProfileResponseDTO[]>(
    []
  );
  const [vaccines, setVaccines] = useState<VaccineResponseDTO[]>([]);
  const [vaccinePackages, setVaccinePackages] = useState<
    VaccinePackageResponseDTO[]
  >([]);
  const [payments, setPayments] = useState<PaymentResponseDTO[]>([]);
  const [allPaymentDetails, setAllPaymentDetails] = useState<
    PaymentDetailResponseDTO[]
  >([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const allVaccines = await vaccineService.getAllVaccines();
      const allVaccinePackages = await vaccinePackageService.getAllPackages();
      const allChildProfiles = await childProfileService.getAllChildProfiles();
      const allAppointments = await appointmentService.getAllAppointments();
      const allPayments = await paymentService.getAllPayments();
      const allPaymentDetailsResponse =
        await paymentDetailService.getAllPaymentDetails();
      const filteredAppointments = allAppointments.filter(
        (appointment) =>
          appointment.appointmentStatus === 1 ||
          appointment.appointmentStatus === 2
      );
      setVaccines(allVaccines);
      setVaccinePackages(allVaccinePackages);
      setChildProfiles(allChildProfiles);
      setAppointments(filteredAppointments);
      setOriginalAppointments(allAppointments);
      setPayments(allPayments);
      setAllPaymentDetails(allPaymentDetailsResponse); // Lưu tất cả paymentDetails
      setPagination({
        current: 1,
        pageSize: pagination.pageSize,
        total: allAppointments.length,
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
      message.error("Không thể tải dữ liệu: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTableChange = (pagination: any) => {
    const { current, pageSize } = pagination;
    setPagination((prev) => ({ ...prev, current, pageSize }));
  };

  const onSearch = (value: string) => {
    const trimmedValue = value.trim().toLowerCase();
    setSearchKeyword(trimmedValue);

    if (!trimmedValue) {
      setAppointments(originalAppointments);
      setPagination({
        ...pagination,
        current: 1,
        total: originalAppointments.length,
      });
      return;
    }

    const filteredAppointments = originalAppointments.filter((appointment) => {
      const child = childProfiles.find(
        (p) => p.childId === appointment.childId
      );
      const childName = child?.fullName.toLowerCase() || "";
      const vaccine = appointment.vaccineId
        ? vaccines
            .find((v) => v.vaccineId === appointment.vaccineId)
            ?.name.toLowerCase() || ""
        : "";
      const vaccinePackage = appointment.vaccinePackageId
        ? vaccinePackages
            .find((p) => p.vaccinePackageId === appointment.vaccinePackageId)
            ?.name.toLowerCase() || ""
        : "";

      return (
        childName.includes(trimmedValue) ||
        vaccine.includes(trimmedValue) ||
        vaccinePackage.includes(trimmedValue)
      );
    });

    setAppointments(filteredAppointments);
    setPagination({
      ...pagination,
      current: 1,
      total: filteredAppointments.length,
    });
  };

  const handleReset = () => {
    setSearchKeyword("");
    fetchData();
    setPagination({
      ...pagination,
      current: 1,
      total: originalAppointments.length,
    });
  };

  const handleViewDetail = (appointment: AppointmentResponseDTO) => {
    setSelectedAppointment(appointment);
    setIsDetailModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalVisible(false);
    setIsPaymentModalVisible(false);
    setIsConfirmPaymentModalVisible(false);
    setIsSelectDoseModalVisible(false);
    setSelectedAppointment(null);
    setSelectedPaymentType(null);
    setSelectedPaymentDetails([]);
  };

  const handleSelectDose = async (appointment: AppointmentResponseDTO) => {
    const payment = payments.find(
      (p) =>
        p.appointmentId === appointment.appointmentId && p.paymentStatus === 2
    );
    if (!payment) {
      message.error("Không tìm thấy thông tin thanh toán!");
      return;
    }

    try {
      const paymentDetails =
        await paymentDetailService.getPaymentDetailsByPaymentId(
          payment.paymentId
        );
      if (paymentDetails.length === 0) {
        message.warning("Không tìm thấy mũi tiêm nào trong gói vaccine!");
        return;
      }

      // Lọc bỏ các mũi tiêm đã được gán vào một lịch hẹn
      const unusedPaymentDetails = paymentDetails.filter(
        (detail) =>
          !appointments.some(
            (appt) => appt.paymentDetailId === detail.paymentDetailId
          )
      );

      if (unusedPaymentDetails.length === 0) {
        message.warning("Tất cả các mũi tiêm trong gói đã được chọn!");
        return;
      }

      setSelectedAppointment(appointment);
      setSelectedPaymentDetails(unusedPaymentDetails);
      setIsSelectDoseModalVisible(true);
    } catch (error) {
      message.error(
        "Không thể lấy danh sách mũi tiêm: " + (error as Error).message
      );
    }
  };
  const handleConfirmDoseSelection = async (paymentDetailId: number) => {
    if (!selectedAppointment) {
      message.error("Không có lịch hẹn được chọn!");
      return;
    }

    try {
      // Cập nhật PaymentDetail với appointmentId
      const updatePaymentDetailData: UpdatePaymentDetailDTO = {
        isCompleted: 0, // Giữ nguyên giá trị hiện tại, hoặc thay đổi nếu cần
        notes: "Đã chọn mũi tiêm",
        appointmentId: selectedAppointment.appointmentId, // Liên kết PaymentDetail với Appointment
      };
      await paymentDetailService.updatePaymentDetail(
        paymentDetailId,
        updatePaymentDetailData
      );

      // Cập nhật Appointment với paymentDetailId và appointmentStatus
      const updateAppointmentData: UpdateAppointmentDTO = {
        paymentDetailId: paymentDetailId,
        appointmentStatus: 2,
      };
      const updatedAppointment = await appointmentService.updateAppointment(
        selectedAppointment.appointmentId,
        updateAppointmentData
      );

      // Cập nhật danh sách appointments trong state
      const updatedAppointments = appointments.map((appointment) =>
        appointment.appointmentId === selectedAppointment.appointmentId
          ? {
              ...appointment,
              paymentDetailId: updatedAppointment.paymentDetailId,
              appointmentStatus: updatedAppointment.appointmentStatus,
            }
          : appointment
      );
      setAppointments(updatedAppointments);
      setOriginalAppointments(updatedAppointments);

      // Cập nhật danh sách selectedPaymentDetails để hiển thị giao diện
      const updatedPaymentDetails = selectedPaymentDetails.map((detail) =>
        detail.paymentDetailId === paymentDetailId
          ? { ...detail, notes: "Đã chọn mũi tiêm" }
          : detail
      );
      setSelectedPaymentDetails(updatedPaymentDetails);

      // Làm mới allPaymentDetails để phản ánh trạng thái isCompleted
      const refreshedPaymentDetails =
        await paymentDetailService.getAllPaymentDetails();
      setAllPaymentDetails(refreshedPaymentDetails);

      // Hiển thị thông báo chi tiết
      const selectedDose = selectedPaymentDetails.find(
        (detail) => detail.paymentDetailId === paymentDetailId
      );
      message.success(`Đã chọn mũi ${selectedDose?.doseSequence} thành công!`);

      handleCloseModal();
    } catch (error) {
      message.error("Chọn mũi tiêm thất bại: " + (error as Error).message);
    }
  };

  const handleConfirmAppointment = async (
    appointmentId: number,
    currentStatus: number
  ) => {
    if (currentStatus === 2 || currentStatus === 4 || currentStatus === 5) {
      message.warning("Lịch hẹn không thể xác nhận ở trạng thái hiện tại!");
      return;
    }
    Modal.confirm({
      title: "Xác nhận lịch hẹn",
      content: "Bạn có chắc muốn xác nhận lịch hẹn này không?",
      okText: "Xác nhận",
      okType: "primary",
      cancelText: "Hủy bỏ",
      onOk: async () => {
        try {
          const updateData: UpdateAppointmentDTO = {
            appointmentStatus: 2,
          };
          const updatedAppointment = await appointmentService.updateAppointment(
            appointmentId,
            updateData
          );
          message.success("Xác nhận lịch hẹn thành công");
          const updatedAppointments = appointments.map((appointment) =>
            appointment.appointmentId === appointmentId
              ? {
                  ...appointment,
                  appointmentStatus: updatedAppointment.appointmentStatus,
                }
              : appointment
          );
          setAppointments(updatedAppointments);
          setOriginalAppointments(updatedAppointments);
        } catch (error) {
          message.error(
            "Xác nhận lịch hẹn thất bại: " + (error as Error).message
          );
        }
      },
    });
  };

  const confirmCancel = (appointmentId: number, currentStatus: number) => {
    if (currentStatus === 5) {
      message.warning("Lịch tiêm đã được hủy trước đó!");
      return;
    }
    if (currentStatus === 2 || currentStatus === 3 || currentStatus === 4) {
      message.warning("Lịch hẹn không thể hủy ở trạng thái hiện tại!");
      return;
    }
    Modal.confirm({
      title: "Xác nhận hủy lịch tiêm",
      content: "Bạn có chắc chắn muốn hủy lịch tiêm không?",
      okText: "Xác nhận",
      okType: "danger",
      cancelText: "Hủy bỏ",
      onOk: async () => {
        try {
          const updateData: UpdateAppointmentDTO = {
            appointmentStatus: 5,
          };
          const updatedAppointment = await appointmentService.updateAppointment(
            appointmentId,
            updateData
          );
          message.success("Hủy lịch hẹn thành công");
          const updatedAppointments = appointments.map((appointment) =>
            appointment.appointmentId === appointmentId
              ? {
                  ...appointment,
                  appointmentStatus: updatedAppointment.appointmentStatus,
                }
              : appointment
          );
          setAppointments(updatedAppointments);
          setOriginalAppointments(updatedAppointments);
        } catch (error) {
          message.error("Hủy lịch hẹn thất bại: " + (error as Error).message);
        }
      },
    });
  };

  const handlePayment = (appointment: AppointmentResponseDTO) => {
    const hasPaid = payments.some(
      (p) =>
        p.appointmentId === appointment.appointmentId && p.paymentStatus === 2
    );
    if (hasPaid) {
      message.info("Lịch hẹn này đã được thanh toán!");
      return;
    }
    setSelectedAppointment(appointment);
    setIsPaymentModalVisible(true);
  };

  const handlePaymentConfirm = () => {
    if (!selectedAppointment || selectedPaymentType === null) {
      message.error("Vui lòng chọn phương thức thanh toán!");
      return;
    }
    setIsPaymentModalVisible(false);
    setIsConfirmPaymentModalVisible(true);
  };

  const handleFinalPaymentConfirm = async () => {
    if (!selectedAppointment || selectedPaymentType === null) {
      message.error("Dữ liệu không hợp lệ!");
      return;
    }

    // Tính toán số tiền
    let amount = 0;
    if (selectedAppointment.vaccinePackageId) {
      const vaccinePackage = vaccinePackages.find(
        (pkg) => pkg.vaccinePackageId === selectedAppointment.vaccinePackageId
      );
      amount = vaccinePackage ? vaccinePackage.totalPrice : 0;
    } else if (selectedAppointment.vaccineId) {
      const vaccine = vaccines.find(
        (v) => v.vaccineId === selectedAppointment.vaccineId
      );
      amount = vaccine ? vaccine.price : 0;
    }

    if (amount === 0) {
      message.error("Không thể xác định số tiền thanh toán!");
      return;
    }

    const paymentData: CreatePaymentDTO = {
      appointmentId: selectedAppointment.appointmentId,
      userId: selectedAppointment.userId,
      vaccineId: selectedAppointment.vaccineId || undefined,
      vaccinePackageId: selectedAppointment.vaccinePackageId || undefined,
      paymentType: selectedPaymentType,
    };

    try {
      // Gọi API addPayment để tạo giao dịch
      const newPayment = await paymentService.addPayment(paymentData);

      if (selectedPaymentType === PaymentType.Cash) {
        // Cập nhật trạng thái thanh toán cho tiền mặt
        await paymentService.updatePayment(newPayment.paymentId, {
          paymentStatus: 2,
        });

        // Gọi API generatePaymentDetail để tạo chi tiết thanh toán
        await paymentDetailService.generatePaymentDetail(newPayment.paymentId);
        message.success(
          "Thanh toán bằng tiền mặt và tạo chi tiết thanh toán thành công!"
        );
        setPayments([...payments, { ...newPayment, paymentStatus: 2 }]);
      } else if (selectedPaymentType === PaymentType.BankTransfer) {
        // Lưu paymentId vào orderInfo để sử dụng sau khi thanh toán qua VNPay

        // Gọi API createPaymentUrl để lấy URL
        const paymentUrl = await paymentService.createPaymentUrl({
          ...paymentData,
        });

        if (!paymentUrl) {
          message.error("Không thể tạo URL thanh toán!");
          return;
        }

        // Chuyển hướng người dùng đến URL thanh toán
        window.location.href = paymentUrl;
      }

      setIsConfirmPaymentModalVisible(false);
      setSelectedPaymentType(null);
      setSelectedAppointment(null);
    } catch (error) {
      message.error("Thanh toán thất bại: " + (error as Error).message);
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return "Đã lên lịch";
      case 2:
        return "Chờ tiêm";
      case 3:
        return "Chờ phản ứng";
      case 4:
        return "Hoàn thành";
      case 5:
        return "Đã hủy";
      default:
        return status;
    }
  };

  const columns: ColumnType<AppointmentResponseDTO>[] = [
    {
      title: "STT",
      key: "index",
      width: 50,
      align: "center",
      render: (_: any, __: AppointmentResponseDTO, index: number) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Tên Trẻ em",
      dataIndex: "childId",
      key: "ChildName",
      width: 200,
      render: (childId: number) =>
        childProfiles.find((profile) => profile.childId === childId)
          ?.fullName || "Không tìm thấy tên",
    },
    {
      title: "Tên Vắc xin",
      dataIndex: "vaccineId",
      key: "VaccineName",
      width: 150,
      render: (vaccineId: number) =>
        vaccines.find((v) => v.vaccineId === vaccineId)?.name || "",
    },
    {
      title: "Tên Gói vắc xin",
      dataIndex: "vaccinePackageId",
      key: "VaccinePackageName",
      width: 150,
      render: (vaccinePackageId: number) =>
        vaccinePackages.find((p) => p.vaccinePackageId === vaccinePackageId)
          ?.name || "",
    },
    {
      title: "Ngày hẹn",
      dataIndex: "appointmentDate",
      key: "AppointmentDate",
      width: 100,
    },
    {
      title: "Trạng thái",
      dataIndex: "appointmentStatus",
      key: "AppointmentStatus",
      width: 150,
      render: (status: number) => {
        const statusText = getStatusText(status);
        const isScheduled = status === 1;
        const isWaiting = status === 2;
        return (
          <span
            style={{
              display: "inline-block",
              padding: "2px 4px",
              borderRadius: "4px",
              backgroundColor: isScheduled
                ? "#e6f7ff" // Màu xanh da trời nhạt
                : isWaiting
                ? "#f6ffed" // Màu xanh lá cây nhạt
                : "transparent",
              border: isScheduled
                ? "1px solid #1890ff" // Viền xanh da trời
                : isWaiting
                ? "1px solid #52c41a" // Viền xanh lá cây
                : "none",
              color: isScheduled
                ? "#1890ff" // Chữ xanh da trời
                : isWaiting
                ? "#52c41a" // Chữ xanh lá cây
                : "inherit",
            }}
          >
            {statusText}
          </span>
        );
      },
    },
    {
      title: "Thanh toán",
      key: "payment",
      width: 200,
      render: (_: any, record: AppointmentResponseDTO) => {
        const hasPaid = payments.some(
          (p) =>
            p.appointmentId === record.appointmentId && p.paymentStatus === 2
        );
        const content = hasPaid ? (
          <span>Đã thanh toán</span>
        ) : (
          <a onClick={() => handlePayment(record)}>Thanh toán ngay</a>
        );

        return (
          <span
            style={{
              display: "inline-block",
              padding: "2px 4px",
              borderRadius: "4px",
              backgroundColor: hasPaid
                ? "#f6ffed" // Màu xanh lá cây nhạt
                : "#e6f7ff", // Màu xanh da trời nhạt
              border: hasPaid
                ? "1px solid #52c41a" // Viền xanh lá cây
                : "1px solid #1890ff", // Viền xanh da trời
              color: hasPaid ? "#52c41a" : "#1890ff", // Màu chữ tương ứng
            }}
          >
            {content}
          </span>
        );
      },
    },
    {
      title: "Chọn mũi tiêm",
      key: "selectDose",
      width: 190,
      render: (_: any, record: AppointmentResponseDTO) => {
        const hasPaid = payments.some(
          (p) =>
            p.appointmentId === record.appointmentId && p.paymentStatus === 2
        );
        const hasVaccinePackage = !!record.vaccinePackageId;
        const canSelect = hasPaid && hasVaccinePackage;
        const content = canSelect ? (
          <a
            onClick={() => handleSelectDose(record)}
            style={{ color: "orange", cursor: "pointer" }}
          >
            Chọn mũi tiêm
          </a>
        ) : (
          <span style={{ color: "gray" }}>-</span>
        );

        return (
          <span
            style={{
              display: "inline-block",
              padding: "2px 4px",
              borderRadius: "4px",
              backgroundColor: canSelect
                ? "#fff7e6" // Màu cam nhạt
                : "#f0f0f0", // Màu xám nhạt
              border: canSelect
                ? "1px solid #fa8c16" // Viền cam
                : "1px solid #d9d9d9", // Viền xám
              color: canSelect ? "#fa8c16" : "#8c8c8c", // Màu chữ tương ứng
            }}
          >
            {content}
          </span>
        );
      },
    },
    {
      title: "Mũi tiêm đã chọn",
      key: "selectedDose",
      width: 170,
      render: (_: any, record: AppointmentResponseDTO) => {
        if (!record.paymentDetailId) {
          return <span style={{ color: "gray" }}>-</span>;
        }

        // Tìm paymentDetail tương ứng với paymentDetailId từ allPaymentDetails
        const selectedPaymentDetail = allPaymentDetails.find(
          (detail) => detail.paymentDetailId === record.paymentDetailId
        );
        if (!selectedPaymentDetail) {
          return <span style={{ color: "gray" }}>-</span>;
        }

        const statusText =
          selectedPaymentDetail.isCompleted === 1 ? " (Hoàn thành)" : "";
        return (
          <span style={{ color: "red" }}>
            Đã chọn mũi {selectedPaymentDetail.doseSequence}
            {statusText}
          </span>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      render: (_: any, record: AppointmentResponseDTO) => {
        const hasPaid = payments.some(
          (p) =>
            p.appointmentId === record.appointmentId && p.paymentStatus === 2
        );
        return (
          <Space size="middle">
            <EyeOutlined
              onClick={() => handleViewDetail(record)}
              style={{ color: "blue", cursor: "pointer" }}
            />
            <CheckOutlined
              onClick={() => {
                if (!hasPaid) {
                  message.warning(
                    "Vui lòng thanh toán trước khi xác nhận lịch hẹn!"
                  );
                  return;
                }
                handleConfirmAppointment(
                  record.appointmentId,
                  record.appointmentStatus
                );
              }}
              style={{
                color: hasPaid ? "green" : "gray",
                cursor: hasPaid ? "pointer" : "not-allowed",
              }}
              title="Xác nhận lịch hẹn"
            />
            <DeleteOutlined
              style={{ color: "red", cursor: "pointer" }}
              onClick={() =>
                confirmCancel(record.appointmentId, record.appointmentStatus)
              }
            />
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-center p-2 rounded-t-lg">
        DANH SÁCH LỊCH ĐĂNG KÝ TIÊM CHỦNG
      </h2>
      <Row justify="space-between" style={{ marginBottom: 16, marginTop: 24 }}>
        <Col>
          <Space>
            <Search
              placeholder="Tìm kiếm theo tên trẻ, vaccine, hoặc gói vaccine"
              onSearch={onSearch}
              enterButton
              allowClear
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ width: 300 }}
            />
            <ReloadOutlined
              onClick={handleReset}
              style={{ fontSize: "24px", cursor: "pointer" }}
            />
          </Space>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={appointments.slice(
          (pagination.current - 1) * pagination.pageSize,
          pagination.current * pagination.pageSize
        )}
        rowKey="appointmentId"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        loading={loading}
        onChange={handleTableChange}
      />

      {/* Modal chi tiết lịch hẹn */}
      <Modal
        title="CHI TIẾT LỊCH HẸN TIÊM CHỦNG"
        visible={isDetailModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        centered
      >
        {selectedAppointment && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Tên Trẻ em">
              {childProfiles.find(
                (p) => p.childId === selectedAppointment.childId
              )?.fullName || "Không tìm thấy tên"}
            </Descriptions.Item>
            <Descriptions.Item label="Tên Vắc xin">
              {vaccines.find(
                (v) => v.vaccineId === selectedAppointment.vaccineId
              )?.name || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Tên Gói vắc xin">
              {vaccinePackages.find(
                (p) =>
                  p.vaccinePackageId === selectedAppointment.vaccinePackageId
              )?.name || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái hẹn">
              {getStatusText(selectedAppointment.appointmentStatus)}
            </Descriptions.Item>
            <Descriptions.Item label="Hoạt động">
              {selectedAppointment.isActive === 1 ? "Có" : "Không"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {selectedAppointment.createdDate
                ? moment(selectedAppointment.createdDate, "DD/MM/YYYY").format(
                    "DD/MM/YYYY"
                  )
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Người tạo">
              {selectedAppointment.createdBy || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sửa đổi">
              {selectedAppointment.modifiedDate
                ? moment(selectedAppointment.modifiedDate, "DD/MM/YYYY").format(
                    "DD/MM/YYYY"
                  )
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Người sửa đổi">
              {selectedAppointment.modifiedBy || "N/A"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Modal chọn phương thức thanh toán */}
      <Modal
        title="Chọn phương thức thanh toán"
        visible={isPaymentModalVisible}
        onCancel={() => setIsPaymentModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsPaymentModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={handlePaymentConfirm}>
            Tiếp tục
          </Button>,
        ]}
        centered
      >
        <Select
          placeholder="Chọn phương thức thanh toán"
          style={{ width: "100%" }}
          onChange={(value) => setSelectedPaymentType(value)}
          value={selectedPaymentType}
        >
          <Option value={PaymentType.Cash}>Tiền mặt</Option>
          <Option value={PaymentType.BankTransfer}>Chuyển khoản (VNPay)</Option>
        </Select>
      </Modal>

      {/* Modal xác nhận thanh toán */}
      <Modal
        title={
          <div className="text-center text-2xl font-bold">
            XÁC NHẬN THANH TOÁN
          </div>
        }
        visible={isConfirmPaymentModalVisible}
        onCancel={() => setIsConfirmPaymentModalVisible(false)}
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsConfirmPaymentModalVisible(false)}
          >
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleFinalPaymentConfirm}
          >
            Xác nhận
          </Button>,
        ]}
        centered
      >
        {selectedAppointment && (
          <>
            <p className="font-semibold text-xl">
              Bạn có muốn thanh toán bằng phương thức{" "}
              {selectedPaymentType === PaymentType.Cash
                ? "tiền mặt"
                : "chuyển khoản (VNPay)"}
              ?
            </p>
            <p className="mt-4">
              Số tiền:{" "}
              {(() => {
                let amount = 0;
                if (selectedAppointment.vaccinePackageId) {
                  const vaccinePackage = vaccinePackages.find(
                    (pkg) =>
                      pkg.vaccinePackageId ===
                      selectedAppointment.vaccinePackageId
                  );
                  amount = vaccinePackage ? vaccinePackage.totalPrice : 0;
                } else if (selectedAppointment.vaccineId) {
                  const vaccine = vaccines.find(
                    (v) => v.vaccineId === selectedAppointment.vaccineId
                  );
                  amount = vaccine ? vaccine.price : 0;
                }
                return amount > 0
                  ? `${new Intl.NumberFormat("vi-VN").format(amount)} VND`
                  : "Không xác định";
              })()}
            </p>
          </>
        )}
      </Modal>

      {/* Modal chọn mũi tiêm */}
      <Modal
        title="Chọn mũi tiêm cho gói vaccine"
        visible={isSelectDoseModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        centered
      >
        <Table
          dataSource={selectedPaymentDetails}
          rowKey="paymentDetailId"
          pagination={false}
          columns={[
            {
              title: "Mũi tiêm thứ",
              dataIndex: "doseSequence",
              key: "doseSequence",
              render: (doseSequence: number) => `Mũi ${doseSequence}`,
            },
            {
              title: "Ngày dự kiến",
              dataIndex: "scheduledDate",
              key: "scheduledDate",
              render: (scheduledDate: string) =>
                scheduledDate
                  ? moment(scheduledDate, "DD/MM/YYYY").format("DD/MM/YYYY")
                  : "Chưa xác định",
            },
            {
              title: "Trạng thái",
              key: "status",
              render: (_: any, record: PaymentDetailResponseDTO) =>
                selectedAppointment?.paymentDetailId ===
                record.paymentDetailId ? (
                  <span style={{ color: "green" }}>Đã chọn</span>
                ) : (
                  <span style={{ color: "gray" }}>Chưa chọn</span>
                ),
            },
            {
              title: "Hành động",
              key: "action",
              render: (_: any, record: PaymentDetailResponseDTO) => (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() =>
                    handleConfirmDoseSelection(record.paymentDetailId)
                  }
                  disabled={
                    selectedAppointment?.paymentDetailId ===
                    record.paymentDetailId
                  } // Vô hiệu hóa nếu đã chọn
                >
                  Chọn
                </Button>
              ),
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default AppointmentManagePage;
