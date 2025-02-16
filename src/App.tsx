import React, { useContext, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import "./index.css";
import { Layout } from "antd";
import { sidebarPaths } from "./constants/routesHeader";
// import HeaderAdmin from "./components/Layout/HeaderAdmin";
// import HeaderStaff from "./components/Layout/HeaderStaff";
// import HeaderDoctor from "./components/Layout/HeaderDoctor";
import HeaderCustomer from "./components/Layout/Header";
import Sider from "antd/es/layout/Sider";
// import { ROLES } from "./constants";
// import AdminSidebar from "./components/Layout/SidebarAdmin";
// import StaffSidebar from "./components/Layout/SidebarStaff";
// import DoctorSidebar from "./components/Layout/SidebarDoctor";
import CustomerSidebar from "./components/Layout/SiderbarCustomer";
import Loading from "./components/Loading";
import { Content } from "antd/es/layout/layout";
import { AuthContext } from "./context/auth.context";
import CustomFooter from "./components/Layout/Footer";

const App: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isLoading] = useState(false);
  // const [userLoaded] = useState(false);
  const { auth } = useContext(AuthContext);

  const showSidebar = sidebarPaths.includes(location.pathname);
  // const hideHeader = hiddenHeaderPaths.includes(location.pathname);
  // const isAdminPath = location.pathname.startsWith("/admin");
  // const isCustomerPath = location.pathname.startsWith("/customer");
  // const isStaffPath = location.pathname.startsWith("/staff");
  // const isDoctorPath = location.pathname.startsWith("/doctor");

  // const renderSidebar = () => {
  //   if (!userLoaded || !auth?.user?.role) return null;
  //   switch (auth?.user?.role) {
  //     case ROLES.ADMIN:
  //       return <AdminSidebar />;
  //     case ROLES.STAFF:
  //       return <StaffSidebar />;
  //     case ROLES.DOCTOR:
  //       return <DoctorSidebar />;
  //     default:
  //       return <CustomerSidebar />;
  //   }
  // };

  // const renderHeader = () => {
  //   if (hideHeader) return null;

  //   if (isAdminPath) {
  //     return (
  //       <HeaderAdmin
  //         collapsed={collapsed}
  //         setCollapsed={setCollapsed}
  //         loading={appLoading}
  //       />
  //     );
  //   }

  //   if (isCustomerPath) {
  //     return (
  //       <HeaderCustomer
  //       // collapsed={collapsed}
  //       // setCollapsed={setCollapsed}
  //       // loading={appLoading}
  //       />
  //     );
  //   }

  //   if (isStaffPath) {
  //     return (
  //       <HeaderStaff
  //         collapsed={collapsed}
  //         setCollapsed={setCollapsed}
  //         loading={appLoading}
  //       />
  //     );
  //   }

  //   if (isDoctorPath) {
  //     return (
  //       <HeaderDoctor
  //         collapsed={collapsed}
  //         setCollapsed={setCollapsed}
  //         loading={appLoading}
  //       />
  //     );
  //   }
  // };

  const renderSidebar = () => {
    return <CustomerSidebar />; // Hiển thị mặc định
  };

  const renderHeader = () => {
    return <HeaderCustomer />;
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {renderHeader()}
      <Layout>
        {auth?.isAuthenticated && showSidebar && (
          <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={(collapsed) => setCollapsed(collapsed)}
            width={200}
            className="site-layout-background"
            style={{ height: "100vh", zIndex: 1000 }}
          >
            {renderSidebar()}
          </Sider>
        )}

        <Layout>
          <Loading isLoading={isLoading}>
            <Content
              style={{
                margin: 0,
                minHeight: "calc(100vh - 200px)",
                transition: "all 0.2s",
              }}
            >
              <Outlet />
            </Content>
          </Loading>
        </Layout>
      </Layout>
      <CustomFooter />
    </Layout>
  );
};

export default App;
