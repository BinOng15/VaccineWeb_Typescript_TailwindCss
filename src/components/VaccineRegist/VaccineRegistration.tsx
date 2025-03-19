/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Select, Input, DatePicker, Button, notification, Table } from "antd";
import dayjs from "dayjs";
import { CreateAppointmentDTO } from "../../models/Appointment";
import { Gender } from "../../models/Type/enum";
import { VaccineResponseDTO } from "../../models/Vaccine";
import { VaccinePackageResponseDTO } from "../../models/VaccinePackage";
import { ChildProfileResponseDTO } from "../../models/ChildProfile";
import { PaymentDetailResponseDTO } from "../../models/PaymentDetail";
import { VaccineDiseaseResponseDTO } from "../../models/VaccineDisease";
import { PaymentResponseDTO } from "../../models/Payment";
import { AppointmentResponseDTO } from "../../models/Appointment";
import appointmentService from "../../service/appointmentService";
import vaccinePackageService from "../../service/vaccinePackageService";
import vaccineService from "../../service/vaccineService";
import vaccineDiseaseService from "../../service/vaccineDiseaseService";
import diseaseService from "../../service/diseaseService";
import childProfileService from "../../service/childProfileService";
import paymentService from "../../service/paymentService";
import paymentDetailService from "../../service/paymentDetailService";
import vaccinePackageDetailService from "../../service/vaccinePackageDetailService";
import userService from "../../service/userService";
import { useAuth } from "../../context/AuthContext";
import { DiseaseResponseDTO } from "../../models/Disease";

const { Option } = Select;
const { Column } = Table;

const VaccineRegistration: React.FC = () => {
  const { user } = useAuth();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [appointmentDate, setAppointmentDate] = useState<dayjs.Dayjs | null>(null);
  const [selectedVaccineId, setSelectedVaccineId] = useState<number | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [selectedUncompletedDose, setSelectedUncompletedDose] = useState<PaymentDetailResponseDTO | null>(null);
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<number | null>(null);
  const [vaccines, setVaccines] = useState<VaccineResponseDTO[]>([]);
  const [vaccineDiseases, setVaccineDiseases] = useState<VaccineDiseaseResponseDTO[]>([]);
  const [diseases, setDiseases] = useState<DiseaseResponseDTO[]>([]);
  const [packages, setPackages] = useState<VaccinePackageResponseDTO[]>([]);
  const [childProfiles, setChildProfiles] = useState<ChildProfileResponseDTO[]>([]);
  const [allPaymentDetails, setAllPaymentDetails] = useState<PaymentDetailResponseDTO[]>([]);
  const [uncompletedDoses, setUncompletedDoses] = useState<PaymentDetailResponseDTO[]>([]);
  const [vaccineNames, setVaccineNames] = useState<Map<number, string>>(new Map());
  const [allPayments, setAllPayments] = useState<PaymentResponseDTO[]>([]);
  const [allAppointments, setAllAppointments] = useState<AppointmentResponseDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  const getRelationshipLabel = (relationship: string | number | undefined): string => {
    switch (relationship?.toString()) {
      case "1": return "Mẹ";
      case "2": return "Bố";
      case "3": return "Người Giám hộ";
      default: return "Không xác định";
    }
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user || !user.userId) {
        console.error("No user or userId found");
        notification.error({ message: "Error", description: "Vui lòng đăng nhập lại!" });
        return;
      }

      const currentUserId = parseInt(user.userId.toString(), 10);
      setUserId(currentUserId);

      try {
        const userData = await userService.getUserById(currentUserId);
        setUserInfo(userData);
      } catch (error) {
        console.error("Failed to fetch user info:", error);
        notification.error({ message: "Error", description: "Không thể lấy thông tin người dùng!" });
      }
    };

    fetchUserInfo();
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      try {
        const allChildProfiles = await childProfileService.getAllChildProfiles();
        const userChildProfiles = allChildProfiles.filter((profile) => profile.userId === userId);
        setChildProfiles(userChildProfiles);

        const allVaccines = await vaccineService.getAllVaccines();
        setVaccines(allVaccines);

        const allVaccineDiseases = await vaccineDiseaseService.getAllVaccineDiseases();
        setVaccineDiseases(allVaccineDiseases);

        const allDiseases = await diseaseService.getAllDiseases();
        setDiseases(allDiseases);

        const allPackages = await vaccinePackageService.getAllPackages();
        setPackages(allPackages);

        const allPaymentsData = await paymentService.getAllPayments();
        const userPayments = allPaymentsData.filter((payment) => payment.userId === userId && payment.paymentStatus === 2);
        setAllPayments(allPaymentsData);

        const paymentIds = userPayments.map((payment) => payment.paymentId);

        const paymentDetailsPromises = paymentIds.map(async (paymentId) => {
          try {
            const paymentDetails = await paymentDetailService.getPaymentDetailsByPaymentId(paymentId);
            return paymentDetails;
          } catch (error) {
            console.error(`Lỗi khi lấy payment details cho payment ${paymentId}:`, error);
            return [];
          }
        });

        const paymentDetails = (await Promise.all(paymentDetailsPromises)).flat();
        setAllPaymentDetails(paymentDetails);

        const allAppointmentsData = await appointmentService.getAllAppointments();
        setAllAppointments(allAppointmentsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        notification.error({ message: "Error", description: "Không thể tải dữ liệu. Vui lòng thử lại!" });
      }
    };

    fetchData();
  }, [userId]);

  useEffect(() => {
    if (!selectedChildId || !allPaymentDetails.length || !userId || !allPayments.length || !allAppointments.length) {
      setUncompletedDoses([]);
      setVaccineNames(new Map());
      return;
    }

    const childId = parseInt(selectedChildId, 10);
    const fetchUncompletedDoses = async () => {
      try {
        // Lấy danh sách Payment của user đã thanh toán (paymentStatus === 2)
        const userPayments = allPayments.filter((payment) => payment.userId === userId && payment.paymentStatus === 2);
        const paymentIds = userPayments.map((payment) => payment.paymentId);

        // Lấy danh sách PaymentDetail liên quan đến các Payment của user
        const relevantPaymentDetails = allPaymentDetails.filter((detail) => paymentIds.includes(detail.paymentId));

        // Lọc các PaymentDetail chưa hoàn thành (isCompleted === 0)
        const uncompletedPaymentDetails = relevantPaymentDetails.filter((detail) => detail.isCompleted === 0);

        // Lấy danh sách appointment của child đã chọn
        const appointments = await appointmentService.getAppointmentsByChildId(childId);
        const appointmentPaymentDetailIds = appointments
          .map((appointment) => appointment.paymentDetailId)
          .filter((id): id is number => id !== null);

        // Lọc các PaymentDetail chưa có trong appointment
        const childUncompletedDoses = uncompletedPaymentDetails.filter(
          (detail) => !appointmentPaymentDetailIds.includes(detail.paymentDetailId)
        );

        // Lọc các PaymentDetail liên quan đến child đã chọn thông qua Payment và Appointment
        const filteredUncompletedDoses: PaymentDetailResponseDTO[] = [];
        const vaccineNamesMap = new Map<number, string>();

        for (const dose of childUncompletedDoses) {
          // Lấy Payment tương ứng với PaymentDetail
          const payment = allPayments.find((p) => p.paymentId === dose.paymentId);
          if (!payment) continue;

          // Lấy Appointment tương ứng với Payment
          const appointment = allAppointments.find((a) => a.appointmentId === payment.appointmentId);
          if (!appointment) continue;

          // Kiểm tra childId từ Appointment
          if (appointment.childId === childId) {
            // Kiểm tra vaccinePackageDetail có active không
            try {
              const vaccinePackageDetail = await vaccinePackageDetailService.getPackageDetailById(dose.vaccinePackageDetailId);
              if (vaccinePackageDetail.isActive === "Active") {
                filteredUncompletedDoses.push(dose);
                const vaccine = vaccines.find((v) => v.vaccineId === vaccinePackageDetail.vaccineId);
                // Lấy tất cả các bệnh liên quan đến vaccine
                const relatedVaccineDiseases = vaccineDiseases.filter((vd) => vd.vaccineId === vaccinePackageDetail.vaccineId);
                const diseaseNames = relatedVaccineDiseases
                  .map((vd) => {
                    const disease = diseases.find((d) => d.diseaseId === vd.diseaseId);
                    return disease ? disease.name : "Không xác định";
                  })
                  .filter((name) => name !== "Không xác định"); // Loại bỏ các bệnh không xác định
                const displayName = `${vaccine ? vaccine.name : "Không xác định"} - ${diseaseNames.length > 0 ? diseaseNames.join(", ") : "Không xác định"}`;
                vaccineNamesMap.set(dose.paymentDetailId, displayName);
              }
            } catch (error) {
              console.error(`Lỗi khi lấy vaccine cho paymentDetailId ${dose.paymentDetailId}:`, error);
              vaccineNamesMap.set(dose.paymentDetailId, "Không xác định - Không xác định");
            }
          }
        }

        setVaccineNames(vaccineNamesMap);
        setUncompletedDoses(filteredUncompletedDoses);
      } catch (error) {
        console.error("Failed to fetch uncompleted doses for child:", error);
        setUncompletedDoses([]);
        setVaccineNames(new Map());
      }
    };

    fetchUncompletedDoses();
  }, [selectedChildId, allPaymentDetails, userId, allPayments, allAppointments, vaccines, vaccineDiseases, diseases]);

  const selectedChildProfile = childProfiles.find((profile) => profile.childId.toString() === selectedChildId);

  const calculateMinAppointmentDate = () => {
    if (!selectedChildProfile || !selectedPackageId) return null;
    const selectedPackage = packages.find((pkg) => pkg.vaccinePackageId === selectedPackageId);
    if (!selectedPackage) return null;
    const childBirthDate = dayjs(selectedChildProfile.dateOfBirth, "DD/MM/YYYY");
    return childBirthDate.add(selectedPackage.ageInMonths, "month");
  };

  const filteredVaccines = selectedDiseaseId
    ? vaccines.filter((vaccine) =>
      vaccineDiseases.some((vd) => vd.vaccineId === vaccine.vaccineId && vd.diseaseId === selectedDiseaseId)
    )
    : [];

  const handleSubmit = async () => {
    if (
      !selectedChildId ||
      !appointmentDate ||
      (!selectedVaccineId && !selectedPackageId && !selectedUncompletedDose) ||
      !userId
    ) {
      notification.error({
        message: "Error",
        description: "Vui lòng điền đầy đủ thông tin (trẻ, ngày hẹn, và vaccine hoặc gói vaccine hoặc liều chưa hoàn thành)!",
      });
      return;
    }

    setLoading(true);
    try {
      const childId = parseInt(selectedChildId, 10);
      let vaccinePackageId: number | null = null;
      let vaccineIdToCheck: number | null = null;

      // Kiểm tra số lượng vaccine nếu chọn vaccine lẻ hoặc liều chưa hoàn thành
      if (selectedVaccineId) {
        vaccineIdToCheck = selectedVaccineId;
      } else if (selectedUncompletedDose) {
        const paymentDetail = allPaymentDetails.find(
          (detail) => detail.paymentDetailId === selectedUncompletedDose.paymentDetailId
        );
        if (!paymentDetail) {
          notification.error({
            message: "Error",
            description: "Không tìm thấy thông tin chi tiết thanh toán cho liều này!",
          });
          return;
        }

        const payment = allPayments.find((p) => p.paymentId === paymentDetail.paymentId);
        if (!payment || payment.paymentStatus !== 2) {
          notification.error({
            message: "Error",
            description: "Liều tiêm này chưa được thanh toán! Vui lòng kiểm tra lại.",
          });
          return;
        }

        const vaccinePackageDetail = await vaccinePackageDetailService.getPackageDetailById(selectedUncompletedDose.vaccinePackageDetailId);
        vaccinePackageId = vaccinePackageDetail.vaccinePackageId;
        vaccineIdToCheck = vaccinePackageDetail.vaccineId; // Lấy vaccineId từ vaccinePackageDetail để kiểm tra số lượng
      }

      // Kiểm tra số lượng vaccine nếu có vaccineIdToCheck
      if (vaccineIdToCheck) {
        const vaccine = vaccines.find((v) => v.vaccineId === vaccineIdToCheck);
        if (!vaccine) {
          notification.error({
            message: "Error",
            description: "Không tìm thấy thông tin vaccine!",
          });
          return;
        }

        if (vaccine.quantity === null || vaccine.quantity <= 0) {
          notification.error({
            message: "Error",
            description: `Hiện tại vaccine ${vaccine.name} trong hệ thống tạm thời hết, vui lòng chọn vaccine khác để đăng ký!`,
          });
          return;
        }
      }

      // Nếu chọn gói vaccine, kiểm tra số lượng của tất cả vaccine trong gói
      if (selectedPackageId) {
        vaccinePackageId = selectedPackageId;
        const selectedPackage = packages.find((pkg) => pkg.vaccinePackageId === selectedPackageId);
        if (!selectedPackage) {
          notification.error({
            message: "Error",
            description: "Không tìm thấy thông tin gói vaccine!",
          });
          return;
        }

        // Lấy danh sách vaccinePackageDetail của gói vaccine
        const packageDetails = await vaccinePackageDetailService.getPackageDetailByVaccinePackageID(selectedPackageId);
        for (const detail of packageDetails) {
          const vaccine = vaccines.find((v) => v.vaccineId === detail.vaccineId);
          if (!vaccine) {
            notification.error({
              message: "Error",
              description: `Không tìm thấy thông tin vaccine trong gói ${selectedPackage.name}!`,
            });
            return;
          }

          if (vaccine.quantity === null || vaccine.quantity <= 0) {
            notification.error({
              message: "Error",
              description: `Hiện tại vaccine ${vaccine.name} trong gói ${selectedPackage.name} tạm thời hết, vui lòng chọn gói vaccine khác để đăng ký!`,
            });
            return;
          }
        }
      }

      const appointmentData: CreateAppointmentDTO = {
        userId: userId,
        childId,
        paymentDetailId: selectedUncompletedDose ? selectedUncompletedDose.paymentDetailId : null,
        vaccineId: selectedVaccineId ?? null,
        vaccinePackageId: vaccinePackageId,
        appointmentDate: appointmentDate.format("DD/MM/YYYY"),
      };

      console.log("Appointment Data to Send:", JSON.stringify(appointmentData));
      await appointmentService.createAppointment(appointmentData);
      notification.success({
        message: "Success",
        description: "Đăng ký cuộc hẹn thành công!",
      });

      setSelectedChildId(null);
      setAppointmentDate(null);
      setSelectedVaccineId(null);
      setSelectedPackageId(null);
      setSelectedUncompletedDose(null);
      setSelectedDiseaseId(null);

      const allPaymentsData = await paymentService.getAllPayments();
      const userPayments = allPaymentsData.filter((payment) => payment.userId === userId && payment.paymentStatus === 2);
      const paymentIds = userPayments.map((payment) => payment.paymentId);
      const paymentDetailsPromises = paymentIds.map(async (paymentId) => {
        try {
          return await paymentDetailService.getPaymentDetailsByPaymentId(paymentId);
        } catch (error) {
          console.error(`Lỗi khi lấy payment details cho payment ${paymentId}:`, error);
          return [];
        }
      });
      const updatedPaymentDetails = (await Promise.all(paymentDetailsPromises)).flat();
      setAllPaymentDetails(updatedPaymentDetails);
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Đăng ký cuộc hẹn thất bại. Vui lòng thử lại!";
      notification.error({ message: "Error", description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold">ĐĂNG KÝ TIÊM CHỦNG</h2>
      <p className="mt-2 text-gray-700">
        Đăng ký thông tin tiêm chủng để tiết kiệm thời gian khi đến làm thủ tục tại quầy...
      </p>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <span className="text-red-500">*</span> Đăng ký trẻ tiêm
        </label>
        <Select
          placeholder="Chọn"
          className="w-full"
          onChange={(value) => setSelectedChildId(value)}
          value={selectedChildId}
        >
          {childProfiles.map((child) => (
            <Option key={child.childId} value={child.childId.toString()}>
              {child.fullName}
            </Option>
          ))}
        </Select>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold">THÔNG TIN CỦA TRẺ</h3>
        <div className="space-y-6 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <span className="text-red-500">*</span> Họ và tên của trẻ
            </label>
            <Input value={selectedChildProfile?.fullName || ""} className="w-full" readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <span className="text-red-500">*</span> Ngày sinh của trẻ
            </label>
            <DatePicker
              className="w-full"
              value={selectedChildProfile?.dateOfBirth ? dayjs(selectedChildProfile.dateOfBirth, "DD/MM/YYYY") : undefined}
              placeholder="Ngày/tháng/năm"
              disabled
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <span className="text-red-500">*</span> Giới tính
            </label>
            <Select
              className="w-full"
              value={selectedChildProfile ? getGenderLabel(selectedChildProfile.gender) : "Không xác định"}
              disabled
            >
              <Option value="Nam">Nam</Option>
              <Option value="Nữ">Nữ</Option>
              <Option value="Không xác định">Không xác định</Option>
            </Select>
          </div>
        </div>
      </div>

      {userInfo && selectedChildId && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold">THÔNG TIN PHỤ HUYNH</h3>
          <div className="space-y-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Họ và tên</label>
              <Input value={userInfo.fullName || ""} className="w-full" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Ngày sinh</label>
              <DatePicker
                className="w-full"
                value={userInfo.dateOfBirth ? dayjs(userInfo.dateOfBirth, "DD/MM/YYYY") : undefined}
                placeholder="Ngày/tháng/năm"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Mối quan hệ với trẻ</label>
              <Input
                value={selectedChildProfile?.relationship ? getRelationshipLabel(selectedChildProfile.relationship) : "Không xác định"}
                className="w-full"
                readOnly
              />
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-2xl font-semibold">THÔNG TIN CUỘC HẸN</h3>
        <div className="space-y-6 mt-4">
          <div>
            {uncompletedDoses.length > 0 && selectedChildId && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold">Danh sách các mũi tiêm chưa hoàn thành</h3>
                <label className="block text-sm font-medium text-gray-700 mt-3 mb-3">
                  Dưới đây là danh sách các mũi tiêm mà bạn đã đăng ký cho bé nhưng chưa tiêm
                </label>
                <Table dataSource={uncompletedDoses} rowKey="paymentDetailId" pagination={false} className="mt-2">
                  <Column
                    title="Mũi tiêm"
                    dataIndex="doseSequence"
                    key="doseSequence"
                    render={(doseSequence) => `Mũi ${doseSequence}`}
                  />
                  <Column
                    title="Vaccine - Bệnh"
                    key="vaccineName"
                    render={(record) => vaccineNames.get(record.paymentDetailId) || "Không xác định - Không xác định"}
                  />
                  <Column
                    title="Giới tính trẻ"
                    key="childGender"
                    render={(record) => {
                      const payment = allPayments.find((p) => p.paymentId === record.paymentId);
                      if (!payment) return "Không xác định";
                      const appointment = allAppointments.find((a) => a.appointmentId === payment.appointmentId);
                      if (!appointment) return "Không xác định";
                      const child = childProfiles.find((profile) => profile.childId === appointment.childId);
                      return child ? getGenderLabel(child.gender) : "Không xác định";
                    }}
                  />
                  <Column
                    title="Dự kiến"
                    key="scheduledDate"
                    render={(record) =>
                      record.scheduledDate
                        ? dayjs(record.scheduledDate, "DD/MM/YYYY").format("DD/MM/YYYY")
                        : "Chưa xác định"
                    }
                  />
                </Table>
              </div>
            )}
            <label className="block text-sm font-medium text-gray-700 mt-3">
              <span className="text-red-500">*</span> Chọn mũi tiêm chưa hoàn thành
            </label>
            <Select
              className="w-full mt-4 mb-2"
              placeholder="Chọn liều chưa hoàn thành"
              onChange={(value) => {
                const dose = uncompletedDoses.find((d) => d.paymentDetailId.toString() === value);
                setSelectedUncompletedDose(dose || null);
                setSelectedVaccineId(null);
                setSelectedPackageId(null);
                setSelectedDiseaseId(null);
                setAppointmentDate(dose?.scheduledDate ? dayjs(dose.scheduledDate, "DD/MM/YYYY") : null);
              }}
              value={selectedUncompletedDose?.paymentDetailId?.toString() || undefined}
            >
              {uncompletedDoses.map((dose) => (
                <Option key={dose.paymentDetailId} value={dose.paymentDetailId.toString()}>
                  Mũi {dose.doseSequence} - {vaccineNames.get(dose.paymentDetailId) || "Không xác định - Không xác định"} - Dự kiến: {dose.scheduledDate ? dayjs(dose.scheduledDate, "DD/MM/YYYY").format("DD/MM/YYYY") : "Chưa xác định"}
                </Option>
              ))}
            </Select>
            <label className="block text-sm font-medium text-gray-700 mt-5 mb-3">
              <span className="text-red-500">*</span> Chọn bệnh muốn tiêm
            </label>
            <Select
              className="w-full mb-2"
              placeholder="Chọn bệnh"
              onChange={(value) => {
                setSelectedDiseaseId(value ? parseInt(value as string) : null);
                setSelectedVaccineId(null);
                setSelectedUncompletedDose(null);
                setSelectedPackageId(null);
                setAppointmentDate(null);
              }}
              value={selectedDiseaseId ? selectedDiseaseId.toString() : undefined}
            >
              {diseases.map((disease) => (
                <Option key={disease.diseaseId} value={disease.diseaseId.toString()}>
                  {disease.name}
                </Option>
              ))}
            </Select>
            <label className="block text-sm font-medium text-gray-700 mt-5 mb-3">
              <span className="text-red-500">*</span> Chọn vaccine hoặc gói vaccine
            </label>
            <Select
              className="w-full mb-2"
              placeholder="Chọn vaccine"
              onChange={(value) => {
                setSelectedVaccineId(value ? parseInt(value as string) : null);
                setSelectedPackageId(null);
                setSelectedUncompletedDose(null);
                setAppointmentDate(null);
              }}
              value={selectedVaccineId ? selectedVaccineId.toString() : undefined}
              disabled={!selectedDiseaseId}
            >
              {filteredVaccines.map((vaccine) => (
                <Option key={vaccine.vaccineId} value={vaccine.vaccineId.toString()}>
                  {vaccine.name}
                </Option>
              ))}
            </Select>
            <Select
              className="w-full mb-2"
              placeholder="Chọn gói vaccine"
              onChange={(value) => {
                setSelectedPackageId(value ? parseInt(value as string) : null);
                setSelectedVaccineId(null);
                setSelectedUncompletedDose(null);
                setSelectedDiseaseId(null);
                setAppointmentDate(null);
              }}
              value={selectedPackageId ? selectedPackageId.toString() : undefined}
            >
              {packages.map((pkg) => (
                <Option key={pkg.vaccinePackageId} value={pkg.vaccinePackageId.toString()}>
                  {pkg.name} (Tuổi bắt đầu: {pkg.ageInMonths} tháng)
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <span className="text-red-500">*</span> Ngày hẹn
            </label>
            <DatePicker
              className="w-full"
              value={appointmentDate}
              onChange={(date) => setAppointmentDate(date)}
              placeholder="Chọn ngày hẹn"
              disabledDate={(current) => {
                if (selectedVaccineId && !selectedPackageId && !selectedUncompletedDose) {
                  return current && current < dayjs().startOf("day");
                }
                const minDate = calculateMinAppointmentDate();
                if (!minDate || !current) return false;
                return current && current.isBefore(minDate, "day");
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={loading}
          disabled={!selectedChildId || !appointmentDate || (!selectedVaccineId && !selectedPackageId && !selectedUncompletedDose)}
        >
          Đăng ký
        </Button>
      </div>
    </div>
  );
};

const getGenderLabel = (gender: Gender): string => {
  switch (gender) {
    case Gender.Male: return "Nam";
    case Gender.Female: return "Nữ";
    case Gender.Unknown:
    default: return "Không xác định";
  }
};

export default VaccineRegistration;