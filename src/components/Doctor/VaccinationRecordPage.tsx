/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Table, Input, Space, Row, Col, Modal } from "antd";
import { ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import moment from "moment";
import { axiosInstance } from "../../service/axiosInstance";
import childProfileService from "../../service/childProfileService";
import userService from "../../service/userService";

const { Search } = Input;

// Giao diện VaccinationRecordResponseDTO
interface VaccinationRecordResponseDTO {
  recordId: number;
  appointmentId: number;
  childId: number;
  administeredDate: string;
  reaction: string;
  notes: string;
  isActive: number;
  createdDate: string;
  createdBy: string;
  modifiedDate: string;
  modifiedBy: string;
}

// Giao diện ChildProfileResponseDTO
interface ChildProfileResponseDTO {
  childId: number;
  userId: number;
  fullName: string;
  // Các trường khác nếu cần
}

// Giao diện UserResponseDTO
interface UserResponseDTO {
  userId: number;
  fullName: string;
  // Các trường khác nếu cần
}

// Giao diện mở rộng để thêm thông tin tên trẻ và tên người thân
interface VaccinationRecordWithNames extends VaccinationRecordResponseDTO {
  childName: string;
  parentName: string;
}

const VaccinationRecordPage: React.FC = () => {
  const [records, setRecords] = useState<VaccinationRecordWithNames[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<VaccinationRecordWithNames | null>(null);

  // Hàm fetchVaccinationRecords để lấy tất cả bản ghi tiêm chủng từ API
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
          params: {
            page: page,
            pageSize: pageSize,
            keyword: keyword || undefined,
          },
        }
      );
      const data: VaccinationRecordResponseDTO[] = response.data || [];
      console.log("Dữ liệu từ API VaccinationRecord:", data);

      // Lấy danh sách childId duy nhất từ dữ liệu
      const childIds = [...new Set(data.map((record) => record.childId))];
      console.log("Child IDs:", childIds);

      // Gọi API lấy tất cả ChildProfile theo danh sách childId
      const childProfiles: (ChildProfileResponseDTO | null)[] =
        await Promise.all(
          childIds.map(async (childId) => {
            try {
              return await childProfileService.getChildProfileById(childId);
            } catch (error) {
              console.error(
                `Lỗi khi lấy ChildProfile cho childId ${childId}:`,
                error
              );
              return null;
            }
          })
        );
      const validChildProfiles = childProfiles.filter(
        (profile) => profile !== null
      ) as ChildProfileResponseDTO[];
      console.log("Child Profiles:", validChildProfiles);

      // Lấy danh sách userId duy nhất từ ChildProfile
      const userIds = [
        ...new Set(validChildProfiles.map((profile) => profile.userId)),
      ];
      console.log("User IDs:", userIds);

      // Gọi API lấy tất cả User theo danh sách userId
      const users: (UserResponseDTO | null)[] = await Promise.all(
        userIds.map(async (userId) => {
          try {
            return await userService.getUserById(userId);
          } catch (error) {
            console.error(`Lỗi khi lấy User cho userId ${userId}:`, error);
            return null;
          }
        })
      );
      const validUsers = users.filter(
        (user) => user !== null
      ) as UserResponseDTO[];
      console.log("Users:", validUsers);

      // Tạo bản đồ để tra cứu nhanh
      const childProfileMap = new Map(
        validChildProfiles.map((profile) => [profile.childId, profile])
      );
      const userMap = new Map(validUsers.map((user) => [user.userId, user]));

      // Thêm tên trẻ và tên người thân vào bản ghi
      const recordsWithNames: VaccinationRecordWithNames[] = data.map(
        (record) => {
          const childProfile = childProfileMap.get(record.childId) || {
            fullName: "N/A",
          };
          const user = childProfile.userId
            ? userMap.get(childProfile.userId) || { fullName: "N/A" }
            : { fullName: "N/A" };
          return {
            ...record,
            childName: childProfile.fullName || "N/A",
            parentName: user.fullName || "N/A",
          };
        }
      );

      setRecords(recordsWithNames);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: recordsWithNames.length || 0,
      });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách bản ghi tiêm chủng:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    fetchVaccinationRecords();
  }, []);

  const handleTableChange = (pagination: any) => {
    const { current, pageSize } = pagination;
    fetchVaccinationRecords(current, pageSize);
  };

  const onSearch = (value: string) => {
    setSearchKeyword(value);
    fetchVaccinationRecords(1, pagination.pageSize, value);
  };

  const handleReset = () => {
    setSearchKeyword("");
    fetchVaccinationRecords(1, pagination.pageSize, "");
  };

  // Hàm handleViewDetail để xem chi tiết bản ghi tiêm chủng
  const handleViewDetail = (record: VaccinationRecordWithNames) => {
    if (!record || typeof record.recordId !== "number") {
      console.error("Dữ liệu bản ghi không hợp lệ:", record);
      return;
    }
    console.log("Xem chi tiết bản ghi tiêm chủng:", record);
    setSelectedRecord(record);
    setIsDetailModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalVisible(false);
    setSelectedRecord(null);
  };

  // Chuyển đổi giá trị số sang chuỗi cho isActive
  const getIsActiveText = (isActive: number) => {
    switch (isActive) {
      case 1:
        return "Có";
      case 0:
        return "Không";
      default:
        return "Không xác định";
    }
  };

  const columns = [
    {
      title: "Tên trẻ",
      dataIndex: "childName",
      key: "childName",
      width: 150,
    },
    {
      title: "Tên người thân",
      dataIndex: "parentName",
      key: "parentName",
      width: 150,
    },
    {
      title: "Ngày tiêm",
      dataIndex: "administeredDate",
      key: "administeredDate",
      width: 150,
      render: (date: string) =>
        date ? moment(date).format("DD/MM/YYYY") : "N/A",
    },
    { title: "Phản ứng", dataIndex: "reaction", key: "reaction", width: 150 },
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
      render: (date: string) =>
        date ? moment(date).format("DD/MM/YYYY HH:mm:ss") : "N/A",
    },
    {
      title: "Người tạo",
      dataIndex: "createdBy",
      key: "createdBy",
      width: 120,
    },
    {
      title: "Ngày sửa",
      dataIndex: "modifiedDate",
      key: "modifiedDate",
      width: 150,
      render: (date: string) =>
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
      render: (_: any, record: VaccinationRecordWithNames) => (
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

      {/* Modal hiển thị chi tiết thông tin */}
      <Modal
        title="Chi tiết Bản ghi tiêm chủng"
        visible={isDetailModalVisible}
        onCancel={handleCloseModal}
        footer={null}
      >
        {selectedRecord && (
          <div style={{ padding: 16 }}>
            <p>
              <strong>Tên trẻ:</strong> {selectedRecord.childName || "N/A"}
            </p>
            <p>
              <strong>Tên người thân:</strong>{" "}
              {selectedRecord.parentName || "N/A"}
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
              <strong>Người tạo:</strong> {selectedRecord.createdBy || "N/A"}
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
    </div>
  );
};

export default VaccinationRecordPage;
