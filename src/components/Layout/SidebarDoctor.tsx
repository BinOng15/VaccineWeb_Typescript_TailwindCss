import React from "react";
import { Menu } from "antd";
import {
  DashOutlined,
  ExceptionOutlined,
  FileUnknownOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const DoctorSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: "/doctor/dashboard", icon: <DashOutlined />, label: "Bảng chính" },
    {
      key: "/doctor/confirm-injection",
      icon: <ExceptionOutlined />,
      label: "Xác nhận tiêm chủng",
    },
    {
      key: "/doctor/response",
      icon: <FileUnknownOutlined />,
      label: "Ghi nhận phản ứng",
    },
    {
      key: "/doctor/vaccination-record",
      icon: <SolutionOutlined />,
      label: "Đã hoàn thành",
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
