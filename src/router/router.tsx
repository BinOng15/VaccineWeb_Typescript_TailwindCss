// import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import App from "../App";
// import AppRouter from "./AppRouter";
// import Homepage from "../pages/Customer/Homepage";
// import { ROLES } from "../constants";
// import { AuthWrapper } from "../context/auth.context";
// import Introductionpage from "../pages/Customer/Introductionpage";
// import LoginPage from "../pages/LoginPage";
// import RegisterPage from "../pages/RegisterPage";
// import PaymentMethod from "../pages/Customer/Payment";
// import VaccineRegistationPage from "../pages/Customer/VaccineRegistationPage";
// import ManageVaccinationSchedule from "../pages/Staff/Vaccination/VaccinationRecord";
// import DoctorVaccinationManagement from "../pages/Doctor/DoctorVaccinationManagement";
// import VaccineTypesPage from "../pages/Customer/VaccineTypesPage";
// import VaccinePackagePage from "../pages/Customer/VaccinePackagePage";
// import VaccinationSchedule from "../components/Vaccine/vaccinationschedule";
// import UserManagement from "../pages/Admin/UserManagement";
// import DashboardAdmin from "../pages/Admin/DashboardAdmin";
// import DashboardStaff from "../pages/Staff/DashboardStaff";
// import DashboardDoctor from "../pages/Doctor/DashboardDoctor";

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <App />,
//     children: [
//       // Admin routes
//       {
//         path: "admin/dashboard",
//         element: (
//           <AppRouter element={DashboardAdmin} allowedRoles={[ROLES.ADMIN]} />
//         ),
//       },
//       {
//         path: "admin/manage-user",
//         element: (
//           <AppRouter element={UserManagement} allowedRoles={[ROLES.ADMIN]} />
//         ),
//       },

//       // Staff routes
//       {
//         path: "staff/dashboard",
//         element: (
//           <AppRouter element={DashboardStaff} allowedRoles={[ROLES.STAFF]} />
//         ),
//       },
//       {
//         path: "staff/vaccination-record",
//         element: (
//           <AppRouter
//             element={ManageVaccinationSchedule}
//             allowedRoles={[ROLES.STAFF]}
//           />
//         ),
//       },
//       // Doctor routes
//       {
//         path: "doctor/dashboard",
//         element: (
//           <AppRouter element={DashboardDoctor} allowedRoles={[ROLES.DOCTOR]} />
//         ),
//       },
//       {
//         path: "doctor/vaccination-management",
//         element: (
//           <AppRouter
//             element={DoctorVaccinationManagement}
//             allowedRoles={[ROLES.DOCTOR]}
//           />
//         ),
//       },
//       // Customer routes
//       {
//         path: "/vaccine-registration",
//         element: (
//           <AppRouter
//             element={VaccineRegistationPage}
//             allowedRoles={[ROLES.CUSTOMER]}
//           />
//         ),
//       },
//       {
//         path: "/payment",
//         element: (
//           <AppRouter element={PaymentMethod} allowedRoles={[ROLES.CUSTOMER]} />
//         ),
//       },
//       {
//         path: "/vaccinationschedule",
//         element: (
//           <AppRouter
//             element={VaccinationSchedule}
//             allowedRoles={[ROLES.CUSTOMER]}
//           />
//         ),
//       },

//       // Public routes
//       {
//         path: "",
//         element: (
//           <AppRouter element={Homepage} allowedRoles={[ROLES.CUSTOMER]} />
//         ),
//       },
//       {
//         path: "/introduction",
//         element: (
//           <AppRouter
//             element={Introductionpage}
//             allowedRoles={[ROLES.CUSTOMER]}
//           />
//         ),
//       },
//       {
//         path: "/vaccine-types",
//         element: (
//           <AppRouter
//             element={VaccineTypesPage}
//             allowedRoles={[ROLES.CUSTOMER]}
//           />
//         ),
//       },
//       {
//         path: "/vaccine-package",
//         element: (
//           <AppRouter
//             element={VaccinePackagePage}
//             allowedRoles={[ROLES.CUSTOMER]}
//           />
//         ),
//       },
//     ],
//   },
//   { path: "/login", element: <LoginPage /> },
//   { path: "/register", element: <RegisterPage /> },
// ]);

// const RouterComponent: React.FC = () => {
//   return (
//     <AuthWrapper>
//       <RouterProvider router={router} />
//     </AuthWrapper>
//   );
// };

// export default RouterComponent;
