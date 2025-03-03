import { Layout } from "antd";
import React, { useState } from "react";
import { Content } from "antd/es/layout/layout";
import HeaderAdmin from "./HeaderAdmin";
import Sider from "antd/es/layout/Sider";
import AdminSidebar from "./SidebarAdmin";

interface MainLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <HeaderAdmin collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout>
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(collapsed) => setCollapsed(collapsed)}
          width={200}
          className="site-layout-background"
          style={{ height: "100vh", zIndex: 1000 }}
        >
          <AdminSidebar />
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

export default AdminLayout;
