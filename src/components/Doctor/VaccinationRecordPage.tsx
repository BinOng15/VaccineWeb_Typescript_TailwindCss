/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Table, Input, Space, Row, Col, Modal, Button } from "antd";
import { ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import moment from "moment";
import { axiosInstance } from "../../service/axiosInstance";
import childProfileService from "../../service/childProfileService";
import userService from "../../service/userService";
import { AppointmentResponseDTO } from "../../models/Appointment";
import { ChildProfileResponseDTO } from "../../models/ChildProfile";
import { VaccinationRecordResponseDTO } from "../../models/VaccinationRecord";
import { UserResponseDTO } from "../../models/User";

const { Search } = Input;

const VaccinationRecordPage: React.FC = () => {
  const [records, setRecords] = useState<VaccinationRecordResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isReactionModalVisible, setIsReactionModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<VaccinationRecordResponseDTO | null>(null);
  const [selectedChildName, setSelectedChildName] = useState<string | null>(
    null
  );
  const [childMap, setChildMap] = useState<{
    [key: number]: { childFullName: string; userFullName: string };
  }>({});
  const [appointmentMap, setAppointmentMap] = useState<{
    [key: number]: number;
  }>({});

  const fetchVaccinationRecords = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    keyword = searchKeyword
  ) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        "/api/VaccinationRecord/get-all",
        {
          params: { page, pageSize, keyword: keyword || undefined },
        }
      );
      const recordsData: VaccinationRecordResponseDTO[] = response.data;
      console.log("Vaccination Records:", recordsData);

      if (!recordsData || recordsData.length === 0) {
        setRecords([]);
        setPagination({ current: page, pageSize, total: 0 });
        return;
      }

      const appointmentIds = [
        ...new Set(recordsData.map((record) => record.appointmentId)),
      ];
      console.log("Appointment IDs:", appointmentIds);

      const appointmentPromises = appointmentIds.map(async (appointmentId) => {
        try {
          const response = await axiosInstance.get(
            `/api/Appointment/get-by-id/${appointmentId}`
          );
          const appointment: AppointmentResponseDTO = response.data;
          return { appointmentId, childId: Number(appointment.childId) };
        } catch (error) {
          console.error(`Lỗi khi lấy appointment ${appointmentId}:`, error);
          return { appointmentId, childId: null };
        }
      });

      const appointmentsData = await Promise.all(appointmentPromises);
      console.log("Appointments Data:", appointmentsData);

      const newAppointmentMap = appointmentsData.reduce(
        (acc, { appointmentId, childId }) => {
          if (childId !== null) acc[appointmentId] = childId;
          return acc;
        },
        {} as { [key: number]: number }
      );
      setAppointmentMap(newAppointmentMap);
      console.log("Appointment Map:", newAppointmentMap);

      const childIds = [...new Set(Object.values(newAppointmentMap))];
      console.log("Child IDs:", childIds);

      const childPromises = childIds.map(async (childId) => {
        try {
          const child: ChildProfileResponseDTO =
            await childProfileService.getChildProfileById(childId);
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

      const userIds = [
        ...new Set(childrenData.map((child) => child.userId).filter(Boolean)),
      ];
      console.log("User IDs:", userIds);

      const allUsers: UserResponseDTO[] = await userService.getAllUsers();
      console.log("Dữ liệu từ getAllUsers:", allUsers);
      if (!allUsers || !Array.isArray(allUsers)) {
        console.error(
          "Dữ liệu từ getAllUsers không phải là mảng hoặc không tồn tại:",
          allUsers
        );
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

  const fetchUserAndChildNames = async (
    record: VaccinationRecordResponseDTO
  ) => {
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
    fetchVaccinationRecords(1, pagination.pageSize, "");
  };

  const handleViewDetail = (record: VaccinationRecordResponseDTO) => {
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
    fetchUserAndChildNames(record);
  };

  const handleViewReaction = (record: VaccinationRecordResponseDTO) => {
    setSelectedRecord(record);
    setIsReactionModalVisible(true);
  };

  const handleConfirmVaccination = (record: VaccinationRecordResponseDTO) => {
    console.log(`Xác nhận tiêm cho recordId ${record.recordId}`);
    // Thêm logic gọi API để xác nhận tiêm nếu cần
  };

  const handleCloseModal = () => {
    setIsDetailModalVisible(false);
    setIsReactionModalVisible(false);
    setSelectedRecord(null);
    setSelectedChildName(null);
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
      render: (date: Date | string) =>
        date ? moment(date).format("DD/MM/YYYY") : "N/A",
    },
    { title: "Ghi chú", dataIndex: "notes", key: "notes", width: 200 },
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
      render: (date: Date | string) =>
        date ? moment(date).format("DD/MM/YYYY HH:mm:ss") : "N/A",
    },
    {
      title: "Ngày sửa",
      dataIndex: "modifiedDate",
      key: "modifiedDate",
      width: 150,
      render: (date: Date | string) =>
        date ? moment(date).format("DD/MM/YYYY HH:mm:ss") : "N/A",
    },
    {
      title: "Người sửa",
      dataIndex: "modifiedBy",
      key: "modifiedBy",
      width: 120,
    },
    {
      title: "Xem chi tiết",
      key: "action",
      width: 100,
      render: (_: any, record: VaccinationRecordResponseDTO) => (
        <Space>
          <EyeOutlined
            onClick={() => handleViewDetail(record)}
            style={{ color: "blue", cursor: "pointer" }}
          />
        </Space>
      ),
    },
    {
      title: "Ghi chú phản ứng",
      key: "reaction",
      width: 150,
      render: (_: any, record: VaccinationRecordResponseDTO) => (
        <Button
          type="primary"
          size="small"
          onClick={() => handleViewReaction(record)}
        >
          Ghi chú phản ứng
        </Button>
      ),
    },
    {
      title: "Xác nhận tiêm",
      key: "confirm",
      width: 150,
      render: (_: any, record: VaccinationRecordResponseDTO) => (
        <Button
          type="default"
          size="small"
          onClick={() => handleConfirmVaccination(record)}
        >
          Xác nhận tiêm
        </Button>
      ),
    },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto mt-12">
      <h2 className="text-2xl font-bold text-center p-2 rounded-t-lg">
        QUẢN LÝ QUÁ TRÌNH TIÊM CHỦNG
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
      <Modal
        title="Chi tiết Bản ghi tiêm chủng"
        visible={isDetailModalVisible}
        onCancel={handleCloseModal}
        footer={null}
      >
        {selectedRecord && (
          <div style={{ padding: 16 }}>
            <p>
              <strong>Tên Trẻ em:</strong> {selectedChildName || "N/A"}
            </p>
            <p>
              <strong>Ngày tiêm:</strong>{" "}
              {selectedRecord.administeredDate
                ? moment(selectedRecord.administeredDate).format("DD/MM/YYYY")
                : "N/A"}
            </p>
            <p>
              <strong>Phản ứng:</strong> {selectedRecord.reaction || "N/A"}
            </p>
            <p>
              <strong>Ghi chú:</strong> {selectedRecord.notes || "N/A"}
            </p>
            <p>
              <strong>Hoạt động:</strong>{" "}
              {getIsActiveText(selectedRecord.isActive)}
            </p>
            <p>
              <strong>Ngày tạo:</strong>{" "}
              {selectedRecord.createdDate
                ? moment(selectedRecord.createdDate).format(
                    "DD/MM/YYYY HH:mm:ss"
                  )
                : "N/A"}
            </p>
            <p>
              <strong>Ngày sửa đổi:</strong>{" "}
              {selectedRecord.modifiedDate
                ? moment(selectedRecord.modifiedDate).format(
                    "DD/MM/YYYY HH:mm:ss"
                  )
                : "N/A"}
            </p>
            <p>
              <strong>Người sửa đổi:</strong>{" "}
              {selectedRecord.modifiedBy || "N/A"}
            </p>
          </div>
        )}
      </Modal>

      {/* Modal phản ứng */}
      <Modal
        title="Ghi chú phản ứng"
        visible={isReactionModalVisible}
        onCancel={handleCloseModal}
        footer={null}
      >
        {selectedRecord && (
          <div style={{ padding: 16 }}>
            <p>
              <strong>Phản ứng sau tiêm:</strong>{" "}
              {selectedRecord.reaction || "Không có phản ứng"}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VaccinationRecordPage;
