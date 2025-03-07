/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Row, Col, Modal, message } from "antd";
import {
  EditOutlined,
  ReloadOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { ChildProfileResponseDTO } from "../../models/ChildProfile";
import { Gender, Relationship } from "../../models/Type/enum";
import childProfileService from "../../service/childProfileService";
import { getCurrentUser } from "../../service/authService";
import moment from "moment";

const { Search } = Input;

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
  const [error, setError] = useState<string | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedChildProfile, setSelectedChildProfile] =
    useState<ChildProfileResponseDTO | null>(null);

  // Lấy token để xác thực
  const getToken = () => {
    return (
      localStorage.getItem("token") || sessionStorage.getItem("accessToken")
    );
  };

  // Fetch dữ liệu hồ sơ trẻ em khi component mount
  useEffect(() => {
    const fetchChildProfileData = async () => {
      try {
        const token = getToken();
        if (!token) {
          setError("Không tìm thấy token. Vui lòng đăng nhập lại!");
          setLoading(false);
          return;
        }

        // Lấy thông tin người dùng hiện tại để lấy userId
        const userData = await getCurrentUser(token);
        if (!userData) {
          setError(
            "Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại!"
          );
          setLoading(false);
          return;
        }
        const userId = userData.userId;
        console.log("Current userId:", userId);

        // Lấy tất cả hồ sơ trẻ em
        let fetchedChildProfiles: ChildProfileResponseDTO[] = [];
        try {
          fetchedChildProfiles =
            await childProfileService.getAllChildProfiles();
          console.log("All child profiles fetched:", fetchedChildProfiles);
        } catch (error) {
          console.error("Failed to fetch all child profiles:", error);
          setError(
            "Không thể lấy danh sách trẻ em. Vui lòng kiểm tra kết nối hoặc liên hệ admin!"
          );
          setLoading(false);
          return;
        }

        // Lọc danh sách dựa trên userId
        const userChildProfiles = fetchedChildProfiles.filter(
          (profile) => profile.userId === userId
        );
        console.log(
          "Filtered child profiles for userId",
          userId,
          ":",
          userChildProfiles
        );

        // Kiểm tra nếu không tìm thấy child profiles cho userId
        if (userChildProfiles.length === 0) {
          setError(
            "Không tìm thấy trẻ em nào liên quan đến tài khoản của bạn!"
          );
          setLoading(false);
          return;
        }

        // Lưu danh sách child profiles đã lọc
        setChildProfiles(userChildProfiles);
        setPagination({
          current: 1,
          pageSize: pagination.pageSize,
          total: userChildProfiles.length,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại!");
      } finally {
        setLoading(false);
      }
    };

    fetchChildProfileData();
  }, []);

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
    fetchChildProfileData(); // Gọi lại fetch để lấy dữ liệu gốc
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

  // Cột cho Table
  const columns = [
    {
      title: "Họ và tên",
      dataIndex: "fullName",
      key: "fullName",
      width: 150,
    },
    {
      title: "Hình ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 150,
      render: (imageUrl: string, record: ChildProfileResponseDTO) => (
        <div style={{ textAlign: "center" }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={record.fullName || "Hình ảnh"}
              style={{ width: 100, height: 100, objectFit: "contain" }}
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
      width: 150,
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
      title: "Mối quan hệ",
      dataIndex: "relationship",
      key: "relationship",
      width: 150,
      render: (relationship: Relationship | null) =>
        getRelationshipLabel(relationship),
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      render: (_: any, record: ChildProfileResponseDTO) => (
        <Space>
          <EyeOutlined
            onClick={() => handleViewDetail(record)}
            style={{ color: "blue", cursor: "pointer", fontSize: 18 }}
          />
          {/* Thêm các hành động khác nếu cần (Edit, Delete) */}
        </Space>
      ),
    },
  ];

  // Modal chi tiết
  const handleCloseModal = () => {
    setIsDetailModalVisible(false);
    setSelectedChildProfile(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl">Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl text-red-500">{error}</p>
        <p className="text-gray-600 mt-2">
          Vui lòng kiểm tra lại hoặc liên hệ admin.
        </p>
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

        {/* Thanh tìm kiếm và nút reset */}
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
        />

        {/* Modal chi tiết thông tin ChildProfile */}
        <Modal
          title="Chi tiết hồ sơ trẻ"
          visible={isDetailModalVisible}
          onCancel={handleCloseModal}
          footer={null}
        >
          {selectedChildProfile && (
            <div style={{ padding: 16 }}>
              <p>
                <strong>Họ và tên:</strong>{" "}
                {selectedChildProfile.fullName || "N/A"}
              </p>
              {selectedChildProfile.imageUrl && (
                <p>
                  <strong>Hình ảnh:</strong>
                  <img
                    src={selectedChildProfile.imageUrl}
                    alt={selectedChildProfile.fullName || "Hình ảnh Vắc xin"}
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: "contain",
                      marginTop: 8,
                    }}
                  />
                </p>
              )}
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
                <strong>Mối quan hệ:</strong>{" "}
                {getRelationshipLabel(selectedChildProfile.relationship)}
              </p>
              {selectedChildProfile.imageUrl && (
                <p>
                  <strong>Hình ảnh:</strong>
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
                </p>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default ChildProfile;
