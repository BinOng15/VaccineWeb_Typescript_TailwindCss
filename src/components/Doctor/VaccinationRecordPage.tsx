/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Table, Input, Space, Row, Col, Modal, message, Form, Tag } from "antd";
import { ReloadOutlined, EyeOutlined, CheckOutlined } from "@ant-design/icons";
import moment from "moment";
import appointmentService from "../../service/appointmentService";
import childProfileService from "../../service/childProfileService";
import userService from "../../service/userService";
import vaccineService from "../../service/vaccineService";
import vaccinePackageService from "../../service/vaccinePackageService";
import paymentService from "../../service/paymentService";
import paymentDetailService from "../../service/paymentDetailService";
import vaccinePackageDetailService from "../../service/vaccinePackageDetailService";
import {
  AppointmentResponseDTO,
  UpdateAppointmentDTO,
} from "../../models/Appointment";
import { ChildProfileResponseDTO } from "../../models/ChildProfile";
import { UserResponseDTO } from "../../models/User";
import { VaccineResponseDTO } from "../../models/Vaccine";
import { VaccinePackageResponseDTO } from "../../models/VaccinePackage";
import { PaymentDetailResponseDTO } from "../../models/PaymentDetail";
import { ColumnType } from "antd/es/table";

const { Search } = Input;
const { TextArea } = Input;

const VaccinationRecordPage: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentResponseDTO[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isReactionModalVisible, setIsReactionModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentResponseDTO | null>(null);
  const [childMap, setChildMap] = useState<{
    [key: number]: { childFullName: string; userFullName: string };
  }>({});
  const [vaccines, setVaccines] = useState<VaccineResponseDTO[]>([]);
  const [vaccinePackages, setVaccinePackages] = useState<
    VaccinePackageResponseDTO[]
  >([]);
  const [allPaymentDetails, setAllPaymentDetails] = useState<
    PaymentDetailResponseDTO[]
  >([]);
  const [vaccineNameMap, setVaccineNameMap] = useState<Map<number, string>>(
    new Map()
  );
  const [reactionForm] = Form.useForm();

  const getAppointmentStatusText = (status: number) => {
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

  const getStatusColor = (status: number) => {
    switch (status) {
      case 2:
        return "gold";
      case 3:
        return "orange";
      case 4:
        return "green";
      case 5:
        return "red";
      default:
        return "default";
    }
  };

  const fetchAppointments = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    keyword = searchKeyword
  ) => {
    setLoading(true);
    try {
      const allVaccines = await vaccineService.getAllVaccines();
      const allVaccinePackages = await vaccinePackageService.getAllPackages();
      setVaccines(allVaccines);
      setVaccinePackages(allVaccinePackages);

      const allAppointments = await appointmentService.getAllAppointments();

      const updatedAppointments = allAppointments.map((appointment) => ({
        ...appointment,
        appointmentStatus: appointment.appointmentStatus || 2,
      }));

      let filteredAppointments = updatedAppointments.filter(
        (appointment) =>
          appointment.appointmentStatus === 2 ||
          appointment.appointmentStatus === 3 ||
          appointment.appointmentStatus === 4
      );

      if (keyword) {
        filteredAppointments = filteredAppointments.filter(
          (appointment) =>
            appointment.appointmentId.toString().includes(keyword) ||
            moment(appointment.appointmentDate)
              .format("DD/MM/YYYY")
              .includes(keyword)
        );
      }

      const startIndex = (page - 1) * pageSize;
      const paginatedAppointments = filteredAppointments.slice(
        startIndex,
        startIndex + pageSize
      );

      const childIds = [
        ...new Set(
          paginatedAppointments
            .map((appointment) => appointment.childId)
            .filter((id): id is number => id !== null)
        ),
      ];

      const childPromises = childIds.map(async (childId) => {
        try {
          const child: ChildProfileResponseDTO =
            await childProfileService.getChildProfileById(childId);
          return {
            childId,
            childFullName: child.fullName || "N/A",
            userId: child.userId,
          };
        } catch (error) {
          console.error(`Lỗi khi lấy child ${childId}:`, error);
          return { childId, childFullName: "N/A", userId: null };
        }
      });

      const childrenData = await Promise.all(childPromises);
      const userIds = [
        ...new Set(
          childrenData
            .map((child) => child.userId)
            .filter((id): id is number => id !== null)
        ),
      ];

      const userPromises = userIds.map(async (userId) => {
        try {
          const user: UserResponseDTO = await userService.getUserById(userId);
          return user;
        } catch (error) {
          console.error(`Lỗi khi lấy user ${userId}:`, error);
          return null;
        }
      });

      const usersData = (await Promise.all(userPromises)).filter(
        (user) => user !== null
      ) as UserResponseDTO[];
      const userMap = usersData.reduce((acc, user) => {
        acc[user.userId] = user.fullName || "N/A";
        return acc;
      }, {} as { [key: number]: string });

      const newChildMap = childrenData.reduce(
        (acc, { childId, childFullName, userId }) => {
          acc[childId] = {
            childFullName,
            userFullName: userId ? userMap[userId] || "N/A" : "N/A",
          };
          return acc;
        },
        {} as { [key: number]: { childFullName: string; userFullName: string } }
      );

      const allPayments = await paymentService.getAllPayments();
      const appointmentIds = paginatedAppointments.map(
        (app) => app.appointmentId
      );
      const relevantPayments = allPayments.filter((payment) =>
        appointmentIds.includes(payment.appointmentId)
      );
      const paymentIds = relevantPayments.map((payment) => payment.paymentId);

      const paymentDetailsPromises = paymentIds.map(async (paymentId) => {
        try {
          const paymentDetails =
            await paymentDetailService.getPaymentDetailsByPaymentId(paymentId);
          return { paymentId, paymentDetails };
        } catch (error) {
          console.error(
            `Lỗi khi lấy payment details cho payment ${paymentId}:`,
            error
          );
          return { paymentId, paymentDetails: [] };
        }
      });

      const allPaymentDetailsResponse =
        await paymentDetailService.getAllPaymentDetails();
      setAllPaymentDetails(allPaymentDetailsResponse);

      await Promise.all(paymentDetailsPromises); // Giữ logic này để không làm gián đoạn (dù không sử dụng)

      const uniqueVaccinePackageDetailIds = new Set(
        allPaymentDetailsResponse
          .map((detail) => detail.vaccinePackageDetailId || 0)
          .filter((id): id is number => id !== 0)
      );
      const newVaccineNameMap = new Map<number, string>();
      for (const packageDetailId of uniqueVaccinePackageDetailIds) {
        try {
          const packageDetail =
            await vaccinePackageDetailService.getPackageDetailById(
              packageDetailId
            );
          const vaccine = allVaccines.find(
            (v) => v.vaccineId === packageDetail.vaccineId
          );
          newVaccineNameMap.set(
            packageDetailId,
            vaccine ? vaccine.name : "Không xác định"
          );
        } catch (error) {
          console.error(
            `Lỗi khi lấy vaccine cho packageDetailId ${packageDetailId}:`,
            error
          );
          newVaccineNameMap.set(packageDetailId, "Không xác định");
        }
      }
      setVaccineNameMap(newVaccineNameMap);

      setChildMap(newChildMap);
      setAppointments(paginatedAppointments);
      setPagination({
        current: page,
        pageSize,
        total: filteredAppointments.length,
      });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách lịch hẹn:", error);
      setAppointments([]);
      message.error("Không thể tải danh sách lịch hẹn.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAndCompleteDose = async (
    appointment: AppointmentResponseDTO
  ) => {
    if (
      appointment.appointmentStatus === 1 ||
      appointment.appointmentStatus === 5
    ) {
      message.error("Không thể xác nhận trạng thái này!");
      return;
    }

    try {
      if (appointment.appointmentStatus === 2) {
        // Chuyển từ trạng thái 2 (Chờ tiêm) sang 3 (Chờ phản ứng)
        const updateAppointmentData: UpdateAppointmentDTO = {
          appointmentStatus: 3,
        };
        await appointmentService.updateAppointment(
          appointment.appointmentId,
          updateAppointmentData
        );
        message.success(
          "Đã chuyển sang 'Đang chờ phản hồi'. Vui lòng nhập phản ứng!"
        );
        setSelectedAppointment({ ...appointment, appointmentStatus: 3 });
        setIsReactionModalVisible(true);
      } else if (appointment.appointmentStatus === 3) {
        // Chuyển từ trạng thái 3 (Chờ phản ứng) sang 4 (Hoàn thành)
        setSelectedAppointment({ ...appointment, appointmentStatus: 3 }); // Cập nhật tạm thời để mở modal
        setIsReactionModalVisible(true);
      }

      fetchAppointments(pagination.current, pagination.pageSize, searchKeyword);
    } catch (error) {
      console.error("Lỗi khi xác nhận hoàn thành liều tiêm:", error);
      message.error("Xác nhận thất bại.");
    }
  };

  const handleSaveReaction = async () => {
    if (!selectedAppointment) return;
    try {
      const values = await reactionForm.validateFields();
      const reaction = values.reaction;

      const updateData: UpdateAppointmentDTO = {
        appointmentStatus: selectedAppointment.appointmentStatus === 2 ? 3 : 4, // 2 -> 3 hoặc 3 -> 4
        reaction: reaction,
      };
      await appointmentService.updateAppointment(
        selectedAppointment.appointmentId,
        updateData
      );

      message.success(
        `Đã cập nhật trạng thái sang '${
          updateData.appointmentStatus === 3 ? "Đang chờ phản hồi" : "Hoàn tất"
        }' và lưu phản ứng`,
        1.5,
        () => {
          fetchAppointments(
            pagination.current,
            pagination.pageSize,
            searchKeyword
          );
          setIsReactionModalVisible(false);
          reactionForm.resetFields();
        }
      );
    } catch (error) {
      console.error("Lỗi khi lưu phản ứng:", error);
      message.error("Lưu phản ứng thất bại.");
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleTableChange = (pagination: any) => {
    fetchAppointments(pagination.current, pagination.pageSize);
  };

  const onSearch = (value: string) => {
    setSearchKeyword(value);
    fetchAppointments(1, pagination.pageSize, value);
  };

  const handleReset = () => {
    setSearchKeyword("");
    fetchAppointments(1, pagination.pageSize, "");
  };

  const handleViewDetail = (appointment: AppointmentResponseDTO) => {
    setSelectedAppointment(appointment);
    setIsDetailModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalVisible(false);
    setIsReactionModalVisible(false);
    setSelectedAppointment(null);
  };

  const getVaccineOrPackageName = (appointment: AppointmentResponseDTO) => {
    if (appointment.vaccineId) {
      return (
        vaccines.find((v) => v.vaccineId === appointment.vaccineId)?.name ||
        "N/A"
      );
    }
    if (appointment.vaccinePackageId) {
      return (
        vaccinePackages.find(
          (p) => p.vaccinePackageId === appointment.vaccinePackageId
        )?.name || "N/A"
      );
    }
    return "N/A";
  };

  const columns: ColumnType<AppointmentResponseDTO>[] = [
    {
      title: "STT",
      key: "index",
      width: 10,
      align: "center",
      render: (_: any, __: AppointmentResponseDTO, index: number) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Tên Phụ huynh",
      key: "userFullName",
      render: (appointment: AppointmentResponseDTO) =>
        appointment.childId !== null &&
        childMap[appointment.childId]?.userFullName
          ? childMap[appointment.childId].userFullName
          : "N/A",
    },
    {
      title: "Tên Trẻ em",
      key: "childFullName",
      render: (appointment: AppointmentResponseDTO) =>
        appointment.childId !== null &&
        childMap[appointment.childId]?.childFullName
          ? childMap[appointment.childId].childFullName
          : "N/A",
    },
    {
      title: "Tên Vaccine/Gói Vaccine",
      key: "vaccineOrPackageName",
      render: (appointment: AppointmentResponseDTO) =>
        getVaccineOrPackageName(appointment),
    },
    {
      title: "Mũi Tiêm",
      key: "doseSequence",
      width: 200,
      render: (appointment: AppointmentResponseDTO) => {
        if (!appointment.paymentDetailId)
          return <span style={{ color: "gray" }}>-</span>;
        const selectedPaymentDetail = allPaymentDetails.find(
          (detail) => detail.paymentDetailId === appointment.paymentDetailId
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
            Mũi {selectedPaymentDetail.doseSequence} - Vaccine: {vaccineName}
            {statusText}
          </span>
        );
      },
    },
    { title: "Ngày hẹn", dataIndex: "appointmentDate" },
    {
      title: "Trạng thái",
      key: "appointmentStatus",
      render: (appointment: AppointmentResponseDTO) => (
        <Tag color={getStatusColor(appointment.appointmentStatus)}>
          {getAppointmentStatusText(appointment.appointmentStatus)}
        </Tag>
      ),
    },
    {
      title: "Phản ứng",
      dataIndex: "reaction",
      width: 100,
      render: (reaction: string) => reaction || "N/A",
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      align: "center",
      render: (_: any, appointment: AppointmentResponseDTO) => (
        <Space size="middle">
          <EyeOutlined
            onClick={() => handleViewDetail(appointment)}
            style={{ color: "blue", cursor: "pointer", fontSize: "18px" }}
            title="Chi tiết lịch tiêm"
          />
          <CheckOutlined
            onClick={() => handleConfirmAndCompleteDose(appointment)}
            style={{
              color:
                appointment.appointmentStatus === 2 ||
                appointment.appointmentStatus === 3
                  ? "green"
                  : "gray",
              cursor:
                appointment.appointmentStatus === 2 ||
                appointment.appointmentStatus === 3
                  ? "pointer"
                  : "not-allowed",
              fontSize: "18px",
            }}
            title="Hoàn thành lịch tiêm"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto mt-12">
      <h2 className="text-2xl font-bold text-center p-2">
        QUẢN LÝ LỊCH HẸN TIÊM CHỦNG
      </h2>
      <Row justify="space-between" style={{ marginBottom: 16, marginTop: 24 }}>
        <Col>
          <Space>
            <Search
              placeholder="Tìm kiếm"
              onSearch={onSearch}
              enterButton
              allowClear
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
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
        dataSource={appointments}
        rowKey="appointmentId"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
        }}
        loading={loading}
        onChange={handleTableChange}
      />

      <Modal
        title="Chi tiết Lịch hẹn"
        open={isDetailModalVisible}
        onCancel={handleCloseModal}
        footer={null}
      >
        {selectedAppointment && (
          <div style={{ padding: 16 }}>
            <p>
              <strong>Tên Phụ huynh:</strong>{" "}
              {selectedAppointment.childId !== null &&
              childMap[selectedAppointment.childId]?.userFullName
                ? childMap[selectedAppointment.childId].userFullName
                : "N/A"}
            </p>
            <p>
              <strong>Tên Trẻ em:</strong>{" "}
              {selectedAppointment.childId !== null &&
              childMap[selectedAppointment.childId]?.childFullName
                ? childMap[selectedAppointment.childId].childFullName
                : "N/A"}
            </p>
            <p>
              <strong>Tên Vaccine/Gói Vaccine:</strong>{" "}
              {getVaccineOrPackageName(selectedAppointment)}
            </p>
            <p>
              <strong>Tên Mũi Tiêm:</strong>{" "}
              {allPaymentDetails.length > 0
                ? (() => {
                    const selectedDetail = allPaymentDetails.find(
                      (detail) =>
                        detail.paymentDetailId ===
                        selectedAppointment?.paymentDetailId
                    );
                    const vaccineName =
                      selectedDetail && selectedDetail.vaccinePackageDetailId
                        ? vaccineNameMap.get(
                            selectedDetail.vaccinePackageDetailId
                          ) || "Không xác định"
                        : "N/A";
                    const statusText =
                      selectedDetail?.isCompleted === 1 ? " (Hoàn thành)" : "";
                    return selectedDetail?.doseSequence
                      ? `Mũi ${selectedDetail.doseSequence} - ${vaccineName}${statusText}`
                      : "N/A";
                  })()
                : "N/A"}
            </p>
            <p>
              <strong>Ngày hẹn:</strong>{" "}
              {selectedAppointment.appointmentDate
                ? moment(
                    selectedAppointment.appointmentDate,
                    "DD/MM/YYYY"
                  ).format("DD/MM/YYYY")
                : "N/A"}
            </p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              <Tag
                color={getStatusColor(selectedAppointment.appointmentStatus)}
              >
                {getAppointmentStatusText(
                  selectedAppointment.appointmentStatus
                )}
              </Tag>
            </p>
            <p>
              <strong>Phản ứng:</strong> {selectedAppointment.reaction || "N/A"}
            </p>
          </div>
        )}
      </Modal>

      <Modal
        title="Nhập phản ứng"
        open={isReactionModalVisible}
        onOk={handleSaveReaction}
        onCancel={handleCloseModal}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Form form={reactionForm} layout="vertical">
          <Form.Item
            name="reaction"
            label="Phản ứng"
            rules={[{ required: true, message: "Vui lòng nhập phản ứng" }]}
          >
            <TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default VaccinationRecordPage;
