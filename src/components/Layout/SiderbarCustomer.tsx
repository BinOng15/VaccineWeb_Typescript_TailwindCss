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
      key: "/child-appointment",
      icon: <SettingOutlined />,
      label: "Đăng ký tiêm",
    },

    {
      key: "/child-vaccine-profile",
      icon: <DollarOutlined />,
      label: "Hồ sơ tiêm chủng",
    },
    {
      key: "/child-vaccine-schedule",
      icon: <DollarOutlined />,
      label: "Lịch tiêm chủng",
    },
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
