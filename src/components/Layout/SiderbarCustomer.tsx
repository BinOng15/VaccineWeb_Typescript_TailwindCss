import React from "react";
import { Menu } from "antd";
import {
  SettingOutlined,
  FileTextOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const CustomerSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: "/my-profile", icon: <SettingOutlined />, label: "Hồ sơ cá nhân" },
    {
      key: "/child-profile-page",
      icon: <FileTextOutlined />,
      label: "Hồ sơ của trẻ",
    },
    {
      key: "/user/payment-history",
      icon: <DollarOutlined />,
      label: "Lịch tiêm của trẻ",
    },
    { key: "/user/setting", icon: <SettingOutlined />, label: "Cài đặt" },
  ];

  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      style={{ height: "100%", borderRight: 0 }}
      items={menuItems.map((item) => ({
        ...item,
        onClick: () => navigate(item.key),
      }))}
    />
  );
};

export default CustomerSidebar;
