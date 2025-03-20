import { useState, useEffect } from "react";
import {
  Table,
  Space,
  message,
  TablePaginationConfig,
  Button,
  Row,
  Col,
  Input,
} from "antd";
import { ColumnType } from "antd/es/table";
import {
  ReloadOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { DiseaseResponseDTO } from "../../models/Disease";
import diseaseService from "../../service/diseaseService";
import AddDiseaseButton from "./AddDiseaseButton";
import EditDiseaseModal from "./EditDiseaseModal";
import ViewDiseaseModal from "./ViewDiseaseModal";

const { Search } = Input;

function DiseaseManagePage() {
  const [diseases, setDiseases] = useState<DiseaseResponseDTO[]>([]);
  const [filteredDiseases, setFilteredDiseases] = useState<
    DiseaseResponseDTO[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [pagination, setPagination] = useState<TablePaginationConfig>({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedDisease, setSelectedDisease] =
    useState<DiseaseResponseDTO | null>(null);

  // Lấy danh sách bệnh khi component được mount
  useEffect(() => {
    fetchDiseases();
  }, []);

  // Hàm lấy danh sách bệnh
  const fetchDiseases = async () => {
    setLoading(true);
    try {
      const allDiseases = await diseaseService.getAllDiseases();
      console.log("API response:", allDiseases);
      setDiseases(allDiseases);
      setFilteredDiseases(allDiseases); // Ban đầu, danh sách lọc bằng danh sách gốc
      setPagination((prev) => ({
        ...prev,
        total: allDiseases.length,
      }));
    } catch (error) {
      console.error("Failed to fetch diseases:", error);
      message.error(
        "Không thể tải danh sách bệnh: " + (error as Error).message
      );
    } finally {
      setLoading(false);
    }
  };

  // Hàm tìm kiếm
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    const filtered = diseases.filter(
      (disease) =>
        disease.name.toLowerCase().includes(value.toLowerCase()) ||
        disease.description.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredDiseases(filtered);
    setPagination((prev) => ({
      ...prev,
      current: 1, // Reset về trang đầu tiên sau khi tìm kiếm
      total: filtered.length,
    }));
  };

  // Hàm làm mới
  const handleReset = () => {
    setSearchKeyword("");
    setFilteredDiseases(diseases); // Khôi phục danh sách gốc
    setPagination((prev) => ({
      ...prev,
      current: 1,
      total: diseases.length,
    }));
  };

  // Xử lý thay đổi phân trang
  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current || prev.current,
      pageSize: newPagination.pageSize || prev.pageSize,
    }));
  };

  // Xử lý xóa bệnh
  const handleDelete = async (diseaseId: number) => {
    try {
      await diseaseService.deleteDisease(diseaseId);
      message.success("Xóa bệnh thành công");
      fetchDiseases();
    } catch (error) {
      message.error("Không thể xóa bệnh: " + (error as Error).message);
    }
  };

  // Xử lý thêm mới gói vaccine
  const handleAddPackage = () => {
    setAddModalVisible(true);
  };

  // Định nghĩa cột cho bảng
  const columns: ColumnType<DiseaseResponseDTO>[] = [
    {
      title: "STT",
      key: "index",
      width: 50,
      align: "center",
      render: (_value, _record, index) => {
        return (pagination.current! - 1) * pagination.pageSize! + index + 1;
      },
    },
    {
      title: "Tên bệnh",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Hành động",
      key: "action",
      width: 250,
      render: (_text, record: DiseaseResponseDTO) => (
        <Space size="middle">
          <EyeOutlined
            onClick={() => {
              setSelectedDisease(record);
              setViewModalVisible(true);
            }}
            title="Xem chi tiết"
          />
          <EditOutlined
            onClick={() => {
              setSelectedDisease(record);
              setEditModalVisible(true);
            }}
            style={{ color: "blue", cursor: "pointer" }}
            title="Chỉnh sửa"
          />
          <DeleteOutlined
            onClick={() => handleDelete(record.diseaseId)}
            title="Xóa"
            style={{ color: "red", cursor: "pointer", marginRight: 8 }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-center p-2 rounded-t-lg">
        QUẢN LÝ BỆNH
      </h2>
      {/* Thanh tìm kiếm và nút Tạo mới */}
      <Row
        gutter={16}
        justify="space-between"
        align="middle"
        className="mb-4"
      >
        <Col>
          <Space className="custom-search">
            <Search
              placeholder="Tìm kiếm theo tên hoặc mô tả"
              onSearch={handleSearch}
              enterButton
              allowClear
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ width: 300 }} // Điều chỉnh độ rộng theo ý muốn
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
            Tạo mới bệnh
          </Button>
        </Col>
      </Row>

      {/* Bảng danh sách bệnh */}
      <Table
        columns={columns}
        dataSource={filteredDiseases}
        rowKey="diseaseId"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        bordered
        locale={{ emptyText: "Không có dữ liệu" }}
      />

      {/* Modal Thêm mới */}
      <AddDiseaseButton
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        refreshDiseases={fetchDiseases}
      />

      {/* Modal Chỉnh sửa */}
      {selectedDisease && (
        <EditDiseaseModal
          disease={selectedDisease}
          visible={editModalVisible}
          onClose={() => {
            setEditModalVisible(false);
            setSelectedDisease(null);
          }}
          refreshDiseases={fetchDiseases}
        />
      )}

      {/* Modal Xem chi tiết */}
      {selectedDisease && (
        <ViewDiseaseModal
          disease={selectedDisease}
          visible={viewModalVisible}
          onClose={() => {
            setViewModalVisible(false);
            setSelectedDisease(null);
          }}
        />
      )}
    </div>
  );
}

export default DiseaseManagePage;
