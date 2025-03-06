import React from "react";
import { Menu } from "antd";
import {
  SettingOutlined,
  DollarOutlined,
  ExperimentOutlined,
  GoldOutlined,
  ExceptionOutlined,
  AppstoreOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";

const StaffSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: "/staff/dashboard", icon: <SettingOutlined />, label: "Bảng chính" },
    {
      key: "/staff/manage-vaccine",
      icon: <ExperimentOutlined />,
      label: "Vắc xin lẻ",
    },
    {
      key: "/staff/manage-vaccine-package",
      icon: <GoldOutlined />,
      label: "Gói vắc xin",
    },
    {
      key: "/staff/manage-appointment",
      icon: <ExceptionOutlined />,
      label: "Đăng ký tiêm",
    },
     {
      key: "/staff/manager-childprofile",
      icon: <IdcardOutlined />,
      label: "Hồ sơ của trẻ",
    },
    {
      key: "/staff/manage-disease",
      icon: <AppstoreOutlined />,
      label: "Các loại bệnh",
    },
    {
      key: "/staff/manager-payment",
      icon: <DollarOutlined />,
      label: "Thanh toán",
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
