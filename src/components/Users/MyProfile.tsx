import { useEffect, useState } from "react";
import { UserResponseDTO } from "../../models/User";
import userService from "../../service/userService";
import EditProfileModal from "./EditProfileModal";
import ChangeAvatarModal from "./ChangeAvatarModal";
import { useAuth } from "../../context/AuthContext";
import { message } from "antd";

interface User extends UserResponseDTO {
  userId: number;
}

function MyProfile() {
  const [isUser, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isChangeAvatarModalVisible, setIsChangeAvatarModalVisible] =
    useState(false);
  const { user } = useAuth();

  // Fetch dữ liệu người dùng khi component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        console.error("No user found");
        setLoading(false);
        return;
      }
      try {
        const userData = await userService.getUserById(user.userId);
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // Dữ liệu mặc định khi chưa load xong hoặc không có dữ liệu
  const defaultUser = {
    userId: 0,
    email: "Chưa có dữ liệu",
    role: "user",
    fullName: "Chưa có dữ liệu",
    phoneNumber: "Chưa có dữ liệu",
    dateOfBirth: "Chưa có dữ liệu",
    address: "Chưa có dữ liệu",
    image:
      "https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-computer-wallpaper-thumbnail.png",
    createdDate: "",
    createdBy: "",
    modifiedDate: "",
    modifiedBy: "",
    isActive: "",
  };

  // Sử dụng dữ liệu từ API nếu có, ngược lại dùng dữ liệu mặc định
  const displayUser = isUser || defaultUser;

  const handleUpdate = () => {
    setIsEditModalVisible(true);
  };

  const handleChangeAvatar = () => {
    setIsChangeAvatarModalVisible(true);
  };

  const handleSaveChanges = async (formData: FormData) => {
    if (!user?.userId) {
      console.error("User ID is missing");
      return;
    }

    try {
      const success = await userService.updateUser(user.userId, formData);
      if (success) {
        const updatedUser = await userService.getUserById(user.userId);
        setUser(updatedUser);
        setIsEditModalVisible(false);
        message.success("Cập nhật thông tin thành công!");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      message.error("Cập nhật thông tin thất bại!");
    }
  };

  const handleCloseModal = () => {
    setIsEditModalVisible(false);
  };

  const handleCloseAvatarModal = () => {
    setIsChangeAvatarModalVisible(false);
  };

  const handleAvatarChange = (newImageUrl: string) => {
    if (isUser) {
      setUser({ ...isUser, image: newImageUrl });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-xl">Đang tải...</p>
      </div>
    );
  }

  // Hàm định dạng ngày sinh
  const formatDateOfBirth = (dateStr: string | null) => {
    if (!dateStr || dateStr === "Chưa có dữ liệu" || dateStr === "01/01/0001") {
      return "Chưa có dữ liệu";
    }
    const date = new Date(dateStr.split("/").reverse().join("-")); // Chuyển từ DD/MM/YYYY sang YYYY-MM-DD
    if (isNaN(date.getTime())) {
      return "Chưa có dữ liệu"; // Xử lý nếu ngày không hợp lệ
    }
    return date
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "/");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-[#102A83] mb-6 text-center">
          Thông tin cá nhân
        </h1>

        <div className="flex flex-col items-center mb-6">
          <img
            src={displayUser.image}
            alt="Avatar"
            className="w-24 h-24 rounded-full border-2 border-[#102A83] object-cover"
          />
          <button
            className="mt-4 px-4 py-2 bg-[#102A83] text-white rounded-full hover:bg-[#009EE0] transition duration-300"
            onClick={handleChangeAvatar}
          >
            Thay đổi ảnh đại diện
          </button>
        </div>

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
              {formatDateOfBirth(displayUser.dateOfBirth)}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <span className="text-gray-600 font-medium">Địa chỉ:</span>
            <span className="text-[#102A83]">{displayUser.address}</span>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            className="px-6 py-2 bg-[#102A83] text-white rounded-full hover:bg-[#102A83] transition duration-300"
            onClick={handleUpdate}
          >
            Chỉnh sửa thông tin
          </button>
        </div>

        {isEditModalVisible && (
          <EditProfileModal
            user={displayUser}
            visible={isEditModalVisible}
            onSave={handleSaveChanges}
            onClose={handleCloseModal}
          />
        )}

        {isChangeAvatarModalVisible && (
          <ChangeAvatarModal
            visible={isChangeAvatarModalVisible}
            onClose={handleCloseAvatarModal}
            userId={displayUser.userId}
            currentImage={displayUser.image}
            onAvatarChange={handleAvatarChange}
          />
        )}
      </div>
    </div>
  );
}

export default MyProfile;
