/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Table, Input, Space, Row, Col, Modal } from "antd";
import { ReloadOutlined, EyeOutlined } from "@ant-design/icons";

import moment from "moment"; // Để định dạng ngày tháng
import { axiosInstance } from "../../../service/axiosInstance";

const { Search } = Input;

// Giao diện ChildProfileResponseDTO
interface ChildProfileResponseDTO {
  childId: number;
  userId: number;
  fullName: string;
  imageUrl: string;
  dateOfBirth: string;
  gender: number;
  relationship: number;
  createdDate: string;
  createdBy: string;
  modifiedDate: string;
  modifiedBy: string;
  isActive: number;
}

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
  const [selectedProfile, setSelectedProfile] = useState<ChildProfileResponseDTO | null>(null);

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
    const data = response.data; // Nếu API trả về mảng trực tiếp
    setChildProfiles(data || []);
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

  // Hàm handleViewDetail đã được sửa để xử lý lỗi
  const handleViewDetail = (profile: ChildProfileResponseDTO) => {
    // Kiểm tra xem profile có tồn tại và có childId hợp lệ không
    if (!profile || typeof profile.childId !== "number") {
      console.error("Dữ liệu hồ sơ không hợp lệ:", profile);
      return;
    }
    console.log("Xem chi tiết hồ sơ:", profile); // Debug để kiểm tra dữ liệu
    setSelectedProfile(profile);
    setIsDetailModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalVisible(false);
    setSelectedProfile(null);
  };

  // Chuyển đổi giá trị số sang chuỗi cho gender và relationship
  const getGenderText = (gender: number) => {
    switch (gender) {
      case 0:
        return "Nam";
      case 1:
        return "Nữ";
      default:
        return "Không xác định";
    }
  };

  const getRelationshipText = (relationship: number) => {
    switch (relationship) {
      case 0:
        return "Cha/Mẹ";
      case 1:
        return "Người giám hộ";
      default:
        return "Không xác định";
    }
  };

  const columns = [
    { title: "Tên đầy đủ", dataIndex: "fullName", key: "FullName", width: 150 },
    {
      title: "Ảnh đại diện",
      dataIndex: "imageUrl",
      key: "ImageUrl",
      width: 100,
      render: (imageUrl: string, record: ChildProfileResponseDTO) => (
        <div style={{ textAlign: "center" }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={record.fullName || "Ảnh đại diện"}
              style={{ width: 50, height: 50, objectFit: "contain" }}
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
      width: 120,
      render: (date: string) =>
        date ? moment(date, "DD/MM/YYYY HH:mm:ss").format("DD/MM/YYYY") : "N/A",
    },
    {
      title: "Giới tính",
      dataIndex: "gender",
      key: "Gender",
      width: 100,
      render: (gender: number) => getGenderText(gender),
    },
    {
      title: "Quan hệ",
      dataIndex: "relationship",
      key: "Relationship",
      width: 120,
      render: (relationship: number) => getRelationshipText(relationship),
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "IsActive",
      width: 100,
      render: (isActive: number) => (isActive === 1 ? "Hoạt động" : "Không hoạt động"),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      key: "CreatedDate",
      width: 150,
      render: (date: string) =>
        date ? moment(date, "DD/MM/YYYY HH:mm:ss").format("DD/MM/YYYY HH:mm:ss") : "N/A",
    },
    {
      title: "Người tạo",
      dataIndex: "createdBy",
      key: "CreatedBy",
      width: 120,
    },
    {
      title: "Ngày sửa",
      dataIndex: "modifiedDate",
      key: "ModifiedDate",
      width: 150,
      render: (date: string) =>
        date ? moment(date, "DD/MM/YYYY HH:mm:ss").format("DD/MM/YYYY HH:mm:ss") : "N/A",
    },
    {
      title: "Người sửa",
      dataIndex: "modifiedBy",
      key: "ModifiedBy",
      width: 120,
    },
    {
      title: "Xem chi tiết",
      key: "action",
      width: 100,
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
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-center p-2 rounded-t-lg">
        DANH SÁCH HỒ SƠ TRẺ EM
      </h2>
      <Row justify="space-between" style={{ marginBottom: 16 , marginTop: 24 }}>
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
            <p><strong>ID Hồ sơ:</strong> {selectedProfile.childId}</p>
            <p><strong>ID Người dùng:</strong> {selectedProfile.userId}</p>
            <p><strong>Tên đầy đủ:</strong> {selectedProfile.fullName || "N/A"}</p>
            <p>
              <strong>Ảnh đại diện:</strong>
              {selectedProfile.imageUrl ? (
                <img
                  src={selectedProfile.imageUrl}
                  alt={selectedProfile.fullName || "Ảnh đại diện"}
                  style={{ width: 100, height: 100, objectFit: "contain", marginTop: 8 }}
                />
              ) : (
                " N/A"
              )}
            </p>
            <p>
              <strong>Ngày sinh:</strong>{" "}
              {selectedProfile.dateOfBirth
                ? moment(selectedProfile.dateOfBirth, "DD/MM/YYYY HH:mm:ss").format("DD/MM/YYYY")
                : "N/A"}
            </p>
            <p><strong>Giới tính:</strong> {getGenderText(selectedProfile.gender)}</p>
            <p><strong>Quan hệ:</strong> {getRelationshipText(selectedProfile.relationship)}</p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              {selectedProfile.isActive === 1 ? "Hoạt động" : "Không hoạt động"}
            </p>
            <p>
              <strong>Ngày tạo:</strong>{" "}
              {selectedProfile.createdDate
                ? moment(selectedProfile.createdDate, "DD/MM/YYYY HH:mm:ss").format("DD/MM/YYYY HH:mm:ss")
                : "N/A"}
            </p>
            <p><strong>Người tạo:</strong> {selectedProfile.createdBy || "N/A"}</p>
            <p>
              <strong>Ngày sửa đổi:</strong>{" "}
              {selectedProfile.modifiedDate
                ? moment(selectedProfile.modifiedDate, "DD/MM/YYYY HH:mm:ss").format("DD/MM/YYYY HH:mm:ss")
                : "N/A"}
            </p>
            <p><strong>Người sửa đổi:</strong> {selectedProfile.modifiedBy || "N/A"}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChildProfileManagePage;