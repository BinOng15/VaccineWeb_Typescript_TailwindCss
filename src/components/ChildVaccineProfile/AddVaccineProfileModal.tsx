/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Modal, Form, message, Select } from "antd";
import { CreateVaccineProfileDTO } from "../../models/VaccineProfile";
import vaccineProfileService from "../../service/vaccineProfileService";
import childProfileService from "../../service/childProfileService";
import { useAuth } from "../../context/AuthContext";
import { ChildProfileResponseDTO } from "../../models/ChildProfile";

const { Option } = Select;
const { Item } = Form;

interface AddVaccineProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddVaccineProfileModal: React.FC<AddVaccineProfileModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [childProfiles, setChildProfiles] = useState<ChildProfileResponseDTO[]>(
    []
  );
  const { user } = useAuth();

  useEffect(() => {
    if (visible) {
      fetchData();
    }
  }, [visible]);

  const fetchData = async () => {
    if (!user) {
      console.error("No user found");
      return;
    }
    try {
      const allChildProfiles = await childProfileService.getAllChildProfiles();
      const userChildProfiles = allChildProfiles.filter(
        (profile) => profile.userId === user.userId
      );
      setChildProfiles(userChildProfiles);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      message.error("Không thể tải dữ liệu: " + (error as Error).message);
    }
  };

  const handleSaveAdd = async (values: any) => {
    setLoading(true);
    try {
      if (!user) throw new Error("No user found");

      const newVaccineProfile: CreateVaccineProfileDTO = {
        childId: values.childId,
      };

      // Tạo VaccineProfile
      await vaccineProfileService.createVaccineProfile(newVaccineProfile);

      message.success(
        "Cập nhật hồ sơ tiêm chủng và lịch tiêm theo hệ thống thành công"
      );
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Lỗi khi cập nhật hồ sơ tiêm chủng theo hệ thống:", error);
      message.error(
        "Không thể cập nhật hồ sơ tiêm chủng: " + (error as Error).message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Cập nhật hồ sơ tiêm chủng theo hệ thống cho trẻ"
      visible={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Lưu"
      centered
      style={{
        transform: "translate(10%, -50%)",
        margin: 0,
      }}
      confirmLoading={loading}
    >
      <Form
        form={form}
        name="addVaccineProfile"
        onFinish={handleSaveAdd}
        layout="vertical"
      >
        <Item
          name="childId"
          label="Họ và tên trẻ"
          rules={[{ required: true, message: "Vui lòng chọn trẻ!" }]}
        >
          <Select placeholder="Chọn trẻ">
            {childProfiles.map((child) => (
              <Option key={child.childId} value={child.childId}>
                {child.fullName}
              </Option>
            ))}
          </Select>
        </Item>
      </Form>
    </Modal>
  );
};

export default AddVaccineProfileModal;
