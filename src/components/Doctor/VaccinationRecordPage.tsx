/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Table, Input, Space, Row, Col, Modal, Button, message, Form } from "antd";
import { ReloadOutlined, EyeOutlined, CheckOutlined } from "@ant-design/icons";
import moment from "moment";
import appointmentService from "../../service/appointmentService";
import childProfileService from "../../service/childProfileService";
import userService from "../../service/userService";
import { AppointmentResponseDTO } from "../../models/Appointment";
import { ChildProfileResponseDTO } from "../../models/ChildProfile";
import { UserResponseDTO } from "../../models/User";

const { Search } = Input;
const { TextArea } = Input;

const VaccinationRecordPage: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isReactionModalVisible, setIsReactionModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponseDTO | null>(null);
  const [childMap, setChildMap] = useState<{
    [key: number]: { childFullName: string; userFullName: string };
  }>({});
  const [reactionForm] = Form.useForm();

  const getAppointmentStatusText = (status: number) => {
    switch (status) {
      case 1: return "Đang chờ";
      case 2: return "Đang chờ tiêm";
      case 3: return "Đang chờ phản hồi";
      case 4: return "Đã hoàn tất";
      case 5: return "Đã hủy";
      default: return "Không xác định";
    }
  };

  const fetchAppointments = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    keyword = searchKeyword
  ) => {
    setLoading(true);
    try {
      const allAppointments = await appointmentService.getAllAppointments();
      const updatedAppointments = allAppointments.map((appointment) => ({
        ...appointment,
        appointmentStatus: appointment.appointmentStatus || 2,
      }));
      let filteredAppointments = updatedAppointments;

      if (keyword) {
        filteredAppointments = updatedAppointments.filter((appointment) =>
          appointment.appointmentId.toString().includes(keyword) ||
          moment(appointment.appointmentDate).format("DD/MM/YYYY").includes(keyword)
        );
      }

      const startIndex = (page - 1) * pageSize;
      const paginatedAppointments = filteredAppointments.slice(startIndex, startIndex + pageSize);

      const childIds = [
        ...new Set(paginatedAppointments.map((appointment) => appointment.childId).filter((id): id is number => id !== null)),
      ];

      const childPromises = childIds.map(async (childId) => {
        try {
          const child: ChildProfileResponseDTO = await childProfileService.getChildProfileById(childId);
          return { childId, childFullName: child.fullName || "N/A", userId: child.userId };
        } catch (error) {
          console.error(`Lỗi khi lấy child ${childId}:`, error);
          return { childId, childFullName: "N/A", userId: null };
        }
      });

      const childrenData = await Promise.all(childPromises);
      const userIds = [
        ...new Set(childrenData.map((child) => child.userId).filter((id): id is number => id !== null)),
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

      const usersData = (await Promise.all(userPromises)).filter((user) => user !== null) as UserResponseDTO[];
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

      setChildMap(newChildMap);
      setAppointments(paginatedAppointments);
      setPagination({ current: page, pageSize, total: filteredAppointments.length });
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
      // Cập nhật trạng thái từ 2 sang 3
      await appointmentService.updateAppointmentStatus(appointment.appointmentId, 3);
      message.success("Đã cập nhật trạng thái sang 'Đang chờ phản hồi'");
      setSelectedAppointment(appointment);
      setIsReactionModalVisible(true); // Mở modal nhập phản ứng
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái sang 3:", error);
      message.error("Cập nhật trạng thái thất bại.");
    }
  };

  const handleSaveReaction = async () => {
    if (!selectedAppointment) return;
    try {
      const values = await reactionForm.validateFields();
      const reaction = values.reaction;
      // Cập nhật trạng thái sang 4 và lưu phản ứng
      await appointmentService.updateAppointmentStatus(selectedAppointment.appointmentId, 4);
      const updatedAppointments = appointments.map((appointment) =>
        appointment.appointmentId === selectedAppointment.appointmentId
          ? { ...appointment, appointmentStatus: 4, reaction }
          : appointment
      );
      setAppointments(updatedAppointments);
      message.success("Đã cập nhật trạng thái sang 'Đã hoàn tất' và lưu phản ứng");
      setIsReactionModalVisible(false);
      reactionForm.resetFields();
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

  const columns = [
    {
      title: "Tên Phụ huynh",
      key: "userFullName",
      render: (appointment: AppointmentResponseDTO) =>
        appointment.childId !== null && childMap[appointment.childId]?.userFullName
          ? childMap[appointment.childId].userFullName
          : "N/A",
    },
    {
      title: "Tên Trẻ em",
      key: "childFullName",
      render: (appointment: AppointmentResponseDTO) =>
        appointment.childId !== null && childMap[appointment.childId]?.childFullName
          ? childMap[appointment.childId].childFullName
          : "N/A",
    },
    {
      title: "Ngày hẹn",
      dataIndex: "appointmentDate",
      render: (date: string) => (date ? moment(date).format("DD/MM/YYYY") : "N/A"),
    },
    {
      title: "Trạng thái",
      key: "appointmentStatus",
      render: (appointment: AppointmentResponseDTO) => getAppointmentStatusText(appointment.appointmentStatus),
    },
    {
      title: "Phản ứng",
      dataIndex: "reaction",
      render: (reaction: string) => reaction || "N/A",
    },
    {
      title: "Hoạt động",
      dataIndex: "isActive",
      render: (isActive: number) => getIsActiveText(isActive),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, appointment: AppointmentResponseDTO) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(appointment)} />
          <Button type="primary" size="small" icon={<CheckOutlined />} onClick={() => handleConfirmClick(appointment)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto mt-12">
      <h2 className="text-2xl font-bold text-center p-2">QUẢN LÝ LỊCH HẸN TIÊM CHỦNG</h2>
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
            <ReloadOutlined onClick={handleReset} style={{ fontSize: "24px", cursor: "pointer" }} />
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

      <Modal title="Chi tiết Lịch hẹn" open={isDetailModalVisible} onCancel={handleCloseModal} footer={null}>
        {selectedAppointment && (
          <div style={{ padding: 16 }}>
            <p>
              <strong>Tên Phụ huynh:</strong>{" "}
              {selectedAppointment.childId !== null && childMap[selectedAppointment.childId]?.userFullName
                ? childMap[selectedAppointment.childId].userFullName
                : "N/A"}
            </p>
            <p>
              <strong>Tên Trẻ em:</strong>{" "}
              {selectedAppointment.childId !== null && childMap[selectedAppointment.childId]?.childFullName
                ? childMap[selectedAppointment.childId].childFullName
                : "N/A"}
            </p>
            <p>
              <strong>Ngày hẹn:</strong>{" "}
              {selectedAppointment.appointmentDate
                ? moment(selectedAppointment.appointmentDate).format("DD/MM/YYYY")
                : "N/A"}
            </p>
            <p>
              <strong>Trạng thái:</strong> {getAppointmentStatusText(selectedAppointment.appointmentStatus)}
            </p>
            <p>
              <strong>Phản ứng:</strong> {selectedAppointment.reaction || "N/A"}
            </p>
            <p>
              <strong>Hoạt động:</strong> {getIsActiveText(selectedAppointment.isActive)}
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