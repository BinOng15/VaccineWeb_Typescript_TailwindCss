/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Space,
  Row,
  Col,
  Modal,
  Button,
  message,
  Form,
} from "antd";
import { ReloadOutlined, EyeOutlined, CheckOutlined } from "@ant-design/icons";
import moment from "moment";
import appointmentService from "../../service/appointmentService";
import childProfileService from "../../service/childProfileService";
import userService from "../../service/userService";
import vaccineService from "../../service/vaccineService";
import vaccinePackageService from "../../service/vaccinePackageService";
import paymentService from "../../service/paymentService"; // Sử dụng paymentService để getAllPayments
import paymentDetailService from "../../service/paymentDetailService";
import {
  AppointmentResponseDTO,
  UpdateAppointmentDTO,
} from "../../models/Appointment";
import { ChildProfileResponseDTO } from "../../models/ChildProfile";
import { UserResponseDTO } from "../../models/User";
import { VaccineResponseDTO } from "../../models/Vaccine";
import { VaccinePackageResponseDTO } from "../../models/VaccinePackage";
import {
  PaymentDetailResponseDTO,
  UpdatePaymentDetailDTO,
} from "../../models/PaymentDetail";
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
  const [paymentDetailsMap, setPaymentDetailsMap] = useState<{
    [key: number]: PaymentDetailResponseDTO[];
  }>({});
  const [reactionForm] = Form.useForm();

  const getAppointmentStatusText = (status: number) => {
    switch (status) {
      case 1:
        return "Đang chờ";
      case 2:
        return "Đang chờ tiêm";
      case 3:
        return "Đang chờ phản hồi";
      case 4:
        return "Đã hoàn tất";
      case 5:
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  const fetchAppointments = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    keyword = searchKeyword
  ) => {
    setLoading(true);
    try {
      // Lấy danh sách vaccine, gói vaccine
      const allVaccines = await vaccineService.getAllVaccines();
      const allVaccinePackages = await vaccinePackageService.getAllPackages();
      setVaccines(allVaccines);
      setVaccinePackages(allVaccinePackages);

      const allAppointments = await appointmentService.getAllAppointments();

      const updatedAppointments = allAppointments.map((appointment) => ({
        ...appointment,
        appointmentStatus: appointment.appointmentStatus || 2,
      }));

      // Lọc chỉ hiển thị appointment có status là 2, 3 hoặc 4
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

      // Lấy tất cả payments và payment details
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

      const paymentDetailsData = await Promise.all(paymentDetailsPromises);
      const newPaymentDetailsMap = paymentDetailsData.reduce(
        (acc, { paymentId, paymentDetails }) => {
          const appointmentId = relevantPayments.find(
            (p) => p.paymentId === paymentId
          )?.appointmentId;
          if (appointmentId) {
            acc[appointmentId] = paymentDetails;
          }
          return acc;
        },
        {} as { [key: number]: PaymentDetailResponseDTO[] }
      );

      setChildMap(newChildMap);
      setPaymentDetailsMap(newPaymentDetailsMap);
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

  const handleConfirmClick = async (appointment: AppointmentResponseDTO) => {
    if (appointment.appointmentStatus !== 2) {
      message.error("Chỉ có thể xác nhận khi trạng thái là 'Đang chờ tiêm'");
      return;
    }
    try {
      const updateData: UpdateAppointmentDTO = {
        appointmentStatus: 3, // Chuyển trạng thái sang "Đang chờ phản hồi"
      };
      await appointmentService.updateAppointment(
        appointment.appointmentId,
        updateData
      );

      message.success(
        "Đã cập nhật trạng thái sang 'Đang chờ phản hồi'",
        1.5,
        () => {
          fetchAppointments(
            pagination.current,
            pagination.pageSize,
            searchKeyword
          );
          setSelectedAppointment({ ...appointment, appointmentStatus: 3 });
          setIsReactionModalVisible(true); // Mở modal nhập phản ứng
        }
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái sang 3:", error);
      message.error("Cập nhật trạng thái thất bại.");
    }
  };

  const handleCompleteDose = async (appointment: AppointmentResponseDTO) => {
    if (
      !appointment.vaccinePackageId ||
      !paymentDetailsMap[appointment.appointmentId]?.length
    ) {
      message.error("Không có mũi tiêm để hoàn thành.");
      return;
    }

    const paymentDetails = paymentDetailsMap[appointment.appointmentId] || [];
    try {
      // Lặp qua tất cả paymentDetails của appointment và cập nhật isCompleted thành 1
      for (const detail of paymentDetails) {
        if (detail.isCompleted !== 1) {
          // Chỉ cập nhật nếu chưa hoàn thành
          const updateData: UpdatePaymentDetailDTO = {
            isCompleted: 1, // Đặt isCompleted thành 1 (hoàn thành)
            administeredDate: moment().format("DD/MM/YYYY"), // Thêm ngày hoàn thành (tùy chọn)
            notes: `Hoàn thành mũi ${detail.doseSequence} vào ${moment().format(
              "DD/MM/YYYY"
            )}`,
            scheduledDate: detail.scheduledDate, // Giữ nguyên ngày dự kiến (tùy chọn)
            appointmentId: appointment.appointmentId,
          };
          await paymentDetailService.updatePaymentDetail(
            detail.paymentDetailId,
            updateData
          );
        }
      }

      message.success("Cập nhật trạng thái hoàn thành thành công!");
      // Làm mới dữ liệu để phản ánh thay đổi
      fetchAppointments(pagination.current, pagination.pageSize, searchKeyword);
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái hoàn thành:", error);
      message.error("Cập nhật trạng thái thất bại.");
    }
  };

  const handleSaveReaction = async () => {
    if (!selectedAppointment) return;
    try {
      const values = await reactionForm.validateFields();
      const reaction = values.reaction;

      const updateData: UpdateAppointmentDTO = {
        appointmentStatus: 4,
        reaction: reaction,
      };
      console.log("Sending Update Data:", updateData);
      const response = await appointmentService.updateAppointment(
        selectedAppointment.appointmentId,
        updateData
      );
      console.log("Server Response:", response);

      message.success(
        "Đã cập nhật trạng thái sang 'Đã hoàn tất' và lưu phản ứng",
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

  const getIsActiveText = (isActive: number) => {
    return isActive === 1 ? "Có" : isActive === 0 ? "Không" : "Không xác định";
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
      title: "Tên Vaccine",
      key: "vaccineName",
      render: (appointment: AppointmentResponseDTO) =>
        appointment.vaccineId
          ? vaccines.find((v) => v.vaccineId === appointment.vaccineId)?.name ||
            "N/A"
          : "N/A",
    },
    {
      title: "Tên Gói Vaccine",
      key: "vaccinePackageName",
      render: (appointment: AppointmentResponseDTO) =>
        appointment.vaccinePackageId
          ? vaccinePackages.find(
              (p) => p.vaccinePackageId === appointment.vaccinePackageId
            )?.name || "N/A"
          : "N/A",
    },
    {
      title: "Tên Mũi Tiêm",
      key: "doseSequence",
      render: (appointment: AppointmentResponseDTO) => {
        const details = paymentDetailsMap[appointment.appointmentId] || [];
        return details.length > 0
          ? details[0]?.doseSequence
            ? `Mũi ${details[0].doseSequence}`
            : "N/A"
          : "N/A";
      },
    },
    {
      title: "Ngày hẹn",
      dataIndex: "appointmentDate",
    },
    {
      title: "Trạng thái",
      key: "appointmentStatus",
      render: (appointment: AppointmentResponseDTO) =>
        getAppointmentStatusText(appointment.appointmentStatus),
    },
    {
      title: "Phản ứng",
      dataIndex: "reaction",
      render: (reaction: string) => reaction || "N/A",
    },
    {
      title: "Hoàn thành mũi tiêm",
      key: "completeDose",
      width: 100,
      render: (_: any, appointment: AppointmentResponseDTO) => {
        // Chỉ hiển thị nút nếu appointment có vaccinePackageId và có paymentDetails
        if (
          !appointment.vaccinePackageId ||
          !paymentDetailsMap[appointment.appointmentId]?.length
        ) {
          return <span style={{ color: "gray" }}>-</span>;
        }

        const paymentDetails =
          paymentDetailsMap[appointment.appointmentId] || [];
        return (
          <Button
            type="primary"
            size="small"
            onClick={() => handleCompleteDose(appointment)}
            disabled={paymentDetails.every(
              (detail) => detail.isCompleted === 1
            )}
          >
            Hoàn thành
          </Button>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, appointment: AppointmentResponseDTO) => (
        <Space size="middle">
          <EyeOutlined
            type="link"
            onClick={() => handleViewDetail(appointment)}
            style={{ color: "blue", cursor: "pointer" }}
            title="Chi tiết lịch tiêm"
          />
          <CheckOutlined
            type="primary"
            onClick={() => handleConfirmClick(appointment)}
            style={{ color: "green", cursor: "pointer" }}
            title="Hoàn thành lịch tiêm"
          />
        </Space>
      ),
    },
    // Thêm cột mới để hoàn thành mũi tiêm
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
              <strong>Tên Vaccine:</strong>{" "}
              {selectedAppointment.vaccineId
                ? vaccines.find(
                    (v) => v.vaccineId === selectedAppointment.vaccineId
                  )?.name || "N/A"
                : "N/A"}
            </p>
            <p>
              <strong>Tên Gói Vaccine:</strong>{" "}
              {selectedAppointment.vaccinePackageId
                ? vaccinePackages.find(
                    (p) =>
                      p.vaccinePackageId ===
                      selectedAppointment.vaccinePackageId
                  )?.name || "N/A"
                : "N/A"}
            </p>
            <p>
              <strong>Tên Mũi Tiêm:</strong>{" "}
              {paymentDetailsMap[selectedAppointment.appointmentId]?.length > 0
                ? paymentDetailsMap[selectedAppointment.appointmentId][0]
                    ?.doseSequence
                  ? `Mũi ${
                      paymentDetailsMap[selectedAppointment.appointmentId][0]
                        .doseSequence
                    }`
                  : "N/A"
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
              {getAppointmentStatusText(selectedAppointment.appointmentStatus)}
            </p>
            <p>
              <strong>Phản ứng:</strong> {selectedAppointment.reaction || "N/A"}
            </p>
            <p>
              <strong>Hoạt động:</strong>{" "}
              {getIsActiveText(selectedAppointment.isActive)}
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
