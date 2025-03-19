/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
    Table,
    Input,
    Space,
    Row,
    Col,
    Modal,
    message,
    Descriptions,
    Select,
    Button,
} from "antd";
import { ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import moment from "moment";
import { ColumnType } from "antd/es/table";
import { AppointmentResponseDTO, UpdateAppointmentDTO } from "../../models/Appointment";
import { ChildProfileResponseDTO } from "../../models/ChildProfile";
import { VaccineResponseDTO } from "../../models/Vaccine";
import { VaccinePackageResponseDTO } from "../../models/VaccinePackage";
import { CreatePaymentDTO, PaymentResponseDTO, VnPaymentRequestModel } from "../../models/Payment";
import vaccineService from "../../service/vaccineService";
import vaccinePackageService from "../../service/vaccinePackageService";
import childProfileService from "../../service/childProfileService";
import appointmentService from "../../service/appointmentService";
import paymentService from "../../service/paymentService";
import { AppointmentStatus, PaymentType } from "../../models/Type/enum";
import paymentDetailService from "../../service/paymentDetailService";
import { VaccineDiseaseResponseDTO } from "../../models/VaccineDisease";
import { DiseaseResponseDTO } from "../../models/Disease";
import vaccineDiseaseService from "../../service/vaccineDiseaseService";
import diseaseService from "../../service/diseaseService";

const { Search } = Input;
const { Option } = Select;

const PaymentManagementPage: React.FC = () => {
    const [appointments, setAppointments] = useState<AppointmentResponseDTO[]>([]);
    const [originalAppointments, setOriginalAppointments] = useState<AppointmentResponseDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
    const [isConfirmPaymentModalVisible, setIsConfirmPaymentModalVisible] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponseDTO | null>(null);
    const [selectedPaymentType, setSelectedPaymentType] = useState<number | null>(null);
    const [childProfiles, setChildProfiles] = useState<ChildProfileResponseDTO[]>([]);
    const [vaccines, setVaccines] = useState<VaccineResponseDTO[]>([]);
    const [vaccineDiseases, setVaccineDiseases] = useState<VaccineDiseaseResponseDTO[]>([]);
    const [diseases, setDiseases] = useState<DiseaseResponseDTO[]>([]);
    const [vaccinePackages, setVaccinePackages] = useState<VaccinePackageResponseDTO[]>([]);
    const [payments, setPayments] = useState<PaymentResponseDTO[]>([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const allVaccines = await vaccineService.getAllVaccines();
            const allVaccinePackages = await vaccinePackageService.getAllPackages();
            const allChildProfiles = await childProfileService.getAllChildProfiles();
            const allAppointments = await appointmentService.getAllAppointments();
            const allPayments = await paymentService.getAllPayments();
            const allVaccineDiseases = await vaccineDiseaseService.getAllVaccineDiseases();
            const allDiseases = await diseaseService.getAllDiseases();

            const activeAppointments = allAppointments.filter(
                (appointment) => appointment.isActive === 1
            );

            const checkedAppointments = activeAppointments.filter(
                (appointment) => appointment.appointmentStatus === AppointmentStatus.Checked
            );

            // Lọc các lịch hẹn có paymentStatus = 1 (chưa thanh toán) hoặc chưa có thanh toán
            const unpaidAppointments = checkedAppointments.filter((appointment) => {
                const relatedPayment = allPayments.find(
                    (payment) => payment.appointmentId === appointment.appointmentId
                );
                // Nếu không có thanh toán hoặc paymentStatus = 1 (chưa thanh toán)
                return !relatedPayment || relatedPayment.paymentStatus === 1;
            });

            setVaccines(allVaccines);
            setVaccinePackages(allVaccinePackages);
            setChildProfiles(allChildProfiles);
            setAppointments(unpaidAppointments);
            setOriginalAppointments(activeAppointments);
            setPayments(allPayments);
            setVaccineDiseases(allVaccineDiseases);
            setDiseases(allDiseases);
            setPagination({
                current: 1,
                pageSize: pagination.pageSize,
                total: unpaidAppointments.length,
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

    const handleTableChange = (pagination: any) => {
        const { current, pageSize } = pagination;
        setPagination((prev) => ({ ...prev, current, pageSize }));
    };

    const onSearch = (value: string) => {
        const trimmedValue = value.trim().toLowerCase();
        setSearchKeyword(trimmedValue);

        if (!trimmedValue) {
            const unpaidAppointments = originalAppointments.filter(
                (appointment) => {
                    const relatedPayment = payments.find(
                        (payment) => payment.appointmentId === appointment.appointmentId
                    );
                    return (
                        appointment.appointmentStatus === AppointmentStatus.Checked &&
                        (!relatedPayment || relatedPayment.paymentStatus === 1)
                    );
                }
            );
            setAppointments(unpaidAppointments);
            setPagination({
                ...pagination,
                current: 1,
                total: unpaidAppointments.length,
            });
            return;
        }

        const filteredAppointments = originalAppointments.filter((appointment) => {
            const child = childProfiles.find((p) => p.childId === appointment.childId);
            const childName = child?.fullName.toLowerCase() || "";
            const vaccine = appointment.vaccineId
                ? vaccines.find((v) => v.vaccineId === appointment.vaccineId)?.name.toLowerCase() || ""
                : "";
            const vaccinePackage = appointment.vaccinePackageId
                ? vaccinePackages.find((p) => p.vaccinePackageId === appointment.vaccinePackageId)?.name.toLowerCase() || ""
                : "";
            const relatedPayment = payments.find(
                (payment) => payment.appointmentId === appointment.appointmentId
            );

            return (
                (childName.includes(trimmedValue) ||
                    vaccine.includes(trimmedValue) ||
                    vaccinePackage.includes(trimmedValue)) &&
                appointment.appointmentStatus === AppointmentStatus.Checked &&
                (!relatedPayment || relatedPayment.paymentStatus === 1)
            );
        });

        setAppointments(filteredAppointments);
        setPagination({
            ...pagination,
            current: 1,
            total: filteredAppointments.length,
        });
    };

    const handleReset = () => {
        setSearchKeyword("");
        fetchData();
    };

    const handleViewDetail = (appointment: AppointmentResponseDTO) => {
        setSelectedAppointment(appointment);
        setIsDetailModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsDetailModalVisible(false);
        setIsPaymentModalVisible(false);
        setIsConfirmPaymentModalVisible(false);
        setSelectedAppointment(null);
        setSelectedPaymentType(null);
    };

    const handlePayment = async (appointment: AppointmentResponseDTO) => {
        try {
            const latestAppointment = await appointmentService.getAppointmentById(appointment.appointmentId);

            if (latestAppointment.appointmentStatus !== AppointmentStatus.Checked) {
                message.error("Chỉ có thể thanh toán lịch hẹn sau khi đã check in!");
                return;
            }

            const relatedPayment = payments.find(
                (p) => p.appointmentId === latestAppointment.appointmentId
            );
            if (relatedPayment && relatedPayment.paymentStatus === 3) {
                message.info("Lịch hẹn này đã được thanh toán!");
                return;
            }

            setSelectedAppointment(latestAppointment);
            setIsPaymentModalVisible(true);
        } catch (error) {
            message.error("Không thể tải lại trạng thái lịch hẹn: " + (error as Error).message);
        }
    };

    const handlePaymentConfirm = () => {
        if (!selectedAppointment || selectedPaymentType === null) {
            message.error("Vui lòng chọn phương thức thanh toán!");
            return;
        }

        appointmentService
            .getAppointmentById(selectedAppointment.appointmentId)
            .then((latestAppointment) => {
                setSelectedAppointment(latestAppointment);

                if (latestAppointment.appointmentStatus !== AppointmentStatus.Checked) {
                    message.error("Chỉ có thể xác nhận thanh toán lịch hẹn sau khi đã check in'!");
                    return;
                }

                setIsPaymentModalVisible(false);
                setIsConfirmPaymentModalVisible(true);
            })
            .catch((error) => {
                message.error("Không thể tải lại trạng thái lịch hẹn: " + (error as Error).message);
            });
    };

    const handleFinalPaymentConfirm = async () => {
        if (!selectedAppointment || selectedPaymentType === null) {
            message.error("Dữ liệu không hợp lệ!");
            return;
        }

        try {
            const latestAppointment = await appointmentService.getAppointmentById(selectedAppointment.appointmentId);
            setSelectedAppointment(latestAppointment);

            if (latestAppointment.appointmentStatus !== AppointmentStatus.Checked) {
                message.error("Chỉ có thể thực hiện thanh toán lịch hẹn sau khi đã check in!");
                return;
            }

            let amount = 0;
            if (latestAppointment.vaccinePackageId) {
                const vaccinePackage = vaccinePackages.find(
                    (pkg) => pkg.vaccinePackageId === latestAppointment.vaccinePackageId
                );
                amount = vaccinePackage ? vaccinePackage.totalPrice : 0;
            } else if (latestAppointment.vaccineId) {
                const vaccine = vaccines.find((v) => v.vaccineId === latestAppointment.vaccineId);
                amount = vaccine ? vaccine.price : 0;
            }

            if (amount === 0) {
                message.error("Không thể xác định số tiền thanh toán!");
                return;
            }

            const child = childProfiles.find(
                (profile) => profile.childId === latestAppointment.childId
            );
            const childFullName = child?.fullName || "Không xác định";

            const description = `Thanh toán lịch hẹn tiêm chủng cho trẻ ${childFullName} vào ngày ${moment().format("DD/MM/YYYY")}`;

            const paymentData: CreatePaymentDTO = {
                appointmentId: latestAppointment.appointmentId,
                userId: latestAppointment.userId,
                vaccineId: latestAppointment.vaccineId || undefined,
                vaccinePackageId: latestAppointment.vaccinePackageId || undefined,
                paymentType: selectedPaymentType,
            };

            try {
                const newPayment = await paymentService.addPayment(paymentData);

                if (selectedPaymentType === PaymentType.Cash) {
                    await paymentService.updatePayment(newPayment.paymentId, {
                        paymentStatus: 2,
                    });

                    if (latestAppointment.vaccinePackageId) {
                        await paymentDetailService.generatePaymentDetail(newPayment.paymentId);
                    }

                    const updateAppointmentData: UpdateAppointmentDTO = {
                        appointmentStatus: AppointmentStatus.Paid, // Cập nhật thành Paid (3)
                    };
                    await appointmentService.updateAppointment(latestAppointment.appointmentId, updateAppointmentData);

                    message.success("Thanh toán bằng tiền mặt thành công!");
                    setPayments([...payments, { ...newPayment, paymentStatus: 2 }]);
                } else if (selectedPaymentType === PaymentType.BankTransfer) {
                    const vnPaymentRequest: VnPaymentRequestModel = {
                        orderId: newPayment.paymentId,
                        fullName: childFullName,
                        description: description,
                        amount: amount,
                    };

                    const paymentUrl = await paymentService.createPaymentUrl(vnPaymentRequest);

                    if (!paymentUrl) {
                        message.error("Không thể tạo URL thanh toán!");
                        return;
                    }

                    window.location.href = paymentUrl;
                }
                setIsConfirmPaymentModalVisible(false);
                setSelectedPaymentType(null);
                setSelectedAppointment(null);
                fetchData();
            } catch (error) {
                message.error("Thanh toán thất bại: " + (error as Error).message);
            }
        } catch (error) {
            message.error("Không thể tải lại trạng thái lịch hẹn: " + (error as Error).message);
        }
    };

    const getStatusText = (status: number) => {
        let text = "";
        let style = {};

        switch (status) {
            case AppointmentStatus.Checked:
                text = "Đã check in";
                style = {
                    color: "#fa8c16",
                    backgroundColor: "#fff7e6",
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
                childProfiles.find((profile) => profile.childId === childId)?.fullName || "Không tìm thấy tên",
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
            width: 100,
        },
        {
            title: "Trạng thái",
            dataIndex: "appointmentStatus",
            key: "AppointmentStatus",
            width: 150,
            render: (status: number) => getStatusText(status),
        },
        {
            title: "Thanh toán",
            key: "payment",
            width: 200,
            render: (_: any, record: AppointmentResponseDTO) => {
                return (
                    <span
                        style={{
                            display: "inline-block",
                            padding: "2px 4px",
                            borderRadius: "4px",
                            backgroundColor: "#e6f7ff",
                            border: "1px solid #1890ff",
                            color: "#1890ff",
                        }}
                    >
                        <a onClick={() => handlePayment(record)}>Thanh toán ngay</a>
                    </span>
                );
            },
        },
        {
            title: "Hành động",
            key: "action",
            width: 150,
            render: (_: any, record: AppointmentResponseDTO) => {
                return (
                    <Space size="middle">
                        <EyeOutlined
                            onClick={() => handleViewDetail(record)}
                            style={{ color: "blue", cursor: "pointer" }}
                        />
                    </Space>
                );
            },
        },
    ];

    return (
        <div className="p-4 max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-center p-2 rounded-t-lg">
                QUẢN LÝ THANH TOÁN LỊCH HẸN TIÊM CHỦNG
            </h2>
            <Row justify="space-between" style={{ marginBottom: 16, marginTop: 24 }}>
                <Col>
                    <Space>
                        <Search
                            placeholder="Tìm kiếm theo tên trẻ, vaccine, hoặc gói vaccine"
                            onSearch={onSearch}
                            enterButton
                            allowClear
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            style={{ width: 300 }}
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
                dataSource={appointments.slice(
                    (pagination.current - 1) * pagination.pageSize,
                    pagination.current * pagination.pageSize
                )}
                rowKey="appointmentId"
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

            <Modal
                title="CHI TIẾT LỊCH HẸN TIÊM CHỦNG"
                visible={isDetailModalVisible}
                onCancel={handleCloseModal}
                footer={null}
                centered
            >
                {selectedAppointment && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Tên Trẻ em">
                            {childProfiles.find((p) => p.childId === selectedAppointment.childId)?.fullName || "Không tìm thấy tên"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tên Vắc xin">
                            {vaccines.find((v) => v.vaccineId === selectedAppointment.vaccineId)?.name || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tên Gói vắc xin">
                            {vaccinePackages.find((p) => p.vaccinePackageId === selectedAppointment.vaccinePackageId)?.name || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái hẹn">
                            {getStatusText(selectedAppointment.appointmentStatus)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Hoạt động">
                            {selectedAppointment.isActive === 1 ? "Có" : "Không"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo">
                            {selectedAppointment.createdDate
                                ? moment(selectedAppointment.createdDate, "DD/MM/YYYY").format("DD/MM/YYYY")
                                : "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Người tạo">
                            {selectedAppointment.createdBy || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày sửa đổi">
                            {selectedAppointment.modifiedDate
                                ? moment(selectedAppointment.modifiedDate, "DD/MM/YYYY").format("DD/MM/YYYY")
                                : "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Người sửa đổi">
                            {selectedAppointment.modifiedBy || "N/A"}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>

            <Modal
                title="Chọn phương thức thanh toán"
                visible={isPaymentModalVisible}
                onCancel={() => setIsPaymentModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsPaymentModalVisible(false)}>
                        Hủy
                    </Button>,
                    <Button key="submit" type="primary" onClick={handlePaymentConfirm}>
                        Tiếp tục
                    </Button>,
                ]}
                centered
            >
                <Select
                    placeholder="Chọn phương thức thanh toán"
                    style={{ width: "100%" }}
                    onChange={(value) => setSelectedPaymentType(value)}
                    value={selectedPaymentType}
                >
                    <Option value={PaymentType.Cash}>Tiền mặt</Option>
                    <Option value={PaymentType.BankTransfer}>Chuyển khoản (VNPay)</Option>
                </Select>
            </Modal>

            <Modal
                title={<div className="text-center text-2xl font-bold">XÁC NHẬN THANH TOÁN</div>}
                visible={isConfirmPaymentModalVisible}
                onCancel={() => setIsConfirmPaymentModalVisible(false)}
                footer={[
                    <Button key="cancel" onClick={() => setIsConfirmPaymentModalVisible(false)}>
                        Hủy
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleFinalPaymentConfirm}>
                        Xác nhận
                    </Button>,
                ]}
                centered
            >
                {selectedAppointment && (
                    <>
                        <p className="font-semibold text-xl">
                            Bạn có muốn thanh toán bằng phương thức{" "}
                            {selectedPaymentType === PaymentType.Cash ? "tiền mặt" : "chuyển khoản (VNPay)"}?
                        </p>
                        <p className="mt-4">
                            Số tiền:{" "}
                            {(() => {
                                let amount = 0;
                                if (selectedAppointment.vaccinePackageId) {
                                    const vaccinePackage = vaccinePackages.find(
                                        (pkg) => pkg.vaccinePackageId === selectedAppointment.vaccinePackageId
                                    );
                                    amount = vaccinePackage ? vaccinePackage.totalPrice : 0;
                                } else if (selectedAppointment.vaccineId) {
                                    const vaccine = vaccines.find(
                                        (v) => v.vaccineId === selectedAppointment.vaccineId
                                    );
                                    amount = vaccine ? vaccine.price : 0;
                                }
                                return amount > 0
                                    ? `${new Intl.NumberFormat("vi-VN").format(amount)} VND`
                                    : "Không xác định";
                            })()}
                        </p>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default PaymentManagementPage;