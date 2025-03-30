/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Table, Input, Space, Row, Col, Modal, message, Form, Tag, Descriptions } from "antd";
import { ReloadOutlined, EyeOutlined, CheckOutlined, EditOutlined } from "@ant-design/icons";
import moment from "moment";
import appointmentService from "../../service/appointmentService";
import childProfileService from "../../service/childProfileService";
import userService from "../../service/userService";
import vaccineService from "../../service/vaccineService";
import vaccinePackageService from "../../service/vaccinePackageService";
import paymentDetailService from "../../service/paymentDetailService";
import vaccinePackageDetailService from "../../service/vaccinePackageDetailService";
import {
    AppointmentResponseDTO,
    UpdateAppointmentDTO,
} from "../../models/Appointment";
import { ChildProfileResponseDTO } from "../../models/ChildProfile";
import { UserResponseDTO } from "../../models/User";
import { VaccineResponseDTO } from "../../models/Vaccine";
import { VaccinePackageResponseDTO } from "../../models/VaccinePackage";
import { PaymentDetailResponseDTO } from "../../models/PaymentDetail";
import { ColumnType } from "antd/es/table";
import { AppointmentStatus } from "../Appointment/CustomerAppointment";

const { Search } = Input;
const { TextArea } = Input;

const ResponsePage: React.FC = () => {
    const [appointments, setAppointments] = useState<AppointmentResponseDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0,
    });
    const [searchKeyword, setSearchKeyword] = useState("");
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [isReactionModalVisible, setIsReactionModalVisible] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState<AppointmentResponseDTO | null>(null);
    const [childMap, setChildMap] = useState<{
        [key: number]: { childFullName: string; userFullName: string };
    }>({});
    const [vaccines, setVaccines] = useState<VaccineResponseDTO[]>([]);
    const [vaccinePackages, setVaccinePackages] = useState<VaccinePackageResponseDTO[]>([]);
    const [allPaymentDetails, setAllPaymentDetails] = useState<PaymentDetailResponseDTO[]>([]);
    const [vaccineNameMap, setVaccineNameMap] = useState<Map<number, string>>(new Map());
    const [reactionForm] = Form.useForm();
    const [processedAppointments, setProcessedAppointments] = useState<Set<number>>(new Set());

    const getStatusText = (status: number) => {
        let text = "";
        let style = {};

        switch (status) {
            case AppointmentStatus.Pending:
                text = "Đã lên lịch";
                style = { color: "#1890ff", backgroundColor: "#e6f7ff", padding: "2px 8px", borderRadius: "4px" };
                break;
            case AppointmentStatus.Checked:
                text = "Đã check in";
                style = { color: "#fa8c16", backgroundColor: "#fff7e6", padding: "2px 8px", borderRadius: "4px" };
                break;
            case AppointmentStatus.Paid:
                text = "Đã thanh toán";
                style = { color: "#722ed1", backgroundColor: "#f9f0ff", padding: "2px 8px", borderRadius: "4px" };
                break;
            case AppointmentStatus.Injected:
                text = "Đã tiêm";
                style = { color: "#08979c", backgroundColor: "#e6fffb", padding: "2px 8px", borderRadius: "4px" };
                break;
            case AppointmentStatus.WaitingForResponse:
                text = "Chờ Phản Ứng";
                style = { color: "#d4b106", backgroundColor: "#fffbe6", padding: "2px 8px", borderRadius: "4px" };
                break;
            case AppointmentStatus.Completed:
                text = "Hoàn thành";
                style = { color: "#52c41a", backgroundColor: "#f6ffed", padding: "2px 8px", borderRadius: "4px" };
                break;
            case AppointmentStatus.Cancelled:
                text = "Đã hủy";
                style = { color: "#ff4d4f", backgroundColor: "#fff1f0", padding: "2px 8px", borderRadius: "4px" };
                break;
            default:
                text = String(status);
                style = { color: "#000", padding: "2px 8px", borderRadius: "4px" };
        }

        return <span style={style}>{text}</span>;
    };

    const getStatusColor = (status: number) => {
        switch (status) {
            case AppointmentStatus.Pending: return "blue";
            case AppointmentStatus.Checked: return "gold";
            case AppointmentStatus.Paid: return "purple";
            case AppointmentStatus.Injected: return "cyan";
            case AppointmentStatus.WaitingForResponse: return "yellow";
            case AppointmentStatus.Completed: return "green";
            case AppointmentStatus.Cancelled: return "red";
            default: return "default";
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

            setVaccines(allVaccines);
            setVaccinePackages(allVaccinePackages);

            const allAppointments = await appointmentService.getAllAppointments();

            let filteredAppointments = allAppointments.filter(
                (appointment) => appointment.appointmentStatus === AppointmentStatus.WaitingForResponse
            );

            if (keyword) {
                filteredAppointments = filteredAppointments.filter(
                    (appointment) =>
                        appointment.appointmentId.toString().includes(keyword) ||
                        moment(appointment.appointmentDate).format("DD/MM/YYYY").includes(keyword)
                );
            }

            const startIndex = (page - 1) * pageSize;
            const paginatedAppointments = filteredAppointments.slice(startIndex, startIndex + pageSize);

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
                    return { childId, childFullName: child.fullName || "N/A", userId: child.userId };
                } catch (error) {
                    console.error(`Lỗi khi lấy child ${childId}:`, error);
                    return { childId, childFullName: "N/A", userId: null };
                }
            });

            const childrenData = await Promise.all(childPromises);
            const userIds = [
                ...new Set(childrenData.map((child) => child.userId).filter((id): id is number => id !== null)),
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

            const usersData = (await Promise.all(userPromises)).filter((user) => user !== null) as UserResponseDTO[];
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
                    newVaccineNameMap.set(packageDetailId, vaccine ? vaccine.name : "Không xác định");
                } catch (error) {
                    console.error(`Lỗi khi lấy vaccine cho packageDetailId ${packageDetailId}:`, error);
                    newVaccineNameMap.set(packageDetailId, "Không xác định");
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

    const handleRecordReaction = async (appointment: AppointmentResponseDTO) => {
        if (appointment.appointmentStatus !== AppointmentStatus.WaitingForResponse) {
            message.error("Chỉ có thể ghi phản ứng cho lịch hẹn ở trạng thái 'Chờ Phản Ứng'!");
            return;
        }

        try {
            setSelectedAppointment(appointment);
            reactionForm.setFieldsValue({ reaction: appointment.reaction || "" });
            setIsReactionModalVisible(true);
        } catch (error) {
            console.error("Lỗi khi mở modal ghi phản ứng:", error);
            message.error("Không thể mở modal ghi phản ứng.");
        }
    };

    const handleSaveReaction = async () => {
        if (!selectedAppointment) return;
        try {
            const values = await reactionForm.validateFields();
            const reaction = values.reaction;

            const updateData: UpdateAppointmentDTO = {
                reaction: reaction,
            };
            await appointmentService.updateAppointment(selectedAppointment.appointmentId, updateData);

            setProcessedAppointments((prev) => new Set(prev).add(selectedAppointment.appointmentId));

            message.success("Đã cập nhật phản ứng", 1.5, () => {
                fetchAppointments(pagination.current, pagination.pageSize, searchKeyword);
                setIsReactionModalVisible(false);
                reactionForm.resetFields();
            });
        } catch (error) {
            console.error("Lỗi khi lưu phản ứng:", error);
            message.error("Lưu phản ứng thất bại.");
        }
    };

    const handleConfirmComplete = async (appointment: AppointmentResponseDTO) => {
        if (appointment.appointmentStatus !== AppointmentStatus.WaitingForResponse) {
            message.error("Chỉ lịch hẹn ở trạng thái 'Chờ Phản Ứng' mới có thể hoàn thành!");
            return;
        }

        if (processedAppointments.has(appointment.appointmentId)) {
            message.warning("Lịch hẹn đã hoàn thành từ trước!");
            return;
        }

        try {
            const updateData: UpdateAppointmentDTO = {
                appointmentStatus: AppointmentStatus.Completed,
            };
            await appointmentService.updateAppointment(appointment.appointmentId, updateData);

            setProcessedAppointments((prev) => new Set(prev).add(appointment.appointmentId));

            message.success("Lịch hẹn đã hoàn thành!", 1.5, () => {
                fetchAppointments(pagination.current, pagination.pageSize, searchKeyword);
            });
        } catch (error) {
            console.error("Error confirming completion:", error);
            message.error("Có lỗi khi hoàn thành lịch hẹn.");
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
        setIsReactionModalVisible(false);
        setSelectedAppointment(null);
        reactionForm.resetFields();
    };

    const getVaccineOrPackageName = (appointment: AppointmentResponseDTO) => {
        if (appointment.vaccineId) {
            return vaccines.find((v) => v.vaccineId === appointment.vaccineId)?.name || "N/A";
        }
        if (appointment.vaccinePackageId) {
            return vaccinePackages.find((p) => p.vaccinePackageId === appointment.vaccinePackageId)?.name || "N/A";
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

                const vaccineName = vaccineNameMap.get(selectedPaymentDetail.vaccinePackageDetailId) || "Không xác định";
                const statusText = selectedPaymentDetail.isCompleted === 1 ? " (Hoàn thành)" : "";
                return (
                    <span style={{ color: "red" }}>
                        Mũi {selectedPaymentDetail.doseSequence} - Vaccine: {vaccineName}{statusText}
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
            title: "Phản ứng",
            dataIndex: "reaction",
            width: 100,
            render: (reaction: string) => reaction || "N/A",
        },
        {
            title: "Hành động",
            key: "action",
            width: 150,
            align: "center",
            render: (_: any, appointment: AppointmentResponseDTO) => (
                <Space size="middle">
                    <EyeOutlined
                        onClick={() => handleViewDetail(appointment)}
                        style={{ color: "blue", cursor: "pointer", fontSize: "18px" }}
                        title="Chi tiết lịch hẹn"
                    />
                    <EditOutlined
                        onClick={() => handleRecordReaction(appointment)}
                        style={{
                            color: appointment.appointmentStatus === AppointmentStatus.WaitingForResponse ? "orange" : "gray",
                            cursor: appointment.appointmentStatus === AppointmentStatus.WaitingForResponse ? "pointer" : "not-allowed",
                            fontSize: "18px",
                        }}
                        title="Ghi phản ứng"
                    />
                    <CheckOutlined
                        onClick={() => handleConfirmComplete(appointment)}
                        style={{
                            color: appointment.appointmentStatus === AppointmentStatus.WaitingForResponse ? "green" : "gray",
                            cursor: appointment.appointmentStatus === AppointmentStatus.WaitingForResponse ? "pointer" : "not-allowed",
                            fontSize: "18px",
                        }}
                        title="Xác nhận hoàn thành"
                    />
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4 max-w-7xl mx-auto mt-12">
            <h2 className="text-2xl font-bold text-center p-2">
                GHI NHẬN PHẢN ỨNG SAU TIÊM
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
                title="CHI TIẾT LỊCH HẸN TIÊM CHỦNG"
                visible={isDetailModalVisible}
                onCancel={handleCloseModal}
                footer={null}
                centered
                style={{ width: "800px", maxHeight: "600px" }}
                bodyStyle={{ maxHeight: "500px", overflowY: "auto" }}
            >
                {selectedAppointment && (
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Tên Phụ huynh">
                            {selectedAppointment.childId !== null && childMap[selectedAppointment.childId]?.userFullName
                                ? childMap[selectedAppointment.childId].userFullName
                                : "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tên Trẻ em">
                            {selectedAppointment.childId !== null && childMap[selectedAppointment.childId]?.childFullName
                                ? childMap[selectedAppointment.childId].childFullName
                                : "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tên Vắc xin">
                            {vaccines.find((v) => v.vaccineId === selectedAppointment.vaccineId)?.name || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tên Gói Vắc xin">
                            {vaccinePackages.find((p) => p.vaccinePackageId === selectedAppointment.vaccinePackageId)?.name || "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Mũi tiêm đã chọn">
                            {selectedAppointment.paymentDetailId ? (
                                (() => {
                                    const selectedPaymentDetail = allPaymentDetails.find(
                                        (detail) => detail.paymentDetailId === selectedAppointment.paymentDetailId
                                    );
                                    if (!selectedPaymentDetail) return "Không tìm thấy thông tin mũi tiêm";
                                    const vaccineName = vaccineNameMap.get(selectedPaymentDetail.vaccinePackageDetailId) || "Không xác định";
                                    const statusText = selectedPaymentDetail.isCompleted === 1 ? " (Hoàn thành)" : " (Chưa hoàn thành)";
                                    return `Mũi ${selectedPaymentDetail.doseSequence} - Vaccine: ${vaccineName}${statusText} - Ngày dự kiến: ${selectedPaymentDetail.scheduledDate ? moment(selectedPaymentDetail.scheduledDate, "DD/MM/YYYY").format("DD/MM/YYYY") : "Chưa xác định"}`;
                                })()
                            ) : (
                                "Chưa chọn mũi tiêm"
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái hẹn">
                            {getStatusText(selectedAppointment.appointmentStatus)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày hẹn">
                            {selectedAppointment.appointmentDate
                                ? moment(selectedAppointment.appointmentDate, "DD/MM/YYYY").format("DD/MM/YYYY")
                                : "N/A"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phản ứng">
                            {selectedAppointment.reaction || "N/A"}
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
                title="Ghi nhận phản ứng sau tiêm"
                visible={isReactionModalVisible}
                onOk={handleSaveReaction}
                onCancel={handleCloseModal}
                okText="Lưu phản ứng"
                cancelText="Hủy"
            >
                <Form form={reactionForm} layout="vertical">
                    <Form.Item
                        name="reaction"
                        label="Phản ứng sau tiêm"
                        rules={[{ required: true, message: "Vui lòng nhập phản ứng sau tiêm" }]}
                    >
                        <TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ResponsePage;