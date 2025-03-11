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
  message,
  Modal,
} from "antd";
import {
  EditOutlined,
  ReloadOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";

import AddVaccinePackageModal from "./AddVaccinePackageModal";
import EditVaccinePackageModal from "./EditVaccinePackageModal";
import moment from "moment";
import { VaccinePackageResponseDTO } from "../../../models/VaccinePackage";
import vaccinePackageService from "../../../service/vaccinePackageService";
import { ColumnType } from "antd/es/table";

const { Search } = Input;
const { TabPane } = Tabs;

// Interface VaccinePackage khớp với VaccinePackageResponseDTO từ backend
interface VaccinePackage extends VaccinePackageResponseDTO {
  packageId: number; // Alias cho packageId từ VaccinePackageResponseDTO
}

const VaccinePackageManagePage: React.FC = () => {
  const [vaccinePackages, setVaccinePackages] = useState<VaccinePackage[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeTab, setActiveTab] = useState("activePackages");
  const [isAddPackageModalVisible, setIsAddPackageModalVisible] =
    useState(false);
  const [isEditPackageModalVisible, setIsEditPackageModalVisible] =
    useState(false);
  const [editedPackage, setEditedPackage] = useState<VaccinePackage | null>(
    null
  );
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<VaccinePackage | null>(
    null
  );

  const fetchVaccinePackages = async () => {
    setLoading(true);
    try {
      const response = await vaccinePackageService.getAllPackages();
      console.log("Phản hồi API:", response);
      const filteredPackages = response
        .filter((pkg) =>
          activeTab === "inactivePackages"
            ? pkg.isActive === 0
            : pkg.isActive === 1
        )
        .map((pkg) => ({ ...pkg, packageId: pkg.packageId }));
      console.log("Gói vaccine đã lọc:", filteredPackages);
      setVaccinePackages(filteredPackages);
      setPagination({
        current: 1,
        pageSize: pagination.pageSize,
        total: filteredPackages.length,
      });
    } catch (error) {
      console.error("Lỗi khi lấy gói vaccine:", error);
      message.error(
        "Không thể lấy danh sách gói vaccine: " + (error as Error).message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccinePackages();
  }, [activeTab]);

  const handleTableChange = (pagination: any) => {
    const { current, pageSize } = pagination;
    setPagination((prev) => ({ ...prev, current, pageSize }));
    fetchVaccinePackages();
  };

  const onSearch = (value: string) => {
    setSearchKeyword(value);
    setVaccinePackages((prevPackages) =>
      prevPackages.filter((pkg) =>
        pkg.name.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  const handleReset = () => {
    setSearchKeyword("");
    fetchVaccinePackages();
  };

  const handleAddPackage = () => {
    setIsAddPackageModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsAddPackageModalVisible(false);
    setIsEditPackageModalVisible(false);
    setEditedPackage(null);
    setIsDetailModalVisible(false);
    setSelectedPackage(null);
  };

  const handleUpdate = (packageData: VaccinePackage) => {
    if (!packageData.packageId || typeof packageData.packageId !== "number") {
      console.error(
        "Dữ liệu gói vaccine không hợp lệ trong handleUpdate:",
        packageData
      );
      message.error("Dữ liệu gói vaccine không hợp lệ để chỉnh sửa");
      return;
    }
    console.log("Chỉnh sửa gói vaccine với ID:", packageData.packageId);
    setEditedPackage(packageData);
    setIsEditPackageModalVisible(true);
  };

  const handleDelete = async (packageId: number) => {
    Modal.confirm({
      title: "Bạn có muốn xóa gói vaccine này không?",
      content: "Hành động này không thể hoàn tác.",
      okText: "Có",
      okType: "danger",
      cancelText: "Không",
      onOk: async () => {
        try {
          const success = await vaccinePackageService.deletePackage(packageId);
          if (success) {
            message.success("Gói vaccine đã được xóa thành công");
            fetchVaccinePackages();
          } else {
            message.error("Xóa gói vaccine thất bại!");
          }
        } catch (error) {
          console.error("Lỗi khi xóa gói vaccine:", error);
          message.error(
            "Không thể xóa gói vaccine: " + (error as Error).message
          );
        }
      },
      onCancel() {
        console.log("Hủy xóa");
      },
    });
  };

  const handleViewDetail = (packageData: VaccinePackage) => {
    if (!packageData.packageId || typeof packageData.packageId !== "number") {
      console.error(
        "Dữ liệu gói vaccine không hợp lệ để xem chi tiết:",
        packageData
      );
      message.error("Dữ liệu gói vaccine không hợp lệ để xem");
      return;
    }
    console.log("Xem chi tiết gói vaccine với ID:", packageData.packageId);
    setSelectedPackage(packageData);
    setIsDetailModalVisible(true);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const columns: ColumnType<VaccinePackageResponseDTO>[] = [
    {
      title: "STT",
      key: "index",
      width: 50,
      align: "center",
      render: (_: any, __: VaccinePackageResponseDTO, index: number) => {
        const currentIndex =
          (pagination.current - 1) * pagination.pageSize + index + 1;
        return currentIndex;
      },
    },
    {
      title: "Tên gói vaccine",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 300,
    },
    {
      title: "Giá tổng",
      dataIndex: "totalPrice",
      key: "totalPrice",
      width: 150,
      render: (totalPrice: number) =>
        totalPrice ? `${totalPrice.toLocaleString()} đồng` : "N/A",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      render: (isActive: number) =>
        isActive === 1 ? "Hoạt động" : "Không hoạt động",
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      render: (_: any, record: VaccinePackage) => {
        console.log("Bản ghi trong Cột Hành động:", record);
        if (!record.packageId || typeof record.packageId !== "number") {
          console.error("ID gói vaccine không hợp lệ trong bản ghi:", record);
          return null;
        }
        return (
          <Space>
            <EditOutlined
              onClick={() => handleUpdate(record)}
              style={{ color: "black", cursor: "pointer", marginRight: 8 }}
            />
            <EyeOutlined
              onClick={() => handleViewDetail(record)}
              style={{ color: "blue", cursor: "pointer", marginRight: 8 }}
            />
            <DeleteOutlined
              onClick={() => handleDelete(record.packageId)}
              style={{ color: "red", cursor: "pointer" }}
            />
          </Space>
        );
      },
    },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-center p-2 rounded-t-lg">
        QUẢN LÝ GÓI VẮC XIN
      </h2>
      <Tabs
        className="custom-tabs"
        defaultActiveKey="activePackages"
        onChange={handleTabChange}
      >
        <TabPane tab="Gói vaccine đang hoạt động" key="activePackages">
          <Row justify="space-between" style={{ marginBottom: 16 }}>
            <Col>
              <Space className="custom-search">
                <Search
                  placeholder="Tìm kiếm theo tên hoặc mô tả"
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
                onClick={handleAddPackage}
              >
                Tạo mới gói vaccine
              </Button>
            </Col>
          </Row>
          <Table
            columns={columns}
            dataSource={vaccinePackages}
            rowKey="packageId"
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
        <TabPane tab="Gói vaccine không hoạt động" key="inactivePackages">
          <Row justify="space-between" style={{ marginBottom: 16 }}>
            <Col>
              <Space>
                <Search
                  placeholder="Tìm kiếm theo tên hoặc mô tả"
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
              <Button type="primary" onClick={handleAddPackage}>
                Tạo mới gói vaccine
              </Button>
            </Col>
          </Row>
          <Table
            columns={columns}
            dataSource={vaccinePackages}
            rowKey="packageId"
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

      <AddVaccinePackageModal
        visible={isAddPackageModalVisible}
        onClose={handleCloseModal}
        onSuccess={fetchVaccinePackages}
      />

      {editedPackage && (
        <EditVaccinePackageModal
          packageData={editedPackage}
          visible={isEditPackageModalVisible}
          onClose={handleCloseModal}
          refreshPackages={fetchVaccinePackages}
        />
      )}

      {/* Modal để xem chi tiết thông tin gói vaccine */}
      <Modal
        title="Chi tiết Gói vaccine"
        visible={isDetailModalVisible}
        onCancel={handleCloseModal}
        footer={null}
      >
        {selectedPackage && (
          <div style={{ padding: 16 }}>
            <p>
              <strong>Tên gói vaccine:</strong> {selectedPackage.name || "N/A"}
            </p>
            <p>
              <strong>Mô tả:</strong> {selectedPackage.description || "N/A"}
            </p>
            <p>
              <strong>Giá tổng:</strong>{" "}
              {selectedPackage.totalPrice
                ? `${selectedPackage.totalPrice.toLocaleString()} đồng`
                : "N/A"}
            </p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              {selectedPackage.isActive === 1 ? "Hoạt động" : "Không hoạt động"}
            </p>
            <p>
              <strong>Ngày tạo:</strong>{" "}
              {moment(selectedPackage.createdDate).format(
                "HH:mm - DD/MM/YYYY"
              ) || "N/A"}
            </p>
            <p>
              <strong>Người tạo:</strong> {selectedPackage.createdBy || "N/A"}
            </p>
            <p>
              <strong>Ngày sửa đổi:</strong>{" "}
              {moment(selectedPackage.modifiedDate).format(
                "HH:mm - DD/MM/YYYY"
              ) || "N/A"}
            </p>
            <p>
              <strong>Người sửa đổi:</strong>{" "}
              {selectedPackage.modifiedBy || "N/A"}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VaccinePackageManagePage;
