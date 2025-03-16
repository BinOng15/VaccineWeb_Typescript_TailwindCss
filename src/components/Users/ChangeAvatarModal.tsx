import React, { useState } from "react";
import { Modal, message } from "antd";
import FileUploader from "../../util/FileUploader";
import userService from "../../service/userService";

interface ChangeAvatarModalProps {
  visible: boolean;
  onClose: () => void;
  userId: number;
  currentImage: string;
  onAvatarChange: (newImageUrl: string) => void; // Callback để cập nhật ảnh mới trong MyProfile
}

const ChangeAvatarModal: React.FC<ChangeAvatarModalProps> = ({
  visible,
  onClose,
  userId,
  currentImage,
  onAvatarChange,
}) => {
  const [newImage, setNewImage] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSaveAvatar = async () => {
    if (!newImage) {
      message.error("Vui lòng chọn ảnh mới!");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("Image", newImage);

      // Gửi yêu cầu cập nhật ảnh lên server
      await userService.updateUser(userId, formData);

      // Giả sử API trả về thông tin người dùng đã cập nhật (bao gồm URL ảnh mới)
      const updatedUser = await userService.getUserById(userId);
      const newImageUrl = updatedUser.image || currentImage;

      onAvatarChange(newImageUrl); // Cập nhật ảnh mới trong MyProfile
      message.success("Cập nhật ảnh đại diện thành công!");
      setNewImage(null);
      onClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật ảnh đại diện:", error);
      message.error("Cập nhật ảnh đại diện thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Thay đổi ảnh đại diện"
      open={visible}
      onCancel={() => {
        setNewImage(null);
        onClose();
      }}
      onOk={handleSaveAvatar}
      okText="Lưu"
      confirmLoading={loading}
    >
      <div className="flex flex-col items-center">
        <FileUploader
          onUploadSuccess={(file: File) => setNewImage(file)}
          defaultImage={currentImage}
        />
      </div>
    </Modal>
  );
};

export default ChangeAvatarModal;
