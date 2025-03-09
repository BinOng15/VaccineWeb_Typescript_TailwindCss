/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Table, Input, Space, Row, Col, Modal } from "antd";
import { ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import moment from "moment";
import { axiosInstance } from "../../../service/axiosInstance";
import { ColumnType } from "antd/es/table";
import { ChildProfileResponseDTO } from "../../../models/ChildProfile";
import { UserResponseDTO } from "../../../models/User";

const { Search } = Input;

const ChildProfileManagePage: React.FC = () => {
  const [childProfiles, setChildProfiles] = useState<ChildProfileResponseDTO[]>(
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
  const [selectedProfile, setSelectedProfile] =
    useState<ChildProfileResponseDTO | null>(null);
  const [users, setUsers] = useState<UserResponseDTO[]>([]); // Lưu thông tin người dùng

  // Hàm fetchChildProfiles để lấy tất cả hồ sơ trẻ em từ API
  const fetchChildProfiles = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    keyword = searchKeyword
  ) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/get-all", {
        params: {
          page: page,
          pageSize: pageSize,
          keyword: keyword || undefined,
        },
      });
      const data = response.data; // Giả định API trả về mảng trực tiếp
      setChildProfiles(data || []);

      // Lấy thông tin user cho tất cả userId trong childProfiles
      const uniqueUserIds = [
        ...new Set(
          data.map((profile: ChildProfileResponseDTO) => profile.userId)
        ),
      ];
      const userPromises = uniqueUserIds.map((userId) =>
        axiosInstance.get(`api/User/get-user-by-id/${userId}`)
      );
      const userResponses = await Promise.all(userPromises);
      const usersData = userResponses.map((res) => res.data);
      setUsers(usersData);

      setPagination({
        current: page,
        pageSize: pageSize,
        total: data.length || 0,
      });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách hồ sơ trẻ em:", error);
    } finally {
      setLoading(false);
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    fetchChildProfiles();
  }, []);

  const handleTableChange = (pagination: any) => {
    const { current, pageSize } = pagination;
    fetchChildProfiles(current, pageSize);
  };

  const onSearch = (value: string) => {
    setSearchKeyword(value);
    fetchChildProfiles(1, pagination.pageSize, value);
  };

  const handleReset = () => {
    setSearchKeyword("");
    fetchChildProfiles(1, pagination.pageSize, "");
  };

  const handleViewDetail = (profile: ChildProfileResponseDTO) => {
    if (!profile || typeof profile.childId !== "number") {
      console.error("Dữ liệu hồ sơ không hợp lệ:", profile);
      return;
    }
    console.log("Xem chi tiết hồ sơ:", profile);
    setSelectedProfile(profile);
    setIsDetailModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalVisible(false);
    setSelectedProfile(null);
  };

  const getGenderText = (gender: number) => {
    switch (gender) {
      case 1:
        return "Nam";
      case 2:
        return "Nữ";
      default:
        return "Không xác định";
    }
  };

  const getRelationshipText = (relationship: number) => {
    switch (relationship) {
      case 1:
        return "Mẹ";
      case 2:
        return "Bố";
      default:
        return "Không xác định";
    }
  };

  const columns: ColumnType<ChildProfileResponseDTO>[] = [
    {
      title: "STT",
      key: "index",
      width: 50,
      align: "center",
      render: (_: any, __: ChildProfileResponseDTO, index: number) => {
        const currentIndex =
          (pagination.current - 1) * pagination.pageSize + index + 1;
        return currentIndex;
      },
    },
    { title: "Tên đầy đủ", dataIndex: "fullName", key: "FullName" },
    {
      title: "Ảnh đại diện",
      dataIndex: "imageUrl",
      key: "ImageUrl",
      render: (imageUrl: string, record: ChildProfileResponseDTO) => (
        <div style={{ textAlign: "center" }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={record.fullName || "Ảnh đại diện"}
              style={{
                width: 100,
                height: 100,
                objectFit: "cover",
                borderRadius: 8,
              }}
            />
          ) : (
            "N/A"
          )}
        </div>
      ),
    },
    {
      title: "Ngày sinh",
      dataIndex: "dateOfBirth",
      key: "DateOfBirth",
      render: (date: string) =>
        date ? moment(date, "DD/MM/YYYY HH:mm:ss").format("DD/MM/YYYY") : "N/A",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "Gender",
      render: (gender: number) => getGenderText(gender),
    },
    {
      title: "Tên phụ huynh",
      dataIndex: "userId", // Sử dụng userId làm dataIndex để lấy đúng giá trị
      key: "UserName",
      render: (_: number, record: ChildProfileResponseDTO) => {
        const user = users.find((u) => u.userId === record.userId);
        return user ? user.fullName : "Không tìm thấy tên";
      },
    },
    {
      title: "Phụ huynh là",
      dataIndex: "relationship",
      key: "Relationship",
      render: (relationship: number) => getRelationshipText(relationship),
    },

    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "IsActive",
      render: (isActive: number) =>
        isActive === 1 ? "Hoạt động" : "Không hoạt động",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: ChildProfileResponseDTO) => (
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
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-center p-2 rounded-t-lg">
        DANH SÁCH HỒ SƠ TRẺ EM
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
        dataSource={childProfiles}
        rowKey="childId"
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
        title="Chi tiết Hồ sơ trẻ em"
        visible={isDetailModalVisible}
        onCancel={handleCloseModal}
        footer={null}
      >
        {selectedProfile && (
          <div style={{ padding: 16 }}>
            <p>
              <strong>ID Hồ sơ:</strong> {selectedProfile.childId}
            </p>
            <p>
              <strong>ID Người dùng:</strong> {selectedProfile.userId}
            </p>
            <p>
              <strong>Tên Phụ huynh:</strong>{" "}
              {users.find((u) => u.userId === selectedProfile.userId)
                ?.fullName || "Không tìm thấy tên"}
            </p>
            <p>
              <strong>Tên đầy đủ:</strong> {selectedProfile.fullName || "N/A"}
            </p>
            <p>
              <strong>Ảnh đại diện:</strong>
              {selectedProfile.imageUrl ? (
                <img
                  src={selectedProfile.imageUrl}
                  alt={selectedProfile.fullName || "Ảnh đại diện"}
                  style={{
                    width: 100,
                    height: 100,
                    objectFit: "contain",
                    marginTop: 8,
                  }}
                />
              ) : (
                " N/A"
              )}
            </p>
            <p>
              <strong>Ngày sinh:</strong>{" "}
              {selectedProfile.dateOfBirth
                ? moment(
                    selectedProfile.dateOfBirth,
                    "DD/MM/YYYY HH:mm:ss"
                  ).format("DD/MM/YYYY")
                : "N/A"}
            </p>
            <p>
              <strong>Giới tính:</strong>{" "}
              {getGenderText(selectedProfile.gender)}
            </p>
            <p>
              <strong>Phụ huynh là:</strong>{" "}
              {getRelationshipText(selectedProfile.relationship)}
            </p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              {selectedProfile.isActive === 1 ? "Hoạt động" : "Không hoạt động"}
            </p>
            <p>
              <strong>Ngày tạo:</strong>{" "}
              {selectedProfile.createdDate
                ? moment(
                    selectedProfile.createdDate,
                    "HH:mm:ss - DD/MM/YYYY"
                  ).format("HH:mm - DD/MM/YYYY")
                : "N/A"}
            </p>
            <p>
              <strong>Người tạo:</strong> {selectedProfile.createdBy || "N/A"}
            </p>
            <p>
              <strong>Ngày sửa đổi:</strong>{" "}
              {selectedProfile.modifiedDate
                ? moment(
                    selectedProfile.modifiedDate,
                    "HH:mm:ss - DD/MM/YYYY"
                  ).format("HH:mm - DD/MM/YYYY")
                : "N/A"}
            </p>
            <p>
              <strong>Người sửa đổi:</strong>{" "}
              {selectedProfile.modifiedBy || "N/A"}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChildProfileManagePage;
