/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Row,
  Col,
  Modal,
  message,
  Spin,
} from "antd";
import {
  EditOutlined,
  ReloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  PlusOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { ChildProfileResponseDTO } from "../../models/ChildProfile";
import { Gender, Relationship } from "../../models/Type/enum";
import childProfileService from "../../service/childProfileService";
import moment from "moment";
import AddChildProfileModal from "./AddChildProfileModal";
import EditChildProfileModal from "./EditChildProfileModal";
import { useAuth } from "../../context/AuthContext";
import { ColumnType } from "antd/es/table";

const { Search } = Input;
const { confirm } = Modal;

function ChildProfile() {
  const [childProfiles, setChildProfiles] = useState<ChildProfileResponseDTO[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedChildProfile, setSelectedChildProfile] =
    useState<ChildProfileResponseDTO | null>(null);
  const [editedChildProfile, setEditedChildProfile] =
    useState<ChildProfileResponseDTO | null>(null);
  const { user } = useAuth(); // Lấy thông tin người dùng từ AuthContext

  // Fetch dữ liệu hồ sơ trẻ em khi component mount
  useEffect(() => {
    fetchChildProfileData();
  }, []);

  const fetchChildProfileData = async () => {
    try {
      if (!user) {
        console.error("No user found");
        setLoading(false);
        return;
      }
      setLoading(true);
      const userId = user.userId;
      console.log("Current userId:", userId);

      let fetchedChildProfiles: ChildProfileResponseDTO[] = [];
      try {
        fetchedChildProfiles = await childProfileService.getAllChildProfiles();
        console.log("All child profiles fetched:", fetchedChildProfiles);
      } catch (error) {
        console.error("Failed to fetch all child profiles:", error);
        setLoading(false);
        return;
      }

      const userChildProfiles = fetchedChildProfiles.filter(
        (profile) => profile.userId === userId
      );
      console.log(
        "Filtered child profiles for userId",
        userId,
        ":",
        userChildProfiles
      );

      // Không hiển thị lỗi nếu không có ChildProfile, chỉ đặt mảng rỗng
      setChildProfiles(userChildProfiles);
      setPagination({
        current: 1,
        pageSize: pagination.pageSize,
        total: userChildProfiles.length,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Hàm chuyển đổi enum Gender sang chuỗi hiển thị
  const getGenderLabel = (gender: Gender): string => {
    switch (gender) {
      case Gender.Male:
        return "Nam";
      case Gender.Female:
        return "Nữ";
      case Gender.Unknown:
      default:
        return "Không xác định";
    }
  };

  // Hàm chuyển đổi enum Relationship sang chuỗi hiển thị
  const getRelationshipLabel = (relationship: Relationship | null): string => {
    if (!relationship) return "Không xác định";
    switch (relationship) {
      case Relationship.Mother:
        return "Mẹ";
      case Relationship.Father:
        return "Bố";
      case Relationship.Guardian:
        return "Người giám hộ";
      default:
        return "Không xác định";
    }
  };

  // Xử lý tìm kiếm
  const onSearch = (value: string) => {
    setSearchKeyword(value);
    setChildProfiles((prevChildProfiles) =>
      prevChildProfiles.filter((profile) =>
        profile.fullName.toLowerCase().includes(value.toLowerCase())
      )
    );
    setPagination({
      ...pagination,
      current: 1,
      total: childProfiles.filter((profile) =>
        profile.fullName.toLowerCase().includes(value.toLowerCase())
      ).length,
    });
  };

  // Xử lý reset tìm kiếm
  const handleReset = () => {
    setSearchKeyword("");
    fetchChildProfileData();
  };

  // Xử lý thay đổi phân trang
  const handleTableChange = (pagination: any) => {
    const { current, pageSize } = pagination;
    setPagination((prev) => ({ ...prev, current, pageSize }));
  };

  // Xử lý xem chi tiết
  const handleViewDetail = (profile: ChildProfileResponseDTO) => {
    setSelectedChildProfile(profile);
    setIsDetailModalVisible(true);
  };

  // Xử lý chỉnh sửa
  const handleEdit = (profile: ChildProfileResponseDTO) => {
    setEditedChildProfile(profile);
    setIsEditModalVisible(true);
  };

  // Xử lý xóa
  const handleDelete = (childId: number) => {
    confirm({
      title: "Bạn có muốn xóa hồ sơ trẻ này không?",
      content: "Hành động này không thể hoàn tác.",
      okText: "Có",
      okType: "danger",
      cancelText: "Không",
      onOk: async () => {
        try {
          await childProfileService.deleteChildProfile(childId);
          message.success("Hồ sơ trẻ đã được xóa thành công");
          fetchChildProfileData();
        } catch (error) {
          console.error("Lỗi khi xóa hồ sơ trẻ:", error);
          message.error("Không thể xóa hồ sơ trẻ: " + (error as Error).message);
        }
      },
      onCancel() {
        console.log("Hủy xóa");
      },
    });
  };

  // Xử lý thêm mới
  const handleAdd = () => {
    console.log("handleAdd called"); // Debug log
    setIsAddModalVisible(true);
  };

  // Đóng modal và reload dữ liệu
  const handleModalClose = () => {
    setIsDetailModalVisible(false);
    setIsAddModalVisible(false);
    setIsEditModalVisible(false);
    setSelectedChildProfile(null);
    setEditedChildProfile(null);
  };

  // Cột cho Table
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
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Hình ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (imageUrl: string, record: ChildProfileResponseDTO) => (
        <div style={{ textAlign: "center" }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={record.fullName || "Hình ảnh"}
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
      key: "dateOfBirth",
      render: (date: string) =>
        date && date !== "Chưa có dữ liệu"
          ? moment(date).format("DD/MM/YYYY")
          : date,
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "gender",
      width: 120,
      render: (gender: Gender) => getGenderLabel(gender),
    },
    {
      title: "Mối quan hệ với trẻ",
      dataIndex: "relationship",
      key: "relationship",
      render: (relationship: Relationship | null) =>
        getRelationshipLabel(relationship),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: ChildProfileResponseDTO) => (
        <Space>
          <EyeOutlined
            onClick={() => handleViewDetail(record)}
            style={{ color: "blue", cursor: "pointer", fontSize: 18 }}
          />
          <EditOutlined
            onClick={() => handleEdit(record)}
            style={{
              color: "black",
              cursor: "pointer",
              fontSize: 18,
              marginLeft: 8,
            }}
          />
          <DeleteOutlined
            onClick={() => handleDelete(record.childId)}
            style={{
              color: "red",
              cursor: "pointer",
              fontSize: 18,
              marginLeft: 8,
            }}
          />
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Spin indicator={<LoadingOutlined spin />} size="small" />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="w-full max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6">
        {/* Tiêu đề */}
        <h1 className="text-3xl font-bold text-[#102A83] mb-6 text-center">
          Danh sách hồ sơ trẻ
        </h1>

        {/* Thanh tìm kiếm, nút reset và nút thêm mới */}
        <Row justify="space-between" style={{ marginBottom: 16 }}>
          <Col>
            <Space>
              <Search
                placeholder="Tìm kiếm theo họ và tên"
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

        {/* Table hiển thị danh sách ChildProfile */}
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
          bordered
          locale={{ emptyText: "Không có dữ liệu hồ sơ trẻ" }}
        />

        {/* Modal chi tiết thông tin ChildProfile */}
        <Modal
          title="Chi tiết hồ sơ trẻ"
          visible={isDetailModalVisible}
          onCancel={handleModalClose}
          footer={null}
        >
          {selectedChildProfile && (
            <div style={{ padding: 16 }}>
              <p>
                <strong>Họ và tên:</strong>{" "}
                {selectedChildProfile.fullName || "N/A"}
              </p>
              <p>
                <strong>Ngày sinh:</strong>{" "}
                {selectedChildProfile.dateOfBirth &&
                selectedChildProfile.dateOfBirth !== "Chưa có dữ liệu"
                  ? moment(selectedChildProfile.dateOfBirth).format(
                      "DD/MM/YYYY"
                    )
                  : selectedChildProfile.dateOfBirth}
              </p>
              <p>
                <strong>Giới tính:</strong>{" "}
                {getGenderLabel(selectedChildProfile.gender)}
              </p>
              <p>
                <strong>Mối quan hệ với trẻ:</strong>{" "}
                {getRelationshipLabel(selectedChildProfile.relationship)}
              </p>
              <p>
                <strong>Hình ảnh:</strong>{" "}
                {selectedChildProfile.imageUrl ? (
                  <img
                    src={selectedChildProfile.imageUrl}
                    alt={selectedChildProfile.fullName || "Hình ảnh"}
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: "contain",
                      marginTop: 8,
                    }}
                  />
                ) : (
                  "N/A"
                )}
              </p>
              <p>
                <strong>Ngày tạo:</strong>{" "}
                {moment(selectedChildProfile.createdDate).format(
                  "DD/MM/YYYY"
                ) || "N/A"}
              </p>
              <p>
                <strong>Người tạo:</strong>{" "}
                {selectedChildProfile.createdBy || "N/A"}
              </p>
              <p>
                <strong>Ngày sửa đổi:</strong>{" "}
                {moment(selectedChildProfile.modifiedDate).format(
                  "DD/MM/YYYY"
                ) || "N/A"}
              </p>
              <p>
                <strong>Người sửa đổi:</strong>{" "}
                {selectedChildProfile.modifiedBy || "N/A"}
              </p>
              <p>
                <strong>Trạng thái:</strong>{" "}
                {selectedChildProfile.isActive === 1
                  ? "Hoạt động"
                  : "Không hoạt động"}
              </p>
            </div>
          )}
        </Modal>

        <AddChildProfileModal
          visible={isAddModalVisible}
          onClose={handleModalClose}
          onSuccess={fetchChildProfileData}
        />

        <EditChildProfileModal
          visible={isEditModalVisible}
          onClose={handleModalClose}
          onSuccess={fetchChildProfileData}
          childProfile={editedChildProfile}
        />
      </div>
    </div>
  );
}

export default ChildProfile;
