import React, { useState, useEffect } from "react";
import { Upload, Image, message } from "antd";
import type { UploadFile, UploadProps } from "antd";

interface FileUploaderProps {
  onUploadSuccess: (file: File) => void; // Đổi thành File thay vì URL
  defaultImage?: string;
  type?: "image" | "video";
}

const getBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const FileUploader: React.FC<FileUploaderProps> = ({
  onUploadSuccess,
  defaultImage,
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  useEffect(() => {
    if (defaultImage) {
      setFileList([
        { uid: "-1", name: "default_image", url: defaultImage, status: "done" },
      ]);
      setPreviewImage(defaultImage);
    }
  }, [defaultImage]);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as File);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const handleChange: UploadProps["onChange"] = ({ fileList: newFileList }) => {
    setFileList(newFileList);

    // Khi file được chọn, gọi onUploadSuccess với file gốc
    const file = newFileList[0]?.originFileObj as File;
    if (file) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const allowedImageExtensions = ["jpg", "jpeg", "png", "gif"];

      if (!allowedImageExtensions.includes(fileExtension!)) {
        message.error("Invalid file type. Only images are allowed.");
        setFileList([]); // Xóa file không hợp lệ
        return;
      }

      onUploadSuccess(file); // Trả về file gốc
    }
  };

  const uploadProps: UploadProps = {
    beforeUpload: () => false, // Ngăn upload tự động
    fileList,
    onPreview: handlePreview,
    onChange: handleChange,
    listType: "picture-circle",
    showUploadList: {
      showRemoveIcon: true,
    },
    accept: "image/*",
  };

  return (
    <>
      <Upload {...uploadProps}>
        {fileList.length >= 1 ? null : <div>Upload</div>}
      </Upload>
      {previewImage && (
        <Image
          wrapperStyle={{ display: "none" }}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(""),
          }}
          src={previewImage}
        />
      )}
    </>
  );
};

export default FileUploader;
