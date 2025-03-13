/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Table, Space, message, Modal, Row, Col, Button } from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  ReloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { AppointmentResponseDTO } from "../../models/Appointment";
import appointmentService from "../../service/appointmentService";
import childProfileService from "../../service/childProfileService";
import moment from "moment";
import { useAuth } from "../../context/AuthContext";
import { VaccineResponseDTO } from "../../models/Vaccine";
import { VaccinePackageResponseDTO } from "../../models/VaccinePackage";
import vaccineService from "../../service/vaccineService";
import vaccinePackageService from "../../service/vaccinePackageService";
import Search from "antd/es/input/Search";
import { ColumnType } from "antd/es/table";
import { ChildProfileResponseDTO } from "../../models/ChildProfile";
import { useNavigate } from "react-router-dom";

function CustomerAppointment() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<AppointmentResponseDTO[]>(
    []
  );
  const [originalAppointments, setOriginalAppointments] = useState<
    AppointmentResponseDTO[]
  >([]); // Lưu danh sách gốc
  const [loading, setLoading] = useState<boolean>(true);
  const [childProfiles, setChildProfiles] = useState<ChildProfileResponseDTO[]>(
    []
  );
  const [vaccines, setVaccines] = useState<VaccineResponseDTO[]>([]);
  const [vaccinePackages, setVaccinePackages] = useState<
    VaccinePackageResponseDTO[]
  >([]);
  const [searchText, setSearchText] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentResponseDTO | null>(null);
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
      const allVaccinePackages = await vaccinePackageService.getAllPackages();
      setVaccines(allVaccines);
      setVaccinePackages(allVaccinePackages);

      // Lấy danh sách hồ sơ trẻ của user
      const allChildProfiles = await childProfileService.getAllChildProfiles();
      const userChildIds = allChildProfiles
        .filter((profile) => profile.userId === user.userId)
        .map((profile) => profile.childId);
      setChildProfiles(allChildProfiles); // Lưu toàn bộ childProfiles để ánh xạ

      // Lấy tất cả lịch hẹn và lọc theo childId
      const allAppointments = await appointmentService.getAllAppointments();
      const filteredAppointments = allAppointments.filter((appointment) =>
        userChildIds.includes(appointment.childId)
      );
      setAppointments(filteredAppointments);
      setOriginalAppointments(filteredAppointments); // Lưu danh sách gốc
      setPagination({
        current: 1,
        pageSize: pagination.pageSize,
        total: filteredAppointments.length,
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
      message.error(
        "Không thể tải danh sách lịch hẹn: " + (error as Error).message
      );
    } finally {
      setLoading(false);
    }
  };

  // Xử lý tìm kiếm (theo tên trẻ, vaccine, và package)
  const onSearch = (value: string) => {
    const trimmedValue = value.trim().toLowerCase();
    setSearchText(trimmedValue);

    if (!trimmedValue) {
      // Nếu không có từ khóa, hiển thị danh sách gốc
      setAppointments(originalAppointments);
      setPagination({
        ...pagination,
        current: 1,
        total: originalAppointments.length,
      });
      return;
    }

    // Lọc appointments dựa trên tên trẻ, vaccine, hoặc gói vaccine
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

  // Xử lý reset tìm kiếm
  const handleReset = () => {
    setSearchText("");
    setAppointments(originalAppointments);
    setPagination({
      ...pagination,
      current: 1,
      total: originalAppointments.length,
    });
  };

  // Xử lý thay đổi phân trang
  const handleTableChange = (pagination: any) => {
    const { current, pageSize } = pagination;
    setPagination((prev) => ({ ...prev, current, pageSize }));
  };

  // Cột cho Table
  const columns: ColumnType<AppointmentResponseDTO>[] = [
    {
      title: "STT",
      key: "index",
      width: 50,
      align: "center",
      render: (_: any, __: AppointmentResponseDTO, index: number) => {
        const currentIndex =
          (pagination.current - 1) * pagination.pageSize + index + 1;
        return currentIndex;
      },
    },
    {
      title: "Họ tên của trẻ",
      dataIndex: "childId",
      key: "childId",
      render: (childId: number) => {
        const child = childProfiles.find(
          (profile) => profile.childId === childId
        );
        return child ? child.fullName : "Không tìm thấy";
      },
    },
    {
      title: "Ngày hẹn",
      dataIndex: "appointmentDate",
      key: "appointmentDate",
      render: (date: string) => moment(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Vaccine/Gói vaccine",
      key: "vaccineOrPackage",
      render: (record: AppointmentResponseDTO) => {
        if (record.vaccineId) {
          const vaccine = vaccines.find(
            (v) => v.vaccineId === record.vaccineId
          );
          return vaccine ? vaccine.name : "Không tìm thấy vaccine";
        } else if (record.vaccinePackageId) {
          const packageItem = vaccinePackages.find(
            (p) => p.vaccinePackageId === record.vaccinePackageId
          );
          return packageItem ? packageItem.name : "Không tìm thấy gói vaccine";
        }
        return "Không có vaccine hoặc gói vaccine";
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "appointmentStatus",
      key: "appointmentStatus",
      render: (status: number) => {
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
              color: "red",
              cursor: "pointer",
              fontSize: 18,
              marginLeft: 8,
            }}
            onClick={() =>
              confirmCancel(record.appointmentId, record.appointmentStatus)
            }
          />
        </Space>
      ),
    },
  ];

  // Xử lý xem chi tiết
  const showModal = (appointment: AppointmentResponseDTO) => {
    setSelectedAppointment(appointment);
    setIsModalVisible(true);
  };

  // Hàm đóng modal
  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedAppointment(null);
  };

  const handleAdd = () => {
    navigate("/vaccine-registration");
  };

  // Hàm hủy lịch hẹn
  const confirmCancel = (appointmentId: number, currentStatus: number) => {
    if (currentStatus === 5) {
      message.warning("Lịch tiêm đã được hủy trước đó!");
      return;
    }

    Modal.confirm({
      title: "Xác nhận hủy lịch tiêm",
      content:
        "Nếu hủy lịch hẹn tiêm thì bạn sẽ phải liên hệ với quản lý để tiến hành đăng ký lại. Bạn có chắc chắn muốn hủy lịch tiêm không?",
      okText: "Xác nhận",
      okType: "danger",
      cancelText: "Hủy bỏ",
      onOk: async () => {
        try {
          await appointmentService.updateAppointmentStatus(appointmentId, 5);
          message.success("Hủy lịch hẹn thành công");
          setAppointments(
            appointments.map((appointment) =>
              appointment.appointmentId === appointmentId
                ? { ...appointment, appointmentStatus: 5 }
                : appointment
            )
          );
          setOriginalAppointments(
            originalAppointments.map((appointment) =>
              appointment.appointmentId === appointmentId
                ? { ...appointment, appointmentStatus: 5 }
                : appointment
            )
          );
          setPagination({
            ...pagination,
            total: appointments.length,
          });
        } catch (error) {
          console.error("Failed to cancel appointment:", error);
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
                onChange={(e) => setSearchText(e.target.value)} // Chỉ cập nhật giá trị searchText
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
          title="Chi tiết lịch hẹn"
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={null}
        >
          {selectedAppointment && (
            <div>
              <p>
                <strong>ID Lịch hẹn: </strong>{" "}
                {selectedAppointment.appointmentId}
              </p>
              <p>
                <strong>Họ tên của trẻ: </strong>{" "}
                {childProfiles.find(
                  (p) => p.childId === selectedAppointment.childId
                )?.fullName || "Không tìm thấy"}
              </p>
              <p>
                <strong>Vaccine/Gói vaccine: </strong>
                {selectedAppointment.vaccineId
                  ? vaccines.find(
                      (v) => v.vaccineId === selectedAppointment.vaccineId
                    )?.name || "Không tìm thấy vaccine"
                  : selectedAppointment.vaccinePackageId
                  ? vaccinePackages.find(
                      (p) =>
                        p.vaccinePackageId === selectedAppointment.vaccinePackageId
                    )?.name || "Không tìm thấy gói vaccine"
                  : "Không có vaccine hoặc gói vaccine"}
              </p>
              <p>
                <strong>Ngày hẹn: </strong>{" "}
                {moment(selectedAppointment.appointmentDate).format(
                  "DD/MM/YYYY HH:mm"
                )}
              </p>
              <p>
                <strong>Trạng thái: </strong>
                {selectedAppointment.appointmentStatus === 1
                  ? "Đã lên lịch"
                  : selectedAppointment.appointmentStatus === 2
                  ? "Hoàn thành"
                  : selectedAppointment.appointmentStatus === 3
                  ? "Đã hủy"
                  : selectedAppointment.appointmentStatus}
              </p>
              <p>
                <strong>Trạng thái hoạt động: </strong>{" "}
                {selectedAppointment.isActive === 1
                  ? "Hoạt động"
                  : "Không hoạt động"}
              </p>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default CustomerAppointment;
