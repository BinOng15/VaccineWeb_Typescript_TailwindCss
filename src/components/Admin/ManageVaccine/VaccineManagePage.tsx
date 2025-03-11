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
import { VaccineResponseDTO } from "../../../models/Vaccine";
import vaccineService from "../../../service/vaccineService";
import EditVaccineModal from "../../Vaccine/EditVaccineModal";
import AddVaccineModal from "../../Vaccine/AddVaccineButton";
import moment from "moment";
import { ColumnType } from "antd/es/table";

const { Search } = Input;
const { TabPane } = Tabs;

// Interface Vaccine khớp với VaccineResponseDTO từ backend
interface Vaccine extends VaccineResponseDTO {
  vaccineId: number; // Alias cho VaccineId từ VaccineResponseDTO
}

const VaccineManagePage: React.FC = () => {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 2,
    total: 0,
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeTab, setActiveTab] = useState("activeVaccines");
  const [isAddVaccineModalVisible, setIsAddVaccineModalVisible] =
    useState(false);
  const [isEditVaccineModalVisible, setIsEditVaccineModalVisible] =
    useState(false);
  const [editedVaccine, setEditedVaccine] = useState<Vaccine | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState<Vaccine | null>(null);

  const fetchVaccines = async () => {
    setLoading(true);
    try {
      const response = await vaccineService.getAllVaccines();
      console.log("Phản hồi API:", response);
      const filteredVaccines = response
        .filter((vaccine) =>
          activeTab === "inactiveVaccines"
            ? vaccine.isActive === 0
            : vaccine.isActive === 1
        )
        .map((vaccine) => ({ ...vaccine, vaccineId: vaccine.vaccineId }));
      console.log("Vắc xin đã lọc:", filteredVaccines);
      setVaccines(filteredVaccines);
      setPagination((prev) => ({
        ...prev,
        total: filteredVaccines.length,
      }));
    } catch (error) {
      console.error("Lỗi khi lấy vắc xin:", error);
      message.error(
        "Không thể lấy danh sách vắc xin: " + (error as Error).message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVaccines();
  }, [activeTab]);

  const handleTableChange = (pagination: any) => {
    const { current, pageSize } = pagination;
    setPagination((prev) => ({
      ...prev,
      current,
      pageSize,
    }));
  };

  const onSearch = (value: string) => {
    setSearchKeyword(value);
    const filteredVaccines = vaccines.filter((vaccine) =>
      vaccine.name.toLowerCase().includes(value.toLowerCase())
    );
    setVaccines(filteredVaccines);
    setPagination((prev) => ({
      ...prev,
      total: filteredVaccines.length,
      current: 1, // Reset về trang 1 khi tìm kiếm
    }));
  };

  const handleReset = () => {
    setSearchKeyword("");
    fetchVaccines();
  };

  const handleAddVaccine = () => {
    setIsAddVaccineModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsAddVaccineModalVisible(false);
    setIsEditVaccineModalVisible(false);
    setEditedVaccine(null);
    setIsDetailModalVisible(false);
    setSelectedVaccine(null);
  };

  const handleUpdate = (vaccine: Vaccine) => {
    if (!vaccine.vaccineId || typeof vaccine.vaccineId !== "number") {
      console.error(
        "Dữ liệu vắc xin không hợp lệ trong handleUpdate:",
        vaccine
      );
      message.error("Dữ liệu vắc xin không hợp lệ để chỉnh sửa");
      return;
    }
    console.log("Chỉnh sửa Vắc xin với ID:", vaccine.vaccineId);
    setEditedVaccine(vaccine);
    setIsEditVaccineModalVisible(true);
  };

  const handleDelete = async (vaccineId: number) => {
    Modal.confirm({
      title: "Bạn có muốn xóa vắc xin này không?",
      content: "Hành động này không thể hoàn tác.",
      okText: "Có",
      okType: "danger",
      cancelText: "Không",
      onOk: async () => {
        try {
          await vaccineService.deleteVaccine(vaccineId);
          message.success("Vắc xin đã được xóa thành công");
          fetchVaccines(); // Refresh danh sách vắc xin sau khi xóa
        } catch (error) {
          console.error("Lỗi khi xóa vắc xin:", error);
          message.error("Không thể xóa vắc xin: " + (error as Error).message);
        }
      },
      onCancel() {
        console.log("Hủy xóa");
      },
    });
  };

  const handleViewDetail = (vaccine: Vaccine) => {
    if (!vaccine.vaccineId || typeof vaccine.vaccineId !== "number") {
      console.error("Dữ liệu vắc xin không hợp lệ để xem chi tiết:", vaccine);
      message.error("Dữ liệu vắc xin không hợp lệ để xem");
      return;
    }
    console.log("Xem chi tiết Vắc xin với ID:", vaccine.vaccineId);
    setSelectedVaccine(vaccine);
    setIsDetailModalVisible(true);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    fetchVaccines(); // Lấy lại dữ liệu khi chuyển tab
  };

  const columns: ColumnType<VaccineResponseDTO>[] = [
    {
      title: "STT",
      key: "index",
      width: 50,
      align: "center",
      render: (_: any, __: VaccineResponseDTO, index: number) => {
        const currentIndex =
          (pagination.current - 1) * pagination.pageSize + index + 1;
        return currentIndex;
      },
    },
    {
      title: "Tên vắc xin",
      dataIndex: "name",
      key: "Name",
      width: 120,
    },
    {
      title: "Hình ảnh",
      dataIndex: "image",
      key: "Image",
      width: 150,
      render: (image: string, record: Vaccine) => (
        <div style={{ textAlign: "center" }}>
          {image ? (
            <img
              src={image}
              alt={record.name || "Hình ảnh Vắc xin"}
              style={{ width: 200, height: 200, objectFit: "contain" }}
            />
          ) : (
            "N/A"
          )}
        </div>
      ),
    },
    {
      title: "Thông tin",
      dataIndex: "description",
      width: 500,
      key: "Description",
    },
    {
      title: "Giá",
      dataIndex: "price",
      key: "Price",
      width: 150,
      render: (price: number) =>
        price ? `${price.toLocaleString()} đồng` : "N/A",
    },
    {
      title: "Nhà sản xuất",
      dataIndex: "manufacturer",
      width: 250,
      key: "Manufacturer",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "IsActive",
      width: 120,
      render: (isActive: number) => (isActive === 1 ? "Có" : "Không"),
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      render: (_: any, record: Vaccine) => {
        console.log("Bản ghi trong Cột Hành động:", record);
        if (!record.vaccineId || typeof record.vaccineId !== "number") {
          console.error("ID vắc xin không hợp lệ trong bản ghi:", record);
          return null;
        }
        return (
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
              onClick={() => handleDelete(record.vaccineId)}
              style={{ color: "red", cursor: "pointer" }}
            />
          </span>
        );
      },
    },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-center p-2 rounded-t-lg">
        QUẢN LÝ VẮC XIN
      </h2>
      <Tabs
        className="custom-tabs"
        defaultActiveKey="activeVaccines"
        onChange={handleTabChange}
      >
        <TabPane tab="Vắc xin đang có" key="activeVaccines">
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
                className="custom-button"
                onClick={handleAddVaccine}
              >
                Tạo mới vắc xin
              </Button>
            </Col>
          </Row>
          <Table
            columns={columns}
            dataSource={vaccines.slice(
              (pagination.current - 1) * pagination.pageSize,
              pagination.current * pagination.pageSize
            )}
            rowKey="vaccineId"
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
        <TabPane tab="Vắc xin đã hết" key="inactiveVaccines">
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
                />
              </Space>
            </Col>
            <Col>
              <Button type="primary" onClick={handleAddVaccine}>
                Tạo mới vắc xin
              </Button>
            </Col>
          </Row>
          <Table
            columns={columns}
            dataSource={vaccines.slice(
              (pagination.current - 1) * pagination.pageSize,
              pagination.current * pagination.pageSize
            )}
            rowKey="vaccineId"
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

      <AddVaccineModal
        visible={isAddVaccineModalVisible}
        onClose={handleCloseModal}
        refreshVaccines={fetchVaccines}
      />

      {editedVaccine && (
        <EditVaccineModal
          vaccine={editedVaccine}
          visible={isEditVaccineModalVisible}
          onClose={handleCloseModal}
          refreshVaccines={fetchVaccines}
        />
      )}

      {/* Modal để xem chi tiết thông tin vaccine */}
      <Modal
        title="Chi tiết Vắc xin"
        visible={isDetailModalVisible}
        onCancel={handleCloseModal}
        footer={null}
      >
        {selectedVaccine && (
          <div style={{ padding: 16 }}>
            <p>
              <strong>Tên vắc xin:</strong> {selectedVaccine.name || "N/A"}
            </p>
            <p>
              <strong>Thông tin:</strong> {selectedVaccine.description || "N/A"}
            </p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              {selectedVaccine.isActive === 1 ? "Có" : "Không"}
            </p>
            <p>
              <strong>Giá:</strong> {selectedVaccine.price || "N/A"}
            </p>
            <p>
              <strong>Nhà sản xuất:</strong>{" "}
              {selectedVaccine.manufacturer || "N/A"}
            </p>
            {selectedVaccine.image && (
              <p>
                <strong>Hình ảnh:</strong>
                <img
                  src={selectedVaccine.image}
                  alt={selectedVaccine.name || "Hình ảnh Vắc xin"}
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
              <strong>Ngày sản xuất:</strong>{" "}
              {moment(selectedVaccine.dateOfManufacture).format("DD/MM/YYYY") ||
                "N/A"}
            </p>
            <p>
              <strong>Ngày hết hạn:</strong>{" "}
              {moment(selectedVaccine.expiryDate).format("DD/MM/YYYY") || "N/A"}
            </p>
            <p>
              <strong>Ngày tạo:</strong>{" "}
              {moment(selectedVaccine.createdDate).format(
                "HH:mm - DD/MM/YYYY"
              ) || "N/A"}
            </p>
            <p>
              <strong>Ngày sửa đổi:</strong>{" "}
              {moment(selectedVaccine.modifiedDate).format(
                "HH:mm - DD/MM/YYYY"
              ) || "N/A"}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VaccineManagePage;
