/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Table, Input, Space, Row, Col, Modal } from "antd";
import { ReloadOutlined, EyeOutlined } from "@ant-design/icons";

import moment from "moment"; // Để định dạng ngày tháng
import { axiosInstance } from "../../service/axiosInstance";

const { Search } = Input;

// Giao diện VaccinationRecordResponseDTO dựa trên API bạn cung cấp
interface VaccinationRecordResponseDTO {
  recordId: number;
  appointmentId: number;
  administeredDate: string;
  reaction: string;
  notes: string;
  isActive: number;
  createdDate: string;
  createdBy: string;
  modifiedDate: string;
  modifiedBy: string;
}

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
  const [selectedRecord, setSelectedRecord] = useState<VaccinationRecordResponseDTO | null>(null);

  // Hàm fetchVaccinationRecords để lấy tất cả bản ghi tiêm chủng từ API
  const fetchVaccinationRecords = async (
    page = pagination.current,
    pageSize = pagination.pageSize,
    keyword = searchKeyword
  ) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/VaccinationRecord/get-all", {
        params: {
          page: page,
          pageSize: pageSize,
          keyword: keyword || undefined,
        },
      });
      console.log(response.data)
      const data = response.data; // Giả định API trả về mảng trực tiếp
      setRecords(data || []);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: data.length || 0, // Nếu API không trả về total, dùng độ dài mảng
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
  const handleViewDetail = (record: VaccinationRecordResponseDTO) => {
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
    { title: "ID Bản ghi", dataIndex: "recordId", key: "recordId", width: 120 },
    { title: "ID Lịch hẹn", dataIndex: "appointmentId", key: "appointmentId", width: 120 },
    {
      title: "Ngày tiêm",
      dataIndex: "administeredDate",
      key: "administeredDate",
      width: 150,
      render: (date: string) => (date ? moment(date).format("DD/MM/YYYY") : "N/A"),
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
    { title: "Người tạo", dataIndex: "createdBy", key: "createdBy", width: 120 },
    {
      title: "Ngày sửa",
      dataIndex: "modifiedDate",
      key: "modifiedDate",
      width: 150,
      render: (date: string) =>
        date ? moment(date).format("DD/MM/YYYY HH:mm:ss") : "N/A",
    },
    { title: "Người sửa", dataIndex: "modifiedBy", key: "modifiedBy", width: 120 },
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
  ];

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-center p-2 rounded-t-lg">
        QUẢN LÝ QUÁ TRÌNH TIÊM CHỦNG
      </h2>
      <Row
        justify="space-between"
        style={{ marginBottom: 16, marginTop: 24 }} // Khoảng cách với header
      >
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
              <strong>ID Bản ghi:</strong> {selectedRecord.recordId}
            </p>
            <p>
              <strong>ID Lịch hẹn:</strong> {selectedRecord.appointmentId}
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
              <strong>Hoạt động:</strong> {getIsActiveText(selectedRecord.isActive)}
            </p>
            <p>
              <strong>Ngày tạo:</strong>{" "}
              {selectedRecord.createdDate
                ? moment(selectedRecord.createdDate).format("DD/MM/YYYY HH:mm:ss")
                : "N/A"}
            </p>
            <p>
              <strong>Người tạo:</strong> {selectedRecord.createdBy || "N/A"}
            </p>
            <p>
              <strong>Ngày sửa đổi:</strong>{" "}
              {selectedRecord.modifiedDate
                ? moment(selectedRecord.modifiedDate).format("DD/MM/YYYY HH:mm:ss")
                : "N/A"}
            </p>
            <p>
              <strong>Người sửa đổi:</strong> {selectedRecord.modifiedBy || "N/A"}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VaccinationRecordPage;