import React from "react";
import { Menu } from "antd";
import {
  SettingOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const StaffSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: "/staff/dashboard", icon: <SettingOutlined />, label: "Dashboard" },
    {
      key: "/staff/manager-order",
      icon: <ShoppingCartOutlined />,
      label: "Order",
    },
    {
      key: "/staff/manager-payment",
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

export default StaffSidebar;
