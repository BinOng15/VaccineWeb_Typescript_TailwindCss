/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  Table,
  Space,
  message,
  Modal,
  Row,
  Col,
  Button,
  Descriptions,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  ReloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  AppointmentResponseDTO,
  UpdateAppointmentDTO,
} from "../../models/Appointment";
import appointmentService from "../../service/appointmentService";
import childProfileService from "../../service/childProfileService";
import moment from "moment";
import { useAuth } from "../../context/AuthContext";
import { VaccineResponseDTO } from "../../models/Vaccine";
import { VaccinePackageResponseDTO } from "../../models/VaccinePackage";
import { VaccineDiseaseResponseDTO } from "../../models/VaccineDisease";
import vaccineService from "../../service/vaccineService";
import vaccinePackageService from "../../service/vaccinePackageService";
import vaccineDiseaseService from "../../service/vaccineDiseaseService";
import diseaseService from "../../service/diseaseService";
import paymentDetailService from "../../service/paymentDetailService";
import paymentService from "../../service/paymentService"; // Thêm paymentService
import vaccinePackageDetailService from "../../service/vaccinePackageDetailService";
import Search from "antd/es/input/Search";
import { ColumnType } from "antd/es/table";
import { ChildProfileResponseDTO } from "../../models/ChildProfile";
import { PaymentDetailResponseDTO } from "../../models/PaymentDetail";
import { PaymentResponseDTO } from "../../models/Payment"; // Thêm PaymentResponseDTO
import { useNavigate } from "react-router-dom";

interface DiseaseResponseDTO {
  diseaseId: number;
  name: string;
}

export enum AppointmentStatus {
  Pending = 1,
  Checked = 2,
  Paid = 3,
  Injected = 4,
  WaitingForResponse = 5,
  Completed = 6,
  Cancelled = 7,
}

function CustomerAppointment() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentResponseDTO[]>([]);
  const [originalAppointments, setOriginalAppointments] = useState<AppointmentResponseDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [childProfiles, setChildProfiles] = useState<ChildProfileResponseDTO[]>([]);
  const [vaccines, setVaccines] = useState<VaccineResponseDTO[]>([]);
  const [vaccineDiseases, setVaccineDiseases] = useState<VaccineDiseaseResponseDTO[]>([]);
  const [diseases, setDiseases] = useState<DiseaseResponseDTO[]>([]);
  const [vaccinePackages, setVaccinePackages] = useState<VaccinePackageResponseDTO[]>([]);
  const [allPaymentDetails, setAllPaymentDetails] = useState<PaymentDetailResponseDTO[]>([]);
  const [allPayments, setAllPayments] = useState<PaymentResponseDTO[]>([]); // Thêm danh sách Payment
  const [vaccineNameMap, setVaccineNameMap] = useState<Map<number, string>>(new Map());
  const [searchText, setSearchText] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponseDTO | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) {
      console.error("No user found");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const allVaccines = await vaccineService.getAllVaccines();
      const allVaccineDiseases = await vaccineDiseaseService.getAllVaccineDiseases();
      const allDiseases = await diseaseService.getAllDiseases();
      const allVaccinePackages = await vaccinePackageService.getAllPackages();
      const allChildProfiles = await childProfileService.getAllChildProfiles();
      const allAppointments = await appointmentService.getAllAppointments();
      const allPaymentDetailsResponse = await paymentDetailService.getAllPaymentDetails();
      const allPaymentsResponse = await paymentService.getAllPayments(); // Lấy danh sách Payment

      const userChildIds = allChildProfiles
        .filter((profile) => profile.userId === user.userId)
        .map((profile) => profile.childId);
      setChildProfiles(allChildProfiles);
      setVaccines(allVaccines);
      setVaccineDiseases(allVaccineDiseases);
      setDiseases(allDiseases);
      setVaccinePackages(allVaccinePackages);
      setAllPaymentDetails(allPaymentDetailsResponse);
      setAllPayments(allPaymentsResponse); // Lưu danh sách Payment

      const filteredAppointments = allAppointments.filter((appointment) =>
        userChildIds.includes(appointment.childId)
      );
      setAppointments(filteredAppointments);
      setOriginalAppointments(filteredAppointments);

      // Tạo vaccineNameMap với "Vaccine - Bệnh"
      const uniqueVaccinePackageDetailIds = new Set(
        allPaymentDetailsResponse
          .map((detail) => detail.vaccinePackageDetailId || 0)
          .filter((id): id is number => id !== 0)
      );
      const newVaccineNameMap = new Map<number, string>();
      for (const packageDetailId of uniqueVaccinePackageDetailIds) {
        try {
          const packageDetail = await vaccinePackageDetailService.getPackageDetailById(packageDetailId);
          const vaccine = allVaccines.find((v) => v.vaccineId === packageDetail.vaccineId);
          const vaccineDisease = allVaccineDiseases.find((vd) => vd.vaccineId === packageDetail.vaccineId);
          const disease = vaccineDisease ? allDiseases.find((d) => d.diseaseId === vaccineDisease.diseaseId) : null;
          const displayName = `${vaccine ? vaccine.name : "Không xác định"} - ${disease ? disease.name : "Không xác định"}`;
          newVaccineNameMap.set(packageDetailId, displayName);
        } catch (error) {
          console.error(`Lỗi khi lấy vaccine cho packageDetailId ${packageDetailId}:`, error);
          newVaccineNameMap.set(packageDetailId, "Không xác định - Không xác định");
        }
      }
      setVaccineNameMap(newVaccineNameMap);

      setPagination({
        current: 1,
        pageSize: pagination.pageSize,
        total: filteredAppointments.length,
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
      message.error("Không thể tải danh sách lịch hẹn: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const onSearch = (value: string) => {
    const trimmedValue = value.trim().toLowerCase();
    setSearchText(trimmedValue);

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
      const child = childProfiles.find((p) => p.childId === appointment.childId);
      const childName = child?.fullName.toLowerCase() || "";
      const vaccine = appointment.vaccineId
        ? vaccines.find((v) => v.vaccineId === appointment.vaccineId)?.name.toLowerCase() || ""
        : "";
      const vaccinePackage = appointment.vaccinePackageId
        ? vaccinePackages.find((p) => p.vaccinePackageId === appointment.vaccinePackageId)?.name.toLowerCase() || ""
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
    setSearchText("");
    fetchData();
    setPagination({
      ...pagination,
      current: 1,
      total: originalAppointments.length,
    });
  };

  const handleTableChange = (pagination: any) => {
    const { current, pageSize } = pagination;
    setPagination((prev) => ({ ...prev, current, pageSize }));
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

  const getPaymentStatus = (appointment: AppointmentResponseDTO) => {
    // Kiểm tra nếu lịch hẹn có paymentDetailId
    if (appointment.paymentDetailId) {
      const paymentDetail = allPaymentDetails.find(
        (detail) => detail.paymentDetailId === appointment.paymentDetailId
      );
      if (paymentDetail) {
        const payment = allPayments.find((p) => p.paymentId === paymentDetail.paymentId);
        if (payment) {
          return payment.paymentStatus === 2 ? "Đã thanh toán" : "Chưa thanh toán";
        }
      }
    }

    // Kiểm tra nếu lịch hẹn có liên quan trực tiếp đến một Payment
    const payment = allPayments.find((p) => p.appointmentId === appointment.appointmentId);
    if (payment) {
      return payment.paymentStatus === 2 ? "Đã thanh toán" : "Chưa thanh toán";
    }

    return "Chưa thanh toán";
  };

  const columns: ColumnType<AppointmentResponseDTO>[] = [
    {
      title: "STT",
      key: "index",
      width: 50,
      align: "center",
      render: (_: any, __: AppointmentResponseDTO, index: number) => {
        const currentIndex = (pagination.current - 1) * pagination.pageSize + index + 1;
        return currentIndex;
      },
    },
    {
      title: "Họ tên của trẻ",
      dataIndex: "childId",
      key: "childId",
      render: (childId: number) => {
        const child = childProfiles.find((profile) => profile.childId === childId);
        return child ? child.fullName : "Không tìm thấy";
      },
    },
    {
      title: "Ngày hẹn",
      dataIndex: "appointmentDate",
      key: "appointmentDate",
    },
    {
      title: "Vaccine/Gói vaccine",
      key: "vaccineOrPackage",
      render: (record: AppointmentResponseDTO) => {
        if (record.vaccineId) {
          const vaccine = vaccines.find((v) => v.vaccineId === record.vaccineId);
          const vaccineDisease = vaccineDiseases.find((vd) => vd.vaccineId === record.vaccineId);
          const disease = vaccineDisease ? diseases.find((d) => d.diseaseId === vaccineDisease.diseaseId) : null;
          return `${vaccine ? vaccine.name : "Không tìm thấy vaccine"} - ${disease ? disease.name : "Không xác định"}`;
        } else if (record.vaccinePackageId) {
          const packageItem = vaccinePackages.find((p) => p.vaccinePackageId === record.vaccinePackageId);
          return packageItem ? packageItem.name : "Không tìm thấy gói vaccine";
        }
        return "Không có vaccine hoặc gói vaccine";
      },
    },
    {
      title: "Mũi Tiêm",
      key: "doseSequence",
      width: 200,
      render: (record: AppointmentResponseDTO) => {
        if (!record.paymentDetailId) return <span style={{ color: "gray" }}>-</span>;
        const selectedPaymentDetail = allPaymentDetails.find(
          (detail) => detail.paymentDetailId === record.paymentDetailId
        );
        if (!selectedPaymentDetail) return <span style={{ color: "gray" }}>-</span>;

        const vaccineName = vaccineNameMap.get(selectedPaymentDetail.vaccinePackageDetailId) || "Không xác định - Không xác định";
        const statusText = selectedPaymentDetail.isCompleted === 1 ? " (Hoàn thành)" : "";
        return (
          <span style={{ color: "red" }}>
            Mũi {selectedPaymentDetail.doseSequence} - {vaccineName}{statusText}
          </span>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "appointmentStatus",
      key: "appointmentStatus",
      render: (status: number) => getStatusText(status),

    },
    {
      title: "Trạng thái thanh toán",
      key: "paymentStatus",
      render: (record: AppointmentResponseDTO) => {
        const paymentStatus = getPaymentStatus(record);
        return (
          <span style={{ color: paymentStatus === "Đã thanh toán" ? "green" : "red" }}>
            {paymentStatus}
          </span>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: AppointmentResponseDTO) => (
        <Space>
          <EyeOutlined
            style={{ color: "blue", cursor: "pointer", fontSize: 18 }}
            onClick={() => showModal(record)}
          />
          <DeleteOutlined
            style={{
              color: record.appointmentStatus === AppointmentStatus.Pending ? "red" : "gray",
              cursor: record.appointmentStatus === AppointmentStatus.Pending ? "pointer" : "not-allowed",
              fontSize: 18,
              marginLeft: 8,
            }}
            onClick={() => confirmCancel(record.appointmentId, record.appointmentStatus)}
          />
        </Space>
      ),
    },
  ];

  const showModal = (appointment: AppointmentResponseDTO) => {
    setSelectedAppointment(appointment);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedAppointment(null);
  };

  const handleAdd = () => {
    navigate("/vaccine-registration");
  };

  const confirmCancel = (appointmentId: number, currentStatus: number) => {
    if (currentStatus === AppointmentStatus.Cancelled) {
      message.warning("Lịch tiêm đã được hủy trước đó!");
      return;
    }

    if (currentStatus !== AppointmentStatus.Pending) {
      message.warning("Chỉ có thể hủy lịch hẹn khi trạng thái là 'Đã lên lịch'!");
      return;
    }

    Modal.confirm({
      title: "Xác nhận hủy lịch tiêm",
      content: "Nếu hủy lịch hẹn tiêm thì bạn sẽ phải liên hệ với quản lý để tiến hành đăng ký lại. Bạn có chắc chắn muốn hủy lịch tiêm không?",
      okText: "Xác nhận",
      okType: "danger",
      cancelText: "Hủy bỏ",
      onOk: async () => {
        try {
          const updateData: UpdateAppointmentDTO = {
            appointmentStatus: AppointmentStatus.Cancelled,
            paymentDetailId: null,
          };
          await appointmentService.updateAppointment(appointmentId, updateData);
          message.success("Hủy lịch hẹn thành công", 1.5, () => {
            fetchData();
          });
        } catch (error) {
          message.error("Hủy lịch hẹn thất bại: " + (error as Error).message);
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="w-full max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-[#102A83] mb-6 text-center">
          Danh sách đăng ký lịch tiêm của trẻ
        </h1>
        <Row justify="space-between" style={{ marginBottom: 16 }}>
          <Col>
            <Space>
              <Search
                placeholder="Tìm kiếm theo tên trẻ, vaccine, hoặc gói vaccine"
                onSearch={onSearch}
                enterButton
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
              />
              <ReloadOutlined
                onClick={handleReset}
                style={{ fontSize: "24px", cursor: "pointer" }}
              />
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              style={{ marginLeft: 8 }}
            >
              Thêm mới
            </Button>
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={appointments.slice(
            (pagination.current - 1) * pagination.pageSize,
            pagination.current * pagination.pageSize
          )}
          rowKey="appointmentId"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: appointments.length,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          onChange={handleTableChange}
          bordered
          locale={{ emptyText: "Không có lịch hẹn nào" }}
        />

        {/* Modal chi tiết */}
        <Modal
          title="CHI TIẾT LỊCH HẸN"
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          centered
        >
          {selectedAppointment && (
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Họ tên của trẻ">
                {childProfiles.find((p) => p.childId === selectedAppointment.childId)?.fullName || "Không tìm thấy"}
              </Descriptions.Item>
              <Descriptions.Item label="Vaccine/Gói vaccine">
                {selectedAppointment.vaccineId
                  ? (() => {
                    const vaccine = vaccines.find((v) => v.vaccineId === selectedAppointment.vaccineId);
                    const vaccineDisease = vaccineDiseases.find((vd) => vd.vaccineId === selectedAppointment.vaccineId);
                    const disease = vaccineDisease ? diseases.find((d) => d.diseaseId === vaccineDisease.diseaseId) : null;
                    return `${vaccine ? vaccine.name : "Không tìm thấy vaccine"} - ${disease ? disease.name : "Không xác định"}`;
                  })()
                  : selectedAppointment.vaccinePackageId
                    ? vaccinePackages.find((p) => p.vaccinePackageId === selectedAppointment.vaccinePackageId)?.name || "Không tìm thấy gói vaccine"
                    : "Không có vaccine hoặc gói vaccine"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày hẹn">
                {moment(selectedAppointment.appointmentDate, "DD/MM/YYYY").format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Tên Mũi Tiêm">
                {allPaymentDetails.length > 0
                  ? (() => {
                    const selectedDetail = allPaymentDetails.find(
                      (detail) => detail.paymentDetailId === selectedAppointment?.paymentDetailId
                    );
                    const vaccineName =
                      selectedDetail && selectedDetail.vaccinePackageDetailId
                        ? vaccineNameMap.get(selectedDetail.vaccinePackageDetailId) || "Không xác định - Không xác định"
                        : "-";
                    const statusText = selectedDetail?.isCompleted === 1 ? " (Hoàn thành)" : "";
                    return selectedDetail?.doseSequence
                      ? `Mũi ${selectedDetail.doseSequence} - ${vaccineName}${statusText}`
                      : "-";
                  })()
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {selectedAppointment.appointmentStatus === AppointmentStatus.Pending
                  ? "Đã lên lịch"
                  : selectedAppointment.appointmentStatus === AppointmentStatus.Checked
                    ? "Chờ tiêm"
                    : selectedAppointment.appointmentStatus === AppointmentStatus.Paid
                      ? "Đã thanh toán"
                      : selectedAppointment.appointmentStatus === AppointmentStatus.Injected
                        ? "Đã tiêm"
                        : selectedAppointment.appointmentStatus === AppointmentStatus.WaitingForResponse
                          ? "Kiểm tra phản ứng"
                          : selectedAppointment.appointmentStatus === AppointmentStatus.Completed
                            ? "Hoàn thành"
                            : selectedAppointment.appointmentStatus === AppointmentStatus.Cancelled
                              ? "Đã hủy"
                              : String(selectedAppointment.appointmentStatus)}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái thanh toán">
                {getPaymentStatus(selectedAppointment)}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default CustomerAppointment;