/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Suspense, useContext } from "react";
import { AuthContext1, AuthProvider } from "../context/AuthContext";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import VaccinePackageManagement from "../pages/Staff/VaccinePackage/VaccinePackageManagement";

//-------------------------------------------------Admin------------------------------------------------
const DashboardAdmin = React.lazy(
  () => import("../pages/Admin/DashboardAdmin")
);
const UserManagement = React.lazy(
  () => import("../pages/Admin/UserManagement")
);
// const AdminRevenuePage = React.lazy(
//   () => import("../pages/Admin/AdminRevenuePage")
// );
const VaccineManagement = React.lazy(
  () => import("../pages/Staff/Vaccine/VaccineManagement")
);
const DiseaseManagement = React.lazy(
  () => import("../pages/Staff/Disease/DiseaseManagement")
);
const VaccineScheduleManagement = React.lazy(
  () => import("../pages/Staff/VaccineSchedule/VaccineScheduleManagement")
);
const VaccinePackageDetailManagerment = React.lazy(
  () =>
    import(
      "../pages/Staff/VaccinePackageDetailvManagerment/VaccinePackageDetailManagerment"
    )
);
const VaccineDiseaseManagement = React.lazy(
  () =>
    import(
      "../pages/Staff/VaccineDisese/VaccineDiseaseManagement"
    )
);
const ChildProfileManage = React.lazy(
  () => import("../pages/Staff/ChildProfile/ChildProfileManage")
);
//-------------------------------------------------Staff------------------------------------------------
const DashboardStaff = React.lazy(
  () => import("../pages/Staff/DashboardStaff")
);

const CheckInManagement = React.lazy(
  () =>
    import(
      "../pages/Staff/CheckIn/CheckInManagement"
    )
);
const PaymentManagement = React.lazy(
  () =>
    import(
      "../pages/Staff/Payment/PaymentManagement"
    )
);
const AppointmentManagerment = React.lazy(
  () => import("../pages/Staff/Appointment/AppointmentManagerment")
);
//-------------------------------------------------Doctor-----------------------------------------------
const DashboardDoctor = React.lazy(
  () => import("../pages/Doctor/DashboardDoctor")
);
const VaccinationRecordManagerment = React.lazy(
  () => import("../pages/Doctor/VaccinationRecord/VaccinationRecordManagerment")
);
const ConfirmInjectionManagement = React.lazy(
  () => import("../pages/Doctor/VaccinationRecord/ConfirmInjectionManagement")
);
const ResponseManagement = React.lazy(
  () => import("../pages/Doctor/VaccinationRecord/ResponseManagement")
);
//-------------------------------------------------Customer----------------------------------------------
const VaccineRegistationPage = React.lazy(
  () => import("../pages/Customer/VaccineRegistationPage")
);
const ChildProfilePage = React.lazy(
  () => import("../pages/Customer/ChildProfilePage")
);
const MyProfilePage = React.lazy(
  () => import("../pages/Customer/MyProfilePage")
);
const CustomerAppointment = React.lazy(
  () => import("../pages/Customer/AppointmentPage")
);
const ChildVaccineProfilePage = React.lazy(
  () => import("../pages/Customer/ChildVaccineProfile/ChildVaccineProfilePage")
);
const ChildVaccineSchedulePage = React.lazy(
  () => import("../pages/Customer/Schedule/ChildVaccineSchedulePage")
);
//-------------------------------------------------Public-----------------------------------------------
const Homepage = React.lazy(() => import("../pages/Customer/Homepage"));
const LoginPage = React.lazy(() => import("../pages/LoginPage"));
const RegisterPage = React.lazy(() => import("../pages/RegisterPage"));
const VaccineTypesPage = React.lazy(
  () => import("../pages/Customer/VaccineTypesPage")
);
const VaccinePackagePage = React.lazy(
  () => import("../pages/Customer/VaccinePackagePage")
);
const VaccinationSchedule = React.lazy(
  () => import("../components/Vaccine/vaccinationschedule")
);
const VaccinePrice = React.lazy(
  () => import("../components/Vaccine/VaccinePrice")
);
const Introductionpage = React.lazy(
  () => import("../pages/Customer/Introductionpage")
);
const PaymentCallback = React.lazy(
  () => import("../components/Payment/PaymentCallBack")
);

interface ProtectedRouteProps {
  element: JSX.Element;
  allowedRoles?: string[];
}

const ProtectedRouter = ({ element, allowedRoles }: ProtectedRouteProps) => {
  const authContext = useContext(AuthContext1);

  if (!authContext) {
    throw new Error("AuthContext must be used within an AuthProvider");
  }

  const storedUser: any = sessionStorage.getItem("user");
  if (!storedUser) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(storedUser);
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return element;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={""}>
          <Routes>
            {/*----------------------------PUBLIC--------------------------------*/}
            <Route path="/" element={<Homepage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/vaccine-types" element={<VaccineTypesPage />} />
            <Route path="/vaccine-package" element={<VaccinePackagePage />} />
            <Route
              path="/vaccination-schedule"
              element={<VaccinationSchedule />}
            />
            <Route path="/vaccine-price" element={<VaccinePrice />} />
            <Route path="/Introduction" element={<Introductionpage />} />
            <Route path="/payment-callback" element={<PaymentCallback />} />
            {/*----------------------------ADMIN---------------------------------*/}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRouter
                  element={<DashboardAdmin />}
                  allowedRoles={["Admin"]}
                />
              }
            />
            {/* <Route
              path="/admin/page"
              element={
                <ProtectedRouter
                  element={<AdminPage />}
                  allowedRoles={["Admin"]}
                />
              }
            /> */}
            <Route
              path="/admin/manage-user"
              element={
                <ProtectedRouter
                  element={<UserManagement />}
                  allowedRoles={["Admin"]}
                />
              }
            />
            {/* <Route
              path="/admin/revenue"
              element={
                <ProtectedRouter
                  element={<AdminRevenuePage />}
                  allowedRoles={["Admin"]}
                />
              }
            /> */}
            <Route
              path="/admin/manage-vaccine-schedule"
              element={
                <ProtectedRouter
                  element={<VaccineScheduleManagement />}
                  allowedRoles={["Admin"]}
                />
              }
            />
            <Route
              path="/admin/manage-vaccine-package-detail"
              element={
                <ProtectedRouter
                  element={<VaccinePackageDetailManagerment />}
                  allowedRoles={["Admin"]}
                />
              }
            />
            <Route
              path="/admin/manage-vaccine-disease"
              element={
                <ProtectedRouter
                  element={<VaccineDiseaseManagement />}
                  allowedRoles={["Admin"]}
                />
              }
            />
            <Route
              path="/admin/manage-vaccine"
              element={
                <ProtectedRouter
                  element={<VaccineManagement />}
                  allowedRoles={["Admin"]}
                />
              }
            />
            <Route
              path="admin/manage-vaccine-package"
              element={
                <ProtectedRouter
                  element={<VaccinePackageManagement />}
                  allowedRoles={["Admin"]}
                />
              }
            />
            <Route
              path="/admin/manager-childprofile"
              element={
                <ProtectedRouter
                  element={<ChildProfileManage />}
                  allowedRoles={["Admin"]}
                />
              }
            />
            <Route
              path="/admin/manage-disease"
              element={
                <ProtectedRouter
                  element={<DiseaseManagement />}
                  allowedRoles={["Admin"]}
                />
              }
            />
            {/*----------------------------STAFF---------------------------------*/}
            <Route
              path="/staff/dashboard"
              element={
                <ProtectedRouter
                  element={<DashboardStaff />}
                  allowedRoles={["Staff"]}
                />
              }
            />
            <Route
              path="/staff/manage-appointment"
              element={
                <ProtectedRouter
                  element={<AppointmentManagerment />}
                  allowedRoles={["Staff"]}
                />
              }
            />
            <Route
              path="/staff/check-in"
              element={
                <ProtectedRouter
                  element={<CheckInManagement />}
                  allowedRoles={["Staff"]}
                />
              }
            />
            <Route
              path="/staff/payment"
              element={
                <ProtectedRouter
                  element={<PaymentManagement />}
                  allowedRoles={["Staff"]}
                />
              }
            />
            {/*----------------------------DOCTOR--------------------------------*/}
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRouter
                  element={<DashboardDoctor />}
                  allowedRoles={["Doctor"]}
                />
              }
            />
            <Route
              path="/doctor/vaccination-record"
              element={
                <ProtectedRouter
                  element={<VaccinationRecordManagerment />}
                  allowedRoles={["Doctor"]}
                />
              }
            />
            <Route
              path="/doctor/confirm-injection"
              element={
                <ProtectedRouter
                  element={<ConfirmInjectionManagement />}
                  allowedRoles={["Doctor"]}
                />
              }
            />
            <Route
              path="/doctor/response"
              element={
                <ProtectedRouter
                  element={<ResponseManagement />}
                  allowedRoles={["Doctor"]}
                />
              }
            />
            {/*----------------------------CUSTOMER------------------------------*/}
            <Route
              path="/vaccine-registration"
              element={
                <ProtectedRouter
                  element={<VaccineRegistationPage />}
                  allowedRoles={["Customer"]}
                />
              }
            />
            <Route
              path="/my-profile"
              element={
                <ProtectedRouter
                  element={<MyProfilePage />}
                  allowedRoles={["Customer"]}
                />
              }
            />
            <Route
              path="/child-profile-page"
              element={
                <ProtectedRouter
                  element={<ChildProfilePage />}
                  allowedRoles={["Customer"]}
                />
              }
            />
            <Route
              path="/child-appointment"
              element={
                <ProtectedRouter
                  element={<CustomerAppointment />}
                  allowedRoles={["Customer"]}
                />
              }
            />
            <Route
              path="/child-vaccine-profile"
              element={
                <ProtectedRouter
                  element={<ChildVaccineProfilePage />}
                  allowedRoles={["Customer"]}
                />
              }
            />
            <Route
              path="/child-vaccine-schedule"
              element={
                <ProtectedRouter
                  element={<ChildVaccineSchedulePage />}
                  allowedRoles={["Customer"]}
                />
              }
            />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
};
export default AppRouter;
