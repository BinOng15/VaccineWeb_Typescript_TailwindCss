/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Row,
  Col,
  Modal,
  notification,
} from "antd";
import EditUserModal from "./EditUserModal";
import {
  EditOutlined,
  ReloadOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { UserResponseDTO } from "../../models/User";
import userService from "../../service/userService";
import { ColumnType } from "antd/es/table";
import AddUserModal from "./AddUserButton";

const { Search } = Input;

interface User extends UserResponseDTO {
  userId: number;
}

const UserComponent: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isAddUserModalVisible, setIsAddUserModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Lấy danh sách người dùng từ API (chỉ lấy người dùng hoạt động)
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAllUsers();
      console.log("API Response:", response);
      const activeUsers = response.filter((user) => user.isActive === "Active");
      setUsers(activeUsers);
      applyPaginationAndFilter(activeUsers, searchKeyword, pagination);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      notification.error({
        message: "Lỗi",
        description:
          error.response?.data?.message || "Không thể lấy danh sách người dùng!",
      });
    } finally {
      setLoading(false);
    }
  };

  // Áp dụng phân trang và lọc (tìm kiếm trên 3 trường: fullName, email, phoneNumber)
  const applyPaginationAndFilter = (
    data: User[],
    keyword: string,
    pag: { current: number; pageSize: number; total: number }
  ) => {
    let filtered = data;
    if (keyword) {
      const keywordLower = keyword.toLowerCase();
      filtered = data.filter((user) =>
        (user.fullName?.toLowerCase() || "").includes(keywordLower) ||
        (user.email?.toLowerCase() || "").includes(keywordLower) ||
        (user.phoneNumber?.toLowerCase() || "").includes(keywordLower)
      );
    }

    const startIndex = (pag.current - 1) * pag.pageSize;
    const endIndex = startIndex + pag.pageSize;
    const paginatedData = filtered.slice(startIndex, endIndex);

    setFilteredUsers(paginatedData);
    setPagination({
      ...pag,
      total: filtered.length,
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Xử lý thay đổi phân trang
  const handleTableChange = (pagination: any) => {
    const { current, pageSize } = pagination;
    setPagination((prev) => ({ ...prev, current, pageSize }));
    applyPaginationAndFilter(users, searchKeyword, {
      current,
      pageSize,
      total: pagination.total,
    });
  };

  // Xử lý tìm kiếm
  const onSearch = (value: string) => {
    setSearchKeyword(value);
    setPagination((prev) => ({ ...prev, current: 1 }));
    applyPaginationAndFilter(users, value, {
      ...pagination,
      current: 1,
    });
  };

  const handleReset = () => {
    setSearchKeyword("");
    setPagination((prev) => ({ ...prev, current: 1 }));
    applyPaginationAndFilter(users, "", { ...pagination, current: 1 });
  };

  const handleAddUser = () => {
    setIsAddUserModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsAddUserModalVisible(false);
    setIsEditModalVisible(false);
    setEditedUser(null);
    setIsDetailModalVisible(false);
    setSelectedUser(null);
  };

  const handleUpdate = (user: User) => {
    if (!user.userId || typeof user.userId !== "number") {
      console.error("Invalid user in handleUpdate:", user);
      notification.error({
        message: "Lỗi",
        description: "Dữ liệu người dùng không hợp lệ để chỉnh sửa!",
      });
      return;
    }
    console.log("Editing User with ID:", user.userId);
    setEditedUser(user);
    setIsEditModalVisible(true);
  };

  const handleViewDetail = (user: User) => {
    if (!user.userId || typeof user.userId !== "number") {
      console.error("Dữ liệu người dùng không khả dụng:", user);
      notification.error({
        message: "Lỗi",
        description: "Dữ liệu người dùng không khả dụng!",
      });
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
          await userService.deleteUser(userId);
          notification.success({
            message: "Thành công",
            description: "Người dùng đã được xóa thành công!",
          });
          fetchUsers();
        } catch (error: any) {
          console.error("Lỗi khi xóa người dùng:", error);
          notification.error({
            message: "Lỗi",
            description:
              error.response?.data?.message || "Không thể xóa người dùng!",
          });
        }
      },
      onCancel() {
        console.log("Hủy xóa");
      },
    });
  };

  const columns: ColumnType<UserResponseDTO>[] = [
    {
      title: "STT",
      key: "index",
      width: 50,
      align: "center",
      render: (_: any, __: UserResponseDTO, index: number) => {
        const currentIndex =
          (pagination.current - 1) * pagination.pageSize + index + 1;
        return currentIndex;
      },
    },
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
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-center p-2 rounded-t-lg">
        QUẢN LÝ NGƯỜI DÙNG
      </h2>
      <Row justify="space-between" style={{ marginBottom: 16, marginTop: 24 }}>
        <Col>
          <Space className="custom-search">
            <Search
              placeholder="Tìm kiếm theo tên, email hoặc số điện thoại"
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
        dataSource={filteredUsers}
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

      <Modal
        title="Chi tiết Người dùng"
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
              <strong>Họ và Tên:</strong> {selectedUser.fullName || "N/A"}
            </p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              {selectedUser.isActive === "Active" ? "Hoạt động" : "Không hoạt động"}
            </p>
            <p>
              <strong>Số điện thoại:</strong> {selectedUser.phoneNumber || "N/A"}
            </p>
            <p>
              <strong>Địa chỉ:</strong> {selectedUser.address || "N/A"}
            </p>
            <p>
              <strong>Vai trò:</strong>{" "}
              {selectedUser.role === "Staff"
                ? "Nhân viên"
                : selectedUser.role === "Doctor"
                  ? "Bác sĩ"
                  : "N/A"}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserComponent;