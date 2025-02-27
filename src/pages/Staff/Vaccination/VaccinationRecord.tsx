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
  Dropdown,
  Menu,
  message,
} from "antd";
import { EyeOutlined, ReloadOutlined, SelectOutlined } from "@ant-design/icons";
import moment from "moment";

const { Search } = Input;
const { TabPane } = Tabs;

interface VaccinationRecord {
  id: number;
  childName: string;
  dob: string;
  gender: string;
  registrationDate: string;
  vaccineName: string;
  total_doses: string;
  doses_received: string;
  next_injection: string;
  doctor_name: string;
  room_no: string;
  status: boolean; // Trạng thái xác nhận
  paymentStatus: boolean; // Trạng thái thanh toán
}

const ManageVaccinationSchedule: React.FC = () => {
  const [records, setRecords] = useState<VaccinationRecord[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeTab, setActiveTab] = useState("confirmed");

  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<VaccinationRecord | null>(null);

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedDetail, setSelectedDetail] =
    useState<VaccinationRecord | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);
  const [selectedDoses, setSelectedDoses] = useState<{ [key: string]: string }>(
    {}
  );

  const openPaymentModal = (record: VaccinationRecord) => {
    setSelectedRecord(record);
    setIsPaymentModalVisible(true);
  };

  const openDetailModal = (record: VaccinationRecord) => {
    setSelectedDetail(record);
    setIsDetailModalVisible(true);
  };

  const handlePaymentSelect = (method: string) => {
    setSelectedPaymentMethod(method);
  };

  // Hàm xử lý khi chọn phương thức thanh toán
  const handlePaymentConfirm = () => {
    if (selectedRecord) {
      setRecords((prevRecords) =>
        prevRecords.map((record) =>
          record.id === selectedRecord.id
            ? { ...record, paymentStatus: true }
            : record
        )
      );
      setIsPaymentModalVisible(false);
    }
  };
  const handleSelectDose = (id: string, dose: string) => {
    setSelectedDoses((prev) => ({
      ...prev,
      [id]: dose,
    }));

    message.success(`Đã chọn ${dose} cho bệnh nhân ${id}`);
  };

  const TOTAL_DOSES = 6; // Tổng số mũi tiêm

  const getNextDoses = (selectedDose?: string) => {
    if (!selectedDose) {
      return Array.from({ length: TOTAL_DOSES }, (_, i) => `Mũi ${i + 1}`);
    }

    const selectedDoseNumber = parseInt(selectedDose.replace("Mũi ", ""), 10);
    return Array.from(
      { length: TOTAL_DOSES - selectedDoseNumber },
      (_, i) => `Mũi ${selectedDoseNumber + 1 + i}`
    );
  };

  // Modal hiển thị lựa chọn phương thức thanh toán
  const paymentModal = (
    <Modal
      title="Chọn phương thức thanh toán"
      open={isPaymentModalVisible} // Sửa `visible` → `open`
      onCancel={() => setIsPaymentModalVisible(false)}
      onOk={handlePaymentConfirm}
    >
      <h2 className="text-3xl font-semibold text-center mb-6">THANH TOÁN</h2>
      <p className="text-center mb-6 text-gray-600">
        Hãy lựa chọn phương thức thanh toán cho việc xin của bạn
      </p>

      {/* Danh sách phương thức thanh toán */}
      <div className="space-y-4">
        {/* PayOs */}
        <div
          className={`flex items-center justify-start p-4 border rounded-lg cursor-pointer transition ${
            selectedPaymentMethod === "PayOs"
              ? "border-blue-500 bg-blue-100"
              : "border-blue-200 bg-white"
          }`}
          onClick={() => handlePaymentSelect("PayOs")}
        >
          <img
            src="https://payos.vn/wp-content/uploads/sites/13/2023/07/Untitled-design-8.svg"
            alt="PayOs"
            className="mr-4 w-12 h-12"
          />
          <p className="text-lg font-medium">Thanh toán trực tuyến qua PayOs</p>
        </div>

        {/* Thanh toán tại trung tâm */}
        <div
          className={`flex items-center justify-start p-4 border rounded-lg cursor-pointer transition ${
            selectedPaymentMethod === "PayAtCenter"
              ? "border-blue-500 bg-blue-100"
              : "border-blue-200 bg-white"
          }`}
          onClick={() => handlePaymentSelect("PayAtCenter")}
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png"
            alt="PayAtCenter"
            className="mr-4 w-12 h-12"
          />
          <p className="text-lg font-medium">
            Thanh toán trực tiếp tại trung tâm
          </p>
        </div>
      </div>
    </Modal>
  );

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
            <strong>Vắc xin:</strong> {selectedDetail.vaccineName}
          </p>
          <p>
            <strong>Tổng số mũi:</strong> {selectedDetail.total_doses}
          </p>
          <p>
            <strong>Số mũi đã tiêm:</strong> {selectedDetail.doses_received}
          </p>
          <p>
            <strong>Mũi tiêm tiếp theo:</strong> {selectedDetail.next_injection}
          </p>
          <p>
            <strong>Vắc xin:</strong> {selectedDetail.gender}
          </p>
          <p>
            <strong>Ngày đăng ký:</strong>{" "}
            {moment(selectedDetail.registrationDate).format("DD-MM-YYYY")}
          </p>
          <p>
            <strong>Bác sĩ tiêm:</strong> {selectedDetail.doctor_name}
          </p>
          <p>
            <strong>Phòng tiêm:</strong> {selectedDetail.room_no}
          </p>
          <p>
            <strong>Trạng thái xác nhận:</strong>{" "}
            {selectedDetail.status ? "Đã xác nhận" : "Chưa xác nhận"}
          </p>
          <p>
            <strong>Trạng thái thanh toán:</strong>{" "}
            {selectedDetail.paymentStatus ? "Đã thanh toán" : "Chưa thanh toán"}
          </p>
        </div>
      )}
    </Modal>
  );

  // Fetch vaccination records from API
  const fetchRecords = async (
    page = 1,
    pageSize = 10,
    keyword = "",
    status = "confirmed"
  ) => {
    // API call logic for fetching data
    const data = {
      pageNum: page,
      pageSize: pageSize,
      keyWord: keyword,
      status: status === "confirmed" ? true : false,
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
          vaccineName: "Hexaxim",
          total_doses: "7",
          doses_received: "1",
          next_injection: "Ho gà",
          doctor_name: "Dư Trần Vĩnh Hưng",
          room_no: "201",
          status: true,
          paymentStatus: true,
        },
        {
          id: 2,
          childName: "Trần Thị B",
          dob: "2019-03-15",
          gender: "Nam",
          registrationDate: "2023-10-02",
          vaccineName: "Viêm gan B",
          total_doses: "1",
          doses_received: "0",
          next_injection: "Viêm gan B",
          doctor_name: "Nguyễn Minh Triết",
          room_no: "102",
          status: false,
          paymentStatus: false,
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
    fetchRecords(
      pagination.current,
      pagination.pageSize,
      searchKeyword,
      activeTab
    );
  }, [pagination.current, pagination.pageSize, searchKeyword, activeTab]);

  // Handle table pagination changes
  const handleTableChange = (pagination: any) => {
    const { current, pageSize } = pagination;
    setPagination((prev) => ({ ...prev, current, pageSize }));
    fetchRecords(current, pageSize, searchKeyword, activeTab);
  };

  // Handle search functionality
  const onSearch = (value: string) => {
    setSearchKeyword(value);
    fetchRecords(1, pagination.pageSize, value, activeTab);
  };

  // Handle reset functionality
  const handleReset = () => {
    setSearchKeyword("");
    fetchRecords(1, pagination.pageSize, "", activeTab);
  };

  // Handle tab change
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    fetchRecords(1, pagination.pageSize, searchKeyword, key);
  };

  // Handle changing the "status" and "paymentStatus"
  const toggleStatus = (recordId: number, type: "status" | "paymentStatus") => {
    const updatedRecords = records.map((record) => {
      if (record.id === recordId) {
        return {
          ...record,
          [type]: !record[type],
        };
      }
      return record;
    });
    setRecords(updatedRecords);

    // Here, you would call an API to update the status in the backend
    console.log(`Updated ${type} for record ID: ${recordId}`);
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
      render: (birthDate: string) => moment(birthDate).format("YYYY-MM-DD"),
    },
    {
      title: "Tên/Gói vắc xin",
      dataIndex: "vaccineName",
      key: "vaccineName",
    },
    {
      title: "Tổng số mũi tiêm",
      dataIndex: "total_doses",
      key: "total_doses",
    },
    {
      title: "Số mũi đã tiêm",
      dataIndex: "doses_received",
      key: "doses_received",
    },
    {
      title: "Mũi tiêm tiếp theo",
      dataIndex: "next_injection",
      key: "next_injection",
    },
    {
      title: "Trạng thái thanh toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (paymentStatus: boolean, record: VaccinationRecord) => (
        <Button
          type={paymentStatus ? "primary" : "default"}
          onClick={() => openPaymentModal(record)}
        >
          {paymentStatus ? "Đã thanh toán" : "Chọn phương thức"}
        </Button>
      ),
    },
    {
      title: "Trạng thái xác nhận",
      dataIndex: "status",
      key: "status",
      render: (status: boolean, record: VaccinationRecord) => (
        <Button
          type={status ? "primary" : "default"}
          onClick={() => toggleStatus(record.id, "status")}
        >
          {status ? "Đã xác nhận" : "Chưa xác nhận"}
        </Button>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: VaccinationRecord) => {
        const selectedDose = selectedDoses[record.id];
        const availableDoses = getNextDoses(selectedDose);

        return (
          <Space size="middle">
            {/* Nút Xem Chi Tiết */}
            <EyeOutlined
              style={{ color: "blue", cursor: "pointer" }}
              onClick={() => openDetailModal(record)}
            />

            {/* Nút Chọn Mũi Tiêm */}
            <Dropdown
              disabled={availableDoses.length === 0} // Vô hiệu hóa nếu không còn mũi nào để chọn
              overlay={
                <Menu
                  onClick={({ key }) =>
                    handleSelectDose(record.id.toString(), key)
                  }
                >
                  {availableDoses.map((next_injection) => (
                    <Menu.Item key={next_injection}>{next_injection}</Menu.Item>
                  ))}
                </Menu>
              }
            >
              <SelectOutlined
                style={{
                  color: availableDoses.length === 0 ? "gray" : "green",
                  cursor:
                    availableDoses.length === 0 ? "not-allowed" : "pointer",
                }}
              />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="mt-10 ml-10 mr-10">
      <h2 className="text-2xl font-bold mb-6">QUẢN LÝ TIÊM CHỦNG CHO STAFF</h2>
      <Tabs
        className="custom-tabs"
        defaultActiveKey="confirmed"
        onChange={handleTabChange}
      >
        <TabPane tab="Đã xác nhận" key="confirmed">
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
                onClick={() => alert("Thêm lịch tiêm mới")}
              >
                Thêm lịch tiêm
              </Button>
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
        </TabPane>
        <TabPane tab="Chưa xác nhận" key="unconfirmed">
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
              <Button
                type="primary"
                onClick={() => alert("Thêm lịch tiêm mới")}
              >
                Thêm lịch tiêm
              </Button>
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
        </TabPane>
      </Tabs>
      {paymentModal}
      {detailModal}
    </div>
  );
};

export default ManageVaccinationSchedule;
