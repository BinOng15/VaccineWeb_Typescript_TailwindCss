import React from "react";
import { Menu } from "antd";
import { AppstoreOutlined, CalendarOutlined, ExperimentOutlined, GoldOutlined, HddOutlined, IdcardOutlined, MinusCircleOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
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
      key: "/admin/manage-vaccine-disease",
      icon: <MinusCircleOutlined />,
      label: "Chi tiết vắc xin",
    },
    {
      key: "/admin/manage-disease",
      icon: <AppstoreOutlined />,
      label: "Các loại bệnh",
    },
    {
      key: "/admin/manage-vaccine-package",
      icon: <GoldOutlined />,
      label: "Gói vắc xin",
    },
    {
      key: "/admin/manage-vaccine-package-detail",
      icon: <HddOutlined />,
      label: "Chi tiết gói vaccine",
    },
    {
      key: "/admin/manager-childprofile",
      icon: <IdcardOutlined />,
      label: "Hồ sơ của trẻ",
    },
    {
      key: "/admin/manage-vaccine-schedule",
      icon: <CalendarOutlined />,
      label: "Lịch tiêm chủng",
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
