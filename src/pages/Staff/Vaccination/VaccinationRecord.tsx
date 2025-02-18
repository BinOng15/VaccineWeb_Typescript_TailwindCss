/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Table, Input, Button, Space, Row, Col, Tabs } from "antd";
import { EditOutlined, ReloadOutlined } from "@ant-design/icons";
import moment from "moment";

const { Search } = Input;
const { TabPane } = Tabs;

interface VaccinationRecord {
  id: number;
  childName: string;
  birthDate: string;
  registrationDate: string;
  vaccineName: string;
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
          birthDate: "2018-02-25",
          registrationDate: "2023-10-01",
          vaccineName: "Vắc xin MMR",
          status: true,
          paymentStatus: true,
        },
        {
          id: 2,
          childName: "Trần Thị B",
          birthDate: "2019-03-15",
          registrationDate: "2023-10-02",
          vaccineName: "Vắc xin bạch hầu",
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
      title: "Ngày đăng ký tiêm",
      dataIndex: "registrationDate",
      render: (registrationDate: string) =>
        moment(registrationDate).format("YYYY-MM-DD"),
    },
    {
      title: "Tên/Gói vắc xin",
      dataIndex: "vaccineName",
      key: "vaccineName",
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
      title: "Trạng thái thanh toán",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      render: (paymentStatus: boolean, record: VaccinationRecord) => (
        <Button
          type={paymentStatus ? "primary" : "default"}
          onClick={() => toggleStatus(record.id, "paymentStatus")}
        >
          {paymentStatus ? "Đã thanh toán" : "Chưa thanh toán"}
        </Button>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: VaccinationRecord) => (
        <EditOutlined
          onClick={() => alert(`Edit record with ID: ${record.id}`)}
          style={{ color: "black", cursor: "pointer" }}
        />
      ),
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
                <Button onClick={handleReset}>Reset</Button>
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
    </div>
  );
};

export default ManageVaccinationSchedule;
