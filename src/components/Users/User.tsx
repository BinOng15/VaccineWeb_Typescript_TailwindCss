/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Table, Input, Button, Space, Row, Col, Tabs } from "antd";
import EditUserModal from "./EditUserModal";
import AddUserModal from "./AddUserButton"; // Giả định tên file là AddUserButton.tsx
import { EditOutlined, ReloadOutlined } from "@ant-design/icons";
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
  const [editingUserId, setEditingUserId] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAllUsers();
      console.log("API Response:", response);
      const filteredUsers = response
        .filter(
          (user) =>
            activeTab === "deletedUsers"
              ? user.isActive === "Inactive" // Sử dụng number 0 cho Inactive
              : user.isActive === "Active" // Sử dụng number 1 cho Active
        )
        .map((user) => ({ ...user, userId: user.id }));
      console.log("Filtered Users:", filteredUsers);
      setUsers(filteredUsers);
      setPagination({
        current: 1,
        pageSize: pagination.pageSize,
        total: filteredUsers.length,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
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
    setEditingUserId(null);
  };

  const handleEditUser = (userId: User) => {
    console.log("Editing User with ID:", userId);
    setEditingUserId(userId);
    setIsEditModalVisible(true);
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
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: number) => (isActive === 1 ? "Active" : "Inactive"),
    },
    {
      title: "Phone Number",
      dataIndex: "phoneNumber",
      key: "phoneNumber",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: User) => (
        <span>
          <EditOutlined
            onClick={() => handleEditUser(record)}
            style={{ color: "black", cursor: "pointer" }}
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
        <TabPane tab="Active Users" key="activeUsers">
          <Row justify="space-between" style={{ marginBottom: 16 }}>
            <Col>
              <Space className="custom-search">
                <Search
                  placeholder="Search by keyword"
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
              <Button className="custom-button" onClick={handleAddUser}>
                Add User
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
        <TabPane tab="Deleted Users" key="deletedUsers">
          <Row justify="space-between" style={{ marginBottom: 16 }}>
            <Col>
              <Space>
                <Search
                  placeholder="Search by keyword"
                  onSearch={onSearch}
                  enterButton
                  allowClear
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
                <Button onClick={handleReset}>Reset</Button>
              </Space>
            </Col>
            <Col>
              <Button type="primary" onClick={handleAddUser}>
                Add User
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

      {editingUserId && (
        <EditUserModal
          user={editingUserId}
          visible={isEditModalVisible}
          onClose={handleCloseModal}
          refreshUsers={fetchUsers}
        />
      )}
    </div>
  );
};

export default UserComponent;
