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

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader />
      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(collapsed) => setCollapsed(collapsed)}
          width={200}
          className="site-layout-background"
          style={{
            height: "100vh",
            zIndex: 1000,
            backgroundColor: "#0000", // Thay đổi màu nền sidebar (ví dụ: màu xám đậm)
          }}
          theme="light" // Đặt theme để tránh xung đột màu
        >
          <CustomerSidebar />
        </Sider>
        <Layout>
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

export default CustomerLayout;
