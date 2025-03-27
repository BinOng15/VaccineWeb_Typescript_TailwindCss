/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import userService from "../../service/userService"; // Import userService để gọi getUserById

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [avatarMenuOpen, setAvatarMenuOpen] = useState<boolean>(false);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [userData, setUserData] = useState<any | null>(null); // State để lưu dữ liệu người dùng từ API
  const avatarDropdownRef = useRef<HTMLDivElement>(null);
  const menuDropdownRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { name: "Trang chủ", path: "/" },
    { name: "Giới thiệu", path: "/Introduction" },
    { name: "Vắc xin cho trẻ em", path: "/vaccine-types" },
    { name: "Gói vắc xin", path: "/vaccine-package" },
    {
      name: "Cẩm nang",
      subMenu: [
        { name: "Lịch tiêm chủng cho trẻ em", path: "/vaccination-schedule" },
        { name: "Các loại vắc xin cho trẻ em", path: "/vaccine-types" },
        { name: "Các gói vắc xin cho trẻ em", path: "/vaccine-package" },
      ],
    },
    { name: "Bảng giá", path: "/vaccine-price" },
  ];

  const isLoggedIn = !!user;

  // Lấy dữ liệu người dùng từ API khi component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        console.error("No user found");
        return;
      }
      try {
        const userData = await userService.getUserById(user.userId);
        console.log("User data from API:", userData); // Debug dữ liệu trả về
        setUserData(userData);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };

    fetchUserData();
  }, [user]); // Chạy lại khi user thay đổi

  const handleLogout = async () => {
    try {
      await logout();
      setAvatarMenuOpen(false);
      setUserData(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path, { replace: true });
  };

  // Xử lý đường dẫn ảnh (nếu là đường dẫn tương đối)
  const getAvatarUrl = () => {
    const defaultAvatar =
      "https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-computer-wallpaper-thumbnail.png";
    if (!userData?.image) return defaultAvatar;

    // Nếu image là đường dẫn tương đối, thêm base URL
    if (!userData.image.startsWith("http")) {
      return `https://yourdomain.com${userData.image}`; // Thay bằng domain thực tế của bạn
    }
    return userData.image;
  };

  return (
    <header className="w-full mb-0 relative z-50">
      <div className="flex items-center justify-between px-8 py-3 bg-white shadow-md border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <img
            src="logo/vaccine.png"
            alt="Vaccine Logo"
            className="h-12"
            onClick={() => navigate("")}
          />
          <img src="image/asset1.png" alt="Asset one" className="h-12" />
          <span className="text-xl font-bold">
            <span className="text-[#009EE0]">Vì sức khỏe</span>{" "}
            <span className="text-[#102A83]">Cộng đồng</span>
          </span>
        </div>

        {/* <div className="relative w-1/4">
          <input
            type="text"
            placeholder="Tìm kiếm"
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div> */}

        <div className="flex items-center space-x-6 text-[#102A83]">
          <button
            className="flex items-center font-semibold space-x-2"
            onClick={() => handleNavigate("/vaccine-registration")}
          >
            <FaCalendarAlt className="text-[#102A83]" />
            <span>Đăng ký tiêm</span>
          </button>

          {isLoggedIn ? (
            <div className="relative" ref={avatarDropdownRef}>
              <img
                src={getAvatarUrl()}
                alt="Avatar"
                className="w-10 h-10 rounded-full cursor-pointer"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-computer-wallpaper-thumbnail.png";
                }}
                onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
              />
              {avatarMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg border border-gray-200 py-2">
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => handleNavigate("/my-profile")}
                  >
                    My Profile
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button
                className="px-5 py-2 border border-[#102A83] text-[#102A83] rounded-full"
                onClick={() => handleNavigate("/login")}
              >
                Đăng nhập
              </button>
              <button
                className="px-5 py-2 bg-[#102A83] text-white rounded-full"
                onClick={() => handleNavigate("/register")}
              >
                Đăng ký
              </button>
            </>
          )}
        </div>
      </div>

      <nav className="bg-[#102A83] text-white flex justify-center space-x-20 py-3 font-medium">
        {menuItems.map((item, index) =>
          item.subMenu ? (
            <div key={index} className="relative" ref={menuDropdownRef}>
              <button
                className="hover:underline"
                onClick={() =>
                  setOpenMenuIndex(openMenuIndex === index ? null : index)
                }
              >
                {item.name}
              </button>
              {openMenuIndex === index && (
                <div className="absolute bg-white text-black shadow-lg rounded-md mt-2 w-64">
                  {item.subMenu.map((sub, subIndex) => (
                    <button
                      key={subIndex}
                      className="block px-4 py-2 w-full text-left hover:bg-gray-100"
                      onClick={() => handleNavigate(sub.path)}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button
              key={index}
              className="hover:underline"
              onClick={() => handleNavigate(item.path)}
            >
              {item.name}
            </button>
          )
        )}
      </nav>
    </header>
  );
};

export default AppHeader;
