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
  Button,
} from "antd";
import {
  ReloadOutlined,
  EyeOutlined,
  PlusOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import moment from "moment";
import {
  AppointmentResponseDTO,
  UpdateAppointmentDTO,
} from "../../../models/Appointment";
import { ChildProfileResponseDTO } from "../../../models/ChildProfile";
import { VaccineResponseDTO } from "../../../models/Vaccine";
import { VaccinePackageResponseDTO } from "../../../models/VaccinePackage";
import { PaymentResponseDTO } from "../../../models/Payment";
import {
  PaymentDetailResponseDTO,
  UpdatePaymentDetailDTO,
} from "../../../models/PaymentDetail";
import vaccineService from "../../../service/vaccineService";
import vaccinePackageService from "../../../service/vaccinePackageService";
import childProfileService from "../../../service/childProfileService";
import appointmentService from "../../../service/appointmentService";
import paymentService from "../../../service/paymentService";
import paymentDetailService from "../../../service/paymentDetailService";
import vaccinePackageDetailService from "../../../service/vaccinePackageDetailService";
import vaccineDiseaseService from "../../../service/vaccineDiseaseService";
import diseaseService from "../../../service/diseaseService";
import { ColumnType } from "antd/es/table";
import { AppointmentStatus } from "../../../models/Type/enum";
import { VaccineDiseaseResponseDTO } from "../../../models/VaccineDisease";
import { DiseaseResponseDTO } from "../../../models/Disease";

// Cập nhật interface để thêm thuộc tính vaccineQuantity
interface ExtendedPaymentDetailResponseDTO extends PaymentDetailResponseDTO {
  vaccineQuantity?: number | null;
  vaccineName?: string; // Thêm thuộc tính để lưu tên vaccine
}

const { Search } = Input;

const AppointmentManagePage: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentResponseDTO[]>([]);
  const [originalAppointments, setOriginalAppointments] = useState<AppointmentResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isSelectDoseModalVisible, setIsSelectDoseModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponseDTO | null>(null);
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState<ExtendedPaymentDetailResponseDTO[]>([]);
  const [childProfiles, setChildProfiles] = useState<ChildProfileResponseDTO[]>([]);
  const [vaccines, setVaccines] = useState<VaccineResponseDTO[]>([]);
  const [vaccinePackages, setVaccinePackages] = useState<VaccinePackageResponseDTO[]>([]);
  const [payments, setPayments] = useState<PaymentResponseDTO[]>([]);
  const [allPaymentDetails, setAllPaymentDetails] = useState<PaymentDetailResponseDTO[]>([]);
  const [vaccineNameMap, setVaccineNameMap] = useState<Map<number, string>>(new Map());
  const [vaccineDiseases, setVaccineDiseases] = useState<VaccineDiseaseResponseDTO[]>([]);
  const [diseases, setDiseases] = useState<DiseaseResponseDTO[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const allVaccines = await vaccineService.getAllVaccines();
      const allVaccinePackages = await vaccinePackageService.getAllPackages();
      const allChildProfiles = await childProfileService.getAllChildProfiles();
      const allAppointments = await appointmentService.getAllAppointments();
      const allPayments = await paymentService.getAllPayments();
      const allPaymentDetailsResponse = await paymentDetailService.getAllPaymentDetails();
      const allVaccineDiseases = await vaccineDiseaseService.getAllVaccineDiseases();
      const allDiseases = await diseaseService.getAllDiseases();

      const activeAppointments = allAppointments.filter(
        (appointment) => appointment.isActive === 1
      );

      const paidAppointments = activeAppointments.filter(
        (appointment) => appointment.appointmentStatus === AppointmentStatus.Paid
      );

      const uniqueVaccinePackageDetailIds = new Set(
        allPaymentDetailsResponse
          .map((detail) => detail.vaccinePackageDetailId)
          .filter((id): id is number => id !== null && id !== undefined)
      );
      const nameMap = new Map<number, string>();
      for (const id of uniqueVaccinePackageDetailIds) {
        try {
          const vaccinePackageDetail = await vaccinePackageDetailService.getPackageDetailById(id);
          const vaccine = allVaccines.find(
            (v) => v.vaccineId === vaccinePackageDetail.vaccineId
          );
          const vaccineDisease = allVaccineDiseases.find(
            (vd) => vd.vaccineId === vaccinePackageDetail.vaccineId
          );
          const disease = vaccineDisease
            ? allDiseases.find((d) => d.diseaseId === vaccineDisease.diseaseId)
            : null;
          const displayName = `${vaccine ? vaccine.name : "Không xác định"} - ${disease ? disease.name : "Không xác định"}`;
          nameMap.set(id, displayName);
        } catch (error) {
          console.error("Lỗi khi lấy thông tin vaccine cho ID:", id, error);
          nameMap.set(id, "Không xác định - Không xác định");
        }
      }

      setVaccines(allVaccines);
      setVaccinePackages(allVaccinePackages);
      setChildProfiles(allChildProfiles);
      setAppointments(paidAppointments);
      setOriginalAppointments(activeAppointments);
      setPayments(allPayments);
      setAllPaymentDetails(allPaymentDetailsResponse);
      setVaccineNameMap(nameMap);
      setVaccineDiseases(allVaccineDiseases);
      setDiseases(allDiseases);
      setPagination({
        current: 1,
        pageSize: pagination.pageSize,
        total: paidAppointments.length,
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
      const paidAppointments = originalAppointments.filter(
        (appointment) => appointment.appointmentStatus === AppointmentStatus.Paid
      );
      setAppointments(paidAppointments);
      setPagination({
        ...pagination,
        current: 1,
        total: paidAppointments.length,
      });
      return;
    }

    const filteredAppointments = originalAppointments.filter((appointment) => {
      const child = childProfiles.find((p) => p.childId === appointment.childId);
      const childName = child?.fullName.toLowerCase() || "";
      const vaccine = appointment.vaccineId
        ? vaccines.find((v) => v.vaccineId === appointment.vaccineId)?.name.toLowerCase() || ""
        : "";
      const vaccinePackage = appointment.vaccinePackageId
        ? vaccinePackages.find((p) => p.vaccinePackageId === appointment.vaccinePackageId)?.name.toLowerCase() || ""
        : "";

      return (
        (childName.includes(trimmedValue) ||
          vaccine.includes(trimmedValue) ||
          vaccinePackage.includes(trimmedValue)) &&
        appointment.appointmentStatus === AppointmentStatus.Paid
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
  };

  const handleViewDetail = (appointment: AppointmentResponseDTO) => {
    setSelectedAppointment(appointment);
    setIsDetailModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalVisible(false);
    setIsSelectDoseModalVisible(false);
    setSelectedAppointment(null);
    setSelectedPaymentDetails([]);
  };

  const handleSelectDose = async (appointment: AppointmentResponseDTO) => {
    try {
      const latestAppointment = await appointmentService.getAppointmentById(appointment.appointmentId);
      setSelectedAppointment(latestAppointment);

      if (latestAppointment.appointmentStatus !== AppointmentStatus.Paid) {
        message.error("Chỉ có thể chọn mũi tiêm khi trạng thái là 'Đã thanh toán'!");
        return;
      }

      const payment = payments.find(
        (p) => p.appointmentId === latestAppointment.appointmentId && p.paymentStatus === 2
      );
      if (!payment) {
        const paymentDetail = allPaymentDetails.find(
          (detail) => detail.paymentDetailId === latestAppointment.paymentDetailId
        );
        if (paymentDetail) {
          const relatedPayment = payments.find(
            (p) => p.paymentId === paymentDetail.paymentId
          );
          if (relatedPayment && relatedPayment.paymentStatus === 2) {
            message.info("Lịch tiêm của mũi tiêm này đã có sẵn trong hệ thống, không thể thay đổi mũi tiêm!");
            return;
          }
        }
        message.error("Không tìm thấy thông tin thanh toán!");
        return;
      }

      try {
        const paymentDetails = await paymentDetailService.getPaymentDetailsByPaymentId(payment.paymentId);
        if (paymentDetails.length === 0) {
          message.warning("Không tìm thấy mũi tiêm nào trong gói vaccine!");
          return;
        }

        // Lọc paymentDetails để chỉ giữ lại những mũi tiêm có vaccinePackageDetail.isActive === "Active"
        const activePaymentDetails: ExtendedPaymentDetailResponseDTO[] = [];
        for (const paymentDetail of paymentDetails) {
          if (paymentDetail.vaccinePackageDetailId) {
            try {
              const packageDetail = await vaccinePackageDetailService.getPackageDetailById(
                paymentDetail.vaccinePackageDetailId
              );
              if (packageDetail.isActive === "Active") {
                const vaccine = vaccines.find((v) => v.vaccineId === packageDetail.vaccineId);
                activePaymentDetails.push({
                  ...paymentDetail,
                  vaccineQuantity: vaccine ? vaccine.quantity : null,
                  vaccineName: vaccine ? vaccine.name : "Không xác định",
                });
              }
            } catch (error) {
              console.error(`Lỗi khi lấy vaccinePackageDetail cho paymentDetailId ${paymentDetail.paymentDetailId}:`, error);
            }
          }
        }

        if (activePaymentDetails.length === 0) {
          message.warning("Không có mũi tiêm nào trong gói vaccine có trạng thái Active!");
          return;
        }

        // Lọc các mũi tiêm chưa được sử dụng hoặc đã được chọn bởi lịch hẹn hiện tại
        const unusedPaymentDetails = activePaymentDetails.filter(
          (detail) =>
            (!appointments.some(
              (appt) =>
                appt.paymentDetailId === detail.paymentDetailId &&
                appt.appointmentId !== latestAppointment.appointmentId &&
                appt.appointmentStatus !== AppointmentStatus.Cancelled
            ) && detail.isCompleted !== 1) ||
            detail.paymentDetailId === latestAppointment.paymentDetailId
        );

        if (unusedPaymentDetails.length === 0) {
          message.warning("Tất cả các mũi tiêm Active trong gói đã được chọn hoặc đã hoàn thành!");
          return;
        }

        setSelectedPaymentDetails(unusedPaymentDetails);
        setIsSelectDoseModalVisible(true);
      } catch (error) {
        message.error("Không thể lấy danh sách mũi tiêm: " + (error as Error).message);
      }
    } catch (error) {
      message.error("Không thể tải lại trạng thái lịch hẹn: " + (error as Error).message);
    }
  };

  const handleConfirmDoseSelection = async (paymentDetailId: number) => {
    if (!selectedAppointment) {
      message.error("Không có lịch hẹn được chọn!");
      return;
    }

    try {
      const latestAppointment = await appointmentService.getAppointmentById(selectedAppointment.appointmentId);
      setSelectedAppointment(latestAppointment);

      if (latestAppointment.appointmentStatus !== AppointmentStatus.Paid) {
        message.error("Chỉ có thể xác nhận chọn mũi tiêm khi trạng thái là 'Đã thanh toán'!");
        return;
      }

      // Kiểm tra số lượng vaccine của mũi tiêm được chọn
      const selectedPaymentDetail = selectedPaymentDetails.find(
        (detail) => detail.paymentDetailId === paymentDetailId
      );
      if (!selectedPaymentDetail || !selectedPaymentDetail.vaccinePackageDetailId) {
        message.error("Không tìm thấy thông tin mũi tiêm!");
        return;
      }

      const packageDetail = await vaccinePackageDetailService.getPackageDetailById(
        selectedPaymentDetail.vaccinePackageDetailId
      );
      const vaccine = vaccines.find((v) => v.vaccineId === packageDetail.vaccineId);
      if (!vaccine) {
        message.error("Không tìm thấy thông tin vaccine!");
        return;
      }

      if (vaccine.quantity === null || vaccine.quantity <= 0) {
        message.error(
          `Vaccine ${vaccine.name} hiện tại trong hệ thống tạm thời hết, vui lòng chọn mũi tiêm khác!`
        );
        return;
      }

      // Nếu lịch hẹn đã có paymentDetailId (tức là đã chọn một mũi tiêm trước đó), đặt lại appointmentId của PaymentDetail cũ
      if (latestAppointment.paymentDetailId) {
        const oldPaymentDetail = allPaymentDetails.find(
          (detail) => detail.paymentDetailId === latestAppointment.paymentDetailId
        );
        if (oldPaymentDetail && oldPaymentDetail.paymentDetailId !== paymentDetailId) {
          const resetPaymentDetailData: UpdatePaymentDetailDTO = {
            isCompleted: 0,
            notes: "Đã bỏ chọn mũi tiêm",
          };
          await paymentDetailService.updatePaymentDetail(
            oldPaymentDetail.paymentDetailId,
            resetPaymentDetailData
          );
        }
      }

      // Cập nhật PaymentDetail mới với appointmentId
      const updatePaymentDetailData: UpdatePaymentDetailDTO = {
        isCompleted: 0,
        notes: "Đã chọn mũi tiêm",
        appointmentId: latestAppointment.appointmentId,
      };
      await paymentDetailService.updatePaymentDetail(paymentDetailId, updatePaymentDetailData);

      // Cập nhật Appointment với paymentDetailId mới
      const updateAppointmentData: UpdateAppointmentDTO = {
        paymentDetailId: paymentDetailId,
        appointmentStatus: AppointmentStatus.Paid,
      };
      const updatedAppointment = await appointmentService.updateAppointment(
        latestAppointment.appointmentId,
        updateAppointmentData
      );

      // Cập nhật danh sách appointments
      const updatedAppointments = appointments.map((appointment) =>
        appointment.appointmentId === latestAppointment.appointmentId
          ? {
            ...appointment,
            paymentDetailId: updatedAppointment.paymentDetailId,
            appointmentStatus: updatedAppointment.appointmentStatus,
          }
          : appointment
      );
      setAppointments(updatedAppointments);
      setOriginalAppointments(updatedAppointments);

      // Làm mới danh sách PaymentDetails
      const refreshedPaymentDetails = await paymentDetailService.getAllPaymentDetails();
      setAllPaymentDetails(refreshedPaymentDetails);

      const selectedDose = selectedPaymentDetails.find(
        (detail) => detail.paymentDetailId === paymentDetailId
      );
      message.success(`Đã chọn mũi ${selectedDose?.doseSequence} thành công!`);
      fetchData();
      handleCloseModal();
    } catch (error) {
      message.error("Chọn mũi tiêm thất bại: " + (error as Error).message);
    }
  };

  const handleCheckOut = async (appointmentId: number) => {
    try {
      const latestAppointment = await appointmentService.getAppointmentById(appointmentId);

      if (latestAppointment.appointmentStatus !== AppointmentStatus.Paid) {
        message.warning("Chỉ có thể bắt đầu vào tiêm khi ở trạng thái 'Đã thanh toán'!");
        return;
      }

      Modal.confirm({
        title: "Xác nhận Check In",
        content: "Bạn có chắc chắn muốn xác nhận chờ tiêm cho cuộc hẹn này không?",
        okText: "Xác nhận",
        okType: "primary",
        cancelText: "Hủy bỏ",
        onOk: async () => {
          try {
            const updateData: UpdateAppointmentDTO = {
              appointmentStatus: AppointmentStatus.Paid,
            };
            const updatedAppointment = await appointmentService.updateAppointment(appointmentId, updateData);
            message.success("Xác nhận thành công!");
            const updatedAppointments = appointments.map((appointment) =>
              appointment.appointmentId === appointmentId
                ? { ...appointment, appointmentStatus: updatedAppointment.appointmentStatus }
                : appointment
            );
            fetchData();
            setAppointments(updatedAppointments);
            setOriginalAppointments(updatedAppointments);
          } catch (error) {
            message.error("Xác nhận thất bại: " + (error as Error).message);
          }
        },
      });
    } catch (error) {
      message.error("Không thể tải lại trạng thái lịch hẹn: " + (error as Error).message);
    }
  };

  const getStatusText = (status: number) => {
    let text = "";
    let style = {};

    switch (status) {
      case AppointmentStatus.Pending:
        text = "Đã lên lịch";
        style = {
          color: "#1890ff",
          backgroundColor: "#e6f7ff",
          padding: "2px 8px",
          borderRadius: "4px",
        };
        break;
      case AppointmentStatus.Checked:
        text = "Đã check in";
        style = {
          color: "#fa8c16",
          backgroundColor: "#fff7e6",
          padding: "2px 8px",
          borderRadius: "4px",
        };
        break;
      case AppointmentStatus.Paid:
        text = "Đã thanh toán";
        style = {
          color: "#722ed1",
          backgroundColor: "#f9f0ff",
          padding: "2px 8px",
          borderRadius: "4px",
        };
        break;
      case AppointmentStatus.Injected:
        text = "Đã tiêm";
        style = {
          color: "#08979c",
          backgroundColor: "#e6fffb",
          padding: "2px 8px",
          borderRadius: "4px",
        };
        break;
      case AppointmentStatus.Completed:
        text = "Hoàn thành";
        style = {
          color: "#52c41a",
          backgroundColor: "#f6ffed",
          padding: "2px 8px",
          borderRadius: "4px",
        };
        break;
      case AppointmentStatus.Cancelled:
        text = "Đã hủy";
        style = {
          color: "#ff4d4f",
          backgroundColor: "#fff1f0",
          padding: "2px 8px",
          borderRadius: "4px",
        };
        break;
      default:
        text = String(status);
        style = {
          color: "#000",
          padding: "2px 8px",
          borderRadius: "4px",
        };
    }

    return <span style={style}>{text}</span>;
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
        childProfiles.find((profile) => profile.childId === childId)?.fullName || "Không tìm thấy tên",
    },
    {
      title: "Tên Vắc xin / Gói Vắc xin",
      key: "vaccineOrPackage",
      width: 300,
      render: (_: any, record: AppointmentResponseDTO) => {
        if (record.vaccineId) {
          const vaccine = vaccines.find((v) => v.vaccineId === record.vaccineId);
          const vaccineDisease = vaccineDiseases.find((vd) => vd.vaccineId === record.vaccineId);
          const disease = vaccineDisease ? diseases.find((d) => d.diseaseId === vaccineDisease.diseaseId) : null;
          return (
            <div>
              <div>{vaccine ? vaccine.name : "Không tìm thấy vắc xin"}</div>
              <div style={{ color: "gray", fontSize: "12px" }}>
                {disease ? disease.name : "Không xác định"} - Số lượng: {vaccine ? vaccine.quantity : "N/A"} - Giá: {vaccine ? new Intl.NumberFormat("vi-VN").format(vaccine.price) : "N/A"} VND
              </div>
            </div>
          );
        } else if (record.vaccinePackageId) {
          const packageItem = vaccinePackages.find((p) => p.vaccinePackageId === record.vaccinePackageId);
          return (
            <div>
              <div>{packageItem ? packageItem.name : "Không tìm thấy gói vắc xin"}</div>
              <div style={{ color: "gray", fontSize: "12px" }}>
                Giá: {packageItem ? new Intl.NumberFormat("vi-VN").format(packageItem.totalPrice) : "N/A"} VND
              </div>
            </div>
          );
        }
        return "Không có vắc xin hoặc gói vắc xin";
      },
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
      width: 160,
      render: (status: number) => getStatusText(status),
    },
    {
      title: "Chọn mũi tiêm",
      key: "selectDose",
      width: 190,
      render: (_: any, record: AppointmentResponseDTO) => {
        const hasPaid = payments.some(
          (p) => p.appointmentId === record.appointmentId && p.paymentStatus === 2
        );
        const hasPaidViaPackage = record.paymentDetailId
          ? allPaymentDetails.some(
            (detail) =>
              detail.paymentDetailId === record.paymentDetailId &&
              payments.some(
                (p) => p.paymentId === detail.paymentId && p.paymentStatus === 2
              )
          )
          : false;
        const hasVaccinePackage = !!record.vaccinePackageId;
        const canSelect = (hasPaid || hasPaidViaPackage) && hasVaccinePackage;
        const content = canSelect ? (
          <a
            onClick={() => handleSelectDose(record)}
            style={{ color: "orange", cursor: "pointer" }}
          >
            {record.paymentDetailId ? "Chọn lại mũi tiêm" : "Chọn mũi tiêm"}
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
              border: "1px solid #fa8c16",
            }}
          >
            {content}
          </span>
        );
      },
    },
    {
      title: "Mũi tiêm đã chọn",
      key: "doseSequence",
      width: 250,
      render: (record: AppointmentResponseDTO) => {
        if (!record.paymentDetailId) return <span style={{ color: "gray" }}>-</span>;
        const selectedPaymentDetail = allPaymentDetails.find(
          (detail) => detail.paymentDetailId === record.paymentDetailId
        );
        if (!selectedPaymentDetail) return <span style={{ color: "gray" }}>-</span>;

        const vaccineNameWithDisease = vaccineNameMap.get(selectedPaymentDetail.vaccinePackageDetailId) || "Không xác định - Không xác định";
        const statusText = selectedPaymentDetail.isCompleted === 1 ? " (Hoàn thành)" : "";
        return (
          <span style={{ color: "red" }}>
            Mũi {selectedPaymentDetail.doseSequence} - {vaccineNameWithDisease}{statusText}
          </span>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      render: (_: any, record: AppointmentResponseDTO) => {
        return (
          <Space size="middle">
            <EyeOutlined
              onClick={() => handleViewDetail(record)}
              style={{ color: "blue", cursor: "pointer" }}
            />
            <CheckOutlined
              style={{
                color: record.appointmentStatus === AppointmentStatus.Paid ? "green" : "gray",
                cursor: record.appointmentStatus === AppointmentStatus.Paid ? "pointer" : "not-allowed",
              }}
              onClick={() => handleCheckOut(record.appointmentId)}
            />
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-center p-2 rounded-t-lg">
        QUẢN LÝ XÁC NHẬN MŨI TIÊM
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

      <Modal
        title="CHI TIẾT LỊCH HẸN TIÊM CHỦNG"
        visible={isDetailModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        centered
        style={{ width: "800px", maxHeight: "600px" }}
        bodyStyle={{ maxHeight: "500px", overflowY: "auto" }}
      >
        {selectedAppointment && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Tên Trẻ em">
              {childProfiles.find((p) => p.childId === selectedAppointment.childId)?.fullName || "Không tìm thấy tên"}
            </Descriptions.Item>
            <Descriptions.Item label="Tên Vắc xin">
              {vaccines.find((v) => v.vaccineId === selectedAppointment.vaccineId)?.name || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Tên Gói vắc xin">
              {vaccinePackages.find((p) => p.vaccinePackageId === selectedAppointment.vaccinePackageId)?.name || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Mũi tiêm đã chọn">
              {selectedAppointment.paymentDetailId ? (
                (() => {
                  const selectedPaymentDetail = allPaymentDetails.find(
                    (detail) => detail.paymentDetailId === selectedAppointment.paymentDetailId
                  );
                  if (!selectedPaymentDetail) return "Không tìm thấy thông tin mũi tiêm";
                  const vaccineNameWithDisease = vaccineNameMap.get(selectedPaymentDetail.vaccinePackageDetailId) || "Không xác định - Không xác định";
                  const statusText = selectedPaymentDetail.isCompleted === 1 ? " (Hoàn thành)" : " (Chưa hoàn thành)";
                  return `Mũi ${selectedPaymentDetail.doseSequence} - ${vaccineNameWithDisease}${statusText} - Ngày dự kiến: ${selectedPaymentDetail.scheduledDate ? moment(selectedPaymentDetail.scheduledDate, "DD/MM/YYYY").format("DD/MM/YYYY") : "Chưa xác định"}`;
                })()
              ) : (
                "Chưa chọn mũi tiêm"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái hẹn">
              {getStatusText(selectedAppointment.appointmentStatus)}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {selectedAppointment.createdDate
                ? moment(selectedAppointment.createdDate, "DD/MM/YYYY").format("DD/MM/YYYY")
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Người tạo">
              {selectedAppointment.createdBy || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sửa đổi">
              {selectedAppointment.modifiedDate
                ? moment(selectedAppointment.modifiedDate, "DD/MM/YYYY").format("DD/MM/YYYY")
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Người sửa đổi">
              {selectedAppointment.modifiedBy || "N/A"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal
        title="Chọn mũi tiêm cho gói vaccine"
        visible={isSelectDoseModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        centered
        style={{ width: "800px", maxHeight: "600px" }}
        bodyStyle={{ maxHeight: "500px", overflowY: "auto" }}
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
              title: "Tên vaccine - Tên bệnh",
              key: "vaccineName",
              render: (_: any, record: ExtendedPaymentDetailResponseDTO) => {
                const vaccineNameWithDisease = vaccineNameMap.get(record.vaccinePackageDetailId) || "Không xác định - Không xác định";
                return (
                  <div>
                    <div>{vaccineNameWithDisease}</div>
                    <div style={{ color: "gray", fontSize: "12px" }}>
                      Số lượng: {record.vaccineQuantity !== null && record.vaccineQuantity !== undefined ? record.vaccineQuantity : "N/A"}
                    </div>
                  </div>
                );
              },
            },
            {
              title: "Hành động",
              key: "action",
              render: (_: any, record: ExtendedPaymentDetailResponseDTO) => {
                const isAlreadySelected = selectedAppointment?.paymentDetailId === record.paymentDetailId;
                const isVaccineAvailable = record.vaccineQuantity !== null && record.vaccineQuantity !== undefined && record.vaccineQuantity > 0;

                return (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleConfirmDoseSelection(record.paymentDetailId)}
                    disabled={!isVaccineAvailable}
                    title={isVaccineAvailable ? (isAlreadySelected ? "Mũi tiêm đang được chọn" : "Chọn mũi tiêm") : "Vaccine đã hết"}
                  >
                    {isAlreadySelected ? "Đang chọn" : "Chọn"}
                  </Button>
                );
              },
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default AppointmentManagePage;