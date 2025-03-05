/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Suspense, useContext } from "react";
import { AuthContext1, AuthProvider } from "../context/AuthContext";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";


//-------------------------------------------------Admin------------------------------------------------
const DashboardAdmin = React.lazy(
  () => import("../pages/Admin/DashboardAdmin")
);
const AdminPage = React.lazy(() => import("../pages/Admin/AdminPage"));
const UserManagement = React.lazy(
  () => import("../pages/Admin/UserManagement")
);
//-------------------------------------------------Staff------------------------------------------------
const DashboardStaff = React.lazy(
  () => import("../pages/Staff/DashboardStaff")
);
//-------------------------------------------------Doctor-----------------------------------------------
const DashboardDoctor = React.lazy(
  () => import("../pages/Doctor/DashboardDoctor")
);
//-------VaccinationSchedule------------------------------------------Cútomer----------------------------------------------

//-------------------------------------------------Public-----------------------------------------------
const Homepage = React.lazy(() => import("../pages/Customer/Homepage"));
const LoginPage = React.lazy(() => import("../pages/LoginPage"));
const RegisterPage = React.lazy(() => import("../pages/RegisterPage"));
const VaccinationSchedule = React.lazy(() => import("../components/Vaccine/vaccinationschedule"));
const MyProfilePage = React.lazy(() => import("../pages/Customer/MyProfilePage"));
const VaccineProfilePage = React.lazy(() => import("../pages/Customer/VaccineProfilePage"));

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
             <Route path="/vaccination-schedule" element={<VaccinationSchedule />} />
              <Route path="/my-profile" element={<MyProfilePage />} />
              <Route path="/child-profile" element={<VaccineProfilePage />} />
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
            <Route
              path="/admin/page"
              element={
                <ProtectedRouter
                  element={<AdminPage />}
                  allowedRoles={["Admin"]}
                />
              }
            />
            <Route
              path="/admin/manage-user"
              element={
                <ProtectedRouter
                  element={<UserManagement />}
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
            {/*----------------------------CUSTOMER------------------------------*/}
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
};
export default AppRouter;
