import React from "react";
import { Menu } from "antd";
import { SettingOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: "/admin/dashboard", icon: <SettingOutlined />, label: "Bảng chính" },
    { key: "/admin/manage-user", icon: <UserOutlined />, label: "Tài khoản" },
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
