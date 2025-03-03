import React, { useCallback, useEffect, useState } from "react";
import { Layout, Avatar, Dropdown } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";

const { Header } = Layout;

interface AppHeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const HeaderAdmin: React.FC<AppHeaderProps> = ({ collapsed, setCollapsed }) => {
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
  }, []); // Chỉ chạy một lần khi component mount

  const handleLogout = useCallback(() => {
    // Xóa token từ cả localStorage và sessionStorage
    localStorage.removeItem("token");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/login", { replace: true }); // Sử dụng replace để tránh thêm vào history
  }, [navigate]); // Chỉ phụ thuộc vào navigate

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
          <div className="font-bold">PEDIVAX</div>
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
                  Welcome, Admin
                </span>
              </div>
            </Dropdown>
          ) : (
            <button
              className="bg-white text-[#009EE0] py-2 px-4 rounded-full max-w-xs w-auto mr-4 hover:bg-gray-100 transition-colors duration-200"
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

export default HeaderAdmin;
