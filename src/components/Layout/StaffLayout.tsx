import { Layout } from "antd";
import React, { useState } from "react";
import { Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import StaffSidebar from "./SidebarStaff";
import HeaderStaff from "./HeaderStaff";

interface MainLayoutProps {
  children: React.ReactNode;
}

const StaffLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const siderWidth = collapsed ? 80 : 200; // Điều chỉnh khi thu gọn

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Header cố định */}
      <HeaderStaff collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout style={{ marginTop: 64 }}>
        {/* Sider cố định */}
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={200}
          className="site-layout-background"
          theme="light"
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            height: "calc(100vh - 64px)",
            zIndex: 1000,
          }}
        >
          <StaffSidebar />
        </Sider>

        {/* Nội dung chính với margin-left để tránh bị tràn vào Sider */}
        <Layout style={{ marginLeft: siderWidth, transition: "margin 0.2s" }}>
          <Content
            style={{
              minHeight: "calc(100vh - 64px)",
              transition: "all 0.2s",
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default StaffLayout;
