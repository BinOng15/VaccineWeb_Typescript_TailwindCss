import React from "react";
import { Menu } from "antd";
import {
  SettingOutlined,
  UserOutlined,
  AppstoreOutlined,
  ExperimentOutlined,
  GoldOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: "/admin/dashboard", icon: <SettingOutlined />, label: "Bảng chính" },
    { key: "/admin/manage-user", icon: <UserOutlined />, label: "Tài khoản" },
    {
      key: "/admin/manage-vaccine",
      icon: <ExperimentOutlined />,
      label: "Vắc xin lẻ",
    },
    {
      key: "/admin-manager-package",
      icon: <GoldOutlined />,
      label: "Gói vắc xin",
    },
    {
      key: "/admin/manage-disease",
      icon: <AppstoreOutlined />,
      label: "Các loại bệnh",
    },
  ];

  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      style={{
        height: "100%",
        borderRight: 0,
        marginTop: "64px",
      }}
      items={menuItems.map((item) => ({
        ...item,
        onClick: () => navigate(item.key),
      }))}
    />
  );
};

export default AdminSidebar;
