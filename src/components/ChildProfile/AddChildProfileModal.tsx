/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Modal,
  Form,
  Input as AntInput,
  message,
  Select,
  Upload,
  Button,
  DatePicker,
} from "antd";
import {
  CreateChildProfileDTO,
  ChildProfileResponseDTO,
} from "../../models/ChildProfile";
import childProfileService from "../../service/childProfileService";
import vaccineProfileService from "../../service/vaccineProfileService";
import { getCurrentUser } from "../../service/authService";
import { Gender, Relationship } from "../../models/Type/enum";
import { UploadOutlined } from "@ant-design/icons";
import { CreateVaccineProfileDTO } from "../../models/VaccineProfile";
import dayjs from "dayjs"; // Import dayjs thay vì moment

const { Option } = Select;
const { Item } = Form;

interface AddChildProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddChildProfileModal: React.FC<AddChildProfileModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  const getToken = () => {
    return (
      localStorage.getItem("token") || sessionStorage.getItem("accessToken")
    );
  };

  // Hàm để vô hiệu hóa các ngày trong tương lai với dayjs
  const disabledDate = (current: dayjs.Dayjs) => {
    // Không cho phép chọn ngày sau ngày hiện tại
    return current && current.isAfter(dayjs(), "day");
  };

  const handleSaveAdd = async (values: any) => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) throw new Error("Không tìm thấy token!");

      const userData = await getCurrentUser(token);
      if (!userData) throw new Error("Không tìm thấy dữ liệu người dùng!");

      // Validation
      if (!values.fullName?.trim()) {
        throw new Error("Vui lòng nhập họ và tên!");
      }
      if (values.fullName.trim().length > 50) {
        throw new Error("Tên trẻ không được dài quá 50 ký tự!");
      }

      if (!values.dateOfBirth) {
        throw new Error("Vui lòng chọn ngày sinh!");
      }
      const dateOfBirthDayjs = values.dateOfBirth;
      if (!dateOfBirthDayjs.isValid()) {
        throw new Error("Ngày sinh không hợp lệ!");
      }
      // Backend mong đợi định dạng "dd/MM/yyyy"
      const formattedDate = dateOfBirthDayjs.format("YYYY-MM-DD"); // Thay thành '2025-03-14'
      console.log("Formatted DateOfBirth:", formattedDate);

      if (!values.gender && values.gender !== 0) {
        throw new Error("Vui lòng chọn giới tính!");
      }

      if (!values.relationship && values.relationship !== 0) {
        throw new Error("Vui lòng chọn mối quan hệ!");
      }

      if (!values.profilePicture || !values.profilePicture.file) {
        throw new Error("Vui lòng tải lên hình ảnh của trẻ!");
      }

      // Tạo DTO
      const newChildProfile: CreateChildProfileDTO = {
        userId: userData.userId,
        fullName: values.fullName.trim(),
        dateOfBirth: formattedDate, // Định dạng "dd/MM/yyyy"
        gender: values.gender,
        relationship: values.relationship,
        profilePicture: values.profilePicture.file,
      };

      console.log("Sending child profile data:", newChildProfile);

      // Gửi request tạo child profile
      const childProfileResponse: ChildProfileResponseDTO =
        await childProfileService.createChildProfile(newChildProfile);
      const childId = childProfileResponse.childId;
      console.log("Created childId:", childId);

      // Tạo vaccine profile
      const newVaccineProfile: CreateVaccineProfileDTO = {
        childId: childId,
      };
      console.log("Creating vaccine profile with data:", newVaccineProfile);
      await vaccineProfileService.createVaccineProfile(newVaccineProfile);

      message.success("Thêm mới hồ sơ trẻ và hồ sơ vaccine thành công");
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Lỗi khi thêm hồ sơ:", error);
      if (error.response) {
        console.error("Response status:", error.response.status);
        console.error("Response data:", error.response.data);
      }
      message.error(
        `Thêm hồ sơ thất bại! ${
          error.response?.data?.message || (error as Error).message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Thêm hồ sơ trẻ"
      visible={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Lưu"
      centered
      cancelText="Hủy"
      style={{
        top: "43%",
        transform: "translate(0%, -50%)",
        margin: 0,
      }}
      confirmLoading={loading}
    >
      <Form
        form={form}
        name="addChildProfile"
        onFinish={handleSaveAdd}
        layout="vertical"
      >
        <Item
          name="fullName"
          label="Họ và tên"
          rules={[
            { required: true, message: "Vui lòng nhập họ và tên!" },
            { max: 50, message: "Tên trẻ không được dài quá 50 ký tự!" },
          ]}
        >
          <AntInput placeholder="Nhập họ và tên" />
        </Item>
        <Item
          name="dateOfBirth"
          label="Ngày sinh"
          rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
        >
          <DatePicker
            format="DD/MM/YYYY" // Hiển thị và gửi theo định dạng backend yêu cầu
            style={{ width: "100%" }}
            placeholder="Chọn ngày sinh"
            disabledDate={disabledDate} // Giới hạn ngày không cho chọn sau ngày hiện tại
            onChange={(date) =>
              console.log(
                "Selected Date:",
                date ? date.format("DD/MM/YYYY") : null
              )
            }
          />
        </Item>
        <Item
          name="gender"
          label="Giới tính"
          rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
        >
          <Select placeholder="Chọn giới tính">
            <Option value={Gender.Male}>Nam</Option>
            <Option value={Gender.Female}>Nữ</Option>
            <Option value={Gender.Unknown}>Không xác định</Option>
          </Select>
        </Item>
        <Item
          name="relationship"
          label="Mối quan hệ"
          rules={[{ required: true, message: "Vui lòng chọn mối quan hệ!" }]}
        >
          <Select placeholder="Chọn mối quan hệ">
            <Option value={Relationship.Mother}>Mẹ</Option>
            <Option value={Relationship.Father}>Bố</Option>
            <Option value={Relationship.Guardian}>Người giám hộ</Option>
          </Select>
        </Item>
        <Item
          label="Hình ảnh"
          name="profilePicture"
          rules={[{ required: true, message: "Hãy tải lên hình ảnh của trẻ!" }]}
        >
          <Upload beforeUpload={() => false} maxCount={1} accept="image/*">
            <Button icon={<UploadOutlined />}>Tải lên</Button>
          </Upload>
        </Item>
      </Form>
    </Modal>
  );
};

export default AddChildProfileModal;
