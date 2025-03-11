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
} from "antd";
import { CreateChildProfileDTO } from "../../models/ChildProfile";
import childProfileService from "../../service/childProfileService";
import { getCurrentUser } from "../../service/authService";
import moment from "moment";
import { Gender, Relationship } from "../../models/Type/enum";
import { UploadOutlined } from "@ant-design/icons";
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

  // Lấy token để xác thực
  const getToken = () => {
    return (
      localStorage.getItem("token") || sessionStorage.getItem("accessToken")
    );
  };

  // Xử lý lưu thêm mới
  const handleSaveAdd = async (values: any) => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) throw new Error("No token found");

      const userData = await getCurrentUser(token);
      if (!userData) throw new Error("No user data found");

      const newChildProfile: CreateChildProfileDTO = {
        userId: userData.userId,
        fullName: values.fullName,
        dateOfBirth: values.dateOfBirth
          ? moment(values.dateOfBirth).format("YYYY-MM-DDTHH:mm:ss")
          : null,
        gender: values.gender,
        relationship: values.relationship,
        profilePicture: values.profilePicture.file || "",
      };

      await childProfileService.createChildProfile(newChildProfile);
      message.success("Thêm mới hồ sơ trẻ thành công");
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Lỗi khi thêm hồ sơ trẻ:", error);
      message.error("Không thể thêm hồ sơ trẻ: " + (error as Error).message);
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
          rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
        >
          <AntInput />
        </Item>
        <Item
          name="dateOfBirth"
          label="Ngày sinh"
          rules={[{ required: true, message: "Vui lòng nhập ngày sinh!" }]}
        >
          <AntInput type="date" />
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
          <Upload
            beforeUpload={() => false}
            maxCount={1}
            accept="profilePicture/*"
          >
            <Button icon={<UploadOutlined />}>Tải lên</Button>
          </Upload>
        </Item>
      </Form>
    </Modal>
  );
};

export default AddChildProfileModal;
