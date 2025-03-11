/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Modal, Form, Input as AntInput, message, Select } from "antd";
import { CreateVaccineProfileDTO } from "../../models/VaccineProfile";
import vaccineProfileService from "../../service/vaccineProfileService";
import childProfileService from "../../service/childProfileService";
import diseaseService from "../../service/diseaseService";
import { useAuth } from "../../context/AuthContext";
import moment from "moment";
import { ChildProfileResponseDTO } from "../../models/ChildProfile";
import { DiseaseResponseDTO } from "../../models/Disease";
import { IsCompleted } from "../../models/Type/enum";
import vaccineSchedulePersonalService from "../../service/vaccineSchedulePersonalService";

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
  const [diseases, setDiseases] = useState<DiseaseResponseDTO[]>([]);
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

      const allDiseases = await diseaseService.getAllDiseases();
      setDiseases(allDiseases);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      message.error("Không thể tải dữ liệu: " + (error as Error).message);
    }
  };

  const handleSaveAdd = async (values: any) => {
    setLoading(true);
    try {
      if (!user) throw new Error("No user found");

      // Chuyển vaccinationDate sang đúng định dạng
      const formattedDate = values.vaccinationDate
        ? moment(values.vaccinationDate).format("YYYY-MM-DDTHH:mm:ss")
        : null;

      const newVaccineProfile: CreateVaccineProfileDTO = {
        childId: values.childId,
        diseaseId: values.diseaseId,
        vaccinationDate: formattedDate,
        isCompleted: values.isCompleted,
      };

      // Tạo VaccineProfile
      await vaccineProfileService.createVaccineProfile(newVaccineProfile);

      // Sau khi tạo VaccineProfile thành công, tạo lịch tiêm chủng cho trẻ
      await vaccineSchedulePersonalService.addVaccineScheduleForChild(
        values.childId
      );

      message.success("Thêm mới hồ sơ tiêm chủng và lịch tiêm thành công");
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Lỗi khi thêm hồ sơ tiêm chủng:", error);
      message.error(
        "Không thể thêm hồ sơ tiêm chủng: " + (error as Error).message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Thêm hồ sơ tiêm chủng cho trẻ"
      visible={visible}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Lưu"
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
        <Item
          name="diseaseId"
          label="Bệnh đã tiêm"
          rules={[{ required: true, message: "Vui lòng chọn bệnh!" }]}
        >
          <Select placeholder="Chọn bệnh">
            {diseases.map((disease) => (
              <Option key={disease.diseaseId} value={disease.diseaseId}>
                {disease.name}
              </Option>
            ))}
          </Select>
        </Item>
        <Item
          name="vaccinationDate"
          label="Ngày tiêm"
          rules={[{ required: true, message: "Vui lòng nhập ngày tiêm!" }]}
        >
          <AntInput type="date" />
        </Item>
        <Item
          name="isCompleted"
          label="Trạng thái"
          rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
        >
          <Select placeholder="Chọn trạng thái">
            <Option value={IsCompleted.No}>Chưa tiêm</Option>
            <Option value={IsCompleted.Yes}>Đã tiêm</Option>
          </Select>
        </Item>
      </Form>
    </Modal>
  );
};

export default AddVaccineProfileModal;
