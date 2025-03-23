import React from "react";
import { Menu } from "antd";
import {
  DollarOutlined,
  ExceptionOutlined,
  CheckSquareOutlined,
  DashOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const StaffSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: "/staff/dashboard", icon: <DashOutlined />, label: "Bảng chính" },

    {
      key: "/staff/check-in",
      icon: <CheckSquareOutlined />,
      label: "Check in",
    },
    {
      key: "/staff/payment",
      icon: <DollarOutlined />,
      label: "Thanh toán",
    },
    {
      key: "/staff/manage-appointment",
      icon: <ExceptionOutlined />,
      label: "Đăng ký tiêm",
    },
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
