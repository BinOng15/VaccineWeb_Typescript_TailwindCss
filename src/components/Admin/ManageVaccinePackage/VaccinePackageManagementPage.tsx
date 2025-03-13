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
  Descriptions,
} from "antd";
import {
  EditOutlined,
  ReloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import AddVaccinePackageModal from "./AddVaccinePackageModal";
import EditVaccinePackageModal from "./EditVaccinePackageModal";
import moment from "moment";
import { VaccinePackageResponseDTO } from "../../../models/VaccinePackage";
import vaccinePackageService from "../../../service/vaccinePackageService";
import { ColumnType } from "antd/es/table";

const { Search } = Input;
const { TabPane } = Tabs;

interface VaccinePackage extends VaccinePackageResponseDTO {
  vaccinePackageId: number;
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
        .map((pkg) => ({ ...pkg, vaccinePackageId: pkg.vaccinePackageId }));
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
    if (
      !packageData.vaccinePackageId ||
      typeof packageData.vaccinePackageId !== "number"
    ) {
      console.error(
        "Dữ liệu gói vaccine không hợp lệ trong handleUpdate:",
        packageData
      );
      message.error("Dữ liệu gói vaccine không hợp lệ để chỉnh sửa");
      return;
    }
    console.log("Chỉnh sửa gói vaccine với ID:", packageData.vaccinePackageId);
    setEditedPackage(packageData);
    setIsEditPackageModalVisible(true);
  };

  const handleDelete = async (vaccinePackageId: number) => {
    Modal.confirm({
      title: "Bạn có muốn xóa gói vaccine này không?",
      content: "Hành động này không thể hoàn tác.",
      okText: "Có",
      okType: "danger",
      cancelText: "Không",
      onOk: async () => {
        try {
          const success = await vaccinePackageService.deletePackage(
            vaccinePackageId
          );
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
    if (
      !packageData.vaccinePackageId ||
      typeof packageData.vaccinePackageId !== "number"
    ) {
      console.error(
        "Dữ liệu gói vaccine không hợp lệ để xem chi tiết:",
        packageData
      );
      message.error("Dữ liệu gói vaccine không hợp lệ để xem");
      return;
    }
    console.log(
      "Xem chi tiết gói vaccine với ID:",
      packageData.vaccinePackageId
    );
    setSelectedPackage(packageData);
    setIsDetailModalVisible(true);
  };

  const handleUpdateTotalPrice = async (vaccinePackageId: number) => {
    Modal.confirm({
      title: "Bạn có muốn cập nhật giá tổng cho gói vắc xin này không?",
      okText: "Có",
      cancelText: "Không",
      onOk: async () => {
        try {
          const success = await vaccinePackageService.updateTotalPrice(
            vaccinePackageId
          );
          if (success) {
            message.success("Cập nhật giá tổng thành công.");
            fetchVaccinePackages(); // Làm mới dữ liệu sau khi cập nhật
          } else {
            message.error("Cập nhật giá tổng thất bại.");
          }
        } catch (error) {
          console.error("Lỗi khi cập nhật giá tổng:", error);
          message.error("Không thể cập nhật giá tổng.");
        }
      },
    });
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
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Độ tuổi tiêm(tháng)",
      dataIndex: "ageInMonths",
      key: "ageInMonths",
    },
    {
      title: "Tổng số liều",
      dataIndex: "totalDoses",
      key: "totalDoses",
    },
    {
      title: "Giá tổng",
      dataIndex: "totalPrice",
      key: "totalPrice",
      render: (totalPrice: number) =>
        totalPrice ? `${totalPrice.toLocaleString()} đồng` : "N/A",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: number) =>
        isActive === 1 ? "Hoạt động" : "Không hoạt động",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: VaccinePackage) => {
        console.log("Bản ghi trong Cột Hành động:", record);
        if (
          !record.vaccinePackageId ||
          typeof record.vaccinePackageId !== "number"
        ) {
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
              onClick={() => handleDelete(record.vaccinePackageId)}
              style={{ color: "red", cursor: "pointer", marginRight: 8 }}
            />
            <DollarOutlined
              onClick={() => handleUpdateTotalPrice(record.vaccinePackageId)}
              style={{ color: "green", cursor: "pointer" }}
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
            rowKey="vaccinePackageId"
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
            rowKey="vaccinePackageId"
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

      <Modal
        title="CHI TIẾT GÓI VẮC XIN"
        visible={isDetailModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        centered
      >
        {selectedPackage && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Tên gói vaccine">
              {selectedPackage.name || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả">
              {selectedPackage.description || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Giá tổng">
              {selectedPackage.totalPrice
                ? `${selectedPackage.totalPrice.toLocaleString()} đồng`
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {selectedPackage.isActive === 1 ? "Hoạt động" : "Không hoạt động"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {selectedPackage.createdDate
                ? moment(selectedPackage.createdDate).format(
                    "HH:mm - DD/MM/YYYY"
                  )
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Người tạo">
              {selectedPackage.createdBy || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sửa đổi">
              {selectedPackage.modifiedDate
                ? moment(selectedPackage.modifiedDate).format(
                    "HH:mm - DD/MM/YYYY"
                  )
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Người sửa đổi">
              {selectedPackage.modifiedBy || "N/A"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default VaccinePackageManagePage;
