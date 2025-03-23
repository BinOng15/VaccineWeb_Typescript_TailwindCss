/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Table, Input, Space, Row, Col, Modal, message, Tag } from "antd";
import { ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import moment from "moment";
import appointmentService from "../../service/appointmentService";
import childProfileService from "../../service/childProfileService";
import userService from "../../service/userService";
import vaccineService from "../../service/vaccineService";
import vaccinePackageService from "../../service/vaccinePackageService";
import paymentDetailService from "../../service/paymentDetailService";
import vaccinePackageDetailService from "../../service/vaccinePackageDetailService";
import vaccineDiseaseService from "../../service/vaccineDiseaseService";
import {
  AppointmentResponseDTO,
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
import diseaseService from "../../service/diseaseService";

const { Search } = Input;

const VaccinationRecordPage: React.FC = () => {
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
      case AppointmentStatus.Completed:
        text = "Hoàn thành";
        style = {
          color: "#52c41a",
          backgroundColor: "#f6ffed",
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
      case AppointmentStatus.Completed:
        return "green";
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

      const updatedAppointments = allAppointments.map((appointment) => ({
        ...appointment,
        appointmentStatus: appointment.appointmentStatus || 2,
      }));

      // Chỉ hiển thị các appointment có trạng thái Completed (4)
      let filteredAppointments = updatedAppointments.filter(
        (appointment) => appointment.appointmentStatus === AppointmentStatus.Completed
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
          const relatedVaccineDiseases = allVaccineDiseases.filter((vd) => vd.vaccineId === packageDetail.vaccineId);
          const diseaseNames = relatedVaccineDiseases
            .map((vd) => {
              const disease = allDiseases.find((d: any) => d.diseaseId === vd.diseaseId);
              return disease ? disease.name : "Không xác định";
            })
            .filter((name) => name !== "Không xác định")
            .join(", ");
          const displayName = `${vaccine ? vaccine.name : "Không xác định"} - ${diseaseNames || "Không xác định"}`;
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
      const relatedVaccineDiseases = vaccineDiseases.filter((vd) => vd.vaccineId === appointment.vaccineId);
      const diseaseNames = relatedVaccineDiseases
        .map((vd) => {
          const disease = diseases.find((d) => d.diseaseId === vd.diseaseId);
          return disease ? disease.name : "Không xác định";
        })
        .filter((name) => name !== "Không xác định")
        .join(", ");
      return `${vaccine ? vaccine.name : "N/A"} ${diseaseNames ? `- ${diseaseNames}` : ""}`;
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
      width: 150,
      render: (appointment: AppointmentResponseDTO) =>
        appointment.childId !== null && childMap[appointment.childId]?.userFullName
          ? childMap[appointment.childId].userFullName
          : "N/A",
    },
    {
      title: "Tên Trẻ em",
      key: "childFullName",
      width: 150,
      render: (appointment: AppointmentResponseDTO) =>
        appointment.childId !== null && childMap[appointment.childId]?.childFullName
          ? childMap[appointment.childId].childFullName
          : "N/A",
    },
    {
      title: "Tên Vaccine/Gói Vaccine",
      key: "vaccineOrPackageName",
      width: 250,
      render: (appointment: AppointmentResponseDTO) => getVaccineOrPackageName(appointment),
    },
    {
      title: "Mũi Tiêm",
      key: "doseSequence",
      render: (appointment: AppointmentResponseDTO) => {
        if (!appointment.paymentDetailId)
          return <span style={{ color: "gray" }}>-</span>;
        const selectedPaymentDetail = allPaymentDetails.find(
          (detail) => detail.paymentDetailId === appointment.paymentDetailId
        );
        if (!selectedPaymentDetail)
          return <span style={{ color: "gray" }}>-</span>;

        const vaccineName = vaccineNameMap.get(selectedPaymentDetail.vaccinePackageDetailId) || "Không xác định";
        return (
          <span style={{ color: "red" }}>
            Mũi {selectedPaymentDetail.doseSequence} - {vaccineName}
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
      render: (reaction: string) => reaction || "N/A",
    },
    {
      title: "Hành động",
      key: "action",
      align: "center",
      render: (_: any, appointment: AppointmentResponseDTO) => (
        <Space size="middle">
          <EyeOutlined
            onClick={() => handleViewDetail(appointment)}
            style={{ color: "blue", cursor: "pointer", fontSize: "18px" }}
            title="Chi tiết lịch tiêm"
          />
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 max-w-7xl mx-auto mt-12">
      <h2 className="text-2xl font-bold text-center p-2">
        QUẢN LÝ LỊCH HẸN TIÊM CHỦNG
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
              {getVaccineOrPackageName(selectedAppointment)}
            </p>
            <p>
              <strong>Tên Mũi Tiêm:</strong>{" "}
              {allPaymentDetails.length > 0
                ? (() => {
                  const selectedDetail = allPaymentDetails.find(
                    (detail) =>
                      detail.paymentDetailId ===
                      selectedAppointment?.paymentDetailId
                  );
                  const vaccineName =
                    selectedDetail && selectedDetail.vaccinePackageDetailId
                      ? vaccineNameMap.get(selectedDetail.vaccinePackageDetailId) || "Không xác định"
                      : "N/A";
                  return selectedDetail?.doseSequence
                    ? `Mũi ${selectedDetail.doseSequence} - ${vaccineName}`
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
            <p>
              <strong>Phản ứng:</strong> {selectedAppointment.reaction || "N/A"}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VaccinationRecordPage;