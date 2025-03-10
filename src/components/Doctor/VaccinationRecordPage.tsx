/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Table, Input, Space, Row, Col, Modal, Button, message } from "antd";
import { ReloadOutlined, EyeOutlined, EditOutlined, CarryOutOutlined } from "@ant-design/icons";
import moment from "moment";

import childProfileService from "../../service/childProfileService";
import userService from "../../service/userService";
import vaccinationRecordService from "../../service/vaccinationRecordService";
import { AppointmentResponseDTO } from "../../models/Appointment";
import { ChildProfileResponseDTO } from "../../models/ChildProfile";
import { UserResponseDTO } from "../../models/User";
import { VaccinationRecordResponseDTO, UpdateVaccinationRecordDTO } from "../../models/VaccinationRecord";
import { AxiosError } from "axios";
import { axiosInstance } from "../../service/axiosInstance";

const { Search } = Input;

const VaccinationRecordPage: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentResponseDTO[]>([]);
  const [originalAppointments, setOriginalAppointments] = useState<AppointmentResponseDTO[]>([]);
  const [records, setRecords] = useState<VaccinationRecordResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<VaccinationRecordResponseDTO | null>(null);
  const [editedNotes, setEditedNotes] = useState<string>("");
  const [selectedChildName, setSelectedChildName] = useState<string | null>(null);
  const [childMap, setChildMap] = useState<{
    [key: number]: { childFullName: string; userFullName: string };
  }>({});
  const [appointmentMap, setAppointmentMap] = useState<{ [key: number]: number }>({});
  const [appointmentStatusMap, setAppointmentStatusMap] = useState<{ [key: number]: number }>({});

  // Hàm chuyển đổi appointmentStatus thành chuỗi văn bản
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

  const fetchVaccinationRecords = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    keyword = searchKeyword
  ) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/VaccinationRecord/get-all", {
        params: { page, pageSize, keyword: keyword || undefined },
      });
      const recordsData: VaccinationRecordResponseDTO[] = response.data;
      console.log("Vaccination Records:", recordsData);

      if (!recordsData || recordsData.length === 0) {
        setRecords([]);
        setPagination({ current: page, pageSize, total: 0 });
        return;
      }

      const appointmentIds = [...new Set(recordsData.map((record) => record.appointmentId))];
      console.log("Appointment IDs:", appointmentIds);

      const appointmentPromises = appointmentIds.map(async (appointmentId) => {
        try {
          const response = await axiosInstance.get(`/api/Appointment/get-by-id/${appointmentId}`);
          const appointment: AppointmentResponseDTO = response.data;
          return {
            appointmentId,
            childId: Number(appointment.childId),
            appointmentStatus: appointment.appointmentStatus,
          };
        } catch (error) {
          console.error(`Lỗi khi lấy appointment ${appointmentId}:`, error);
          return { appointmentId, childId: null, appointmentStatus: null };
        }
      });

      const appointmentsData = await Promise.all(appointmentPromises);
      console.log("Appointments Data:", appointmentsData);

      const newAppointmentMap = appointmentsData.reduce((acc, { appointmentId, childId }) => {
        if (childId !== null) acc[appointmentId] = childId;
        return acc;
      }, {} as { [key: number]: number });
      setAppointmentMap(newAppointmentMap);
      console.log("Appointment Map:", newAppointmentMap);

      const newAppointmentStatusMap = appointmentsData.reduce((acc, { appointmentId, appointmentStatus }) => {
        if (appointmentStatus !== null) acc[appointmentId] = appointmentStatus;
        return acc;
      }, {} as { [key: number]: number });
      setAppointmentStatusMap(newAppointmentStatusMap);
      console.log("Appointment Status Map:", newAppointmentStatusMap);

      const childIds = [...new Set(Object.values(newAppointmentMap))];
      console.log("Child IDs:", childIds);

      const childPromises = childIds.map(async (childId) => {
        try {
          const child: ChildProfileResponseDTO = await childProfileService.getChildProfileById(childId);
          console.log(`Child với childId ${childId}:`, child);
          console.log(`UserId từ child ${childId}:`, child.userId);
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
      console.log("Children Data:", childrenData);

      const userIds = [...new Set(childrenData.map((child) => child.userId).filter(Boolean))];
      console.log("User IDs:", userIds);

      const allUsers: UserResponseDTO[] = await userService.getAllUsers();
      console.log("Dữ liệu từ getAllUsers:", allUsers);
      if (!allUsers || !Array.isArray(allUsers)) {
        console.error("Dữ liệu từ getAllUsers không phải là mảng hoặc không tồn tại:", allUsers);
      }

      const userMap = allUsers.reduce((acc, user: any) => {
        acc[user.userId] = user.fullName || "N/A";
        return acc;
      }, {} as { [key: number]: string });
      console.log("User Map:", userMap);

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
      console.log("New Child Map trước khi set:", newChildMap);
      setChildMap(newChildMap);

      setRecords(recordsData);
      setPagination({ current: page, pageSize, total: recordsData.length });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bản ghi tiêm chủng:", error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAndChildNames = async (record: VaccinationRecordResponseDTO) => {
    try {
      const childId = appointmentMap[record.appointmentId];
      if (childId && childMap[childId]) {
        setSelectedChildName(childMap[childId].childFullName);
      } else {
        setSelectedChildName("N/A");
      }
    } catch (error) {
      console.error("Lỗi khi lấy childName:", error);
      setSelectedChildName("N/A");
    }
  };

  const handleResponseAppointment = (record: VaccinationRecordResponseDTO) => {
    setSelectedRecord(record);
    setEditedNotes(record.notes || "");
    setIsEditModalVisible(true);
  };

  // Khi bấm EditOutlined, nếu trạng thái là 2 thì hiển thị thông báo lỗi
  const handleEditClick = (record: VaccinationRecordResponseDTO) => {
    const currentStatus = appointmentStatusMap[record.appointmentId] || 0;
    if (currentStatus === 3) {
      message.error("Không thể chỉnh sửa bản ghi khi trạng thái là 'Đang chờ tiêm'");
      return;
    }
    handleResponseAppointment(record);
  };

  // Khi bấm CarryOutOutlined, nếu trạng thái là 3 thì hiển thị thông báo lỗi
  const handleCarryOutClick = (record: VaccinationRecordResponseDTO) => {
    const currentStatus = appointmentStatusMap[record.appointmentId] || 0;
    if (currentStatus === 4 ) {
      message.error("Bản ghi đã hoàn thành, không thể thực hiện hành động này");
      return;
    }
    handleConfirmAppointment(record.appointmentId, currentStatus);
  };

  const handleConfirmAppointment = async (
    appointmentId: number,
    currentStatus: number
  ) => {
    if (currentStatus === 2 || currentStatus === 1 || currentStatus === 5) {
      message.warning("Không thể hoàn tất tiêm chủng khi chưa xác nhận phản ứng!");
      return;
    }

    Modal.confirm({
      title: "Xác nhận lịch hẹn",
      content:
        "Bạn có chắc muốn xác nhận lịch hẹn này không? (Trạng thái sẽ chuyển sang 'Chờ tiêm')",
      okText: "Xác nhận",
      okType: "primary",
      cancelText: "Hủy bỏ",
      onOk: async () => {
        try {
          await vaccinationRecordService.updateAppointmentStatus(appointmentId, 4);
          message.success("Xác nhận lịch hẹn thành công");

          const updatedAppointments = appointments.map((appointment) =>
            appointment.appointmentId === appointmentId
              ? { ...appointment, appointmentStatus: 4 }
              : appointment
          );
          const updatedOriginalAppointments = originalAppointments.map((appointment) =>
            appointment.appointmentId === appointmentId
              ? { ...appointment, appointmentStatus: 4 }
              : appointment
          );
          setAppointments(updatedAppointments);
          setOriginalAppointments(updatedOriginalAppointments);
        } catch (error) {
          console.error("Failed to confirm appointment:", error);
          message.error("Xác nhận lịch hẹn thất bại: " + (error as Error).message);
        }
      },
    });
  };

  const handleSaveNotes = async () => {
    if (!selectedRecord) return;

    try {
      const updatedData: UpdateVaccinationRecordDTO = {
        notes: editedNotes,
      };

      console.log("Updating record with:", {
        recordId: selectedRecord.recordId,
        notes: editedNotes,
      });
      console.log("Appointment ID:", selectedRecord.appointmentId);

      if (!selectedRecord.appointmentId) {
        message.error("Appointment ID không hợp lệ!");
        return;
      }

      const updateRecordSuccess = await vaccinationRecordService.updateVaccinationRecord(
        selectedRecord.recordId,
        updatedData
      );
      if (!updateRecordSuccess) {
        message.error("Cập nhật ghi chú thất bại!");
        return;
      }

      const appointmentId = selectedRecord.appointmentId;
      const updateStatusSuccess = await vaccinationRecordService.updateAppointmentStatus(appointmentId, 3);
      if (!updateStatusSuccess) {
        message.error("Cập nhật trạng thái thất bại!");
        return;
      }

      message.success("Cập nhật ghi chú và trạng thái thành công");

      setRecords((prev) =>
        prev.map((record) =>
          record.recordId === selectedRecord.recordId ? { ...record, notes: editedNotes } : record
        )
      );

      setAppointmentStatusMap((prev) => ({
        ...prev,
        [appointmentId]: 3,
      }));
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.appointmentId === appointmentId ? { ...appointment, appointmentStatus: 3 } : appointment
        )
      );
      setOriginalAppointments((prev) =>
        prev.map((appointment) =>
          appointment.appointmentId === appointmentId ? { ...appointment, appointmentStatus: 3 } : appointment
        )
      );

      setIsEditModalVisible(false);
      setSelectedRecord(null);
      setEditedNotes("");
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Lỗi Axios khi cập nhật ghi chú hoặc trạng thái:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data,
        });

        if (error.response?.status === 400) {
          if (error.response?.data?.message) {
            message.error(`Cập nhật thất bại: ${error.response.data.message}`);
          } else {
            message.error("Yêu cầu không hợp lệ. Vui lòng kiểm tra lại dữ liệu.");
          }
          console.log("Dữ liệu phản hồi lỗi 400:", error.response?.data);
        } else {
          message.error(
            `Cập nhật thất bại: ${error.response?.data?.message || error.message} (Mã lỗi: ${error.response?.status})`
          );
        }
      } else {
        console.error("Lỗi không xác định khi cập nhật ghi chú hoặc trạng thái:", error);
        message.error("Cập nhật ghi chú hoặc trạng thái thất bại: " + (error as Error).message);
      }
    }
  };

  useEffect(() => {
    fetchVaccinationRecords();
  }, []);

  const handleTableChange = (pagination: any) => {
    fetchVaccinationRecords(pagination.current, pagination.pageSize);
  };

  const onSearch = (value: string) => {
    setSearchKeyword(value);
    fetchVaccinationRecords(1, pagination.pageSize, value);
  };

  const handleReset = () => {
    setSearchKeyword("");
    setAppointments(originalAppointments);
    fetchVaccinationRecords(1, pagination.pageSize, "");
  };

  const handleViewDetail = (record: VaccinationRecordResponseDTO) => {
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
    fetchUserAndChildNames(record);
  };

  const handleCloseModal = () => {
    setIsDetailModalVisible(false);
    setIsEditModalVisible(false);
    setSelectedRecord(null);
    setSelectedChildName(null);
    setEditedNotes("");
  };

  const getIsActiveText = (isActive: number) => {
    return isActive === 1 ? "Có" : isActive === 0 ? "Không" : "Không xác định";
  };

  const columns = [
    {
      title: "Tên Phụ huynh",
      key: "fullName",
      width: 150,
      render: (record: VaccinationRecordResponseDTO) => {
        const childId = appointmentMap[record.appointmentId];
        return childId ? childMap[childId]?.userFullName || "N/A" : "N/A";
      },
    },
    {
      title: "Tên Trẻ em",
      key: "fullName",
      width: 150,
      render: (record: VaccinationRecordResponseDTO) => {
        const childId = appointmentMap[record.appointmentId];
        return childId ? childMap[childId]?.childFullName || "N/A" : "N/A";
      },
    },
    {
      title: "Ngày tiêm",
      dataIndex: "administeredDate",
      key: "administeredDate",
      width: 150,
      render: (date: Date | string) => (date ? moment(date).format("DD/MM/YYYY") : "N/A"),
    },
    { title: "Ghi chú", dataIndex: "notes", key: "notes", width: 200 },
    {
      title: "Trạng thái",
      key: "appointmentStatus",
      width: 150,
      render: (record: VaccinationRecordResponseDTO) => {
        const status = appointmentStatusMap[record.appointmentId] || 0;
        return getAppointmentStatusText(status);
      },
    },
    {
      title: "Hoạt động",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      render: (isActive: number) => getIsActiveText(isActive),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 150,
      render: (date: Date | string) => (date ? moment(date).format("DD/MM/YYYY HH:mm:ss") : "N/A"),
    },
    {
      title: "Ngày sửa",
      dataIndex: "modifiedDate",
      key: "modifiedDate",
      width: 150,
      render: (date: Date | string) => (date ? moment(date).format("DD/MM/YYYY HH:mm:ss") : "N/A"),
    },
    {
      title: "Người sửa",
      dataIndex: "modifiedBy",
      key: "modifiedBy",
      width: 120,
    },
    {
      title: "Hành động",
      key: "action",
      width: 250,
      render: (_: any, record: VaccinationRecordResponseDTO) => (
        <Space>
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)} />
          <Button type="primary" size="small" icon={<EditOutlined />} onClick={() => handleEditClick(record)} />
          <Button type="default" size="small" icon={<CarryOutOutlined />} onClick={() => handleCarryOutClick(record)} />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto mt-12">
      <h2 className="text-2xl font-bold text-center p-2 rounded-t-lg">QUẢN LÝ QUÁ TRÌNH TIÊM CHỦNG</h2>
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
        dataSource={records}
        rowKey="recordId"
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

      {/* Modal chi tiết */}
      <Modal title="Chi tiết Bản ghi tiêm chủng" open={isDetailModalVisible} onCancel={handleCloseModal} footer={null}>
        {selectedRecord && (
          <div style={{ padding: 16 }}>
            <p>
              <strong>Tên Trẻ em:</strong> {selectedChildName || "N/A"}
            </p>
            <p>
              <strong>Ngày tiêm:</strong>{" "}
              {selectedRecord.administeredDate ? moment(selectedRecord.administeredDate).format("DD/MM/YYYY") : "N/A"}
            </p>
            <p>
              <strong>Phản ứng:</strong> {selectedRecord.reaction || "N/A"}
            </p>
            <p>
              <strong>Ghi chú:</strong> {selectedRecord.notes || "N/A"}
            </p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              {getAppointmentStatusText(appointmentStatusMap[selectedRecord.appointmentId] || 0)}
            </p>
            <p>
              <strong>Hoạt động:</strong> {getIsActiveText(selectedRecord.isActive)}
            </p>
            <p>
              <strong>Ngày tạo:</strong>{" "}
              {selectedRecord.createdDate ? moment(selectedRecord.createdDate).format("DD/MM/YYYY HH:mm:ss") : "N/A"}
            </p>
            <p>
              <strong>Ngày sửa đổi:</strong>{" "}
              {selectedRecord.modifiedDate ? moment(selectedRecord.modifiedDate).format("DD/MM/YYYY HH:mm:ss") : "N/A"}
            </p>
            <p>
              <strong>Người sửa đổi:</strong> {selectedRecord.modifiedBy || "N/A"}
            </p>
          </div>
        )}
      </Modal>

      {/* Modal chỉnh sửa ghi chú */}
      <Modal
        title="Chỉnh sửa Ghi chú"
        open={isEditModalVisible}
        onOk={handleSaveNotes}
        onCancel={handleCloseModal}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Input.TextArea
          value={editedNotes}
          onChange={(e) => setEditedNotes(e.target.value)}
          rows={4}
          placeholder="Nhập ghi chú mới"
        />
      </Modal>
    </div>
  );
};

export default VaccinationRecordPage;
