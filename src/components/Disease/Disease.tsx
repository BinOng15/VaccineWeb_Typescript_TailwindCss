import { useEffect, useState } from "react";
import { Table, Space, message, TablePaginationConfig, Button } from "antd";
import { ColumnType } from "antd/es/table";
import {
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { DiseaseResponseDTO } from "../../models/Disease";
import diseaseService from "../../service/diseaseService";
import AddDiseaseButton from "./AddDiseaseButton";
import EditDiseaseModal from "./EditDiseaseModal";
import ViewDiseaseModal from "./ViewDiseaseModal";

function DiseaseManagePage() {
  const [diseases, setDiseases] = useState<DiseaseResponseDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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
          <Button
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedDisease(record);
              setViewModalVisible(true);
            }}
            title="Xem chi tiết"
          ></Button>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedDisease(record);
              setEditModalVisible(true);
            }}
            title="Chỉnh sửa"
          ></Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.diseaseId)}
            danger
            title="Xóa"
          ></Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="w-full max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-[#102A83] mb-6 text-center">
          Quản lý bệnh
        </h1>
        <Space style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddModalVisible(true)}
          >
            Thêm mới
          </Button>
          <ReloadOutlined
            onClick={fetchDiseases}
            style={{ fontSize: "24px", cursor: "pointer" }}
          />
        </Space>
        <Table
          columns={columns}
          dataSource={diseases}
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
    </div>
  );
}

export default DiseaseManagePage;
