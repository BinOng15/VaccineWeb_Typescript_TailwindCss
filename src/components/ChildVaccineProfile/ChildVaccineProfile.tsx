/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Table, Space, message, Modal, Row, Col, Button } from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  ReloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { VaccineProfileResponseDTO } from "../../models/VaccineProfile";
import vaccineProfileService from "../../service/vaccineProfileService";
import childProfileService from "../../service/childProfileService";
import moment from "moment";
import { useAuth } from "../../context/AuthContext";
import { ChildProfileResponseDTO } from "../../models/ChildProfile";
import Search from "antd/es/input/Search";
import { ColumnType } from "antd/es/table";
import { DiseaseResponseDTO } from "../../models/Disease";
import diseaseService from "../../service/diseaseService";
import AddVaccineProfileModal from "./AddVaccineProfileModal";

function ChildVaccineProfile() {
  const [vaccineProfiles, setVaccineProfiles] = useState<
    VaccineProfileResponseDTO[]
  >([]);
  const [originalVaccineProfiles, setOriginalVaccineProfiles] = useState<
    VaccineProfileResponseDTO[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [childProfiles, setChildProfiles] = useState<ChildProfileResponseDTO[]>(
    []
  );
  const [diseases, setDiseases] = useState<DiseaseResponseDTO[]>([]);
  const [searchText, setSearchText] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [selectedProfile, setSelectedProfile] =
    useState<VaccineProfileResponseDTO | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) {
      console.error("No user found");
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const allDisease = await diseaseService.getAllDiseases();
      setDiseases(allDisease);

      const allChildProfiles = await childProfileService.getAllChildProfiles();
      console.log("All Child Profiles:", allChildProfiles); // Debug dữ liệu childProfiles
      const userChildIds = allChildProfiles
        .filter((profile) => profile.userId === user.userId)
        .map((profile) => profile.childId);
      setChildProfiles(allChildProfiles);

      const allVaccineProfiles =
        await vaccineProfileService.getAllVaccineProfiles();
      console.log("All Vaccine Profiles:", allVaccineProfiles); // Debug dữ liệu vaccineProfiles
      const filteredProfiles = allVaccineProfiles.filter((profile) =>
        userChildIds.includes(profile.childId)
      );
      setVaccineProfiles(filteredProfiles);
      setOriginalVaccineProfiles(filteredProfiles);
      setPagination({
        current: 1,
        pageSize: pagination.pageSize,
        total: filteredProfiles.length,
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
      message.error(
        "Không thể tải danh sách hồ sơ vaccine: " + (error as Error).message
      );
    } finally {
      setLoading(false);
    }
  };

  const onSearch = (value: string) => {
    const trimmedValue = value.trim().toLowerCase();
    setSearchText(trimmedValue);

    if (!trimmedValue) {
      setVaccineProfiles(originalVaccineProfiles);
      setPagination({
        ...pagination,
        current: 1,
        total: originalVaccineProfiles.length,
      });
      return;
    }

    const filteredProfiles = originalVaccineProfiles.filter((profile) => {
      const child = childProfiles.find((p) => p.childId === profile.childId);
      const childName = child?.fullName.toLowerCase() || "";
      const disease =
        diseases
          .find((d) => d.diseaseId === profile.diseaseId)
          ?.name.toLowerCase() || "";

      return childName.includes(trimmedValue) || disease.includes(trimmedValue);
    });

    setVaccineProfiles(filteredProfiles);
    setPagination({
      ...pagination,
      current: 1,
      total: filteredProfiles.length,
    });
  };

  const handleReset = () => {
    setSearchText("");
    fetchData();
  };

  const handleTableChange = (pagination: any) => {
    const { current, pageSize } = pagination;
    setPagination((prev) => ({ ...prev, current, pageSize }));
  };

  const columns: ColumnType<VaccineProfileResponseDTO>[] = [
    {
      title: "STT",
      key: "index",
      width: 50,
      align: "center",
      render: (_: any, __: VaccineProfileResponseDTO, index: number) => {
        const currentIndex =
          (pagination.current - 1) * pagination.pageSize + index + 1;
        return currentIndex;
      },
    },
    {
      title: "Họ tên của trẻ",
      dataIndex: "childId",
      key: "childId",
      render: (childId: number) => {
        const child = childProfiles.find(
          (profile) => profile.childId === childId
        );
        return child ? child.fullName : "Không tìm thấy";
      },
    },
    {
      title: "Ngày sinh",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      render: (childId: number) => {
        const child = childProfiles.find((p) => p.childId === childId);
        console.log("Child found:", child); // Debug thông tin trẻ
        return child?.dateOfBirth
          ? moment(child.dateOfBirth, "DD/MM/YYYY").format("DD/MM/YYYY")
          : "Không có thông tin";
      },
    },
    {
      title: "Bệnh",
      dataIndex: "diseaseId",
      key: "diseaseId",
      render: (diseaseId: number) => {
        const disease = diseases.find((d) => d.diseaseId === diseaseId);
        return disease ? disease.name : "Không tìm thấy disease";
      },
    },
    {
      title: "Mũi số",
      dataIndex: "doseNumber",
      key: "doseNumber",
    },
    {
      title: "Ngày đăng ký tiêm",
      dataIndex: "vaccinationDate",
      key: "vaccinationDate",
    },
    {
      title: "Ngày tiêm dự kiến",
      dataIndex: "scheduledDate",
      key: "scheduledDate",
    },
    {
      title: "Trạng thái",
      dataIndex: "isCompleted",
      key: "isCompleted",
      render: (isCompleted: number) =>
        isCompleted === 1 ? "Đã tiêm" : "Chưa tiêm",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: VaccineProfileResponseDTO) => (
        <Space>
          <EyeOutlined
            style={{ color: "blue", cursor: "pointer", fontSize: 18 }}
            onClick={() => showModal(record)}
          />
          <DeleteOutlined
            style={{
              color: "red",
              cursor: "pointer",
              fontSize: 18,
              marginLeft: 8,
            }}
            onClick={() => confirmDelete(record.vaccineProfileId)}
          />
        </Space>
      ),
    },
  ];

  const showModal = (profile: VaccineProfileResponseDTO) => {
    console.log("Selected Profile:", profile); // Debug selectedProfile
    setSelectedProfile(profile);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedProfile(null);
  };

  const handleAdd = () => {
    setIsAddModalVisible(true);
  };

  const handleAddModalClose = () => {
    setIsAddModalVisible(false);
  };

  const handleAddSuccess = () => {
    fetchData();
  };

  const confirmDelete = (vaccineProfileId: number) => {
    Modal.confirm({
      title: "Xác nhận xóa hồ sơ vaccine",
      content: "Bạn có chắc chắn muốn xóa hồ sơ vaccine này không?",
      okText: "Xác nhận",
      okType: "danger",
      cancelText: "Hủy bỏ",
      onOk: async () => {
        try {
          const success = await vaccineProfileService.deleteVaccineProfile(
            vaccineProfileId
          );
          if (success) {
            message.success("Xóa hồ sơ vaccine thành công");
            setVaccineProfiles(
              vaccineProfiles.filter(
                (profile) => profile.vaccineProfileId !== vaccineProfileId
              )
            );
            setOriginalVaccineProfiles(
              originalVaccineProfiles.filter(
                (profile) => profile.vaccineProfileId !== vaccineProfileId
              )
            );
            setPagination({
              ...pagination,
              total: vaccineProfiles.length - 1,
            });
          }
        } catch (error) {
          console.error("Failed to delete vaccine profile:", error);
          message.error(
            "Xóa hồ sơ vaccine thất bại: " + (error as Error).message
          );
        }
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="w-full max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-[#102A83] mb-6 text-center">
          Danh sách hồ sơ tiêm chủng của trẻ
        </h1>
        <Row justify="space-between" style={{ marginBottom: 16 }}>
          <Col>
            <Space>
              <Search
                placeholder="Tìm kiếm theo tên trẻ hoặc bệnh "
                onSearch={onSearch}
                enterButton
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 300 }}
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
              icon={<PlusOutlined />}
              onClick={handleAdd}
              style={{ marginLeft: 8 }}
            >
              Cập nhật hồ sơ tiêm chủng theo hệ thống
            </Button>
          </Col>
        </Row>
        <Table
          columns={columns}
          dataSource={vaccineProfiles.slice(
            (pagination.current - 1) * pagination.pageSize,
            pagination.current * pagination.pageSize
          )}
          rowKey="vaccineProfileId"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: vaccineProfiles.length,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          onChange={handleTableChange}
          bordered
          locale={{ emptyText: "Không có hồ sơ vaccine nào" }}
        />

        {/* Modal chi tiết */}
        <Modal
          title="Chi tiết hồ sơ vaccine"
          visible={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          centered
          style={{
            top: "-7%",
            transform: "translate(10%, -50%)",
            margin: 0,
          }}
        >
          {selectedProfile && (
            <div>
              <p>
                <strong>Họ tên của trẻ: </strong>{" "}
                {childProfiles.find(
                  (p) => p.childId === selectedProfile.childId
                )?.fullName || "Không tìm thấy"}
              </p>
              <p>
                <strong>Ngày sinh: </strong>{" "}
                {(() => {
                  const child = childProfiles.find(
                    (p) => p.childId === selectedProfile.childId
                  );
                  console.log("Child found:", child); // Debug thông tin trẻ
                  return child?.dateOfBirth
                    ? moment(child.dateOfBirth, "DD/MM/YYYY").format(
                        "DD/MM/YYYY"
                      )
                    : "Không có thông tin";
                })()}
              </p>
              <p>
                <strong>Bệnh từng tiêm: </strong>{" "}
                {diseases.find((d) => d.diseaseId === selectedProfile.diseaseId)
                  ?.name || "Không tìm thấy vaccine"}
              </p>
              <p>
                <strong>Ngày tiêm: </strong>{" "}
                {selectedProfile.vaccinationDate
                  ? moment(selectedProfile.vaccinationDate).format("DD/MM/YYYY")
                  : "Chưa đăng ký"}
              </p>
            </div>
          )}
        </Modal>

        {/* Modal thêm mới */}
        <AddVaccineProfileModal
          visible={isAddModalVisible}
          onClose={handleAddModalClose}
          onSuccess={handleAddSuccess}
        />
      </div>
    </div>
  );
}

export default ChildVaccineProfile;
