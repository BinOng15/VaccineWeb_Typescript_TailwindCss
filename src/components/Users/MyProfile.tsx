import { useEffect, useState } from "react";
import { User } from "../../models/User";
import { getCurrentUser } from "../../service/authService";

function MyProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Lấy token từ localStorage hoặc sessionStorage
  const getToken = () => {
    return (
      localStorage.getItem("token") || sessionStorage.getItem("accessToken")
    );
  };

  // Fetch dữ liệu người dùng khi component mount
  useEffect(() => {
    const fetchUserData = async () => {
      const token = getToken();
      if (!token) {
        console.error("No token found");
        setLoading(false);
        return;
      }

      try {
        const userData = await getCurrentUser(token); // Truyền token vào getCurrentUser
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Dữ liệu mặc định khi chưa load xong hoặc không có dữ liệu
  const defaultUser = {
    userId: "",
    email: "Chưa có dữ liệu",
    role: "user",
    fullName: "Chưa có dữ liệu",
    phoneNumber: "Chưa có dữ liệu",
    dateOfBirth: "Chưa có dữ liệu",
    address: "Chưa có dữ liệu",
    image:
      "https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-computer-wallpaper-thumbnail.png",
  };

  // Sử dụng dữ liệu từ API nếu có, ngược lại dùng dữ liệu mặc định
  const displayUser = user || defaultUser;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6">
        {/* Tiêu đề */}
        <h1 className="text-3xl font-bold text-[#102A83] mb-6 text-center">
          Thông tin cá nhân
        </h1>

        {/* Avatar và nút chỉnh sửa */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={displayUser.image}
            alt="Avatar"
            className="w-24 h-24 rounded-full border-2 border-[#102A83] object-cover"
          />
          <button className="mt-4 px-4 py-2 bg-[#102A83] text-white rounded-full hover:bg-[#009EE0] transition duration-300">
            Thay đổi ảnh đại diện
          </button>
        </div>

        {/* Thông tin người dùng */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-600 font-medium">Họ và tên:</span>
            <span className="text-[#102A83]">{displayUser.fullName}</span>
          </div>
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-600 font-medium">Email:</span>
            <span className="text-[#102A83]">{displayUser.email}</span>
          </div>
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-600 font-medium">Số điện thoại:</span>
            <span className="text-[#102A83]">{displayUser.phoneNumber}</span>
          </div>
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-600 font-medium">Ngày sinh:</span>
            <span className="text-[#102A83]">
              {displayUser.dateOfBirth &&
              displayUser.dateOfBirth !== "Chưa có dữ liệu"
                ? new Date(displayUser.dateOfBirth)
                    .toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                    .replace(/\//g, "/") // Đảm bảo định dạng dd/mm/yyyy
                : displayUser.dateOfBirth}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-600 font-medium">Địa chỉ:</span>
            <span className="text-[#102A83]">{displayUser.address}</span>
          </div>
        </div>

        {/* Nút chỉnh sửa thông tin */}
        <div className="mt-6 flex justify-center">
          <button className="px-6 py-2 bg-[#102A83] text-white rounded-full hover:bg-[#102A83] transition duration-300">
            Chỉnh sửa thông tin
          </button>
        </div>
      </div>
    </div>
  );
}

export default MyProfile;
