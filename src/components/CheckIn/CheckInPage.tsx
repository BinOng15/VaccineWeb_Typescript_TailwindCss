/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Table, Space, Modal, message, Descriptions, Select, Button, Input, Row, Col } from "antd";
import { EyeOutlined, EditOutlined, CheckOutlined, DeleteOutlined, ReloadOutlined } from "@ant-design/icons";
import moment from "moment";
import { AppointmentResponseDTO, UpdateAppointmentDTO } from "../../models/Appointment";
import { ChildProfileResponseDTO } from "../../models/ChildProfile";
import { VaccineResponseDTO } from "../../models/Vaccine";
import { VaccineDiseaseResponseDTO } from "../../models/VaccineDisease";
import { VaccinePackageResponseDTO } from "../../models/VaccinePackage";
import { PaymentResponseDTO } from "../../models/Payment";
import { PaymentDetailResponseDTO } from "../../models/PaymentDetail";
import vaccineService from "../../service/vaccineService";
import vaccineDiseaseService from "../../service/vaccineDiseaseService";
import diseaseService from "../../service/diseaseService";
import vaccinePackageService from "../../service/vaccinePackageService";
import childProfileService from "../../service/childProfileService";
import appointmentService from "../../service/appointmentService";
import paymentService from "../../service/paymentService";
import paymentDetailService from "../../service/paymentDetailService";
import vaccinePackageDetailService from "../../service/vaccinePackageDetailService";
import { ColumnType } from "antd/es/table";
import { AppointmentStatus, PaymentStatus } from "../../models/Type/enum";

const { Option } = Select;
const { Search } = Input;

interface DiseaseResponseDTO {
    diseaseId: number;
    name: string;
}

const CheckInPage: React.FC = () => {
    const [appointments, setAppointments] = useState<AppointmentResponseDTO[]>([]);
    const [filteredAppointments, setFilteredAppointments] = useState<AppointmentResponseDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponseDTO | null>(null);
    const [childProfiles, setChildProfiles] = useState<ChildProfileResponseDTO[]>([]);
    const [vaccines, setVaccines] = useState<VaccineResponseDTO[]>([]);
    const [vaccineDiseases, setVaccineDiseases] = useState<VaccineDiseaseResponseDTO[]>([]);
    const [diseases, setDiseases] = useState<DiseaseResponseDTO[]>([]);
    const [vaccinePackages, setVaccinePackages] = useState<VaccinePackageResponseDTO[]>([]);
    const [payments, setPayments] = useState<PaymentResponseDTO[]>([]);
    const [allPaymentDetails, setAllPaymentDetails] = useState<PaymentDetailResponseDTO[]>([]);
    const [vaccineNameMap, setVaccineNameMap] = useState<Map<number, string>>(new Map());
    const [selectedVaccineId, setSelectedVaccineId] = useState<number | null>(null);
    const [selectedVaccinePackageId, setSelectedVaccinePackageId] = useState<number | null>(null);
    const [searchChildName, setSearchChildName] = useState<string>("");
    const [searchDate, setSearchDate] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const allVaccines = await vaccineService.getAllVaccines();
            const allVaccineDiseases = await vaccineDiseaseService.getAllVaccineDiseases();
            const allDiseases = await diseaseService.getAllDiseases();
            const allVaccinePackages = await vaccinePackageService.getAllPackages();
            const allChildProfiles = await childProfileService.getAllChildProfiles();
            const allAppointments = await appointmentService.getAllAppointments();
            const allPayments = await paymentService.getAllPayments();
            const allPaymentDetailsResponse = await paymentDetailService.getAllPaymentDetails();

            const pendingAppointments = allAppointments.filter(
                (appointment) => appointment.appointmentStatus === AppointmentStatus.Pending && appointment.isActive === 1
            );

            setVaccines(allVaccines);
            setVaccineDiseases(allVaccineDiseases);
            setDiseases(allDiseases);
            setVaccinePackages(allVaccinePackages);
            setChildProfiles(allChildProfiles);
            setAppointments(pendingAppointments);
            setFilteredAppointments(pendingAppointments);
            setPayments(allPayments);
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

            setPagination({
                current: 1,
                pageSize: pagination.pageSize,
                total: pendingAppointments.length,
            });
        } catch (error) {
            console.error("Failed to fetch data:", error);
            message.error("Không thể tải dữ liệu: " + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const getPaymentStatus = (appointment: AppointmentResponseDTO) => {
        // Kiểm tra nếu lịch hẹn có paymentDetailId
        if (appointment.paymentDetailId) {
            const paymentDetail = allPaymentDetails.find(
                (detail) => detail.paymentDetailId === appointment.paymentDetailId
            );
            if (paymentDetail) {
                const payment = payments.find((p) => p.paymentId === paymentDetail.paymentId);
                if (payment) {
                    return payment.paymentStatus === PaymentStatus.Paid ? "Đã thanh toán" : "Chưa thanh toán";
                }
            }
        }

        // Nếu không có paymentDetailId, kiểm tra trực tiếp Payment liên quan đến appointment
        const payment = payments.find((p) => p.appointmentId === appointment.appointmentId);
        if (payment) {
            return payment.paymentStatus === PaymentStatus.Paid ? "Đã thanh toán" : "Chưa thanh toán";
        }

        return "Chưa thanh toán";
    };

    const handleSearch = () => {
        let filtered = [...appointments];

        if (searchChildName) {
            filtered = filtered.filter((appointment) => {
                const child = childProfiles.find((profile) => profile.childId === appointment.childId);
                return child?.fullName.toLowerCase().includes(searchChildName.toLowerCase());
            });
        }

        if (searchDate) {
            filtered = filtered.filter((appointment) =>
                moment(appointment.appointmentDate, "DD/MM/YYYY").isSame(moment(searchDate, "DD/MM/YYYY"), "day")
            );
        }

        setFilteredAppointments(filtered);
        setPagination({
            ...pagination,
            current: 1,
            total: filtered.length,
        });
    };

    const handleReset = () => {
        setSearchChildName("");
        setSearchDate(null);
        fetchData();
    };

    const handleTableChange = (pagination: any) => {
        const { current, pageSize } = pagination;
        setPagination((prev) => ({ ...prev, current, pageSize }));
    };

    const handleViewDetail = (appointment: AppointmentResponseDTO) => {
        setSelectedAppointment(appointment);
        setIsDetailModalVisible(true);
    };

    const handleEdit = (appointment: AppointmentResponseDTO) => {
        // Kiểm tra trạng thái thanh toán
        let paymentStatus: number | undefined;

        // Nếu có paymentDetailId, truy vấn qua PaymentDetail
        if (appointment.paymentDetailId) {
            const paymentDetail = allPaymentDetails.find(
                (detail) => detail.paymentDetailId === appointment.paymentDetailId
            );
            if (paymentDetail) {
                const payment = payments.find((p) => p.paymentId === paymentDetail.paymentId);
                paymentStatus = payment?.paymentStatus;
            }
        } else {
            // Nếu không có paymentDetailId, kiểm tra trực tiếp Payment
            const payment = payments.find((p) => p.appointmentId === appointment.appointmentId);
            paymentStatus = payment?.paymentStatus;
        }

        if (paymentStatus === PaymentStatus.Paid) {
            message.warning("Không thể chỉnh sửa lịch hẹn đã thanh toán!");
            return;
        }

        setSelectedAppointment(appointment);
        setSelectedVaccineId(appointment.vaccineId || null);
        setSelectedVaccinePackageId(appointment.vaccinePackageId || null);
        setIsEditModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsDetailModalVisible(false);
        setIsEditModalVisible(false);
        setSelectedAppointment(null);
        setSelectedVaccineId(null);
        setSelectedVaccinePackageId(null);
    };

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

    const handleCheckIn = async (appointmentId: number) => {
        try {
            const latestAppointment = await appointmentService.getAppointmentById(appointmentId);
            if (latestAppointment.appointmentStatus !== AppointmentStatus.Pending) {
                message.warning("Lịch hẹn không ở trạng thái 'Chưa check in'!");
                return;
            }

            // Kiểm tra số lượng vaccine lẻ
            const vaccineId = latestAppointment.vaccineId;
            if (vaccineId) {
                const vaccine = vaccines.find((v) => v.vaccineId === vaccineId);
                if (!vaccine) {
                    message.error("Không tìm thấy thông tin vaccine!");
                    return;
                }
                if (vaccine.quantity === null || vaccine.quantity <= 0) {
                    message.error(
                        `Vaccine ${vaccine.name} hiện tại trong hệ thống tạm thời hết, vui lòng đổi vaccine khác để check in!`
                    );
                    return;
                }
            }

            let paymentStatus: number | undefined;
            if (latestAppointment.paymentDetailId) {
                const paymentDetail = allPaymentDetails.find(
                    (detail) => detail.paymentDetailId === latestAppointment.paymentDetailId
                );
                if (paymentDetail) {
                    const payment = payments.find((p) => p.paymentId === paymentDetail.paymentId);
                    paymentStatus = payment?.paymentStatus;
                }
            } else {
                const payment = payments.find((p) => p.appointmentId === appointmentId);
                paymentStatus = payment?.paymentStatus;
            }

            const newStatus = paymentStatus === PaymentStatus.Paid ? AppointmentStatus.Paid : AppointmentStatus.Checked;

            Modal.confirm({
                title: "Xác nhận Check In",
                content: "Bạn có chắc chắn muốn check in lịch hẹn này không?",
                okText: "Xác nhận",
                okType: "primary",
                cancelText: "Hủy bỏ",
                onOk: async () => {
                    try {
                        const updateData: UpdateAppointmentDTO = {
                            appointmentStatus: newStatus,
                            appointmentDate: moment().format("DD/MM/YYYY"),
                        };
                        await appointmentService.updateAppointment(appointmentId, updateData);
                        message.success(`Check in thành công!`);
                        fetchData();
                    } catch (error) {
                        message.error("Check in thất bại: " + (error as Error).message);
                    }
                },
            });
        } catch (error) {
            message.error("Không thể kiểm tra trạng thái lịch hẹn: " + (error as Error).message);
        }
    };

    const handleCancelCheckIn = (appointmentId: number) => {
        try {
            appointmentService.getAppointmentById(appointmentId).then((latestAppointment) => {
                if (latestAppointment.appointmentStatus !== AppointmentStatus.Pending) {
                    message.warning("Chỉ có thể hủy lịch hẹn ở trạng thái 'Chưa check in'!");
                    return;
                }

                Modal.confirm({
                    title: "Xác nhận hủy Check In",
                    content: "Bạn có chắc chắn muốn hủy lịch hẹn này không?",
                    okText: "Xác nhận",
                    okType: "danger",
                    cancelText: "Hủy bỏ",
                    onOk: async () => {
                        try {
                            const updateData: UpdateAppointmentDTO = {
                                appointmentStatus: AppointmentStatus.Cancelled,
                                appointmentDate: moment().format("DD/MM/YYYY"),
                            };
                            await appointmentService.updateAppointment(appointmentId, updateData);
                            message.success("Hủy lịch hẹn thành công!");
                            fetchData();
                        } catch (error) {
                            message.error("Hủy lịch hẹn thất bại: " + (error as Error).message);
                        }
                    },
                });
            });
        } catch (error) {
            message.error("Không thể kiểm tra trạng thái lịch hẹn: " + (error as Error).message);
        }
    };

    const handleSaveEdit = async () => {
        if (!selectedAppointment) {
            message.error("Không có lịch hẹn được chọn!");
            return;
        }

        if (selectedAppointment.vaccineId && selectedVaccineId === null) {
            message.error("Vui lòng chọn vaccine!");
            return;
        }
        if (selectedAppointment.vaccinePackageId && selectedVaccinePackageId === null) {
            message.error("Vui lòng chọn gói vaccine!");
            return;
        }

        try {
            const latestAppointment = await appointmentService.getAppointmentById(selectedAppointment.appointmentId);
            if (latestAppointment.appointmentStatus !== AppointmentStatus.Pending) {
                message.warning("Chỉ có thể sửa lịch hẹn ở trạng thái 'Chưa check in'!");
                return;
            }

            if (selectedVaccineId !== null) {
                const newVaccine = vaccines.find((v) => v.vaccineId === selectedVaccineId);
                if (newVaccine && (newVaccine.quantity === null || newVaccine.quantity <= 0)) {
                    message.error(`Vaccine ${newVaccine.name} hiện tại trong hệ thống tạm thời hết, vui lòng chọn vaccine khác!`);
                    return;
                }
            }

            const updateData: UpdateAppointmentDTO = {
                vaccineId: selectedVaccineId !== null ? selectedVaccineId : null,
                vaccinePackageId: selectedVaccinePackageId !== null ? selectedVaccinePackageId : null,
                appointmentStatus: AppointmentStatus.Pending,
            };
            await appointmentService.updateAppointment(selectedAppointment.appointmentId, updateData);
            message.success("Cập nhật thành công! Lưu ý: Giá thanh toán có thể thay đổi.");
            fetchData();
            handleCloseModal();
        } catch (error) {
            message.error("Cập nhật thất bại: " + (error as Error).message);
        }
    };

    const columns: ColumnType<AppointmentResponseDTO>[] = [
        {
            title: "STT",
            key: "index",
            width: 50,
            align: "center",
            render: (_: any, __: AppointmentResponseDTO, index: number) =>
                (pagination.current - 1) * pagination.pageSize + index + 1,
        },
        {
            title: "Tên Trẻ em",
            dataIndex: "childId",
            key: "ChildName",
            width: 200,
            render: (childId: number) =>
                childProfiles.find((profile) => profile.childId === childId)?.fullName || "Không tìm thấy",
        },
        {
            title: "Tên Vắc xin / Gói Vắc xin",
            key: "vaccineOrPackage",
            width: 300,
            render: (_: any, record: AppointmentResponseDTO) => {
                if (record.vaccineId) {
                    const vaccine = vaccines.find((v) => v.vaccineId === record.vaccineId);
                    const vaccineDisease = vaccineDiseases.find((vd) => vd.vaccineId === record.vaccineId);
                    const disease = vaccineDisease ? diseases.find((d) => d.diseaseId === vaccineDisease.diseaseId) : null;
                    return (
                        <div>
                            <div>{vaccine ? vaccine.name : "Không tìm thấy vắc xin"}</div>
                            <div style={{ color: "gray", fontSize: "12px" }}>
                                {disease ? disease.name : "Không xác định"} - Số lượng: {vaccine ? vaccine.quantity : "N/A"} - Giá: {vaccine ? new Intl.NumberFormat("vi-VN").format(vaccine.price) : "N/A"} VND
                            </div>
                        </div>
                    );
                } else if (record.vaccinePackageId) {
                    const packageItem = vaccinePackages.find((p) => p.vaccinePackageId === record.vaccinePackageId);
                    return (
                        <div>
                            <div>{packageItem ? packageItem.name : "Không tìm thấy gói vắc xin"}</div>
                            <div style={{ color: "gray", fontSize: "12px" }}>
                                Giá: {packageItem ? new Intl.NumberFormat("vi-VN").format(packageItem.totalPrice) : "N/A"} VND
                            </div>
                        </div>
                    );
                }
                return "Không có vắc xin hoặc gói vắc xin";
            },
        },
        {
            title: "Ngày hẹn",
            dataIndex: "appointmentDate",
            key: "AppointmentDate",
            width: 150,
        },
        {
            title: "Mũi Tiêm",
            key: "doseSequence",
            width: 200,
            render: (record: AppointmentResponseDTO) => {
                if (!record.paymentDetailId) return <span style={{ color: "gray" }}>-</span>;
                const selectedPaymentDetail = allPaymentDetails.find(
                    (detail) => detail.paymentDetailId === record.paymentDetailId
                );
                if (!selectedPaymentDetail) return <span style={{ color: "gray" }}>-</span>;

                const vaccineName = vaccineNameMap.get(selectedPaymentDetail.vaccinePackageDetailId) || "Không xác định - Không xác định";
                const statusText = selectedPaymentDetail.isCompleted === 1 ? " (Hoàn thành)" : "";
                return (
                    <span style={{ color: "red" }}>
                        Mũi {selectedPaymentDetail.doseSequence} - {vaccineName}{statusText}
                    </span>
                );
            },
        },
        {
            title: "Trạng thái",
            dataIndex: "appointmentStatus",
            key: "AppointmentStatus",
            width: 150,
            render: () => <span style={{ color: "#1890ff" }}>Chưa check in</span>,
        },
        {
            title: "Thanh toán",
            key: "paymentStatus",
            width: 150,
            render: (_: any, record: AppointmentResponseDTO) => {
                const paymentStatus = getPaymentStatus(record);
                return (
                    <span style={{ color: paymentStatus === "Đã thanh toán" ? "green" : "red" }}>
                        {paymentStatus}
                    </span>
                );
            },
        },
        {
            title: "Hành động",
            key: "action",
            width: 200,
            render: (_: any, record: AppointmentResponseDTO) => {
                let paymentStatus: number | undefined;
                if (record.paymentDetailId) {
                    const paymentDetail = allPaymentDetails.find(
                        (detail) => detail.paymentDetailId === record.paymentDetailId
                    );
                    if (paymentDetail) {
                        const payment = payments.find((p) => p.paymentId === paymentDetail.paymentId);
                        paymentStatus = payment?.paymentStatus;
                    }
                } else {
                    const payment = payments.find((p) => p.appointmentId === record.appointmentId);
                    paymentStatus = payment?.paymentStatus;
                }

                const isPaid = paymentStatus === PaymentStatus.Paid;

                return (
                    <Space size="middle">
                        <EyeOutlined
                            onClick={() => handleViewDetail(record)}
                            style={{ color: "blue", cursor: "pointer" }}
                            title="Xem chi tiết"
                        />
                        <EditOutlined
                            onClick={() => handleEdit(record)}
                            style={{
                                color: isPaid ? "gray" : "orange",
                                cursor: isPaid ? "not-allowed" : "pointer",
                            }}
                            title={isPaid ? "Không thể chỉnh sửa (Đã thanh toán)" : "Cập nhật vắc xin/gói"}
                        />
                        <CheckOutlined
                            onClick={() => handleCheckIn(record.appointmentId)}
                            style={{ color: "green", cursor: "pointer" }}
                            title="Check in"
                        />
                        <DeleteOutlined
                            onClick={() => handleCancelCheckIn(record.appointmentId)}
                            style={{ color: "red", cursor: "pointer" }}
                            title="Hủy check in"
                        />
                    </Space>
                );
            },
        },
    ];

    return (
        <div className="p-4 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-center p-2 rounded-t-lg">
                QUẢN LÝ CHECK IN LỊCH HẸN TIÊM CHỦNG
            </h2>

            <Row justify="space-between" style={{ marginBottom: 16, marginTop: 24 }}>
                <Col>
                    <Space>
                        <Search
                            placeholder="Tìm kiếm theo tên trẻ em"
                            value={searchChildName}
                            onChange={(e) => setSearchChildName(e.target.value)}
                            onSearch={handleSearch}
                            enterButton
                            style={{ width: 300 }}
                        />
                        <ReloadOutlined type="default" onClick={handleReset} style={{ fontSize: "24px", cursor: "pointer" }}>
                            Reset
                        </ReloadOutlined>
                    </Space>
                </Col>
            </Row>

            <Table
                columns={columns}
                dataSource={filteredAppointments.slice(
                    (pagination.current - 1) * pagination.pageSize,
                    pagination.current * pagination.pageSize
                )}
                rowKey="appointmentId"
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: filteredAppointments.length,
                    showSizeChanger: true,
                    showQuickJumper: true,
                }}
                loading={loading}
                onChange={handleTableChange}
            />

            <Modal
                title="CHI TIẾT LỊCH HẸN TIÊM CHỦNG"
                open={isDetailModalVisible}
                onCancel={handleCloseModal}
                footer={null}
                centered
            >
                {selectedAppointment && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Tên Trẻ em">
                            {childProfiles.find((p) => p.childId === selectedAppointment.childId)?.fullName || "Không tìm thấy"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tên Vắc xin / Gói Vắc xin">
                            {selectedAppointment.vaccineId ? (
                                (() => {
                                    const vaccine = vaccines.find((v) => v.vaccineId === selectedAppointment.vaccineId);
                                    const vaccineDisease = vaccineDiseases.find((vd) => vd.vaccineId === selectedAppointment.vaccineId);
                                    const disease = vaccineDisease ? diseases.find((d) => d.diseaseId === vaccineDisease.diseaseId) : null;
                                    return `${vaccine ? vaccine.name : "Không tìm thấy vắc xin"} - ${disease ? disease.name : "Không xác định"} (Số lượng: ${vaccine ? vaccine.quantity : "N/A"}, Giá: ${vaccine ? new Intl.NumberFormat("vi-VN").format(vaccine.price) : "N/A"} VND)`;
                                })()
                            ) : selectedAppointment.vaccinePackageId ? (
                                (() => {
                                    const packageItem = vaccinePackages.find((p) => p.vaccinePackageId === selectedAppointment.vaccinePackageId);
                                    return `${packageItem ? packageItem.name : "Không tìm thấy gói vắc xin"} (Giá: ${packageItem ? new Intl.NumberFormat("vi-VN").format(packageItem.totalPrice) : "N/A"} VND)`;
                                })()
                            ) : (
                                "Không có vắc xin hoặc gói vắc xin"
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Mũi tiêm đã chọn">
                            {selectedAppointment.paymentDetailId ? (
                                (() => {
                                    const selectedPaymentDetail = allPaymentDetails.find(
                                        (detail) => detail.paymentDetailId === selectedAppointment.paymentDetailId
                                    );
                                    if (!selectedPaymentDetail) return "Không tìm thấy thông tin mũi tiêm";
                                    const vaccineNameWithDisease = vaccineNameMap.get(selectedPaymentDetail.vaccinePackageDetailId) || "Không xác định - Không xác định";
                                    const statusText = selectedPaymentDetail.isCompleted === 1 ? " (Hoàn thành)" : " (Chưa hoàn thành)";
                                    return `Mũi ${selectedPaymentDetail.doseSequence} - ${vaccineNameWithDisease}${statusText} - Ngày dự kiến: ${selectedPaymentDetail.scheduledDate ? moment(selectedPaymentDetail.scheduledDate, "DD/MM/YYYY").format("DD/MM/YYYY") : "Chưa xác định"}`;
                                })()
                            ) : (
                                "Chưa chọn mũi tiêm"
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày hẹn">
                            {moment(selectedAppointment.appointmentDate, "DD/MM/YYYY").format("DD/MM/YYYY")}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            {getStatusText(selectedAppointment.appointmentStatus)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái thanh toán">
                            {getPaymentStatus(selectedAppointment)}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>

            <Modal
                title="SỬA ĐỔI VẮC XIN"
                open={isEditModalVisible}
                onCancel={handleCloseModal}
                footer={[
                    <Button key="cancel" onClick={handleCloseModal}>
                        Hủy
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleSaveEdit}>
                        Lưu
                    </Button>,
                ]}
                centered
            >
                {selectedAppointment?.vaccineId ? (
                    <div style={{ marginBottom: 16 }}>
                        <Select
                            placeholder="Chọn vắc xin"
                            style={{ width: "100%" }}
                            onChange={(value) => setSelectedVaccineId(value)}
                            value={selectedVaccineId}
                            allowClear
                        >
                            {vaccines.map((vaccine) => (
                                <Option key={vaccine.vaccineId} value={vaccine.vaccineId}>
                                    {vaccine.name} (Số lượng: {vaccine.quantity}, Giá: {new Intl.NumberFormat("vi-VN").format(vaccine.price)} VND)
                                </Option>
                            ))}
                        </Select>
                    </div>
                ) : selectedAppointment?.vaccinePackageId ? (
                    <div style={{ marginBottom: 16 }}>
                        <Select
                            placeholder="Chọn gói vắc xin"
                            style={{ width: "100%" }}
                            onChange={(value) => setSelectedVaccinePackageId(value)}
                            value={selectedVaccinePackageId}
                            allowClear
                        >
                            {vaccinePackages.map((pkg) => (
                                <Option key={pkg.vaccinePackageId} value={pkg.vaccinePackageId}>
                                    {pkg.name} (Giá: {new Intl.NumberFormat("vi-VN").format(pkg.totalPrice)} VND)
                                </Option>
                            ))}
                        </Select>
                    </div>
                ) : (
                    <p style={{ color: "red" }}>Không có vắc xin hoặc gói vắc xin để chỉnh sửa!</p>
                )}
                <p style={{ color: "red" }}>
                    Lưu ý: Thay đổi có thể ảnh hưởng đến giá thanh toán!
                </p>
            </Modal>
        </div>
    );
};

export default CheckInPage;