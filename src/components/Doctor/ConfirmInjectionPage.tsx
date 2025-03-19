/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Table, Input, Space, Row, Col, Modal, message, Tag } from "antd";
import { ReloadOutlined, EyeOutlined, CheckOutlined } from "@ant-design/icons";
import moment from "moment";
import appointmentService from "../../service/appointmentService";
import childProfileService from "../../service/childProfileService";
import userService from "../../service/userService";
import vaccineService from "../../service/vaccineService";
import vaccinePackageService from "../../service/vaccinePackageService";
import paymentDetailService from "../../service/paymentDetailService";
import vaccinePackageDetailService from "../../service/vaccinePackageDetailService";
import vaccineDiseaseService from "../../service/vaccineDiseaseService";
import diseaseService from "../../service/diseaseService";
import {
    AppointmentResponseDTO,
    UpdateAppointmentDTO,
} from "../../models/Appointment";
import { ChildProfileResponseDTO } from "../../models/ChildProfile";
import { UserResponseDTO } from "../../models/User";
import { VaccineResponseDTO } from "../../models/Vaccine";
import { VaccinePackageResponseDTO } from "../../models/VaccinePackage";
import { PaymentDetailResponseDTO } from "../../models/PaymentDetail";
import { VaccineDiseaseResponseDTO } from "../../models/VaccineDisease";
import { DiseaseResponseDTO } from "../../models/Disease";
import { ColumnType } from "antd/es/table";
import { AppointmentStatus } from "../Appointment/CustomerAppointment";

const { Search } = Input;

const ConfirmInjectionPage: React.FC = () => {
    const [appointments, setAppointments] = useState<AppointmentResponseDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponseDTO | null>(null);
    const [childMap, setChildMap] = useState<{
        [key: number]: { childFullName: string; userFullName: string };
    }>({});
    const [vaccines, setVaccines] = useState<VaccineResponseDTO[]>([]);
    const [vaccinePackages, setVaccinePackages] = useState<VaccinePackageResponseDTO[]>([]);
    const [allPaymentDetails, setAllPaymentDetails] = useState<PaymentDetailResponseDTO[]>([]);
    const [vaccineNameMap, setVaccineNameMap] = useState<Map<number, string>>(new Map());
    const [vaccineDiseases, setVaccineDiseases] = useState<VaccineDiseaseResponseDTO[]>([]);
    const [diseases, setDiseases] = useState<DiseaseResponseDTO[]>([]);

    const getStatusText = (status: number) => {
        let text = "";
        let style = {};

        switch (status) {
            case AppointmentStatus.Pending:
                text = "Đã lên lịch";
                style = {
                    color: "#1890ff",
                    backgroundColor: "#e6f7ff",
                    padding: "2px 8px",
                    borderRadius: "4px",
                };
                break;
            case AppointmentStatus.Checked:
                text = "Đã check in";
                style = {
                    color: "#fa8c16",
                    backgroundColor: "#fff7e6",
                    padding: "2px 8px",
                    borderRadius: "4px",
                };
                break;
            case AppointmentStatus.Paid:
                text = "Đã thanh toán";
                style = {
                    color: "#722ed1",
                    backgroundColor: "#f9f0ff",
                    padding: "2px 8px",
                    borderRadius: "4px",
                };
                break;
            case AppointmentStatus.Injected:
                text = "Đã tiêm";
                style = {
                    color: "#08979c",
                    backgroundColor: "#e6fffb",
                    padding: "2px 8px",
                    borderRadius: "4px",
                };
                break;
            case AppointmentStatus.Completed:
                text = "Hoàn thành";
                style = {
                    color: "#52c41a",
                    backgroundColor: "#f6ffed",
                    padding: "2px 8px",
                    borderRadius: "4px",
                };
                break;
            case AppointmentStatus.Cancelled:
                text = "Đã hủy";
                style = {
                    color: "#ff4d4f",
                    backgroundColor: "#fff1f0",
                    padding: "2px 8px",
                    borderRadius: "4px",
                };
                break;
            default:
                text = String(status);
                style = {
                    color: "#000",
                    padding: "2px 8px",
                    borderRadius: "4px",
                };
        }

        return <span style={style}>{text}</span>;
    };

    const getStatusColor = (status: number) => {
        switch (status) {
            case AppointmentStatus.Pending:
                return "blue";
            case AppointmentStatus.Checked:
                return "gold";
            case AppointmentStatus.Paid:
                return "purple";
            case AppointmentStatus.Injected:
                return "cyan";
            case AppointmentStatus.Completed:
                return "green";
            case AppointmentStatus.Cancelled:
                return "red";
            default:
                return "default";
        }
    };

    const fetchAppointments = async (
        page = pagination.current,
        pageSize = pagination.pageSize,
        keyword = searchKeyword
    ) => {
        setLoading(true);
        try {
            const allVaccines = await vaccineService.getAllVaccines();
            const allVaccinePackages = await vaccinePackageService.getAllPackages();
            const allVaccineDiseases = await vaccineDiseaseService.getAllVaccineDiseases();
            const allDiseases = await diseaseService.getAllDiseases();
            setVaccines(allVaccines);
            setVaccinePackages(allVaccinePackages);
            setVaccineDiseases(allVaccineDiseases);
            setDiseases(allDiseases);

            const allAppointments = await appointmentService.getAllAppointments();

            let filteredAppointments = allAppointments.filter(
                (appointment) => appointment.appointmentStatus === AppointmentStatus.Paid // Chỉ lấy các lịch hẹn có trạng thái Paid (3)
            );

            if (keyword) {
                filteredAppointments = filteredAppointments.filter(
                    (appointment) =>
                        appointment.appointmentId.toString().includes(keyword) ||
                        moment(appointment.appointmentDate)
                            .format("DD/MM/YYYY")
                            .includes(keyword)
                );
            }

            const startIndex = (page - 1) * pageSize;
            const paginatedAppointments = filteredAppointments.slice(
                startIndex,
                startIndex + pageSize
            );

            const childIds = [
                ...new Set(
                    paginatedAppointments
                        .map((appointment) => appointment.childId)
                        .filter((id): id is number => id !== null)
                ),
            ];

            const childPromises = childIds.map(async (childId) => {
                try {
                    const child: ChildProfileResponseDTO = await childProfileService.getChildProfileById(childId);
                    return {
                        childId,
                        childFullName: child.fullName || "N/A",
                        userId: child.userId,
                    };
                } catch (error) {
                    console.error(`Lỗi khi lấy child ${childId}:`, error);
                    return { childId, childFullName: "N/A", userId: null };
                }
            });

            const childrenData = await Promise.all(childPromises);
            const userIds = [
                ...new Set(
                    childrenData
                        .map((child) => child.userId)
                        .filter((id): id is number => id !== null)
                ),
            ];

            const userPromises = userIds.map(async (userId) => {
                try {
                    const user: UserResponseDTO = await userService.getUserById(userId);
                    return user;
                } catch (error) {
                    console.error(`Lỗi khi lấy user ${userId}:`, error);
                    return null;
                }
            });

            const usersData = (await Promise.all(userPromises)).filter(
                (user) => user !== null
            ) as UserResponseDTO[];
            const userMap = usersData.reduce((acc, user) => {
                acc[user.userId] = user.fullName || "N/A";
                return acc;
            }, {} as { [key: number]: string });

            const newChildMap = childrenData.reduce(
                (acc, { childId, childFullName, userId }) => {
                    acc[childId] = {
                        childFullName,
                        userFullName: userId ? userMap[userId] || "N/A" : "N/A",
                    };
                    return acc;
                },
                {} as { [key: number]: { childFullName: string; userFullName: string } }
            );

            const allPaymentDetailsResponse = await paymentDetailService.getAllPaymentDetails();
            setAllPaymentDetails(allPaymentDetailsResponse);

            const uniqueVaccinePackageDetailIds = new Set(
                allPaymentDetailsResponse
                    .map((detail) => detail.vaccinePackageDetailId || 0)
                    .filter((id): id is number => id !== 0)
            );
            const newVaccineNameMap = new Map<number, string>();
            for (const packageDetailId of uniqueVaccinePackageDetailIds) {
                try {
                    const packageDetail = await vaccinePackageDetailService.getPackageDetailById(packageDetailId);
                    const vaccine = allVaccines.find((v) => v.vaccineId === packageDetail.vaccineId);
                    const vaccineDisease = allVaccineDiseases.find((vd) => vd.vaccineId === packageDetail.vaccineId);
                    const disease = vaccineDisease ? allDiseases.find((d) => d.diseaseId === vaccineDisease.diseaseId) : null;
                    const displayName = `${vaccine ? vaccine.name : "Không xác định"} - ${disease ? disease.name : "Không xác định"}`;
                    newVaccineNameMap.set(packageDetailId, displayName);
                } catch (error) {
                    console.error(`Lỗi khi lấy vaccine cho packageDetailId ${packageDetailId}:`, error);
                    newVaccineNameMap.set(packageDetailId, "Không xác định - Không xác định");
                }
            }
            setVaccineNameMap(newVaccineNameMap);

            setChildMap(newChildMap);
            setAppointments(paginatedAppointments);
            setPagination({
                current: page,
                pageSize,
                total: filteredAppointments.length,
            });
        } catch (error) {
            console.error("Lỗi khi lấy danh sách lịch hẹn:", error);
            setAppointments([]);
            message.error("Không thể tải danh sách lịch hẹn.");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmInjection = async (appointment: AppointmentResponseDTO) => {
        if (appointment.appointmentStatus !== AppointmentStatus.Paid) {
            message.error("Chỉ có thể xác nhận tiêm cho lịch hẹn khi đã thanh toán!");
            return;
        }

        try {
            const updateAppointmentData: UpdateAppointmentDTO = {
                appointmentStatus: AppointmentStatus.Injected, // Chuyển sang trạng thái Injected (4)
            };
            await appointmentService.updateAppointment(
                appointment.appointmentId,
                updateAppointmentData
            );
            message.success("Đã xác nhận tiêm thành công!");
            fetchAppointments(pagination.current, pagination.pageSize, searchKeyword);
        } catch (error) {
            console.error("Lỗi khi xác nhận tiêm:", error);
            message.error("Xác nhận tiêm thất bại.");
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleTableChange = (pagination: any) => {
        fetchAppointments(pagination.current, pagination.pageSize);
    };

    const onSearch = (value: string) => {
        setSearchKeyword(value);
        fetchAppointments(1, pagination.pageSize, value);
    };

    const handleReset = () => {
        setSearchKeyword("");
        fetchAppointments(1, pagination.pageSize, "");
    };

    const handleViewDetail = (appointment: AppointmentResponseDTO) => {
        setSelectedAppointment(appointment);
        setIsDetailModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsDetailModalVisible(false);
        setSelectedAppointment(null);
    };

    const getVaccineOrPackageName = (appointment: AppointmentResponseDTO) => {
        if (appointment.vaccineId) {
            const vaccine = vaccines.find((v) => v.vaccineId === appointment.vaccineId);
            const vaccineDisease = vaccineDiseases.find((vd) => vd.vaccineId === appointment.vaccineId);
            const disease = vaccineDisease ? diseases.find((d) => d.diseaseId === vaccineDisease.diseaseId) : null;
            return (
                <div>
                    <div>{vaccine ? vaccine.name : "Không tìm thấy vắc xin"}</div>
                    <div style={{ color: "gray", fontSize: "12px" }}>
                        {disease ? disease.name : "Không xác định"} - Số lượng: {vaccine ? vaccine.quantity : "N/A"} - Giá: {vaccine ? new Intl.NumberFormat("vi-VN").format(vaccine.price) : "N/A"} VND
                    </div>
                </div>
            );
        }
        if (appointment.vaccinePackageId) {
            const packageItem = vaccinePackages.find((p) => p.vaccinePackageId === appointment.vaccinePackageId);
            return (
                <div>
                    <div>{packageItem ? packageItem.name : "Không tìm thấy gói vắc xin"}</div>
                    <div style={{ color: "gray", fontSize: "12px" }}>
                        Giá: {packageItem ? new Intl.NumberFormat("vi-VN").format(packageItem.totalPrice) : "N/A"} VND
                    </div>
                </div>
            );
        }
        return "N/A";
    };

    const columns: ColumnType<AppointmentResponseDTO>[] = [
        {
            title: "STT",
            key: "index",
            width: 10,
            align: "center",
            render: (_: any, __: AppointmentResponseDTO, index: number) =>
                (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: "Tên Phụ huynh",
            key: "userFullName",
            render: (appointment: AppointmentResponseDTO) =>
                appointment.childId !== null && childMap[appointment.childId]?.userFullName
                    ? childMap[appointment.childId].userFullName
                    : "N/A",
        },
        {
            title: "Tên Trẻ em",
            key: "childFullName",
            render: (appointment: AppointmentResponseDTO) =>
                appointment.childId !== null && childMap[appointment.childId]?.childFullName
                    ? childMap[appointment.childId].childFullName
                    : "N/A",
        },
        {
            title: "Tên Vaccine/Gói Vaccine",
            key: "vaccineOrPackageName",
            render: (appointment: AppointmentResponseDTO) => getVaccineOrPackageName(appointment),
        },
        {
            title: "Mũi Tiêm",
            key: "doseSequence",
            width: 200,
            render: (appointment: AppointmentResponseDTO) => {
                if (!appointment.paymentDetailId)
                    return <span style={{ color: "gray" }}>-</span>;
                const selectedPaymentDetail = allPaymentDetails.find(
                    (detail) => detail.paymentDetailId === appointment.paymentDetailId
                );
                if (!selectedPaymentDetail)
                    return <span style={{ color: "gray" }}>-</span>;

                const vaccineNameWithDisease = vaccineNameMap.get(selectedPaymentDetail.vaccinePackageDetailId) || "Không xác định - Không xác định";
                const statusText = selectedPaymentDetail.isCompleted === 1 ? " (Hoàn thành)" : "";
                return (
                    <span style={{ color: "red" }}>
                        Mũi {selectedPaymentDetail.doseSequence} - {vaccineNameWithDisease}{statusText}
                    </span>
                );
            },
        },
        { title: "Ngày hẹn", dataIndex: "appointmentDate" },
        {
            title: "Trạng thái",
            key: "appointmentStatus",
            render: (appointment: AppointmentResponseDTO) => (
                <Tag color={getStatusColor(appointment.appointmentStatus)}>
                    {getStatusText(appointment.appointmentStatus)}
                </Tag>
            ),
        },
        {
            title: "Hành động",
            key: "action",
            width: 120,
            align: "center",
            render: (_: any, appointment: AppointmentResponseDTO) => (
                <Space size="middle">
                    <EyeOutlined
                        onClick={() => handleViewDetail(appointment)}
                        style={{ color: "blue", cursor: "pointer", fontSize: "18px" }}
                        title="Chi tiết lịch tiêm"
                    />
                    <CheckOutlined
                        onClick={() => handleConfirmInjection(appointment)}
                        style={{
                            color: appointment.appointmentStatus === AppointmentStatus.Paid ? "green" : "gray",
                            cursor: appointment.appointmentStatus === AppointmentStatus.Paid ? "pointer" : "not-allowed",
                            fontSize: "18px",
                        }}
                        title="Xác nhận tiêm"
                    />
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4 max-w-7xl mx-auto mt-12">
            <h2 className="text-2xl font-bold text-center p-2">
                XÁC NHẬN TIÊM CHỦNG
            </h2>
            <Row justify="space-between" style={{ marginBottom: 16, marginTop: 24 }}>
                <Col>
                    <Space>
                        <Search
                            placeholder="Tìm kiếm"
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
            </Row>
            <Table
                columns={columns}
                dataSource={appointments}
                rowKey="appointmentId"
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                }}
                loading={loading}
                onChange={handleTableChange}
            />

            <Modal
                title="Chi tiết Lịch hẹn"
                open={isDetailModalVisible}
                onCancel={handleCloseModal}
                footer={null}
            >
                {selectedAppointment && (
                    <div style={{ padding: 16 }}>
                        <p>
                            <strong>Tên Phụ huynh:</strong>{" "}
                            {selectedAppointment.childId !== null &&
                                childMap[selectedAppointment.childId]?.userFullName
                                ? childMap[selectedAppointment.childId].userFullName
                                : "N/A"}
                        </p>
                        <p>
                            <strong>Tên Trẻ em:</strong>{" "}
                            {selectedAppointment.childId !== null &&
                                childMap[selectedAppointment.childId]?.childFullName
                                ? childMap[selectedAppointment.childId].childFullName
                                : "N/A"}
                        </p>
                        <p>
                            <strong>Tên Vaccine/Gói Vaccine:</strong>{" "}
                            {(() => {
                                if (selectedAppointment.vaccineId) {
                                    const vaccine = vaccines.find((v) => v.vaccineId === selectedAppointment.vaccineId);
                                    const vaccineDisease = vaccineDiseases.find((vd) => vd.vaccineId === selectedAppointment.vaccineId);
                                    const disease = vaccineDisease ? diseases.find((d) => d.diseaseId === vaccineDisease.diseaseId) : null;
                                    return `${vaccine ? vaccine.name : "Không tìm thấy vắc xin"} - ${disease ? disease.name : "Không xác định"} (Số lượng: ${vaccine ? vaccine.quantity : "N/A"}, Giá: ${vaccine ? new Intl.NumberFormat("vi-VN").format(vaccine.price) : "N/A"} VND)`;
                                }
                                if (selectedAppointment.vaccinePackageId) {
                                    const packageItem = vaccinePackages.find((p) => p.vaccinePackageId === selectedAppointment.vaccinePackageId);
                                    return `${packageItem ? packageItem.name : "Không tìm thấy gói vắc xin"} (Giá: ${packageItem ? new Intl.NumberFormat("vi-VN").format(packageItem.totalPrice) : "N/A"} VND)`;
                                }
                                return "N/A";
                            })()}
                        </p>
                        <p>
                            <strong>Mũi Tiêm:</strong>{" "}
                            {allPaymentDetails.length > 0
                                ? (() => {
                                    const selectedDetail = allPaymentDetails.find(
                                        (detail) =>
                                            detail.paymentDetailId ===
                                            selectedAppointment?.paymentDetailId
                                    );
                                    const vaccineNameWithDisease =
                                        selectedDetail && selectedDetail.vaccinePackageDetailId
                                            ? vaccineNameMap.get(
                                                selectedDetail.vaccinePackageDetailId
                                            ) || "Không xác định - Không xác định"
                                            : "N/A";
                                    const statusText =
                                        selectedDetail?.isCompleted === 1 ? " (Hoàn thành)" : "";
                                    return selectedDetail?.doseSequence
                                        ? `Mũi ${selectedDetail.doseSequence} - ${vaccineNameWithDisease}${statusText}`
                                        : "N/A";
                                })()
                                : "N/A"}
                        </p>
                        <p>
                            <strong>Ngày hẹn:</strong>{" "}
                            {selectedAppointment.appointmentDate
                                ? moment(selectedAppointment.appointmentDate, "DD/MM/YYYY").format("DD/MM/YYYY")
                                : "N/A"}
                        </p>
                        <p>
                            <strong>Trạng thái:</strong>{" "}
                            <Tag color={getStatusColor(selectedAppointment.appointmentStatus)}>
                                {getStatusText(selectedAppointment.appointmentStatus)}
                            </Tag>
                        </p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ConfirmInjectionPage;