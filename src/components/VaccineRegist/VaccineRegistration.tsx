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
import appointmentService from "../../service/appointmentService";
import vaccinePackageService from "../../service/vaccinePackageService";
import vaccineService from "../../service/vaccineService";
import childProfileService from "../../service/childProfileService";
import paymentService from "../../service/paymentService";
import paymentDetailService from "../../service/paymentDetailService";
import vaccinePackageDetailService from "../../service/vaccinePackageDetailService";
import userService from "../../service/userService"; // Import userService
import { useAuth } from "../../context/AuthContext";

const { Option } = Select;
const { Column } = Table;

const VaccineRegistration: React.FC = () => {
  const { user } = useAuth(); // Lấy user từ AuthContext
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [appointmentDate, setAppointmentDate] = useState<dayjs.Dayjs | null>(
    null
  );
  const [selectedVaccineId, setSelectedVaccineId] = useState<number | null>(
    null
  );
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(
    null
  );
  const [selectedUncompletedDose, setSelectedUncompletedDose] =
    useState<PaymentDetailResponseDTO | null>(null);
  const [vaccines, setVaccines] = useState<VaccineResponseDTO[]>([]);
  const [packages, setPackages] = useState<VaccinePackageResponseDTO[]>([]);
  const [childProfiles, setChildProfiles] = useState<ChildProfileResponseDTO[]>(
    []
  );
  const [allPaymentDetails, setAllPaymentDetails] = useState<
    PaymentDetailResponseDTO[]
  >([]);
  const [uncompletedDoses, setUncompletedDoses] = useState<
    PaymentDetailResponseDTO[]
  >([]);
  const [vaccineNames, setVaccineNames] = useState<Map<number, string>>(
    new Map()
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null); // Thêm state để lưu thông tin người dùng từ API

  // Hàm ánh xạ giá trị relationship thành nhãn hiển thị
  const getRelationshipLabel = (
    relationship: string | number | undefined
  ): string => {
    switch (relationship?.toString()) {
      case "1":
        return "Mẹ";
      case "2":
        return "Bố";
      case "3":
        return "Người Giám hộ";
      default:
        return "Không xác định";
    }
  };

  // Tải thông tin người dùng dựa trên userId
  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!user || !user.userId) {
        console.error("No user or userId found");
        notification.error({
          message: "Error",
          description: "Vui lòng đăng nhập lại!",
        });
        return;
      }

      const currentUserId = parseInt(user.userId.toString(), 10);
      setUserId(currentUserId);

      try {
        const userData = await userService.getUserById(currentUserId); // Gọi API để lấy thông tin người dùng
        setUserInfo(userData);
      } catch (error) {
        console.error("Failed to fetch user info:", error);
        notification.error({
          message: "Error",
          description: "Không thể lấy thông tin người dùng!",
        });
      }
    };

    fetchUserInfo();
  }, [user]);

  // Tải dữ liệu ban đầu
  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      try {
        const allChildProfiles =
          await childProfileService.getAllChildProfiles();
        const userChildProfiles = allChildProfiles.filter(
          (profile) => profile.userId === userId
        );
        setChildProfiles(userChildProfiles);

        const allVaccines = await vaccineService.getAllVaccines();
        setVaccines(allVaccines);

        const allPackages = await vaccinePackageService.getAllPackages();
        setPackages(allPackages);

        const allPayments = await paymentService.getAllPayments();
        const userPayments = allPayments.filter(
          (payment) => payment.userId === userId && payment.paymentStatus === 2
        );
        const paymentIds = userPayments.map((payment) => payment.paymentId);

        const paymentDetailsPromises = paymentIds.map(async (paymentId) => {
          try {
            const paymentDetails =
              await paymentDetailService.getPaymentDetailsByPaymentId(
                paymentId
              );
            return paymentDetails;
          } catch (error) {
            console.error(
              `Lỗi khi lấy payment details cho payment ${paymentId}:`,
              error
            );
            return [];
          }
        });

        const paymentDetails = (
          await Promise.all(paymentDetailsPromises)
        ).flat();
        setAllPaymentDetails(paymentDetails);
      } catch (error) {
        console.error("Failed to fetch data:", error);
        notification.error({
          message: "Error",
          description: "Không thể tải dữ liệu. Vui lòng thử lại!",
        });
      }
    };

    fetchData();
  }, [userId]);

  // Cập nhật uncompletedDoses khi selectedChildId thay đổi
  useEffect(() => {
    if (!selectedChildId || !allPaymentDetails.length || !userId) {
      console.log("No selectedChildId, userId, or allPaymentDetails is empty");
      setUncompletedDoses([]);
      setVaccineNames(new Map());
      return;
    }

    const childId = parseInt(selectedChildId, 10);
    const fetchUncompletedDoses = async () => {
      try {
        console.log("Fetching payments for userId:", userId);
        const allPayments = await paymentService.getAllPayments();
        console.log("All Payments:", allPayments);

        const userPayments = allPayments.filter(
          (payment) => payment.userId === userId && payment.paymentStatus === 2
        );
        console.log("User Payments with status 2:", userPayments);

        const paymentIds = userPayments.map((payment) => payment.paymentId);
        console.log("Payment IDs:", paymentIds);

        const relevantPaymentDetails = allPaymentDetails.filter((detail) =>
          paymentIds.includes(detail.paymentId)
        );
        console.log("Relevant PaymentDetails:", relevantPaymentDetails);

        const uncompletedPaymentDetails = relevantPaymentDetails.filter(
          (detail) => detail.isCompleted === 0
        );
        console.log("Uncompleted PaymentDetails:", uncompletedPaymentDetails);

        const appointments = await appointmentService.getAppointmentsByChildId(
          childId
        );
        console.log("Appointments for childId:", appointments);

        const appointmentPaymentDetailIds = appointments
          .map((appointment) => appointment.paymentDetailId)
          .filter((id): id is number => id !== null);
        console.log(
          "Appointment PaymentDetailIds:",
          appointmentPaymentDetailIds
        );

        const childUncompletedDoses = uncompletedPaymentDetails.filter(
          (detail) =>
            !appointmentPaymentDetailIds.includes(detail.paymentDetailId)
        );
        console.log("Initial Uncompleted Doses:", childUncompletedDoses);

        const vaccineNamesMap = new Map<number, string>();
        const activeUncompletedDoses: PaymentDetailResponseDTO[] = [];

        for (const dose of childUncompletedDoses) {
          try {
            const vaccinePackageDetail =
              await vaccinePackageDetailService.getPackageDetailById(
                dose.vaccinePackageDetailId
              );
            if (vaccinePackageDetail.isActive === "Active") {
              activeUncompletedDoses.push(dose);
              const vaccine = vaccines.find(
                (v) => v.vaccineId === vaccinePackageDetail.vaccineId
              );
              if (vaccine) {
                vaccineNamesMap.set(dose.paymentDetailId, vaccine.name);
              } else {
                vaccineNamesMap.set(dose.paymentDetailId, "Không xác định");
              }
            } else {
              console.log(
                `Dose with paymentDetailId ${dose.paymentDetailId} is not active (isActive: ${vaccinePackageDetail.isActive})`
              );
            }
          } catch (error) {
            console.error(
              `Lỗi khi lấy vaccine cho paymentDetailId ${dose.paymentDetailId}:`,
              error
            );
          }
        }

        console.log("Active Uncompleted Doses:", activeUncompletedDoses);
        setVaccineNames(vaccineNamesMap);
        setUncompletedDoses(activeUncompletedDoses);
      } catch (error) {
        console.error("Failed to fetch uncompleted doses for child:", error);
        setUncompletedDoses([]);
        setVaccineNames(new Map());
      }
    };

    fetchUncompletedDoses();
  }, [selectedChildId, allPaymentDetails, userId, vaccines]);

  const selectedChildProfile = childProfiles.find(
    (profile) => profile.childId.toString() === selectedChildId
  );

  const calculateMinAppointmentDate = () => {
    if (!selectedChildProfile || !selectedPackageId) return null;

    const selectedPackage = packages.find(
      (pkg) => pkg.vaccinePackageId === selectedPackageId
    );
    if (!selectedPackage) return null;

    const childBirthDate = dayjs(
      selectedChildProfile.dateOfBirth,
      "DD/MM/YYYY"
    );
    const minDate = childBirthDate.add(selectedPackage.ageInMonths, "month");
    return minDate;
  };

  const handleSubmit = async () => {
    if (
      !selectedChildId ||
      !appointmentDate ||
      (!selectedVaccineId && !selectedPackageId && !selectedUncompletedDose) ||
      !userId
    ) {
      notification.error({
        message: "Error",
        description:
          "Vui lòng điền đầy đủ thông tin (trẻ, ngày hẹn, và vaccine hoặc gói vaccine hoặc liều chưa hoàn thành)!",
      });
      return;
    }

    setLoading(true);
    try {
      const childId = parseInt(selectedChildId, 10);
      let vaccinePackageId: number | null = null;

      if (selectedUncompletedDose) {
        const paymentDetail = allPaymentDetails.find(
          (detail) =>
            detail.paymentDetailId === selectedUncompletedDose.paymentDetailId
        );
        if (!paymentDetail) {
          notification.error({
            message: "Error",
            description:
              "Không tìm thấy thông tin chi tiết thanh toán cho liều này!",
          });
          return;
        }

        const payment = (await paymentService.getAllPayments()).find(
          (p) => p.paymentId === paymentDetail.paymentId
        );
        if (!payment || payment.paymentStatus !== 2) {
          notification.error({
            message: "Error",
            description:
              "Liều tiêm này chưa được thanh toán! Vui lòng kiểm tra lại.",
          });
          return;
        }

        const vaccinePackageDetail =
          await vaccinePackageDetailService.getPackageDetailById(
            selectedUncompletedDose.vaccinePackageDetailId
          );
        vaccinePackageId = vaccinePackageDetail.vaccinePackageId;
      } else if (selectedPackageId) {
        vaccinePackageId = selectedPackageId;
      }

      const appointmentData: CreateAppointmentDTO = {
        userId: userId,
        childId,
        paymentDetailId: selectedUncompletedDose
          ? selectedUncompletedDose.paymentDetailId
          : null,
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

      const allPayments = await paymentService.getAllPayments();
      const userPayments = allPayments.filter(
        (payment) => payment.userId === userId && payment.paymentStatus === 2
      );
      const paymentIds = userPayments.map((payment) => payment.paymentId);
      const paymentDetailsPromises = paymentIds.map(async (paymentId) => {
        try {
          return await paymentDetailService.getPaymentDetailsByPaymentId(
            paymentId
          );
        } catch (error) {
          console.error(
            `Lỗi khi lấy payment details cho payment ${paymentId}:`,
            error
          );
          return [];
        }
      });
      const updatedPaymentDetails = (
        await Promise.all(paymentDetailsPromises)
      ).flat();
      setAllPaymentDetails(updatedPaymentDetails);
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Đăng ký cuộc hẹn thất bại. Vui lòng thử lại!";
      notification.error({
        message: "Error",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold">ĐĂNG KÝ TIÊM CHỦNG</h2>
      <p className="mt-2 text-gray-700">
        Đăng ký thông tin tiêm chủng để tiết kiệm thời gian khi đến làm thủ tục
        tại quầy...
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
            <Input
              value={selectedChildProfile?.fullName || ""}
              className="w-full"
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <span className="text-red-500">*</span> Ngày sinh của trẻ
            </label>
            <DatePicker
              className="w-full"
              value={
                selectedChildProfile?.dateOfBirth
                  ? dayjs(selectedChildProfile.dateOfBirth, "DD/MM/YYYY")
                  : undefined
              }
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
              value={
                selectedChildProfile
                  ? getGenderLabel(selectedChildProfile.gender)
                  : "Không xác định"
              }
              disabled
            >
              <Option value="Nam">Nam</Option>
              <Option value="Nữ">Nữ</Option>
              <Option value="Không xác định">Không xác định</Option>
            </Select>
          </div>
        </div>
      </div>

      {/* Thông tin người dùng */}
      {userInfo && selectedChildId && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold">THÔNG TIN PHỤ HUYNH</h3>
          <div className="space-y-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Họ và tên
              </label>
              <Input
                value={userInfo.fullName || ""}
                className="w-full"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Ngày sinh
              </label>
              <DatePicker
                className="w-full"
                value={
                  userInfo.dateOfBirth
                    ? dayjs(userInfo.dateOfBirth, "DD/MM/YYYY")
                    : undefined
                }
                placeholder="Ngày/tháng/năm"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Mối quan hệ với trẻ
              </label>
              <Input
                value={
                  selectedChildProfile?.relationship
                    ? getRelationshipLabel(selectedChildProfile.relationship)
                    : "Không xác định"
                }
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
                <h3 className="text-xl font-semibold">
                  Danh sách các mũi tiêm chưa hoàn thành
                </h3>
                <label className="block text-sm font-medium text-gray-700 mt-3 mb-3">
                  Dưới đây là danh sách cá mũi tiêm mà bạn đã đăng ký cho bé
                  nhưng chưa tiêm
                </label>
                <Table
                  dataSource={uncompletedDoses}
                  rowKey="paymentDetailId"
                  pagination={false}
                  className="mt-2"
                >
                  <Column
                    title="Mũi tiêm"
                    dataIndex="doseSequence"
                    key="doseSequence"
                    render={(doseSequence) => `Mũi ${doseSequence}`}
                  />
                  <Column
                    title="Vaccine"
                    key="vaccineName"
                    render={(record) =>
                      vaccineNames.get(record.paymentDetailId) ||
                      "Không xác định"
                    }
                  />
                  <Column
                    title="Dự kiến"
                    key="scheduledDate"
                    render={(record) =>
                      record.scheduledDate
                        ? dayjs(record.scheduledDate, "DD/MM/YYYY").format(
                            "DD/MM/YYYY"
                          )
                        : "Chưa xác định"
                    }
                  />
                </Table>
              </div>
            )}
            <label className="block text-sm font-medium text-gray-700 mt-3">
              <span className="text-red-500">*</span> Chọn mũi tiêm chưa hoàn
              thành
            </label>
            <Select
              className="w-full mt-4 mb-2"
              placeholder="Chọn liều chưa hoàn thành"
              onChange={(value) => {
                const dose = uncompletedDoses.find(
                  (d) => d.paymentDetailId.toString() === value
                );
                setSelectedUncompletedDose(dose || null);
                setSelectedVaccineId(null);
                setSelectedPackageId(null);
                setAppointmentDate(
                  dose?.scheduledDate
                    ? dayjs(dose.scheduledDate, "DD/MM/YYYY")
                    : null
                );
              }}
              value={
                selectedUncompletedDose?.paymentDetailId?.toString() ||
                undefined
              }
            >
              {uncompletedDoses.map((dose) => (
                <Option
                  key={dose.paymentDetailId}
                  value={dose.paymentDetailId.toString()}
                >
                  Mũi {dose.doseSequence} - Vaccine:{" "}
                  {vaccineNames.get(dose.paymentDetailId) || "Không xác định"} -
                  Dự kiến:{" "}
                  {dose.scheduledDate
                    ? dayjs(dose.scheduledDate, "DD/MM/YYYY").format(
                        "DD/MM/YYYY"
                      )
                    : "Chưa xác định"}{" "}
                </Option>
              ))}
            </Select>
            <label className="block text-sm font-medium text-gray-700 mt-5 mb-3">
              <span className="text-red-500">*</span> Chọn vaccine hoặc gói
              vaccine
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
              value={
                selectedVaccineId ? selectedVaccineId.toString() : undefined
              }
            >
              {vaccines.map((vaccine) => (
                <Option
                  key={vaccine.vaccineId}
                  value={vaccine.vaccineId.toString()}
                >
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
                setAppointmentDate(null);
              }}
              value={
                selectedPackageId ? selectedPackageId.toString() : undefined
              }
            >
              {packages.map((pkg) => (
                <Option
                  key={pkg.vaccinePackageId}
                  value={pkg.vaccinePackageId.toString()}
                >
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
                if (
                  selectedVaccineId &&
                  !selectedPackageId &&
                  !selectedUncompletedDose
                ) {
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
          disabled={
            !selectedChildId ||
            !appointmentDate ||
            (!selectedVaccineId &&
              !selectedPackageId &&
              !selectedUncompletedDose)
          }
        >
          Đăng ký
        </Button>
      </div>
    </div>
  );
};

const getGenderLabel = (gender: Gender): string => {
  switch (gender) {
    case Gender.Male:
      return "Nam";
    case Gender.Female:
      return "Nữ";
    case Gender.Unknown:
    default:
      return "Không xác định";
  }
};

export default VaccineRegistration;
