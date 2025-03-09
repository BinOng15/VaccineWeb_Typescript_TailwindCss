// /* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useState } from "react";
// import { Modal, Form, Upload, Button, message } from "antd";
// import { UserResponseDTO, UpdateUserDTO } from "../../models/User";
// import userService from "../../service/userService";
// import { UploadOutlined } from "@ant-design/icons";
// import { RcFile, UploadChangeParam } from "antd/es/upload/interface";

// const { Item } = Form;

// interface EditUserImgModalProps {
//   visible: boolean;
//   onClose: () => void;
//   user: UserResponseDTO | null;
//   onSuccess: () => void;
// }

// const EditUserImgModal: React.FC<EditUserImgModalProps> = ({
//   visible,
//   onClose,
//   user,
//   onSuccess,
// }) => {
//   const [form] = Form.useForm();
//   const [loading, setLoading] = useState<boolean>(false);
//   const [file, setFile] = useState<RcFile | null>(null);

//   // Lấy token để xác thực
//   const getToken = () => {
//     return (
//       localStorage.getItem("token") || sessionStorage.getItem("accessToken")
//     );
//   };

//   // Hàm xử lý upload file lên server
//   const handleUpload = async (file: RcFile): Promise<string> => {
//     const formData = new FormData();
//     formData.append("file", file);

//     try {
//       const response = await fetch("/upload", {
//         method: "POST",
//         body: formData,
//         headers: {
//           Authorization: `Bearer ${getToken()}`,
//         },
//       });

//       if (!response.ok) {
//         throw new Error("Upload failed");
//       }

//       const data = await response.json();
//       return data.url; // Giả định API trả về { url: "https://example.com/image.jpg" }
//     } catch (error) {
//       message.error("Không thể upload hình ảnh: " + (error as Error).message);
//       throw error;
//     }
//   };

//   // Xử lý lưu ảnh mới
//   const handleSaveImage = async () => {
//     setLoading(true);
//     try {
//       if (!file) {
//         throw new Error("Vui lòng chọn hình ảnh!");
//       }
//       if (!user) {
//         throw new Error("Không tìm thấy thông tin người dùng!");
//       }

//       const imageUrl = await handleUpload(file);
//       const userData: UpdateUserDTO = {
//         fullName: user.fullName,
//         email: user.email,
//         password: "", // Không thay đổi mật khẩu
//         phoneNumber: user.phoneNumber,
//         image: file, // Gửi file trực tiếp theo DTO
//         address: user.address || undefined, // Đảm bảo address là tùy chọn
//         dateOfBirth: user.dateOfBirth,
//         role: parseInt(user.role), // Chuyển role từ string sang number
//       };

//       const success = await userService.updateUser(user.userId, userData);
//       if (success) {
//         message.success("Cập nhật ảnh đại diện thành công");
//         onSuccess(); // Reload dữ liệu
//         onClose(); // Đóng modal
//       } else {
//         throw new Error("Cập nhật không thành công");
//       }
//     } catch (error) {
//       console.error("Lỗi khi cập nhật ảnh đại diện:", error);
//       message.error("Không thể cập nhật ảnh: " + (error as Error).message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Xử lý khi file thay đổi
//   const handleFileChange = (info: UploadChangeParam) => {
//     if (info.file.status === "removed") {
//       setFile(null);
//     } else if (info.file.originFileObj) {
//       setFile(info.file.originFileObj as RcFile);
//     }
//   };

//   return (
//     <Modal
//       title="Thay đổi ảnh đại diện"
//       visible={visible}
//       onCancel={() => {
//         onClose();
//         setFile(null); // Reset file khi đóng modal
//       }}
//       onOk={handleSaveImage}
//       okText="Lưu"
//       confirmLoading={loading}
//     >
//       <Form form={form} layout="vertical">
//         <Item
//           label="Hình ảnh"
//           name="image"
//           rules={[{ required: true, message: "Hãy tải lên hình ảnh!" }]}
//         >
//           <Upload
//             beforeUpload={() => false} // Ngăn upload tự động
//             maxCount={1}
//             accept="image/*"
//             onChange={handleFileChange}
//             fileList={
//               file
//                 ? [
//                     {
//                       uid: "-1",
//                       name: file.name,
//                       status: "done",
//                       originFileObj: file,
//                     },
//                   ]
//                 : []
//             }
//           >
//             <Button icon={<UploadOutlined />}>Tải lên</Button>
//           </Upload>
//         </Item>
//       </Form>
//     </Modal>
//   );
// };

// export default EditUserImgModal;
