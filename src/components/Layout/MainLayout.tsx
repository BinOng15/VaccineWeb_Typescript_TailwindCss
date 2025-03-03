import { Layout } from "antd";
import React from "react";
import CustomFooter from "./Footer";
import AppHeader from "./Header";
import { Content } from "antd/es/layout/layout";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader />
      <Layout>
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
      <CustomFooter />
    </Layout>
  );
};

export default MainLayout;
