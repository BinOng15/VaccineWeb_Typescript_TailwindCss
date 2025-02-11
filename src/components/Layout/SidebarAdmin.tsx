import React from "react";
import { Menu } from "antd";
import {
  SettingOutlined,
  UserOutlined,
  CalendarOutlined,
  TeamOutlined,
  AppstoreOutlined,
  SolutionOutlined,
  TagsOutlined,
  BarcodeOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const AdminSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: "/admin/dashboard", icon: <SettingOutlined />, label: "Dashboard" },
    { key: "/admin/manager-user", icon: <UserOutlined />, label: "Account" },
    {
      key: "/admin/manager-session",
      icon: <CalendarOutlined />,
      label: "Season",
    },
    { key: "/admin/manager-club", icon: <TeamOutlined />, label: "Club" },
    { key: "/admin/manager-size", icon: <AppstoreOutlined />, label: "Size" },
    {
      key: "/admin/manager-player",
      icon: <SolutionOutlined />,
      label: "Player",
    },
    {
      key: "/admin/manager-type-shirt",
      icon: <TagsOutlined />,
      label: "Type Shirt",
    },
    { key: "/admin/manager-shirt", icon: <BarcodeOutlined />, label: "Shirt" },
    {
      key: "/admin/manager-shirt-size",
      icon: <AppstoreOutlined />,
      label: "Shirt Size",
    },
    {
      key: "/admin/manager-order",
      icon: <ShoppingCartOutlined />,
      label: "Order",
    },
    {
      key: "/admin/manager-payment",
      icon: <DollarOutlined />,
      label: "Payment",
    },
    { key: "/user/setting", icon: <SettingOutlined />, label: "Setting" },
  ];

  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      style={{ height: "100%", borderRight: 0, marginTop: "64px" }}
      items={menuItems.map((item) => ({
        ...item,
        onClick: () => navigate(item.key),
      }))}
    />
  );
};

export default AdminSidebar;
