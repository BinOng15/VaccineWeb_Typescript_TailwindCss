/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Table, Input, Space, Row, Col, Modal } from "antd";
import { ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import { axiosInstance } from "../../../service/axiosInstance";
import moment from "moment"; // Để định dạng ngày tháng

const { Search } = Input;

// Giao diện AppointmentResponseDTO dựa trên API bạn cung cấp
interface AppointmentResponseDTO {
  appointmentId: number;
  paymentId: number | null;
  childId: number;
  vaccineId: number;
  vaccinePackageId: number;
  appointmentDate: string;
  appointmentStatus: number;
  isActive: number;
  createdDate: string;
  createdBy: string;
  modifiedDate: string;
  modifiedBy: string;
  payment: any | null;
  childProfile: any | null;
  vaccine: any | null;
  vaccinePackage: any | null;
}

const AppointmentManagePage: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponseDTO | null>(null);

  // Hàm fetchAppointments để lấy tất cả lịch hẹn từ API
  const fetchAppointments = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    keyword = searchKeyword
  ) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/Appointment/get-all", {
        params: {
          page: page,
          pageSize: pageSize,
          keyword: keyword || undefined,
        },
      });
      const data = response.data; // Giả định API trả về mảng trực tiếp
      setAppointments(data || []);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: data.length || 0, // Nếu API không trả về total, dùng độ dài mảng
      });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách lịch hẹn:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleTableChange = (pagination: any) => {
    const { current, pageSize } = pagination;
    fetchAppointments(current, pageSize);
  };

  const onSearch = (value: string) => {
    setSearchKeyword(value);
    fetchAppointments(1, pagination.pageSize, value);
  };

  const handleReset = () => {
    setSearchKeyword("");
    fetchAppointments(1, pagination.pageSize, "");
  };

  // Hàm handleViewDetail để xem chi tiết lịch hẹn
  const handleViewDetail = (appointment: AppointmentResponseDTO) => {
    if (!appointment || typeof appointment.appointmentId !== "number") {
      console.error("Dữ liệu lịch hẹn không hợp lệ:", appointment);
      return;
    }
    console.log("Xem chi tiết lịch hẹn:", appointment);
    setSelectedAppointment(appointment);
    setIsDetailModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalVisible(false);
    setSelectedAppointment(null);
  };

  // Chuyển đổi giá trị số sang chuỗi cho appointmentStatus
  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return "Đã xác nhận";
      case 0:
        return "Chưa xác nhận";
      default:
        return "Không xác định";
    }
  };

  const columns = [
    { title: "ID Lịch hẹn", dataIndex: "appointmentId", key: "AppointmentId", width: 120 },
    { title: "ID Trẻ em", dataIndex: "childId", key: "ChildId", width: 100 },
    { title: "ID Vắc xin", dataIndex: "vaccineId", key: "VaccineId", width: 100 },
    { title: "ID Gói vắc xin", dataIndex: "vaccinePackageId", key: "VaccinePackageId", width: 120 },
    {
      title: "Ngày hẹn",
      dataIndex: "appointmentDate",
      key: "AppointmentDate",
      width: 150,
      render: (date: string) =>
        date ? moment(date).format("DD/MM/YYYY") : "N/A",
    },
    {
      title: "Trạng thái hẹn",
      dataIndex: "appointmentStatus",
      key: "AppointmentStatus",
      width: 120,
      render: (status: number) => getStatusText(status),
    },
    {
      title: "Hoạt động",
      dataIndex: "isActive",
      key: "IsActive",
      width: 100,
      render: (isActive: number) => (isActive === 1 ? "Có" : "Không"),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      key: "CreatedDate",
      width: 150,
      render: (date: string) =>
        date ? moment(date).format("DD/MM/YYYY HH:mm:ss") : "N/A",
    },
    { title: "Người tạo", dataIndex: "createdBy", key: "CreatedBy", width: 120 },
    {
      title: "Ngày sửa",
      dataIndex: "modifiedDate",
      key: "ModifiedDate",
      width: 150,
      render: (date: string) =>
        date ? moment(date).format("DD/MM/YYYY HH:mm:ss") : "N/A",
    },
    { title: "Người sửa", dataIndex: "modifiedBy", key: "ModifiedBy", width: 120 },
    {
      title: "Xem chi tiết",
      key: "action",
      width: 100,
      render: (_: any, record: AppointmentResponseDTO) => (
        <Space>
          <EyeOutlined
            onClick={() => handleViewDetail(record)}
            style={{ color: "blue", cursor: "pointer" }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-center p-2 rounded-t-lg">
        DANH SÁCH LỊCH HẸN TIÊM CHỦNG
      </h2>
      <Row
        justify="space-between"
        style={{ marginBottom: 16, marginTop: 24 }} // Khoảng cách với header
      >
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
          showQuickJumper: true,
        }}
        loading={loading}
        onChange={handleTableChange}
      />

      {/* Modal hiển thị chi tiết thông tin */}
      <Modal
        title="Chi tiết Lịch hẹn tiêm chủng"
        visible={isDetailModalVisible}
        onCancel={handleCloseModal}
        footer={null}
      >
        {selectedAppointment && (
          <div style={{ padding: 16 }}>
            <p><strong>ID Lịch hẹn:</strong> {selectedAppointment.appointmentId}</p>
            <p><strong>ID Thanh toán:</strong> {selectedAppointment.paymentId || "N/A"}</p>
            <p><strong>ID Trẻ em:</strong> {selectedAppointment.childId}</p>
            <p><strong>ID Vắc xin:</strong> {selectedAppointment.vaccineId}</p>
            <p><strong>ID Gói vắc xin:</strong> {selectedAppointment.vaccinePackageId}</p>
            <p>
              <strong>Ngày hẹn:</strong>{" "}
              {selectedAppointment.appointmentDate
                ? moment(selectedAppointment.appointmentDate).format("DD/MM/YYYY")
                : "N/A"}
            </p>
            <p><strong>Trạng thái hẹn:</strong> {getStatusText(selectedAppointment.appointmentStatus)}</p>
            <p>
              <strong>Hoạt động:</strong>{" "}
              {selectedAppointment.isActive === 1 ? "Có" : "Không"}
            </p>
            <p>
              <strong>Ngày tạo:</strong>{" "}
              {selectedAppointment.createdDate
                ? moment(selectedAppointment.createdDate).format("DD/MM/YYYY HH:mm:ss")
                : "N/A"}
            </p>
            <p><strong>Người tạo:</strong> {selectedAppointment.createdBy || "N/A"}</p>
            <p>
              <strong>Ngày sửa đổi:</strong>{" "}
              {selectedAppointment.modifiedDate
                ? moment(selectedAppointment.modifiedDate).format("DD/MM/YYYY HH:mm:ss")
                : "N/A"}
            </p>
            <p><strong>Người sửa đổi:</strong> {selectedAppointment.modifiedBy || "N/A"}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AppointmentManagePage;