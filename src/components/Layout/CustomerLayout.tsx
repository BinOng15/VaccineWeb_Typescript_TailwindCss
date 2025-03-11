import { Layout } from "antd";
import React, { useState } from "react";
import { Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import AppHeader from "./Header";
import CustomerSidebar from "./SiderbarCustomer";

interface MainLayoutProps {
  children: React.ReactNode;
}

const CustomerLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const siderWidth = collapsed ? 80 : 200; // Độ rộng Sider khi thu gọn

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Header cố định */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 1100,
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <AppHeader />
      </div>

      <Layout>
        {/* Sider cố định */}
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(collapsed) => setCollapsed(collapsed)}
          width={200}
          className="site-layout-background"
          style={{
            position: "fixed",
            left: 0,
            top: 76, // Tránh bị Header che
            height: "calc(100vh - 64px)",
            zIndex: 1000,
            background: "#fff",
            transition: "width 0.2s",
            boxShadow: "2px 0 8px rgba(0, 0, 0, 0.1)",
          }}
          theme="light"
        >
          <CustomerSidebar />
        </Sider>

        {/* Content có marginLeft và paddingTop để tránh bị che */}
        <Layout
          style={{
            marginLeft: siderWidth,
            transition: "margin-left 0.2s",
            paddingTop: 72, // Để tránh bị Header che
          }}
        >
          <Content
            style={{
              margin: "24px",
              minHeight: "calc(100vh - 88px)", // Tránh tràn màn hình
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default CustomerLayout;
