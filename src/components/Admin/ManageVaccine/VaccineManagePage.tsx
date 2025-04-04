/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  Space,
  Row,
  Col,
  message,
  Modal,
  Descriptions,
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

interface Vaccine extends VaccineResponseDTO {
  vaccineId: number;
}

const VaccineManagePage: React.FC = () => {
  const [allVaccines, setAllVaccines] = useState<Vaccine[]>([]); // Lưu trữ toàn bộ vaccine từ API
  const [displayedVaccines, setDisplayedVaccines] = useState<Vaccine[]>([]); // Vaccine hiển thị sau khi lọc
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 2,
    total: 0,
  });
  const [searchKeyword, setSearchKeyword] = useState("");
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
      const vaccinesWithId = response.map((vaccine) => ({
        ...vaccine,
        vaccineId: vaccine.vaccineId,
      }));
      setAllVaccines(vaccinesWithId); // Lưu trữ toàn bộ vaccine

      // Chỉ hiển thị vaccine có isActive = 1, và lọc theo từ khóa tìm kiếm
      const filteredVaccines = vaccinesWithId.filter(
        (vaccine) =>
          vaccine.isActive === 1 &&
          (searchKeyword
            ? vaccine.name.toLowerCase().includes(searchKeyword.toLowerCase())
            : true)
      );
      setDisplayedVaccines(filteredVaccines);
      setPagination((prev) => ({
        ...prev,
        total: filteredVaccines.length,
        current: 1,
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
  }, []); // Không còn phụ thuộc vào activeTab

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
    const filteredVaccines = allVaccines.filter(
      (vaccine) =>
        vaccine.isActive === 1 &&
        (value
          ? vaccine.name.toLowerCase().includes(value.toLowerCase())
          : true)
    );
    setDisplayedVaccines(filteredVaccines);
    setPagination((prev) => ({
      ...prev,
      total: filteredVaccines.length,
      current: 1,
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
          fetchVaccines();
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
      title: "Số lượng",
      dataIndex: "quantity",
      width: 100,
      key: "quantity",
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
          <Space size="middle">
            <EditOutlined
              onClick={() => handleUpdate(record)}
              style={{ color: "black", cursor: "pointer" }}
            />
            <EyeOutlined
              onClick={() => handleViewDetail(record)}
              style={{ color: "blue", cursor: "pointer" }}
            />
            <DeleteOutlined
              onClick={() => handleDelete(record.vaccineId)}
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
        QUẢN LÝ VẮC XIN
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
        dataSource={displayedVaccines.slice(
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
        title="CHI TIẾT VẮC XIN"
        visible={isDetailModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        centered
        style={{ width: "800px", maxHeight: "600px" }}
        bodyStyle={{ maxHeight: "500px", overflowY: "auto" }}
      >
        {selectedVaccine && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Tên vắc xin">
              {selectedVaccine.name || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Thông tin">
              {selectedVaccine.description || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Giá">
              {selectedVaccine.price
                ? `${selectedVaccine.price.toLocaleString()} đồng`
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Nhà sản xuất">
              {selectedVaccine.manufacturer || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Hình ảnh">
              {selectedVaccine.image ? (
                <img
                  src={selectedVaccine.image}
                  alt={selectedVaccine.name || "Hình ảnh Vắc xin"}
                  style={{ width: 100, height: 100, objectFit: "contain" }}
                />
              ) : (
                "N/A"
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng">
              {selectedVaccine.quantity !== undefined
                ? selectedVaccine.quantity.toString()
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {selectedVaccine.isActive === 1 ? "Có" : "Không"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sản xuất">
              {selectedVaccine.dateOfManufacture
                ? moment(
                  selectedVaccine.dateOfManufacture,
                  "DD/MM/YYYY"
                ).format("DD/MM/YYYY")
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày hết hạn">
              {selectedVaccine.expiryDate
                ? moment(selectedVaccine.expiryDate, "DD/MM/YYYY").format(
                  "DD/MM/YYYY"
                )
                : "N/A"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default VaccineManagePage;
