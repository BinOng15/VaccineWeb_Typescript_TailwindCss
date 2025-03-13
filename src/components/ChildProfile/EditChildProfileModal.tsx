/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
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
  ChildProfileResponseDTO,
  UpdateChildProfileDTO,
} from "../../models/ChildProfile";
import childProfileService from "../../service/childProfileService";
import moment from "moment";
import { Gender, Relationship } from "../../models/Type/enum";
import { UploadOutlined } from "@ant-design/icons";

const { Item } = Form;
const { Option } = Select;

interface EditChildProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  childProfile: ChildProfileResponseDTO | null;
}

const EditChildProfileModal: React.FC<EditChildProfileModalProps> = ({
  visible,
  onClose,
  onSuccess,
  childProfile,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  // Điền dữ liệu vào form khi mở modal
  useEffect(() => {
    if (visible && childProfile) {
      console.log("Raw childProfile.dateOfBirth:", childProfile.dateOfBirth);
      // Thử các định dạng khác nhau để parse dateOfBirth
      const dateOfBirthMoment = moment(
        childProfile.dateOfBirth,
        ["DD/MM/YYYY", "YYYY-MM-DD", "DD-MM-YYYY"],
        true
      );
      console.log(
        "Moment dateOfBirth:",
        dateOfBirthMoment.format("DD-MM-YYYY")
      );
      form.setFieldsValue({
        fullName: childProfile.fullName,
        dateOfBirth: dateOfBirthMoment.isValid() ? dateOfBirthMoment : null,
        gender: childProfile.gender,
        relationship: childProfile.relationship,
        imageUrl: childProfile.imageUrl,
      });
    }
  }, [visible, childProfile, form]);

  // Xử lý lưu chỉnh sửa
  const handleSaveEdit = async (values: any) => {
    setLoading(true);
    if (!childProfile) return;
    const token = getToken();
    if (!token) {
      throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại!");
    }
    try {
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

      const updatedChildProfile: UpdateChildProfileDTO = {
        fullName: values.fullName,
        dateOfBirth: formattedDate,
        gender: values.gender,
        relationship: values.relationship,
        profilePicture: values.profilePicture?.file || "",
      };

      console.log("Sending updated child profile data:", updatedChildProfile);

      await childProfileService.updateChildProfile(
        childProfile.childId,
        updatedChildProfile
      );
      message.success("Cập nhật hồ sơ trẻ thành công");
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật hồ sơ trẻ:", error);
      message.error(
        "Không thể cập nhật hồ sơ trẻ: " + (error as Error).message
      );
    } finally {
      setLoading(false);
    }
  };

  // Lấy token
  const getToken = () => {
    return (
      localStorage.getItem("token") || sessionStorage.getItem("accessToken")
    );
  };

  return (
    <Modal
      title="Chỉnh sửa hồ sơ trẻ"
      visible={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Lưu"
      cancelText="Hủy"
      style={{
        top: "43%",
        transform: "translate(0%, -50%)",
        margin: 0,
      }}
      centered
      confirmLoading={loading}
    >
      <Form
        form={form}
        name="editChildProfile"
        onFinish={handleSaveEdit}
        layout="vertical"
      >
        <Item
          label="Hình ảnh"
          name="profilePicture"
          rules={[{ required: true, message: "Hãy tải lên hình ảnh của trẻ!" }]}
        >
          <Upload beforeUpload={() => false} maxCount={1} accept="image/*">
            <Button icon={<UploadOutlined />}>Tải lên</Button>
          </Upload>
        </Item>
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
      </Form>
    </Modal>
  );
};

export default EditChildProfileModal;
