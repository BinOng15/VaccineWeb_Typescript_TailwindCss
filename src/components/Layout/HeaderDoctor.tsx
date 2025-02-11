import React, { useContext } from "react";
import { Layout, Avatar, Dropdown, Skeleton } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/auth.context";

const { Header } = Layout;

interface AppHeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  loading: boolean;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  collapsed,
  setCollapsed,
  loading,
}) => {
  const { auth } = useContext(AuthContext);

  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
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
        className="header flex justify-between items-center bg-black"
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

        {/* Center: Logo - Always visible */}
        <div className="flex-1 flex justify-center">
          <Link to="/">
            <img src={""} alt="logo" className="h-20 w-auto" />
          </Link>
        </div>

        {/* Right: Avatar and Sign In */}
        <div className="flex-1 flex justify-end items-center">
          <Skeleton loading={loading} active avatar>
            {auth.isAuthenticated ? (
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
                    Welcome ST, {auth.user.name}
                  </span>
                </div>
              </Dropdown>
            ) : (
              <button
                className="bg-white text-gray-900 py-2 px-4 rounded-md max-w-xs w-auto mr-4 hover:bg-gray-100 transition-colors duration-200"
                onClick={() => navigate("/login")}
                style={{
                  padding: "6px 12px",
                  fontSize: "14px",
                  lineHeight: "20px",
                  fontWeight: "500",
                  borderRadius: "6px",
                  marginRight: "10px",
                }}
              >
                Sign In
              </button>
            )}
          </Skeleton>
        </div>
      </Header>
    </Layout>
  );
};

export default AppHeader;
