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

  const handleSaveAdd = async (values: any) => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) throw new Error("No token found");

      const userData = await getCurrentUser(token);
      if (!userData) throw new Error("No user data found");

      if (
        !values.fullName ||
        !values.dateOfBirth ||
        !values.gender ||
        !values.relationship ||
        !values.profilePicture
      ) {
        throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      }

      console.log(
        "Raw values.dateOfBirth from DatePicker:",
        values.dateOfBirth
      );
      if (!values.dateOfBirth) {
        throw new Error("Ngày sinh không hợp lệ. Vui lòng chọn ngày sinh!");
      }

      // values.dateOfBirth đã là moment object từ DatePicker
      const dateOfBirthMoment = values.dateOfBirth;
      console.log(
        "Moment dateOfBirth after selection:",
        dateOfBirthMoment.format("DD-MM-YYYY")
      );

      if (!dateOfBirthMoment.isValid()) {
        throw new Error("Ngày sinh không hợp lệ!");
      }

      const formattedDate = dateOfBirthMoment.format("YYYY-MM-DD");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
        throw new Error("Ngày sinh phải có định dạng yyyy-MM-dd!");
      }
      const newChildProfile: CreateChildProfileDTO = {
        userId: userData.userId,
        fullName: values.fullName,
        dateOfBirth: formattedDate,
        gender: values.gender,
        relationship: values.relationship,
        profilePicture: values.profilePicture.file, // Đã bắt buộc
      };

      // Validate FullName length
      if (newChildProfile.fullName.length > 50) {
        throw new Error("Tên trẻ không được dài quá 50 ký tự!");
      }

      console.log("Sending child profile data:", newChildProfile);

      const childProfileResponse: ChildProfileResponseDTO =
        await childProfileService.createChildProfile(newChildProfile);
      const childId = childProfileResponse.childId;
      console.log("Created childId:", childId);

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
      message.error("Không thể thêm hồ sơ: " + (error as Error).message);
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
          <AntInput />
        </Item>
        <Item
          name="dateOfBirth"
          label="Ngày sinh"
          rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
        >
          <DatePicker
            format="DD-MM-YYYY"
            style={{ width: "100%" }}
            placeholder="Chọn ngày sinh"
            onChange={(date) => {
              console.log(
                "Selected Date:",
                date ? date.format("DD-MM-YYYY") : null
              );
            }}
          />
        </Item>
        <Item
          name="gender"
          label="Giới tính"
          rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
        >
          <Select>
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
          <Select>
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
