import React from "react";
import { FaShoppingCart, FaCalendarAlt, FaComments } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
// import { Link, useLocation, useNavigate } from "react-router-dom";
// import { AuthContext } from "../../context/auth.context";

// const { Header } = Layout;

// interface AppHeaderProps {
//   collapsed: boolean;
//   setCollapsed: (collapsed: boolean) => void;
//   loading: boolean;
// }

const AppHeader: React.FC = () => {
  const Navigate = useNavigate();
  const menuItems = [
    { name: "Trang chủ", path: "/" },
    { name: "Giới thiệu", path: "/Introduction" },
    { name: "Vắc xin cho trẻ em", path: "/vac-xin-tre-em" },
    { name: "Gói vắc xin", path: "/goi-vac-xin" },
    { name: "Cẩm nang", path: "/cam-nang" },
    { name: "Bảng giá", path: "/bang-gia" },
    { name: "Liên hệ", path: "/lien-he" },
  ];
  // const { auth } = useContext(AuthContext);
  // const location = useLocation();
  // const navigate = useNavigate();

  // const handleLogout = () => {
  //   localStorage.removeItem("token");
  //   navigate("/login");
  // };

  // const avatarMenuItems = [
  //   {
  //     key: "1",
  //     icon: <UserOutlined />,
  //     label: <Link to="/user/dashboard">My Dashboard</Link>,
  //   },
  //   {
  //     key: "2",
  //     icon: <LogoutOutlined />,
  //     label: (
  //       <a
  //         onClick={handleLogout}
  //         style={{ display: "flex", alignItems: "center" }}
  //       >
  //         Logout
  //       </a>
  //     ),
  //   },
  // ];

  //const isHomePage = location.pathname === "/";

  return (
    <header className="w-full mb-0">
      {" "}
      {/* Xóa khoảng cách giữa header và carousel */}
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-3 bg-white shadow-md border-b border-gray-200">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <img src="logo/vaccine.png" alt="Vaccine Logo" className="h-12" />
          <img src="image/asset1.png" alt="Asset one" className="h-12" />
          <span className="text-xl font-bold">
            <span className="text-[#009EE0]">Vì sức khỏe</span>{" "}
            <span className="text-[#102A83]">Cộng đồng</span>
          </span>
        </div>

        {/* Search Bar */}
        <div className="relative w-1/4">
          <input
            type="text"
            placeholder="Tìm kiếm"
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Icons and Contact */}
        <div className="flex items-center space-x-6 text-[#102A83]">
          <button className="flex items-center font-semibold space-x-2">
            <FaShoppingCart className="text-[#102A83]" />
            <span className="text-sm">Đặt mua vắc xin</span>
          </button>
          <button className="flex items-center font-semibold space-x-2">
            <FaCalendarAlt className="text-[#102A83]" />
            <span>Đăng ký tiêm</span>
          </button>
          <button className="flex items-center font-semibold space-x-2">
            <FaComments className="text-[#102A83]" />
            <span>Tư vấn</span>
          </button>
          <button className="px-5 py-2 border border-[#102A83] text-[#102A83] rounded-full">
            Đăng nhập
          </button>
          <button className="px-5 py-2 bg-[#102A83] text-white rounded-full">
            Đăng ký
          </button>
        </div>
      </div>
      {/* Bottom Navigation */}
      <nav className="bg-[#102A83] text-white flex justify-center space-x-20 py-3 font-medium">
      {menuItems.map((item, index) => (
        <button
          key={index}
          className="hover:underline"
          onClick={() => Navigate(item.path)}
        >
          {item.name}
        </button>
      ))}
    </nav>
    </header>
  );
};

export default AppHeader;
