// import React, { useEffect, useState } from "react";
// import { Outlet, useLocation } from "react-router-dom";
// import "./index.css";
// import { Layout } from "antd";
// import { hiddenHeaderPaths, sidebarPaths } from "./constants/routesHeader";
// import HeaderAdmin from "./components/Layout/HeaderAdmin";
// import HeaderStaff from "./components/Layout/HeaderStaff";
// import HeaderDoctor from "./components/Layout/HeaderDoctor";
// import HeaderCustomer from "./components/Layout/Header";
// import Sider from "antd/es/layout/Sider";
// import { ROLES } from "./constants";
// import AdminSidebar from "./components/Layout/SidebarAdmin";
// import StaffSidebar from "./components/Layout/SidebarStaff";
// import DoctorSidebar from "./components/Layout/SidebarDoctor";
// import CustomerSidebar from "./components/Layout/SiderbarCustomer";
// import Loading from "./components/Loading";
// import { Content } from "antd/es/layout/layout";
// import CustomFooter from "./components/Layout/Footer";
// import { setGlobalLoadingHandler } from "./util/axios.customize";
// import { getCurrentUser } from "./service/authService";
// import { useAuth } from "./context/AuthContext";

// const App: React.FC = () => {
//   const location = useLocation();
//   const [collapsed, setCollapsed] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [userLoaded, setUserLoaded] = useState(false);
//   const { user, setUser, getRole } = useAuth();
//   const [appLoading, setAppLoading] = useState(false);

//   const showSidebar = sidebarPaths.includes(location.pathname);
//   const hideHeader = hiddenHeaderPaths.includes(location.pathname);
//   const isAdminPath = location.pathname.startsWith("/admin");
//   const isCustomerPath = location.pathname.startsWith("/customer");
//   const isStaffPath = location.pathname.startsWith("/staff");
//   const isDoctorPath = location.pathname.startsWith("/doctor");

//   useEffect(() => {
//     setGlobalLoadingHandler(setIsLoading);

//     const fetchAccount = async () => {
//       try {
//         setAppLoading(true);
//         const token = sessionStorage.getItem("accessToken");
//         if (!token) {
//           setUser(null);
//           setUserLoaded(true);
//           return;
//         }

//         const userData = await getCurrentUser(token);
//         if (userData) {
//           setUser(userData);
//           sessionStorage.setItem("user", JSON.stringify(userData));
//           setUserLoaded(true);
//         } else {
//           throw new Error("Failed to fetch user data");
//         }
//       } catch (error) {
//         console.error("Failed to fetch user data:", error);
//         sessionStorage.clear();
//         setUser(null);
//         setUserLoaded(true);
//       } finally {
//         setAppLoading(false);
//       }
//     };

//     fetchAccount();
//   }, [setUser, setIsLoading]);

//   useEffect(() => {
//     window.scrollTo(0, 0);
//   }, [location.pathname]);

//   const renderSidebar = () => {
//     if (!userLoaded || !user?.role) return null;
//     switch (getRole()) {
//       case ROLES.ADMIN:
//         return <AdminSidebar />;
//       case ROLES.STAFF:
//         return <StaffSidebar />;
//       case ROLES.DOCTOR:
//         return <DoctorSidebar />;
//       default:
//         return <CustomerSidebar />;
//     }
//   };

//   const renderHeader = () => {
//     if (hideHeader) return null;

//     if (isAdminPath) {
//       return (
//         <HeaderAdmin
//           collapsed={collapsed}
//           setCollapsed={setCollapsed}
//           loading={appLoading}
//         />
//       );
//     }

//     if (isCustomerPath) {
//       return <HeaderCustomer />;
//     }

//     if (isStaffPath) {
//       return (
//         <HeaderStaff
//           collapsed={collapsed}
//           setCollapsed={setCollapsed}
//           loading={appLoading}
//         />
//       );
//     }

//     if (isDoctorPath) {
//       return (
//         <HeaderDoctor
//           collapsed={collapsed}
//           setCollapsed={setCollapsed}
//           loading={appLoading}
//         />
//       );
//     }
//     return <HeaderCustomer />;
//   };

//   return (
//     <Layout style={{ minHeight: "100vh" }}>
//       {renderHeader()}
//       <Layout>
//         {user && showSidebar && (
//           <Sider
//             collapsible
//             collapsed={collapsed}
//             onCollapse={(collapsed) => setCollapsed(collapsed)}
//             width={200}
//             className="site-layout-background"
//             style={{ height: "100vh", zIndex: 1000 }}
//           >
//             {renderSidebar()}
//           </Sider>
//         )}

//         <Layout>
//           <Loading isLoading={isLoading}>
//             <Content
//               style={{
//                 margin: 0,
//                 minHeight: "calc(100vh - 200px)",
//                 transition: "all 0.2s",
//               }}
//             >
//               <Outlet /> {/* Hiển thị các route con từ AppRouter */}
//             </Content>
//           </Loading>
//         </Layout>
//       </Layout>
//       <CustomFooter />
//     </Layout>
//   );
// };

// export default App;

import AppRouter from "./router/ProtectedRouter";

const App = () => {
  return (
    <>
      <AppRouter />
    </>
  );
};

export default App;
