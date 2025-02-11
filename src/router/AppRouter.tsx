// import React, { useContext } from "react";
// import { AuthContext } from "../context/auth.context";
// import { ROLES } from "../constants";
// import Homepage from "../pages/Customer/Homepage";
// import { Navigate } from "react-router-dom";

// interface PrivateRouteProps {
//   element: React.ComponentType;
//   allowedRoles: string[];
// }

// const AppRouter: React.FC<PrivateRouteProps> = ({
//   element: Component,
//   allowedRoles,
// }) => {
//   const { auth, appLoading } = useContext(AuthContext);

//   // // Thiết lập mặc định là CUSTOMER nếu chưa đăng nhập
//   // React.useEffect(() => {
//   //   if (!auth.isAuthenticated) {
//   //     setAuth({
//   //       isAuthenticated: true,
//   //       user: { name: "Test Customer", role: ROLES.CUSTOMER },
//   //     });
//   //   }
//   // }, [auth.isAuthenticated, setAuth]);

//   if (appLoading) {
//     return <div></div>;
//   }

//   const userRole = auth?.user?.role;

//   // Nếu không đăng nhập hoặc không có role thì chỉ chặn các trang admin
//   if (!userRole) {
//     // Nếu không đăng nhập và trang yêu cầu quyền admin, điều hướng về trang đăng nhập
//     if (allowedRoles.includes(ROLES.ADMIN)) {
//       //return <Navigate to="/login" replace />;
//       return <Homepage />; // Nếu chưa đăng nhập, hiển thị Homepage ngay
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

//   // Điều hướng người dùng không có quyền về trang chủ
//   return <Navigate to="/" replace />;
// };

// export default AppRouter;
import React from "react";

interface PrivateRouteProps {
  element: React.ComponentType;
  allowedRoles: string[];
}

const AppRouter: React.FC<PrivateRouteProps> = ({ element: Component }) => {
  return <Component />;
};

export default AppRouter;
