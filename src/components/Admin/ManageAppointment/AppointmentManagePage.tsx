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
  DeleteOutlined,
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
import {
  PaymentResponseDTO,
  CreatePaymentDTO,
  VnPaymentRequestModel,
} from "../../../models/Payment";
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
import { ColumnType } from "antd/es/table";
import { AppointmentStatus, PaymentType } from "../../../models/Type/enum";

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
    useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentResponseDTO | null>(null);
  const [selectedPaymentType, setSelectedPaymentType] = useState<number | null>(
    null
  );
  const [selectedPaymentDetails, setSelectedPaymentDetails] = useState<
    PaymentDetailResponseDTO[]
  >([]);
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
  const [vaccineNameMap, setVaccineNameMap] = useState<Map<number, string>>(
    new Map()
  );

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

      const activeAppointments = allAppointments.filter(
        (appointment) => appointment.isActive === 1
      );

      const filteredAppointments = activeAppointments.filter(
        (appointment) =>
          appointment.appointmentStatus === 1 ||
          appointment.appointmentStatus === 2
      );

      const uniqueVaccinePackageDetailIds = new Set(
        allPaymentDetailsResponse.map((detail) => detail.vaccinePackageDetailId)
      );
      const nameMap = new Map();
      for (const id of uniqueVaccinePackageDetailIds) {
        try {
          const vaccinePackageDetail =
            await vaccinePackageDetailService.getPackageDetailById(id);
          const vaccine = allVaccines.find(
            (v) => v.vaccineId === vaccinePackageDetail.vaccineId
          );
          nameMap.set(id, vaccine ? vaccine.name : "Không xác định");
        } catch (error) {
          console.error("Lỗi khi lấy thông tin vaccine cho ID:", id, error);
          nameMap.set(id, "Không xác định");
        }
      }

      setVaccines(allVaccines);
      setVaccinePackages(allVaccinePackages);
      setChildProfiles(allChildProfiles);
      setAppointments(filteredAppointments);
      setOriginalAppointments(activeAppointments);
      setPayments(allPayments);
      setAllPaymentDetails(allPaymentDetailsResponse);
      setVaccineNameMap(nameMap);
      setPagination({
        current: 1,
        pageSize: pagination.pageSize,
        total: filteredAppointments.length,
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
      const filteredAppointments = originalAppointments.filter(
        (appointment) =>
          appointment.appointmentStatus === 1 ||
          appointment.appointmentStatus === 2
      );
      setAppointments(filteredAppointments);
      setPagination({
        ...pagination,
        current: 1,
        total: filteredAppointments.length,
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
    // Tải lại trạng thái từ server
    try {
      const latestAppointment = await appointmentService.getAppointmentById(
        appointment.appointmentId
      );
      setSelectedAppointment(latestAppointment);

      // Kiểm tra trạng thái sau khi tải lại
      if (latestAppointment.appointmentStatus !== 2) {
        message.error(
          "Chỉ có thể chọn mũi tiêm khi trạng thái là 'Đã lên lịch'!"
        );
        return;
      }

      const payment = payments.find(
        (p) =>
          p.appointmentId === latestAppointment.appointmentId &&
          p.paymentStatus === 2
      );
      if (!payment) {
        const paymentDetail = allPaymentDetails.find(
          (detail) =>
            detail.paymentDetailId === latestAppointment.paymentDetailId
        );
        if (paymentDetail) {
          const relatedPayment = payments.find(
            (p) => p.paymentId === paymentDetail.paymentId
          );
          if (relatedPayment && relatedPayment.paymentStatus === 2) {
            message.info("Lịch hẹn này đã được thanh toán qua gói vaccine!");
            return;
          }
        }
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

        const unusedPaymentDetails = paymentDetails.filter(
          (detail) =>
            !appointments.some(
              (appt) => appt.paymentDetailId === detail.paymentDetailId
            ) && detail.isCompleted !== 1
        );

        if (unusedPaymentDetails.length === 0) {
          message.warning(
            "Tất cả các mũi tiêm trong gói đã được chọn hoặc đã hoàn thành!"
          );
          return;
        }

        setSelectedPaymentDetails(unusedPaymentDetails);
        setIsSelectDoseModalVisible(true);
        fetchData();
      } catch (error) {
        message.error(
          "Không thể lấy danh sách mũi tiêm: " + (error as Error).message
        );
      }
    } catch (error) {
      message.error(
        "Không thể tải lại trạng thái lịch hẹn: " + (error as Error).message
      );
    }
  };

  const handleConfirmDoseSelection = async (paymentDetailId: number) => {
    if (!selectedAppointment) {
      message.error("Không có lịch hẹn được chọn!");
      return;
    }

    // Tải lại trạng thái từ server
    try {
      const latestAppointment = await appointmentService.getAppointmentById(
        selectedAppointment.appointmentId
      );
      setSelectedAppointment(latestAppointment);

      // Kiểm tra trạng thái sau khi tải lại
      if (latestAppointment.appointmentStatus !== 2) {
        message.error(
          "Chỉ có thể xác nhận chọn mũi tiêm khi trạng thái là 'Đã lên lịch'!"
        );
        return;
      }

      try {
        const updatePaymentDetailData: UpdatePaymentDetailDTO = {
          isCompleted: 0,
          notes: "Đã chọn mũi tiêm",
          appointmentId: latestAppointment.appointmentId,
        };
        await paymentDetailService.updatePaymentDetail(
          paymentDetailId,
          updatePaymentDetailData
        );

        const updateAppointmentData: UpdateAppointmentDTO = {
          paymentDetailId: paymentDetailId,
          appointmentStatus: 2,
        };
        const updatedAppointment = await appointmentService.updateAppointment(
          latestAppointment.appointmentId,
          updateAppointmentData
        );

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

        const updatedPaymentDetails = selectedPaymentDetails.map((detail) =>
          detail.paymentDetailId === paymentDetailId
            ? { ...detail, notes: "Đã chọn mũi tiêm" }
            : detail
        );
        setSelectedPaymentDetails(updatedPaymentDetails);

        const refreshedPaymentDetails =
          await paymentDetailService.getAllPaymentDetails();
        setAllPaymentDetails(refreshedPaymentDetails);

        const selectedDose = selectedPaymentDetails.find(
          (detail) => detail.paymentDetailId === paymentDetailId
        );
        message.success(
          `Đã chọn mũi ${selectedDose?.doseSequence} thành công!`
        );
        fetchData();
        handleCloseModal();
      } catch (error) {
        message.error("Chọn mũi tiêm thất bại: " + (error as Error).message);
      }
    } catch (error) {
      message.error(
        "Không thể tải lại trạng thái lịch hẹn: " + (error as Error).message
      );
    }
  };

  const confirmCancel = (appointmentId: number) => {
    // Tải lại trạng thái từ server
    appointmentService
      .getAppointmentById(appointmentId)
      .then((latestAppointment) => {
        // Kiểm tra trạng thái sau khi tải lại
        if (
          latestAppointment.appointmentStatus === AppointmentStatus.Cancelled
        ) {
          message.warning("Lịch tiêm đã được hủy trước đó!");
          return;
        }
        if (latestAppointment.appointmentStatus !== AppointmentStatus.Pending) {
          message.warning(
            "Chỉ có thể hủy lịch hẹn khi trạng thái là 'Đã lên lịch'!"
          );
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
                appointmentStatus: AppointmentStatus.Cancelled,
              };
              const updatedAppointment =
                await appointmentService.updateAppointment(
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
              fetchData();
            } catch (error) {
              message.error(
                "Hủy lịch hẹn thất bại: " + (error as Error).message
              );
            }
          },
        });
      })
      .catch((error) => {
        message.error(
          "Không thể tải lại trạng thái lịch hẹn: " + (error as Error).message
        );
      });
  };

  const handleCheckOut = async (appointmentId: number) => {
    // Tải lại trạng thái từ server
    try {
      const latestAppointment = await appointmentService.getAppointmentById(
        appointmentId
      );

      // Kiểm tra trạng thái sau khi tải lại
      if (latestAppointment.appointmentStatus !== AppointmentStatus.Pending) {
        message.warning(
          "Chỉ có thể Check Out lịch hẹn ở trạng thái 'Đã lên lịch'!"
        );
        return;
      }

      Modal.confirm({
        title: "Xác nhận Check Out",
        content:
          "Bạn có chắc chắn muốn chuyển trạng thái lịch hẹn sang 'Chờ tiêm' không?",
        okText: "Xác nhận",
        okType: "primary",
        cancelText: "Hủy bỏ",
        onOk: async () => {
          try {
            const updateData: UpdateAppointmentDTO = {
              appointmentStatus: AppointmentStatus.WaitingForInjection,
            };
            const updatedAppointment =
              await appointmentService.updateAppointment(
                appointmentId,
                updateData
              );
            message.success(
              "Check Out thành công! Trạng thái đã chuyển sang 'Chờ tiêm'."
            );
            const updatedAppointments = appointments.map((appointment) =>
              appointment.appointmentId === appointmentId
                ? {
                    ...appointment,
                    appointmentStatus: updatedAppointment.appointmentStatus,
                  }
                : appointment
            );
            fetchData();
            setAppointments(updatedAppointments);
            setOriginalAppointments(updatedAppointments);
          } catch (error) {
            message.error("Check Out thất bại: " + (error as Error).message);
          }
        },
      });
    } catch (error) {
      message.error(
        "Không thể tải lại trạng thái lịch hẹn: " + (error as Error).message
      );
    }
  };

  const handlePayment = async (appointment: AppointmentResponseDTO) => {
    // Tải lại trạng thái từ server
    try {
      const latestAppointment = await appointmentService.getAppointmentById(
        appointment.appointmentId
      );

      // Kiểm tra trạng thái sau khi tải lại
      if (latestAppointment.appointmentStatus !== AppointmentStatus.Pending) {
        message.error(
          "Chỉ có thể thanh toán lịch hẹn ở trạng thái 'Đã lên lịch'!"
        );
        return;
      }

      const paymentDetail = allPaymentDetails.find(
        (detail) => detail.paymentDetailId === latestAppointment.paymentDetailId
      );
      if (paymentDetail) {
        const relatedPayment = payments.find(
          (p) => p.paymentId === paymentDetail.paymentId
        );
        if (relatedPayment && relatedPayment.paymentStatus === 2) {
          message.info("Lịch hẹn này đã được thanh toán qua gói vaccine!");
          return;
        }
      }

      const hasPaid = payments.some(
        (p) =>
          p.appointmentId === latestAppointment.appointmentId &&
          p.paymentStatus === 2
      );
      if (hasPaid) {
        message.info("Lịch hẹn này đã được thanh toán!");
        return;
      }
      setSelectedAppointment(latestAppointment);
      setIsPaymentModalVisible(true);
    } catch (error) {
      message.error(
        "Không thể tải lại trạng thái lịch hẹn: " + (error as Error).message
      );
    }
  };

  const handlePaymentConfirm = () => {
    if (!selectedAppointment || selectedPaymentType === null) {
      message.error("Vui lòng chọn phương thức thanh toán!");
      return;
    }

    // Tải lại trạng thái từ server
    appointmentService
      .getAppointmentById(selectedAppointment.appointmentId)
      .then((latestAppointment) => {
        setSelectedAppointment(latestAppointment);

        // Kiểm tra trạng thái sau khi tải lại
        if (latestAppointment.appointmentStatus !== 1) {
          message.error(
            "Chỉ có thể xác nhận thanh toán lịch hẹn ở trạng thái 'Đã lên lịch'!"
          );
          return;
        }

        setIsPaymentModalVisible(false);
        setIsConfirmPaymentModalVisible(true);
      })
      .catch((error) => {
        message.error(
          "Không thể tải lại trạng thái lịch hẹn: " + (error as Error).message
        );
      });
  };

  const handleFinalPaymentConfirm = async () => {
    if (!selectedAppointment || selectedPaymentType === null) {
      message.error("Dữ liệu không hợp lệ!");
      return;
    }

    // Tải lại trạng thái từ server
    try {
      const latestAppointment = await appointmentService.getAppointmentById(
        selectedAppointment.appointmentId
      );
      setSelectedAppointment(latestAppointment);

      // Kiểm tra trạng thái sau khi tải lại
      if (latestAppointment.appointmentStatus !== 1) {
        message.error(
          "Chỉ có thể thực hiện thanh toán lịch hẹn ở trạng thái 'Đã lên lịch'!"
        );
        return;
      }

      let amount = 0;
      if (latestAppointment.vaccinePackageId) {
        const vaccinePackage = vaccinePackages.find(
          (pkg) => pkg.vaccinePackageId === latestAppointment.vaccinePackageId
        );
        amount = vaccinePackage ? vaccinePackage.totalPrice : 0;
      } else if (latestAppointment.vaccineId) {
        const vaccine = vaccines.find(
          (v) => v.vaccineId === latestAppointment.vaccineId
        );
        amount = vaccine ? vaccine.price : 0;
      }

      if (amount === 0) {
        message.error("Không thể xác định số tiền thanh toán!");
        return;
      }

      const child = childProfiles.find(
        (profile) => profile.childId === latestAppointment.childId
      );
      const childFullName = child?.fullName || "Không xác định";

      const description = `Thanh toán lịch hẹn tiêm chủng cho trẻ ${childFullName} vào ngày ${moment().format(
        "DD/MM/YYYY"
      )}`;

      const paymentData: CreatePaymentDTO = {
        appointmentId: latestAppointment.appointmentId,
        userId: latestAppointment.userId,
        vaccineId: latestAppointment.vaccineId || undefined,
        vaccinePackageId: latestAppointment.vaccinePackageId || undefined,
        paymentType: selectedPaymentType,
      };

      try {
        const newPayment = await paymentService.addPayment(paymentData);

        if (selectedPaymentType === PaymentType.Cash) {
          await paymentService.updatePayment(newPayment.paymentId, {
            paymentStatus: 2,
          });

          if (latestAppointment.vaccinePackageId) {
            await paymentDetailService.generatePaymentDetail(
              newPayment.paymentId
            );
          }

          const updateAppointmentData: UpdateAppointmentDTO = {
            appointmentStatus: 2,
          };
          await appointmentService.updateAppointment(
            latestAppointment.appointmentId,
            updateAppointmentData
          );

          message.success("Thanh toán bằng tiền mặt thành công!");
          setPayments([...payments, { ...newPayment, paymentStatus: 2 }]);
        } else if (selectedPaymentType === PaymentType.BankTransfer) {
          const vnPaymentRequest: VnPaymentRequestModel = {
            orderId: newPayment.paymentId,
            fullName: childFullName,
            description: description,
            amount: amount,
          };

          const paymentUrl = await paymentService.createPaymentUrl(
            vnPaymentRequest
          );

          if (!paymentUrl) {
            message.error("Không thể tạo URL thanh toán!");
            return;
          }

          window.location.href = paymentUrl;
        }
        setIsConfirmPaymentModalVisible(false);
        setSelectedPaymentType(null);
        setSelectedAppointment(null);
        fetchData();
      } catch (error) {
        message.error("Thanh toán thất bại: " + (error as Error).message);
      }
    } catch (error) {
      message.error(
        "Không thể tải lại trạng thái lịch hẹn: " + (error as Error).message
      );
    }
  };

  const getStatusText = (status: number) => {
    let text = "";
    let style = {};

    switch (status) {
      case 1:
        text = "Đã lên lịch";
        style = {
          color: "#1890ff",
          backgroundColor: "#e6f7ff",
          padding: "2px 8px",
          borderRadius: "4px",
        };
        break;
      case 2:
        text = "Chờ tiêm";
        style = {
          color: "#fa8c16",
          backgroundColor: "#fff7e6",
          padding: "2px 8px",
          borderRadius: "4px",
        };
        break;
      case 3:
        text = "Chờ phản ứng";
        style = {
          color: "#722ed1",
          backgroundColor: "#f9f0ff",
          padding: "2px 8px",
          borderRadius: "4px",
        };
        break;
      case 4:
        text = "Hoàn thành";
        style = {
          color: "#52c41a",
          backgroundColor: "#f6ffed",
          padding: "2px 8px",
          borderRadius: "4px",
        };
        break;
      case 5:
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
      render: (status: number) => getStatusText(status),
    },
    {
      title: "Thanh toán",
      key: "payment",
      width: 200,
      render: (_: any, record: AppointmentResponseDTO) => {
        const hasPaidDirect = payments.some(
          (p) =>
            p.appointmentId === record.appointmentId && p.paymentStatus === 2
        );
        const hasPaidViaPackage = record.paymentDetailId
          ? allPaymentDetails.some(
              (detail) =>
                detail.paymentDetailId === record.paymentDetailId &&
                payments.some(
                  (p) =>
                    p.paymentId === detail.paymentId && p.paymentStatus === 2
                )
            )
          : false;

        const hasPaid = hasPaidDirect || hasPaidViaPackage;
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
              backgroundColor: hasPaid ? "#f6ffed" : "#e6f7ff",
              border: hasPaid ? "1px solid #52c41a" : "1px solid #1890ff",
              color: hasPaid ? "#52c41a" : "#1890ff",
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
        const hasPaidViaPackage = record.paymentDetailId
          ? allPaymentDetails.some(
              (detail) =>
                detail.paymentDetailId === record.paymentDetailId &&
                payments.some(
                  (p) =>
                    p.paymentId === detail.paymentId && p.paymentStatus === 2
                )
            )
          : false;
        const hasVaccinePackage = !!record.vaccinePackageId;
        const canSelect =
          (hasPaid || hasPaidViaPackage) &&
          hasVaccinePackage &&
          !record.paymentDetailId;
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
      key: "selectedDose",
      width: 200,
      render: (_: any, record: AppointmentResponseDTO) => {
        if (!record.paymentDetailId)
          return <span style={{ color: "gray" }}>-</span>;
        const selectedPaymentDetail = allPaymentDetails.find(
          (detail) => detail.paymentDetailId === record.paymentDetailId
        );
        if (!selectedPaymentDetail)
          return <span style={{ color: "gray" }}>-</span>;

        const vaccineName =
          vaccineNameMap.get(selectedPaymentDetail.vaccinePackageDetailId) ||
          "Không xác định";
        const statusText =
          selectedPaymentDetail.isCompleted === 1 ? " (Hoàn thành)" : "";
        return (
          <span style={{ color: "red" }}>
            Đã chọn mũi {selectedPaymentDetail.doseSequence} - Vaccine:{" "}
            {vaccineName}
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
        return (
          <Space size="middle">
            <EyeOutlined
              onClick={() => handleViewDetail(record)}
              style={{ color: "blue", cursor: "pointer" }}
            />
            <CheckOutlined
              style={{
                color:
                  record.appointmentStatus === AppointmentStatus.Pending
                    ? "green"
                    : "gray",
                cursor:
                  record.appointmentStatus === AppointmentStatus.Pending
                    ? "pointer"
                    : "not-allowed",
              }}
              onClick={() => handleCheckOut(record.appointmentId)}
            />
            <DeleteOutlined
              style={{
                color:
                  record.appointmentStatus === AppointmentStatus.Pending
                    ? "red"
                    : "gray",
                cursor:
                  record.appointmentStatus === AppointmentStatus.Pending
                    ? "pointer"
                    : "not-allowed",
              }}
              onClick={() => confirmCancel(record.appointmentId)}
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
              title: "Tên vaccine",
              key: "vaccineName",
              render: (_: any, record: PaymentDetailResponseDTO) =>
                vaccineNameMap.get(record.vaccinePackageDetailId) ||
                "Không xác định",
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
                  }
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
