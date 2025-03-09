/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Row,
  Col,
  Tabs,
  Modal,
  message,
} from "antd";
import EditUserModal from "./EditUserModal";
import AddUserModal from "./AddUserButton"; // Giả định tên file là AddUserButton.tsx
import {
  EditOutlined,
  ReloadOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { UserResponseDTO } from "../../models/User";
import userService from "../../service/userService";

const { Search } = Input;
const { TabPane } = Tabs;

// Interface User khớp với UserResponseDTO từ backend
interface User extends UserResponseDTO {
  userId: number; // Alias cho id từ UserResponseDTO
}

const UserComponent: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeTab, setActiveTab] = useState("activeUsers");
  const [isAddUserModalVisible, setIsAddUserModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null); // Thay vì editingUserId
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false); // State cho modal chi tiết
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // User được chọn để xem chi tiết

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAllUsers();
      console.log("API Response:", response);
      const filteredUsers = response
        .filter((user) =>
          activeTab === "deletedUsers"
            ? user.isActive === "Inactive"
            : user.isActive === "Active"
        )
        .map((user) => {
          return { ...user, userId: user.userId };
        });
      console.log("Filtered Users:", filteredUsers);
      setUsers(filteredUsers);
      setPagination({
        current: 1,
        pageSize: pagination.pageSize,
        total: filteredUsers.length,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to fetch users: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  const handleTableChange = (pagination: any) => {
    const { current, pageSize } = pagination;
    setPagination((prev) => ({ ...prev, current, pageSize }));
    fetchUsers();
  };

  const onSearch = (value: string) => {
    setSearchKeyword(value);
    setUsers((prevUsers) =>
      prevUsers.filter((user) =>
        user.fullName.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const handleReset = () => {
    setSearchKeyword("");
    fetchUsers();
  };

  const handleAddUser = () => {
    setIsAddUserModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsAddUserModalVisible(false);
    setIsEditModalVisible(false);
    setEditedUser(null);
    setIsDetailModalVisible(false); // Đóng modal chi tiết
    setSelectedUser(null); // Reset user được chọn
  };

  const handleUpdate = (user: User) => {
    if (!user.userId || typeof user.userId !== "number") {
      console.error("Invalid user in handleUpdate:", user);
      message.error("Invalid user data for editing");
      return;
    }
    console.log("Editing User with ID:", user.userId);
    setEditedUser(user);
    setIsEditModalVisible(true);
  };

  const handleViewDetail = (user: User) => {
    if (!user.userId || typeof user.userId !== "number") {
      console.error("Dữ liệu người dùng không khả dụng:", user);
      message.error("Dữ liệu người dùng không khả dụng");
      return;
    }
    console.log("Viewing User with ID:", user.userId);
    setSelectedUser(user);
    setIsDetailModalVisible(true);
  };
  const handleDelete = async (userId: number) => {
    Modal.confirm({
      title: "Bạn có chắc chắn muốn xóa người dùng này không?",
      content: "Hành động này không thể hoàn tác.",
      okText: "Có",
      okType: "danger",
      cancelText: "Không",
      onOk: async () => {
        try {
          await userService.deleteUser(userId); // Giả sử userService có phương thức deleteUser
          message.success("Người dùng đã được xóa thành công");
          fetchUsers(); // Refresh danh sách người dùng sau khi xóa
        } catch (error) {
          console.error("Lỗi khi xóa người dùng:", error);
          message.error(
            "Không thể xóa người dùng: " + (error as Error).message
          );
        }
      },
      onCancel() {
        console.log("Hủy xóa");
      },
    });
  };
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const columns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Tên đầy đủ",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: string) =>
        isActive === "Active" ? "Hoạt động" : "Không hoạt động",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: User) => (
        <span>
          <EditOutlined
            onClick={() => handleUpdate(record)}
            style={{ color: "black", cursor: "pointer", marginRight: 8 }}
          />
          <EyeOutlined
            onClick={() => handleViewDetail(record)}
            style={{ color: "blue", cursor: "pointer", marginRight: 8 }}
          />
          <DeleteOutlined
            onClick={() => handleDelete(record.userId)}
            style={{ color: "red", cursor: "pointer" }}
          />
        </span>
      ),
    },
  ];

  return (
    <div>
      <Tabs
        className="custom-tabs mt-20 ml-10 mr-10"
        defaultActiveKey="activeUsers"
        onChange={handleTabChange}
      >
        <TabPane tab="Người dùng hoạt động" key="activeUsers">
          <Row justify="space-between" style={{ marginBottom: 16 }}>
            <Col>
              <Space className="custom-search">
                <Search
                  placeholder="Tìm kiếm theo từ khóa"
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
            <Col>
              <Button
                type="primary"
                className="custom-button"
                onClick={handleAddUser}
              >
                Thêm mới người dùng
              </Button>
            </Col>
          </Row>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="userId"
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
        </TabPane>
        <TabPane tab="Người dùng vô hiệu hóa" key="deletedUsers">
          <Row justify="space-between" style={{ marginBottom: 16 }}>
            <Col>
              <Space>
                <Search
                  placeholder="Tìm kiếm theo từ khóa"
                  onSearch={onSearch}
                  enterButton
                  allowClear
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
                <ReloadOutlined
                  onClick={handleReset}
                  style={{ fontSize: "24px", cursor: "pointer" }}
                />{" "}
              </Space>
            </Col>
            <Col>
              <Button type="primary" onClick={handleAddUser}>
                Thêm mới người dùng
              </Button>
            </Col>
          </Row>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="userId"
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
        </TabPane>
      </Tabs>

      <AddUserModal
        visible={isAddUserModalVisible}
        onClose={handleCloseModal}
        refreshUsers={fetchUsers}
      />

      {editedUser && (
        <EditUserModal
          user={editedUser}
          visible={isEditModalVisible}
          onClose={handleCloseModal}
          refreshUsers={fetchUsers}
        />
      )}

      {/* Modal để xem chi tiết thông tin user */}
      <Modal
        title="User Details"
        visible={isDetailModalVisible}
        onCancel={handleCloseModal}
        footer={null}
      >
        {selectedUser && (
          <div style={{ padding: 16 }}>
            <p>
              <strong>Email:</strong> {selectedUser.email || "N/A"}
            </p>
            <p>
              <strong>Full Name:</strong> {selectedUser.fullName || "N/A"}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              {selectedUser.isActive === "Active" ? "Active" : "Inactive"}
            </p>
            <p>
              <strong>Phone Number:</strong> {selectedUser.phoneNumber || "N/A"}
            </p>
            <p>
              <strong>Address:</strong> {selectedUser.address || "N/A"}
            </p>
            <p>
              <strong>Role:</strong>{" "}
              {selectedUser.role === "Staff"
                ? "Staff"
                : selectedUser.role === "Doctor"
                ? "Doctor"
                : "N/A"}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserComponent;
