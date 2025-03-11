import { Layout } from "antd";
import React, { useState } from "react";
import { Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import HeaderDoctor from "./HeaderDoctor";
import DoctorSidebar from "./SidebarDoctor";

interface MainLayoutProps {
  children: React.ReactNode;
}

const DoctorLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const siderWidth = collapsed ? 80 : 200; // Điều chỉnh khi thu gọn

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <HeaderDoctor collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout>
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
          <DoctorSidebar />
        </Sider>
        <Layout style={{ marginLeft: siderWidth, transition: "margin 0.2s" }}>
          <Content
            style={{
              margin: 0,
              minHeight: "calc(100vh - 200px)",
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

export default DoctorLayout;
