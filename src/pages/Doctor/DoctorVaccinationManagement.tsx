/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Table, Input, Button, Space, Row, Col, Select, Modal } from "antd";
import { EditOutlined, EyeOutlined, ReloadOutlined } from "@ant-design/icons";
import moment from "moment";

const { Search } = Input;
const { Option } = Select;

interface VaccinationRecord {
  id: number;
  childName: string;
  dob: string;
  gender: string;
  registrationDate: string;
  vaccineName: string;
  dose: string;
  vaccinationStatus: boolean; // Đã tiêm hoặc chưa tiêm
  reactionStatus: boolean; // Có hoặc không phản ứng
  reactionNote: string; // Ghi chú phản ứng
}

const DoctorVaccinationManagement: React.FC = () => {
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [reactionStatus, setReactionStatus] = useState<boolean | null>(null);
  const [reactionNote, setReactionNote] = useState("");
  const [selectedDetail, setSelectedDetail] =
    useState<VaccinationRecord | null>(null);

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  // Fetch vaccination records from API (mô phỏng dữ liệu)
  const fetchRecords = async (page = 1, pageSize = 5, keyword = "") => {
    const data = {
      pageNum: page,
      pageSize: pageSize,
      keyWord: keyword,
    };
    console.log("Record updated successfully", data);

    // Sample data (replace with real API)
    const response = {
      pageData: [
        {
          id: 1,
          childName: "Nguyễn Văn A",
          dob: "2018-02-25",
          gender: "Nam",
          registrationDate: "2023-10-01",
          vaccineName: "Vaccine A",
          dose: "1",
          doctor_name: "Dư Trần Vĩnh Hưng",
          vaccinationStatus: true,
          reactionStatus: true,
          reactionNote: "Nổi ban nhẹ",
        },
        {
          id: 2,
          childName: "Trần Thị B",
          dob: "2019-03-15",
          gender: "Nữ",
          registrationDate: "2023-10-02",
          vaccineName: "Vaccine B",
          dose: "2",
          doctor_name: "Nguyễn Minh Triết",
          vaccinationStatus: false,
          reactionStatus: false,
          reactionNote: "",
        },
      ],
      pageInfo: { page: 1, size: 5, totalItem: 2 },
    };

    setRecords(response.pageData);
    setPagination({
      current: response.pageInfo.page,
      pageSize: response.pageInfo.size,
      total: response.pageInfo.totalItem,
    });
  };

  useEffect(() => {
    fetchRecords(pagination.current, pagination.pageSize, searchKeyword);
  }, [pagination.current, pagination.pageSize, searchKeyword]);

  // Handle table pagination changes
  const handleTableChange = (pagination: any) => {
    const { current, pageSize } = pagination;
    setPagination((prev) => ({ ...prev, current, pageSize }));
    fetchRecords(current, pageSize, searchKeyword);
  };

  // Handle search functionality
  const onSearch = (value: string) => {
    setSearchKeyword(value);
    fetchRecords(1, pagination.pageSize, value);
  };

  // Handle reset functionality
  const handleReset = () => {
    setSearchKeyword("");
    fetchRecords(1, pagination.pageSize, "");
  };

  // Handle Edit modal visibility and data
  const handleEditModalOpen = (recordId: number) => {
    setSelectedRecordId(recordId);
    const record = records.find((r) => r.id === recordId);
    if (record) {
      setReactionStatus(record.reactionStatus);
      setReactionNote(record.reactionNote);
    }
    setIsEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
    setSelectedRecordId(null);
    setReactionStatus(null);
    setReactionNote("");
  };

  // Handle detail modal
  const handleDetailModalOpen = (record: VaccinationRecord) => {
    setSelectedDetail(record);
    setIsDetailModalVisible(true);
  };

  const detailModal = (
    <Modal
      title="Chi tiết lịch tiêm"
      visible={isDetailModalVisible}
      onCancel={() => setIsDetailModalVisible(false)}
      footer={null}
    >
      {selectedDetail && (
        <div>
          <p>
            <strong>Họ và tên:</strong> {selectedDetail.childName}
          </p>
          <p>
            <strong>Ngày sinh:</strong>{" "}
            {moment(selectedDetail.dob).format("DD-MM-YYYY")}
          </p>
          <p>
            <strong>Giới tính:</strong> {selectedDetail.gender}
          </p>
          <p>
            <strong>Vắc xin:</strong> {selectedDetail.vaccineName}
          </p>
          <p>
            <strong>Mũi tiêm:</strong> {selectedDetail.dose}
          </p>
          <p>
            <strong>Ngày đăng ký:</strong>{" "}
            {moment(selectedDetail.registrationDate).format("DD-MM-YYYY")}
          </p>
          <p>
            <strong>Trạng thái:</strong>{" "}
            {selectedDetail.vaccinationStatus ? "Đã tiêm" : "Chưa tiêm"}
          </p>
          <p>
            <strong>Phản ứng:</strong>{" "}
            {selectedDetail.reactionStatus ? "Có phản ứng" : "Không phản ứng"}
          </p>
          <p>
            <strong>Ghi chú:</strong> {selectedDetail.reactionNote}
          </p>
        </div>
      )}
    </Modal>
  );

  // Handle Save Changes
  const handleSaveChanges = () => {
    const updatedRecords = records.map((record) => {
      if (record.id === selectedRecordId) {
        return {
          ...record,
          reactionStatus: reactionStatus ?? false,
          reactionNote: reactionNote,
        };
      }
      return record;
    });
    setRecords(updatedRecords);
    handleEditModalClose();

    // Call an API to save changes in the backend
    console.log(`Updated record with ID: ${selectedRecordId}`);
  };

  // Handle Toggle Vaccination Status
  const handleToggleVaccinationStatus = (id: number) => {
    const updatedRecords = records.map((record) => {
      if (record.id === id) {
        return {
          ...record,
          vaccinationStatus: !record.vaccinationStatus, // Toggle the vaccination status
        };
      }
      return record;
    });
    setRecords(updatedRecords);

    // You can call an API to update the vaccination status on the server
    console.log(`Toggled vaccination status for record with ID: ${id}`);
  };

  // Table columns
  const columns = [
    {
      title: "Họ và tên của trẻ",
      dataIndex: "childName",
      key: "childName",
    },
    {
      title: "Ngày sinh",
      dataIndex: "birthDate",
      render: (birthDate: string) => moment(birthDate).format("DD-MM-YYYY"),
    },
    {
      title: "Ngày đăng ký tiêm",
      dataIndex: "registrationDate",
      render: (registrationDate: string) =>
        moment(registrationDate).format("DD-MM-YYYY"),
    },
    {
      title: "Tên/Gói vắc xin",
      dataIndex: "vaccineName",
      key: "vaccineName",
    },
    {
      title: "Mũi tiêm",
      dataIndex: "dose",
      key: "dose",
    },
    {
      title: "Trạng thái",
      dataIndex: "vaccinationStatus",
      key: "vaccinationStatus",
      render: (vaccinationStatus: boolean, record: VaccinationRecord) => (
        <Button
          onClick={() => handleToggleVaccinationStatus(record.id)}
          type={vaccinationStatus ? "primary" : "default"}
        >
          {vaccinationStatus ? "Đã tiêm" : "Chưa tiêm"}
        </Button>
      ),
    },
    {
      title: "Phản ứng",
      dataIndex: "reactionStatus",
      key: "reactionStatus",
      render: (reactionStatus: boolean) => (
        <span>{reactionStatus ? "Có phản ứng" : "Không phản ứng"}</span>
      ),
    },
    {
      title: "Ghi chú",
      dataIndex: "reactionNote",
      key: "reactionNote",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: VaccinationRecord) => (
        <Space size="middle">
          {/* Nút xem chi tiết */}
          <EyeOutlined
            onClick={() => handleDetailModalOpen(record)}
            style={{ color: "blue", cursor: "pointer" }}
          />

          {/* Nút chỉnh sửa */}
          <EditOutlined
            onClick={() => handleEditModalOpen(record.id)}
            style={{ color: "black", cursor: "pointer" }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-center p-2 rounded-t-lg">
        QUẢN LÝ QUÁ TRÌNH TIÊM CHỦNG
      </h2>
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
      </Row>
      <Table
        columns={columns}
        dataSource={records}
        rowKey="id"
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        onChange={handleTableChange}
      />

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa phản ứng tiêm"
        visible={isEditModalVisible}
        onCancel={handleEditModalClose}
        onOk={handleSaveChanges}
      >
        <Row>
          <Col span={24}>
            <Select
              defaultValue={reactionStatus ? "Có phản ứng" : "Không phản ứng"}
              style={{ width: "100%" }}
              onChange={(value) => setReactionStatus(value === "Có phản ứng")}
            >
              <Option value="Có phản ứng">Có phản ứng</Option>
              <Option value="Không phản ứng">Không phản ứng</Option>
            </Select>
          </Col>
        </Row>
        <Row style={{ marginTop: 10 }}>
          <Col span={24}>
            <Input.TextArea
              placeholder="Ghi chú về phản ứng"
              value={reactionNote}
              onChange={(e) => setReactionNote(e.target.value)}
              rows={4}
            />
          </Col>
        </Row>
      </Modal>
      {detailModal}
    </div>
  );
};

export default DoctorVaccinationManagement;
