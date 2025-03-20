/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Table, Input, Space, Row, Col, Modal, Descriptions, message } from "antd";
import { ReloadOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import moment from "moment";
import { axiosInstance } from "../../../service/axiosInstance";
import { ColumnType } from "antd/es/table";
import { ChildProfileResponseDTO } from "../../../models/ChildProfile";
import { UserResponseDTO } from "../../../models/User";
import childProfileService from "../../../service/childProfileService";
//import AddChildProfileModal from "./AddChildProfileModal"; // Import modal thêm
import EditChildProfileModal from "./EditChildProfileModal"; // Import modal sửa

const { Search } = Input;

const ChildProfileManagePage: React.FC = () => {
  const [childProfiles, setChildProfiles] = useState<ChildProfileResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  // const [isAddModalVisible, setIsAddModalVisible] = useState(false); // State cho modal thêm
  const [isEditModalVisible, setIsEditModalVisible] = useState(false); // State cho modal sửa
  const [selectedProfile, setSelectedProfile] = useState<ChildProfileResponseDTO | null>(null);
  const [users, setUsers] = useState<UserResponseDTO[]>([]);

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
      const data = response.data;
      // Lọc các hồ sơ có isActive = 1
      const activeProfiles = data.filter(
        (profile: ChildProfileResponseDTO) => profile.isActive === 1
      );
      setChildProfiles(activeProfiles || []);

      const uniqueUserIds = [
        ...new Set(
          activeProfiles.map((profile: ChildProfileResponseDTO) => profile.userId)
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
        total: activeProfiles.length || 0,
      });
    } catch (error) {
      console.error("Lỗi khi lấy danh sách hồ sơ trẻ em:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleEdit = (profile: ChildProfileResponseDTO) => {
    setSelectedProfile(profile);
    setIsEditModalVisible(true);
  };

  const handleDelete = async (childId: number) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa hồ sơ trẻ em này?",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await childProfileService.deleteChildProfile(childId);
          message.success("Xóa hồ sơ trẻ em thành công!");
          fetchChildProfiles(); // Làm mới danh sách
        } catch (error) {
          console.error("Lỗi khi xóa hồ sơ trẻ em:", error);
          message.error("Xóa hồ sơ trẻ em thất bại!");
        }
      },
    });
  };

  const handleCloseModal = () => {
    setIsDetailModalVisible(false);
    setIsEditModalVisible(false);
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
      dataIndex: "userId",
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
      title: "Hành động",
      key: "action",
      render: (_: any, record: ChildProfileResponseDTO) => (
        <Space size="middle">
          <EyeOutlined
            onClick={() => handleViewDetail(record)}
            style={{ color: "blue", cursor: "pointer" }}
          />
          <EditOutlined
            onClick={() => handleEdit(record)}
            style={{ color: "green", cursor: "pointer" }}
          />
          <DeleteOutlined
            onClick={() => handleDelete(record.childId)}
            style={{ color: "red", cursor: "pointer" }}
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
        {/* <Col>
          <Button type="primary" onClick={() => setIsAddModalVisible(true)}>
            Thêm hồ sơ trẻ em
          </Button>
        </Col> */}
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
        title="CHI TIẾT HỒ SƠ TRẺ EM"
        visible={isDetailModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        centered
        style={{ width: "800px", maxHeight: "600px" }}
        bodyStyle={{ maxHeight: "500px", overflowY: "auto" }}
      >
        {selectedProfile && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Tên Phụ huynh">
              {users.find((u) => u.userId === selectedProfile.userId)?.fullName ||
                "Không tìm thấy tên"}
            </Descriptions.Item>
            <Descriptions.Item label="Tên đầy đủ">
              {selectedProfile.fullName || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Ảnh đại diện">
              {selectedProfile.imageUrl ? (
                <img
                  src={selectedProfile.imageUrl}
                  alt={selectedProfile.fullName || "Ảnh đại diện"}
                  style={{ width: 100, height: 100, objectFit: "contain" }}
                />
              ) : (
                "N/A"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              {selectedProfile.dateOfBirth
                ? moment(selectedProfile.dateOfBirth, "DD/MM/YYYY HH:mm:ss").format(
                  "DD/MM/YYYY"
                )
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              {getGenderText(selectedProfile.gender)}
            </Descriptions.Item>
            <Descriptions.Item label="Phụ huynh là">
              {getRelationshipText(selectedProfile.relationship)}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {selectedProfile.isActive === 1 ? "Hoạt động" : "Không hoạt động"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {selectedProfile.createdDate
                ? moment(selectedProfile.createdDate, "HH:mm:ss - DD/MM/YYYY").format(
                  "HH:mm - DD/MM/YYYY"
                )
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Người tạo">
              {selectedProfile.createdBy || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sửa đổi">
              {selectedProfile.modifiedDate
                ? moment(selectedProfile.modifiedDate, "HH:mm:ss - DD/MM/YYYY").format(
                  "HH:mm - DD/MM/YYYY"
                )
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Người sửa đổi">
              {selectedProfile.modifiedBy || "N/A"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Modal thêm hồ sơ trẻ em */}
      {/* <AddChildProfileModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSuccess={fetchChildProfiles}
        userId={1} // Thay bằng userId thực tế, có thể lấy từ context hoặc state
      /> */}

      {/* Modal chỉnh sửa hồ sơ trẻ em */}
      <EditChildProfileModal
        visible={isEditModalVisible}
        onClose={handleCloseModal}
        onSuccess={fetchChildProfiles}
        profile={selectedProfile}
      />
    </div>
  );
};

export default ChildProfileManagePage;