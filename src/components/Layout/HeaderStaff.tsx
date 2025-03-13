import React, { useEffect, useState } from "react";
import { Layout, Avatar, Dropdown } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const { Header } = Layout;

interface AppHeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const HeaderStaff: React.FC<AppHeaderProps> = ({ collapsed, setCollapsed }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    const checkLoginStatus = () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("accessToken");
      setIsLoggedIn(!!token);
    };
    checkLoginStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const avatarMenuItems = [
    {
      key: "1",
      icon: <LogoutOutlined />,
      label: (
        <a
          onClick={handleLogout}
          style={{ display: "flex", alignItems: "center" }}
        >
          Logout
        </a>
      ),
    },
  ];

  const isHomePage = location.pathname === "/";

  return (
    <Layout>
      <Header
        className="header flex justify-between items-center bg-[#009EE0]"
        style={{ zIndex: 1001, position: "fixed", width: "100%" }}
      >
        <div className="flex-1 flex justify-start">
          {!isHomePage &&
            React.createElement(
              collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
              {
                className: "trigger",
                style: { color: "white", fontSize: "20px", cursor: "pointer" },
                onClick: () => setCollapsed(!collapsed),
              }
            )}
        </div>

        <div className="flex-1 flex justify-center">
          {/* <Link to="/">
            <img src={""} alt="logo" className="h-20 w-auto" />
          </Link> */}
          <div className="font-bold text-white">PEDIVAX</div>
        </div>

        <div className="flex-1 flex justify-end items-center">
          {isLoggedIn ? (
            <Dropdown
              menu={{ items: avatarMenuItems }}
              trigger={["hover"]}
              placement="bottomRight"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  marginLeft: "20px",
                }}
              >
                <Avatar icon={<UserOutlined />} />
                <span style={{ color: "white", marginLeft: "10px" }}>
                  Xin chào, Staff
                </span>
              </div>
            </Dropdown>
          ) : (
            <button
              className="bg-white text-[#102A83] py-2 px-4 rounded-full max-w-xs w-auto mr-4 hover:bg-gray-100 transition-colors duration-200"
              onClick={() => navigate("/login", { replace: true })}
              style={{
                padding: "6px 12px",
                fontSize: "14px",
                lineHeight: "20px",
                fontWeight: "500",
                borderRadius: "9999px",
                marginRight: "10px",
              }}
            >
              Đăng nhập
            </button>
          )}
        </div>
      </Header>
    </Layout>
  );
};

export default HeaderStaff;
