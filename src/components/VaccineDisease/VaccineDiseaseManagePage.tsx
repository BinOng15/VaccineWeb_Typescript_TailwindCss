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
    //DeleteOutlined,
    EyeOutlined,
} from "@ant-design/icons";
import EditVaccineDiseaseModal from "./EditVaccineDiseaseModal";
import AddVaccineDiseaseModal from "./AddVaccineDiseaseModal";
import moment from "moment";
import { ColumnType } from "antd/es/table";
import { VaccineDiseaseResponseDTO } from "../../models/VaccineDisease";
import vaccineDiseaseService from "../../service/vaccineDiseaseService";
import vaccineService from "../../service/vaccineService";
import diseaseService from "../../service/diseaseService";
import { VaccineResponseDTO } from "../../models/Vaccine";
import { DiseaseResponseDTO } from "../../models/Disease";

const { Search } = Input;

interface VaccineDisease extends VaccineDiseaseResponseDTO {
    vaccineDiseaseId: number;
}

const VaccineDiseaseManagePage: React.FC = () => {
    const [allVaccineDiseases, setAllVaccineDiseases] = useState<VaccineDisease[]>([]);
    const [displayedVaccineDiseases, setDisplayedVaccineDiseases] = useState<VaccineDisease[]>([]);
    const [vaccines, setVaccines] = useState<VaccineResponseDTO[]>([]);
    const [diseases, setDiseases] = useState<DiseaseResponseDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editedVaccineDisease, setEditedVaccineDisease] = useState<VaccineDisease | null>(null);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedVaccineDisease, setSelectedVaccineDisease] = useState<VaccineDisease | null>(null);

    const fetchVaccineDiseases = async () => {
        setLoading(true);
        try {
            const [vaccineDiseaseResponse, vaccineResponse, diseaseResponse] = await Promise.all([
                vaccineDiseaseService.getAllVaccineDiseases(),
                vaccineService.getAllVaccines(),
                diseaseService.getAllDiseases(),
            ]);

            console.log("Phản hồi API Vaccine-Disease:", vaccineDiseaseResponse);
            const vaccineDiseasesWithId = vaccineDiseaseResponse.map((vd) => ({
                ...vd,
                vaccineDiseaseId: vd.vaccineDiseaseId,
            }));
            setAllVaccineDiseases(vaccineDiseasesWithId);
            setDisplayedVaccineDiseases(vaccineDiseasesWithId);
            setVaccines(vaccineResponse);
            setDiseases(diseaseResponse);
            setPagination((prev) => ({
                ...prev,
                total: vaccineDiseasesWithId.length,
                current: 1,
            }));
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
            message.error("Không thể lấy danh sách dữ liệu: " + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVaccineDiseases();
    }, []);

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
        const filteredVaccineDiseases = allVaccineDiseases.filter((vd) => {
            const vaccineName = vaccines.find((v) => v.vaccineId === vd.vaccineId)?.name || "";
            const diseaseName = diseases.find((d) => d.diseaseId === vd.diseaseId)?.name || "";
            return value
                ? vaccineName.toLowerCase().includes(value.toLowerCase()) ||
                diseaseName.toLowerCase().includes(value.toLowerCase())
                : true;
        });
        setDisplayedVaccineDiseases(filteredVaccineDiseases);
        setPagination((prev) => ({
            ...prev,
            total: filteredVaccineDiseases.length,
            current: 1,
        }));
    };

    const handleReset = () => {
        setSearchKeyword("");
        fetchVaccineDiseases();
    };

    const handleAddVaccineDisease = () => {
        setIsAddModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsAddModalVisible(false);
        setIsEditModalVisible(false);
        setEditedVaccineDisease(null);
        setIsDetailModalVisible(false);
        setSelectedVaccineDisease(null);
    };

    const handleUpdate = (vaccineDisease: VaccineDisease) => {
        if (!vaccineDisease.vaccineDiseaseId || typeof vaccineDisease.vaccineDiseaseId !== "number") {
            console.error("Dữ liệu vaccine-disease không hợp lệ trong handleUpdate:", vaccineDisease);
            message.error("Dữ liệu vaccine-disease không hợp lệ để chỉnh sửa");
            return;
        }
        console.log("Chỉnh sửa Vaccine-Disease với ID:", vaccineDisease.vaccineDiseaseId);
        setEditedVaccineDisease(vaccineDisease);
        setIsEditModalVisible(true);
    };

    // const handleDelete = (vaccineDiseaseId: number) => {
    //     message.warning("Chức năng xóa chưa được triển khai!");
    // };

    const handleViewDetail = (vaccineDisease: VaccineDisease) => {
        if (!vaccineDisease.vaccineDiseaseId || typeof vaccineDisease.vaccineDiseaseId !== "number") {
            console.error("Dữ liệu vaccine-disease không hợp lệ để xem chi tiết:", vaccineDisease);
            message.error("Dữ liệu vaccine-disease không hợp lệ để xem");
            return;
        }
        console.log("Xem chi tiết Vaccine-Disease với ID:", vaccineDisease.vaccineDiseaseId);
        setSelectedVaccineDisease(vaccineDisease);
        setIsDetailModalVisible(true);
    };

    const columns: ColumnType<VaccineDiseaseResponseDTO>[] = [
        {
            title: "STT",
            key: "index",
            width: 50,
            align: "center",
            render: (_: any, __: VaccineDiseaseResponseDTO, index: number) => {
                const currentIndex = (pagination.current - 1) * pagination.pageSize + index + 1;
                return currentIndex;
            },
        },
        {
            title: "Tên Vắc xin",
            dataIndex: "vaccineId",
            key: "VaccineName",
            width: 200,
            render: (vaccineId: number) => {
                const vaccine = vaccines.find((v) => v.vaccineId === vaccineId);
                return vaccine ? vaccine.name : "N/A";
            },
        },
        {
            title: "Tên Bệnh",
            dataIndex: "diseaseId",
            key: "DiseaseName",
            width: 200,
            render: (diseaseId: number) => {
                const disease = diseases.find((d) => d.diseaseId === diseaseId);
                return disease ? disease.name : "N/A";
            },
        },
        {
            title: "Hành động",
            key: "action",
            width: 120,
            render: (_: any, record: VaccineDisease) => {
                if (!record.vaccineDiseaseId || typeof record.vaccineDiseaseId !== "number") {
                    console.error("ID vaccine-disease không hợp lệ trong bản ghi:", record);
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
                        {/* <DeleteOutlined
                            onClick={() => handleDelete(record.vaccineDiseaseId)}
                            style={{ color: "red", cursor: "pointer" }}
                        /> */}
                    </Space>
                );
            },
        },
    ];

    return (
        <div className="p-4 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-center p-2 rounded-t-lg">
                QUẢN LÝ MỐI QUAN HỆ BỆNH - VẮC XIN
            </h2>
            <Row justify="space-between" style={{ marginBottom: 16 }}>
                <Col>
                    <Space className="custom-search">
                        <Search
                            placeholder="Tìm kiếm theo tên vắc xin hoặc bệnh"
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
                        onClick={handleAddVaccineDisease}
                    >
                        Tạo mới mối quan hệ
                    </Button>
                </Col>
            </Row>
            <Table
                columns={columns}
                dataSource={displayedVaccineDiseases.slice(
                    (pagination.current - 1) * pagination.pageSize,
                    pagination.current * pagination.pageSize
                )}
                rowKey="vaccineDiseaseId"
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

            <AddVaccineDiseaseModal
                visible={isAddModalVisible}
                onClose={handleCloseModal}
                refreshVaccineDiseases={fetchVaccineDiseases}
            />

            {editedVaccineDisease && (
                <EditVaccineDiseaseModal
                    vaccineDisease={editedVaccineDisease}
                    visible={isEditModalVisible}
                    onClose={handleCloseModal}
                    refreshVaccineDiseases={fetchVaccineDiseases}
                />
            )}

            <Modal
                title="CHI TIẾT MỐI QUAN HỆ BỆNH - VẮC XIN"
                visible={isDetailModalVisible}
                onCancel={handleCloseModal}
                footer={null}
                centered
                style={{ width: "800px", maxHeight: "600px" }}
                bodyStyle={{ maxHeight: "500px", overflowY: "auto" }}
            >
                {selectedVaccineDisease && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Tên Vắc xin">
                            {vaccines.find((v) => v.vaccineId === selectedVaccineDisease.vaccineId)?.name || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tên Bệnh">
                            {diseases.find((d) => d.diseaseId === selectedVaccineDisease.diseaseId)?.name || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">
                            {selectedVaccineDisease.createdDate
                                ? moment(selectedVaccineDisease.createdDate,
                                    "DD/MM/YYYY"
                                ).format("DD/MM/YYYY")
                                : "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Người tạo">
                            {selectedVaccineDisease.createdBy || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày sửa đổi">
                            {selectedVaccineDisease.modifiedDate
                                ? moment(selectedVaccineDisease.modifiedDate,
                                    "DD/MM/YYYY"
                                ).format("DD/MM/YYYY")
                                : "N/A"}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default VaccineDiseaseManagePage;