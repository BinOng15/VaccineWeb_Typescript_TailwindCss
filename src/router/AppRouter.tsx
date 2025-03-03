// import React, { useContext } from "react";
// import { ROLES } from "../constants";
// import { Navigate } from "react-router-dom";

// interface PrivateRouteProps {
//   element: React.ComponentType;
//   allowedRoles: string[];
// }

// const AppRouter: React.FC<PrivateRouteProps> = ({
//   element: Component,
//   allowedRoles,
// }) => {
//   const context = useContext(AuthContext1);
//   if (!context) {
//     throw new Error("AuthContext must be used within an AuthProvider");
//   }

//   const { auth, appLoading } = context;

//   if (appLoading) {
//     return <div>Loading...</div>;
//   }

//   const userRole = auth?.user?.role;

//   // Nếu không đăng nhập hoặc không có role thì chỉ chặn các trang admin
//   if (!userRole) {
//     // Nếu không đăng nhập và trang yêu cầu quyền admin, điều hướng về trang đăng nhập
//     if (allowedRoles.includes(ROLES.ADMIN)) {
//       return <Navigate to="/login" replace />;
//     }

//     return <Component />;
//   }

//   // Kiểm tra role của người dùng để xác định quyền truy cập
//   if (userRole && allowedRoles.includes(userRole)) {
//     return <Component />;
//   }

//   // Nếu người dùng là admin nhưng truy cập vào trang không dành cho admin, điều hướng về trang admin
//   if (userRole === ROLES.ADMIN && !allowedRoles.includes(ROLES.ADMIN)) {
//     return <Navigate to="/admin/dashboard" replace />;
//   }

//   // Nếu người dùng là staff nhưng truy cập vào trang không dành cho staff, điều hướng về trang staff
//   if (userRole === ROLES.STAFF && !allowedRoles.includes(ROLES.STAFF)) {
//     return <Navigate to="/staff/dashboard" replace />;
//   }

//   // Nếu người dùng là doctor nhưng truy cập vào trang không dành cho doctor, điều hướng về trang doctor
//   if (userRole === ROLES.DOCTOR && !allowedRoles.includes(ROLES.DOCTOR)) {
//     return <Navigate to="/doctor/dashboard" replace />;
//   }

//   // Điều hướng người dùng không có quyền về trang chủ
//   return <Navigate to="/" replace />;
// };

// // export default AppRouter;
// // import React from "react";

// // interface PrivateRouteProps {
// //   element: React.ComponentType;
// //   allowedRoles: string[];
// // }

// // const AppRouter: React.FC<PrivateRouteProps> = ({ element: Component }) => {
// //   return <Component />;
// // };

// export default AppRouter;
