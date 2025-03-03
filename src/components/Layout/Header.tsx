import React, { useEffect, useState, useCallback } from "react";
import { FaShoppingCart, FaCalendarAlt, FaComments } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState<boolean>(false);
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);

  const menuItems = [
    { name: "Trang chủ", path: "/" },
    { name: "Giới thiệu", path: "/Introduction" },
    { name: "Vắc xin cho trẻ em", path: "/vaccine-types" },
    { name: "Gói vắc xin", path: "/vaccine-package" },
    {
      name: "Cẩm nang",
      subMenu: [
        { name: "Lịch tiêm chủng cho trẻ em", path: "/vaccinationschedule" },
        {
          name: "Quá trình tiêm chủng cho trẻ em",
          path: "/cam-nang/huong-dan",
        },
        { name: "Các loại vắc xin cho trẻ em", path: "/vaccine-types" },
        { name: "Các gói vắc xin cho trẻ em", path: "/vaccine-package" },
      ],
    },
    { name: "Bảng giá", path: "/bang-gia" },
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
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");
    setIsLoggedIn(false);
    setAvatarMenuOpen(false);
    navigate("/login", { replace: true });
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
          <img src="logo/vaccine.png" alt="Vaccine Logo" className="h-12" />
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
            <span className="text-sm">Đặt mua vắc xin</span>
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
            <div className="relative">
              <img
                src="https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-computer-wallpaper-thumbnail.png"
                alt="Avatar"
                className="w-10 h-10 rounded-full cursor-pointer"
                onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
              />
              {avatarMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-60">
                  <ul>
                    <li
                      className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        handleNavigate("/user/dashboard");
                        setAvatarMenuOpen(false);
                      }}
                    >
                      My Dashboard
                    </li>
                    <li
                      className="px-4 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100"
                      onClick={handleLogout}
                    >
                      Logout
                    </li>
                  </ul>
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

      <nav className="bg-[#102A83] text-white flex justify-center space-x-20 py-3 font-medium relative z-50">
        {menuItems.map((item, index) => (
          <div key={index} className="relative">
            {item.subMenu ? (
              <div
                className="relative group"
                onMouseEnter={() => setOpenMenuIndex(index)}
              >
                <button className="hover:underline">{item.name}</button>
                {openMenuIndex === index && (
                  <div
                    className="absolute left-0 mt-2 w-52 bg-white text-black shadow-lg z-60 rounded-lg"
                    onMouseEnter={() => setOpenMenuIndex(index)}
                    onMouseLeave={() => setOpenMenuIndex(null)}
                  >
                    <ul>
                      {item.subMenu.map((subItem, subIndex) => (
                        <li
                          key={subIndex}
                          className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 rounded-lg"
                          onClick={() => {
                            handleNavigate(subItem.path);
                            setOpenMenuIndex(null);
                          }}
                        >
                          {subItem.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="hover:underline"
                onClick={() => handleNavigate(item.path)}
              >
                {item.name}
              </button>
            )}
          </div>
        ))}
      </nav>
    </header>
  );
};

export default AppHeader;
