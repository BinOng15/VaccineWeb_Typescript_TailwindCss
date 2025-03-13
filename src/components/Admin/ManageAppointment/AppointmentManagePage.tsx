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
} from "antd";
import {
  ReloadOutlined,
  EyeOutlined,
  CheckOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import moment from "moment";
import { AppointmentResponseDTO } from "../../../models/Appointment";
import { ChildProfileResponseDTO } from "../../../models/ChildProfile";
import { VaccineResponseDTO } from "../../../models/Vaccine";
import { VaccinePackageResponseDTO } from "../../../models/VaccinePackage";
import vaccineService from "../../../service/vaccineService";
import vaccinePackageService from "../../../service/vaccinePackageService";
import childProfileService from "../../../service/childProfileService";
import appointmentService from "../../../service/appointmentService";
import { ColumnType } from "antd/es/table";

const { Search } = Input;

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
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentResponseDTO | null>(null);
  const [childProfiles, setChildProfiles] = useState<ChildProfileResponseDTO[]>(
    []
  );
  const [vaccines, setVaccines] = useState<VaccineResponseDTO[]>([]);
  const [vaccinePackages, setVaccinePackages] = useState<
    VaccinePackageResponseDTO[]
  >([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const allVaccines = await vaccineService.getAllVaccines();
      const allVaccinePackages = await vaccinePackageService.getAllPackages();
      setVaccines(allVaccines);
      setVaccinePackages(allVaccinePackages);

      const allChildProfiles = await childProfileService.getAllChildProfiles();
      setChildProfiles(allChildProfiles);

      const allAppointments = await appointmentService.getAllAppointments();
      const filteredAppointments = allAppointments;
      setAppointments(filteredAppointments);
      setOriginalAppointments(filteredAppointments);
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
            .find((p) => p.packageId === appointment.vaccinePackageId)
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
    setAppointments(originalAppointments);
    setPagination({
      ...pagination,
      current: 1,
      total: originalAppointments.length,
    });
  };

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
      content:
        "Bạn có chắc muốn xác nhận lịch hẹn này không? (Trạng thái sẽ chuyển sang 'Chờ tiêm')",
      okText: "Xác nhận",
      okType: "primary",
      cancelText: "Hủy bỏ",
      onOk: async () => {
        try {
          await appointmentService.updateAppointmentStatus(appointmentId, 2);
          message.success("Xác nhận lịch hẹn thành công");

          const updatedAppointments = appointments.map((appointment) =>
            appointment.appointmentId === appointmentId
              ? { ...appointment, appointmentStatus: 2 }
              : appointment
          );
          const updatedOriginalAppointments = originalAppointments.map(
            (appointment) =>
              appointment.appointmentId === appointmentId
                ? { ...appointment, appointmentStatus: 2 }
                : appointment
          );
          setAppointments(updatedAppointments);
          setOriginalAppointments(updatedOriginalAppointments);
        } catch (error) {
          console.error("Failed to confirm appointment:", error);
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
      render: (_: any, __: AppointmentResponseDTO, index: number) => {
        const currentIndex =
          (pagination.current - 1) * pagination.pageSize + index + 1;
        return currentIndex;
      },
    },
    {
      title: "Tên Trẻ em",
      dataIndex: "childId",
      key: "ChildName",
      width: 200,
      render: (childId: number) => {
        const child = childProfiles.find(
          (profile) => profile.childId === childId
        );
        return child ? child.fullName : "Không tìm thấy tên";
      },
    },
    {
      title: "Tên Vắc xin",
      dataIndex: "vaccineId",
      key: "VaccineName",
      width: 150,
      render: (vaccineId: number) => {
        const vaccine = vaccines.find((v) => v.vaccineId === vaccineId);
        return vaccine ? vaccine.name : "";
      },
    },
    {
      title: "Tên Gói vắc xin",
      dataIndex: "vaccinePackageId",
      key: "VaccinePackageName",
      width: 150,
      render: (vaccinePackageId: number) => {
        const packageItem = vaccinePackages.find(
          (p) => p.packageId === vaccinePackageId
        );
        return packageItem ? packageItem.name : "";
      },
    },
    {
      title: "Ngày hẹn",
      dataIndex: "appointmentDate",
      key: "AppointmentDate",
      width: 100,
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
      title: "Ngày tạo",
      dataIndex: "createdDate",
      key: "CreatedDate",
      width: 100,
      render: (date: string) =>
        date ? moment(date).format("DD/MM/YYYY") : "N/A",
    },
    {
      title: "Người tạo",
      dataIndex: "createdBy",
      key: "CreatedBy",
      width: 150,
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      render: (_: any, record: AppointmentResponseDTO) => (
        <Space>
          <EyeOutlined
            onClick={() => handleViewDetail(record)}
            style={{ color: "blue", cursor: "pointer" }}
          />
          <CheckOutlined
            onClick={() =>
              handleConfirmAppointment(
                record.appointmentId,
                record.appointmentStatus
              )
            }
            style={{ color: "green", cursor: "pointer", marginLeft: "8px" }}
            title="Xác nhận lịch hẹn"
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

      {/* Modal hiển thị chi tiết thông tin */}
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
                (p) => p.packageId === selectedAppointment.vaccinePackageId
              )?.name || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày hẹn">
              {selectedAppointment.appointmentDate
                ? moment(selectedAppointment.appointmentDate).format(
                    "DD/MM/YYYY HH:mm"
                  )
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái hẹn">
              {getStatusText(selectedAppointment.appointmentStatus)}
            </Descriptions.Item>
            <Descriptions.Item label="Hoạt động">
              {selectedAppointment.isActive === 1 ? "Có" : "Không"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {selectedAppointment.createdDate
                ? moment(selectedAppointment.createdDate).format(
                    "HH:mm - DD/MM/YYYY"
                  )
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Người tạo">
              {selectedAppointment.createdBy || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sửa đổi">
              {selectedAppointment.modifiedDate
                ? moment(selectedAppointment.modifiedDate).format(
                    "HH:mm - DD/MM/YYYY"
                  )
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Người sửa đổi">
              {selectedAppointment.modifiedBy || "N/A"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AppointmentManagePage;
