import React, { useEffect, useState, useCallback, useRef } from "react";
import { FaShoppingCart, FaCalendarAlt, FaComments } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { userLogout } from "../../service/authService";
import { notification } from "antd";

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState<boolean>(false);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const avatarDropdownRef = useRef<HTMLDivElement>(null); // Ref riêng cho avatar dropdown
  const menuDropdownRef = useRef<HTMLDivElement>(null); // Ref riêng cho menu dropdown

  const menuItems = [
    { name: "Trang chủ", path: "/" },
    { name: "Giới thiệu", path: "/Introduction" },
    { name: "Vắc xin cho trẻ em", path: "/vaccine-types" },
    { name: "Gói vắc xin", path: "/vaccine-package" },
    {
      name: "Cẩm nang",
      subMenu: [
        { name: "Lịch tiêm chủng cho trẻ em", path: "/vaccination-schedule" },
        {
          name: "Quá trình tiêm chủng cho trẻ em",
          path: "/cam-nang/huong-dan",
        },
        { name: "Các loại vắc xin cho trẻ em", path: "/vaccine-types" },
        { name: "Các gói vắc xin cho trẻ em", path: "/vaccine-package" },
      ],
    },
    { name: "Bảng giá", path: "/vaccine-price" },
    { name: "Liên hệ", path: "/lien-he" },
  ];

  // Hàm kiểm tra trạng thái đăng nhập, sử dụng useCallback để tránh re-render không cần thiết
  const checkLoginStatus = useCallback(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("accessToken");
    setIsLoggedIn(!!token); // Nếu có token thì isLoggedIn = true
  }, []); // Không cần dependency vì chỉ cần chạy một lần

  // Kiểm tra trạng thái đăng nhập khi component mount, tránh re-render liên tục
  useEffect(() => {
    checkLoginStatus();
    // Không cần theo dõi thay đổi token trong dependency array để tránh re-render không cần thiết
  }, [checkLoginStatus]);

  // Hàm logout được tối ưu để chỉ navigation một lần
  const handleLogout = useCallback(async () => {
    try {
      await userLogout(); // Gọi API logout
      setIsLoggedIn(false);
      setAvatarMenuOpen(false);
      navigate("/login", { replace: true });
      notification.success({
        message: "Logout Successful",
        description: "You have been logged out successfully.",
      });
    } catch (error) {
      console.error("Logout error:", error);
      notification.error({
        message: "Logout Failed",
        description: "An error occurred during logout. Please try again.",
      });
    }
  }, [navigate]);

  const handleNavigate = useCallback(
    (path: string) => {
      navigate(path, { replace: true });
    },
    [navigate]
  );

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

        <div className="relative w-1/4">
          <input
            type="text"
            placeholder="Tìm kiếm"
            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-6 text-[#102A83]">
          <button
            className="flex items-center font-semibold space-x-2"
            onClick={() => handleNavigate("/vaccine-purchase")}
          >
            <FaShoppingCart className="text-[#102A83]" />
            <span
              className="text-sm"
              onClick={() => navigate("/vaccine-types")}
            >
              Đặt mua vắc xin
            </span>
          </button>
          <button
            className="flex items-center font-semibold space-x-2"
            onClick={() => handleNavigate("/vaccine-registration")}
          >
            <FaCalendarAlt className="text-[#102A83]" />
            <span>Đăng ký tiêm</span>
          </button>
          <button
            className="flex items-center font-semibold space-x-2"
            onClick={() => handleNavigate("/consultation")}
          >
            <FaComments className="text-[#102A83]" />
            <span>Tư vấn</span>
          </button>

          {isLoggedIn ? (
            <div className="relative" ref={avatarDropdownRef}>
              <img
                src="https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-computer-wallpaper-thumbnail.png"
                alt="Avatar"
                className="w-10 h-10 rounded-full cursor-pointer"
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
