import React from "react";
import { Menu } from "antd";
import {
  SettingOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const DoctorSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: "/doctor/dashboard", icon: <SettingOutlined />, label: "Bảng chính" },
    {
      key: "/doctor/vaccination-record",
      icon: <SolutionOutlined/>,
      label: "Quản lý tiêm chủng",
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

export default DoctorSidebar;
