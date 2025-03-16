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
import { ColumnType } from "antd/es/table";
import { VaccinePackageDetailResponseDTO } from "../../../models/VaccinePackageDetails";
import { VaccineResponseDTO } from "../../../models/Vaccine";
import { VaccinePackageResponseDTO } from "../../../models/VaccinePackage";
import vaccinePackageDetailService from "../../../service/vaccinePackageDetailService";
import vaccineService from "../../../service/vaccineService";
import vaccinePackageService from "../../../service/vaccinePackageService";
import AddVaccinePackageDetailButton from "./AddVaccinePackageDetailButton";
import EditVaccinePackageDetailModal from "./EditVaccinePackageDetailModal";

const { Search } = Input;
const { TabPane } = Tabs;

interface VaccinePackageDetail extends VaccinePackageDetailResponseDTO {}

const VaccinePackageDetailManagement: React.FC = () => {
  const [details, setDetails] = useState<VaccinePackageDetail[]>([]);
  const [originalDetails, setOriginalDetails] = useState<
    VaccinePackageDetail[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeTab, setActiveTab] = useState("activeDetails");
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editedDetail, setEditedDetail] = useState<VaccinePackageDetail | null>(
    null
  );
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedDetail, setSelectedDetail] =
    useState<VaccinePackageDetail | null>(null);
  const [vaccines, setVaccines] = useState<VaccineResponseDTO[]>([]);
  const [vaccinePackages, setVaccinePackages] = useState<
    VaccinePackageResponseDTO[]
  >([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Lấy dữ liệu từ các service
      const allVaccines = await vaccineService.getAllVaccines();
      const allVaccinePackages = await vaccinePackageService.getAllPackages();
      const allDetails =
        await vaccinePackageDetailService.getAllPackagesDetail();

      setVaccines(allVaccines);
      setVaccinePackages(allVaccinePackages);
      const filteredDetails = allDetails;

      setDetails(filteredDetails);
      setOriginalDetails(filteredDetails); // Lưu dữ liệu gốc để reset
      setPagination((prev) => ({
        ...prev,
        total: filteredDetails.length,
      }));
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
      message.error("Không thể lấy danh sách chi tiết gói vắc xin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleTableChange = (pagination: any) => {
    setPagination((prev) => ({
      ...prev,
      current: pagination.current,
      pageSize: pagination.pageSize,
    }));
  };

  const onSearch = (value: string) => {
    const trimmedValue = value.trim().toLowerCase();
    setSearchKeyword(trimmedValue);

    if (!trimmedValue) {
      const filteredDetails = originalDetails.filter((detail) =>
        activeTab === "inActive"
          ? detail.isActive === "Active"
          : detail.isActive === "inActive"
      );
      setDetails(filteredDetails);
      setPagination({
        ...pagination,
        current: 1,
        total: filteredDetails.length,
      });
      return;
    }

    const filteredDetails = originalDetails
      .filter((detail) => {
        const vaccine = vaccines.find((v) => v.vaccineId === detail.vaccineId);
        const vaccinePackage = vaccinePackages.find(
          (vp) => vp.vaccinePackageId === detail.vaccinePackageId
        );
        const vaccineName = vaccine?.name.toLowerCase() || "";
        const packageName = vaccinePackage?.name.toLowerCase() || "";

        return (
          vaccineName.includes(trimmedValue) ||
          packageName.includes(trimmedValue)
        );
      })
      .filter((detail) =>
        activeTab === "inActive"
          ? detail.isActive === "Active"
          : detail.isActive === "inActive"
      );

    setDetails(filteredDetails);
    setPagination({
      ...pagination,
      current: 1,
      total: filteredDetails.length,
    });
  };

  const handleReset = () => {
    setSearchKeyword("");
    fetchData();
  };

  const handleAddDetail = () => {
    setIsAddModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsAddModalVisible(false);
    setIsEditModalVisible(false);
    setEditedDetail(null);
    setIsDetailModalVisible(false);
    setSelectedDetail(null);
  };

  const handleUpdate = (detail: VaccinePackageDetail) => {
    setEditedDetail(detail);
    setIsEditModalVisible(true);
  };

  const handleDelete = async (detailId: number) => {
    Modal.confirm({
      title: "Bạn có chắc muốn xóa chi tiết gói vắc xin này không?",
      okText: "Có",
      okType: "danger",
      cancelText: "Không",
      onOk: async () => {
        try {
          await vaccinePackageDetailService.deletePackageDetail(detailId);
          message.success("Xóa chi tiết gói vắc xin thành công.");
          fetchData();
        } catch (error) {
          message.error("Không thể xóa chi tiết gói vắc xin.");
        }
      },
    });
  };

  const handleViewDetail = (detail: VaccinePackageDetail) => {
    setSelectedDetail(detail);
    setIsDetailModalVisible(true);
  };

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  const columns: ColumnType<VaccinePackageDetailResponseDTO>[] = [
    {
      title: "STT",
      key: "index",
      render: (_, __, index) =>
        (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: "Tên gói vắc xin",
      dataIndex: "vaccinePackageId",
      key: "vaccinePackageName",
      render: (vaccinePackageId: number) => {
        const vaccinePackage = vaccinePackages.find(
          (vp) => vp.vaccinePackageId === vaccinePackageId
        );
        return vaccinePackage ? vaccinePackage.name : "N/A";
      },
    },
    {
      title: "Tên vắc xin",
      dataIndex: "vaccineId",
      key: "vaccineName",
      render: (vaccineId: number) => {
        const vaccine = vaccines.find((v) => v.vaccineId === vaccineId);
        return vaccine ? vaccine.name : "N/A";
      },
    },
    {
      title: "Liều số",
      dataIndex: "doseNumber",
      key: "doseNumber",
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: string) => (isActive === "Active" ? "Có" : "Không"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record: VaccinePackageDetail) => (
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
            onClick={() => handleDelete(record.vaccinePackageDetailId)}
            style={{ color: "red", cursor: "pointer" }}
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-center p-2">
        QUẢN LÝ CHI TIẾT GÓI VẮC XIN
      </h2>
      <Tabs defaultActiveKey="activeDetails" onChange={handleTabChange}>
        <TabPane tab="Chi tiết đang hoạt động" key="activeDetails">
          <Row justify="space-between" style={{ marginBottom: 16 }}>
            <Col>
              <Space>
                <Search
                  placeholder="Tìm kiếm theo tên gói hoặc vắc xin"
                  onSearch={onSearch}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  enterButton
                  allowClear
                  style={{ width: 300 }}
                />
                <ReloadOutlined
                  onClick={handleReset}
                  style={{ fontSize: "24px", cursor: "pointer" }}
                />
              </Space>
            </Col>
            <Col>
              <Button type="primary" onClick={handleAddDetail}>
                Thêm chi tiết gói vắc xin
              </Button>
            </Col>
          </Row>
          <Table
            columns={columns}
            dataSource={details.slice(
              (pagination.current - 1) * pagination.pageSize,
              pagination.current * pagination.pageSize
            )}
            rowKey="vaccinePackageDetailId"
            pagination={pagination}
            loading={loading}
            onChange={handleTableChange}
          />
        </TabPane>
        <TabPane tab="Chi tiết không hoạt động" key="inactiveDetails">
          <Row justify="space-between" style={{ marginBottom: 16 }}>
            <Col>
              <Space>
                <Search
                  placeholder="Tìm kiếm theo tên gói hoặc vắc xin"
                  onSearch={onSearch}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  enterButton
                  allowClear
                  style={{ width: 300 }}
                />
                <ReloadOutlined
                  onClick={handleReset}
                  style={{ fontSize: "24px", cursor: "pointer" }}
                />
              </Space>
            </Col>
            <Col>
              <Button type="primary" onClick={handleAddDetail}>
                Thêm chi tiết gói vắc xin
              </Button>
            </Col>
          </Row>
          <Table
            columns={columns}
            dataSource={details.slice(
              (pagination.current - 1) * pagination.pageSize,
              pagination.current * pagination.pageSize
            )}
            rowKey="vaccinePackageDetailId"
            pagination={pagination}
            loading={loading}
            onChange={handleTableChange}
          />
        </TabPane>
      </Tabs>

      <AddVaccinePackageDetailButton
        visible={isAddModalVisible}
        onClose={handleCloseModal}
        refreshDetails={fetchData}
      />

      {editedDetail && (
        <EditVaccinePackageDetailModal
          detail={editedDetail}
          visible={isEditModalVisible}
          onClose={handleCloseModal}
          refreshDetails={fetchData}
        />
      )}

      <Modal
        title="Chi tiết gói vắc xin"
        visible={isDetailModalVisible}
        onCancel={handleCloseModal}
        footer={null}
      >
        {selectedDetail && (
          <div style={{ padding: 16 }}>
            <p>
              <strong>ID Chi tiết:</strong>{" "}
              {selectedDetail.vaccinePackageDetailId}
            </p>
            <p>
              <strong>Tên gói:</strong>{" "}
              {vaccinePackages.find(
                (vp) => vp.vaccinePackageId === selectedDetail.vaccinePackageId
              )?.name || "N/A"}
            </p>
            <p>
              <strong>Tên vắc xin:</strong>{" "}
              {vaccines.find((v) => v.vaccineId === selectedDetail.vaccineId)
                ?.name || "N/A"}
            </p>
            <p>
              <strong>Số liều:</strong> {selectedDetail.doseNumber}
            </p>
            <p>
              <strong>Trạng thái:</strong>{" "}
              {selectedDetail.isActive === "Active" ? "Có" : "Không"}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VaccinePackageDetailManagement;
