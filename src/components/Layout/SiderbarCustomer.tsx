import React from "react";
import { Menu } from "antd";
import {
  FileTextOutlined,
  FileAddOutlined,
  CalendarOutlined,
  DashOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const CustomerSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: "/my-profile", icon: <DashOutlined />, label: "Hồ sơ cá nhân" },
    {
      key: "/child-profile-page",
      icon: <FileTextOutlined />,
      label: "Hồ sơ của trẻ",
    },
    // {
    //   key: "/child-vaccine-profile",
    //   icon: <FileDoneOutlined />,
    //   label: "Hồ sơ tiêm chủng",
    // },
    {
      key: "/child-appointment",
      icon: <FileAddOutlined />,
      label: "Đăng ký tiêm",
    },
    {
      key: "/child-vaccine-schedule",
      icon: <CalendarOutlined />,
      label: "Hồ sơ tiêm chủng",
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
