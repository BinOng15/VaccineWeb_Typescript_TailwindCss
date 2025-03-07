/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from "react";
import { Modal, Form, Input as AntInput, message } from "antd";
import { ChildProfileResponseDTO } from "../../models/ChildProfile";
import { Gender, Relationship } from "../../models/Type/enum";
import moment from "moment";

interface ChildProfileModalProps {
  isDetailModalVisible: boolean;
  isAddModalVisible: boolean;
  isEditModalVisible: boolean;
  selectedChildProfile: ChildProfileResponseDTO | null;
  editedChildProfile: ChildProfileResponseDTO | null;
  onClose: () => void;
  onSaveAdd: (values: any) => void;
  onSaveEdit: (values: any) => void;
  getGenderLabel: (gender: Gender | null) => string;
  getRelationshipLabel: (relationship: Relationship | null) => string;
}

const ChildProfileModal: React.FC<ChildProfileModalProps> = ({
  isDetailModalVisible,
  isAddModalVisible,
  isEditModalVisible,
  selectedChildProfile,
  editedChildProfile,
  onClose,
  onSaveAdd,
  onSaveEdit,
  getGenderLabel,
  getRelationshipLabel,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (isEditModalVisible && editedChildProfile) {
      form.setFieldsValue({
        fullName: editedChildProfile.fullName,
        dateOfBirth: moment(editedChildProfile.dateOfBirth).format(
          "YYYY-MM-DD"
        ),
        gender: editedChildProfile.gender,
        relationship: editedChildProfile.relationship,
        imageUrl: editedChildProfile.imageUrl,
      });
    } else {
      form.resetFields();
    }
  }, [isEditModalVisible, editedChildProfile, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (isAddModalVisible) {
        onSaveAdd(values);
      } else if (isEditModalVisible) {
        onSaveEdit(values);
      }
    } catch (error) {
      console.error("Validation failed:", error);
      message.error("Vui lòng kiểm tra lại thông tin nhập vào!");
    }
  };

  const getModalTitle = () => {
    if (isDetailModalVisible) return "Chi tiết hồ sơ trẻ";
    if (isAddModalVisible) return "Thêm hồ sơ trẻ";
    if (isEditModalVisible) return "Chỉnh sửa hồ sơ trẻ";
    return "";
  };

  const isVisible =
    isDetailModalVisible || isAddModalVisible || isEditModalVisible;

  return (
    <Modal
      title={getModalTitle()}
      visible={isVisible}
      onCancel={onClose}
      onOk={isAddModalVisible || isEditModalVisible ? handleOk : undefined}
      okText={isAddModalVisible || isEditModalVisible ? "Lưu" : undefined}
      footer={isDetailModalVisible ? null : undefined}
    >
      {isDetailModalVisible && selectedChildProfile && (
        <div style={{ padding: 16 }}>
          <p>
            <strong>Họ và tên:</strong> {selectedChildProfile.fullName || "N/A"}
          </p>
          <p>
            <strong>Ngày sinh:</strong>{" "}
            {selectedChildProfile.dateOfBirth &&
            selectedChildProfile.dateOfBirth !== "Chưa có dữ liệu"
              ? moment(selectedChildProfile.dateOfBirth).format("DD/MM/YYYY")
              : selectedChildProfile.dateOfBirth}
          </p>
          <p>
            <strong>Giới tính:</strong>{" "}
            {getGenderLabel(selectedChildProfile.gender)}
          </p>
          <p>
            <strong>Mối quan hệ:</strong>{" "}
            {getRelationshipLabel(selectedChildProfile.relationship)}
          </p>
          <p>
            <strong>Hình ảnh:</strong>{" "}
            {selectedChildProfile.imageUrl ? (
              <img
                src={selectedChildProfile.imageUrl}
                alt={selectedChildProfile.fullName || "Hình ảnh"}
                style={{
                  width: 100,
                  height: 100,
                  objectFit: "contain",
                  marginTop: 8,
                }}
              />
            ) : (
              "N/A"
            )}
          </p>
          <p>
            <strong>Ngày tạo:</strong>{" "}
            {moment(selectedChildProfile.createdDate).format(
              "HH:mm - DD/MM/YYYY"
            ) || "N/A"}
          </p>
          <p>
            <strong>Người tạo:</strong>{" "}
            {selectedChildProfile.createdBy || "N/A"}
          </p>
          <p>
            <strong>Ngày sửa đổi:</strong>{" "}
            {moment(selectedChildProfile.modifiedDate).format(
              "HH:mm - DD/MM/YYYY"
            ) || "N/A"}
          </p>
          <p>
            <strong>Người sửa đổi:</strong>{" "}
            {selectedChildProfile.modifiedBy || "N/A"}
          </p>
          <p>
            <strong>Trạng thái:</strong>{" "}
            {selectedChildProfile.isActive === 1
              ? "Hoạt động"
              : "Không hoạt động"}
          </p>
        </div>
      )}
      {(isAddModalVisible || isEditModalVisible) && (
        <Form
          form={form}
          name={isAddModalVisible ? "addChildProfile" : "editChildProfile"}
          onFinish={isAddModalVisible ? onSaveAdd : onSaveEdit}
          layout="vertical"
        >
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
          >
            <AntInput />
          </Form.Item>
          <Form.Item
            name="dateOfBirth"
            label="Ngày sinh"
            rules={[{ required: true, message: "Vui lòng nhập ngày sinh!" }]}
          >
            <AntInput type="date" />
          </Form.Item>
          <Form.Item
            name="gender"
            label="Giới tính"
            rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
          >
            <AntInput type="select">
              <option value={Gender.Male}>Nam</option>
              <option value={Gender.Female}>Nữ</option>
              <option value={Gender.Unknown}>Không xác định</option>
            </AntInput>
          </Form.Item>
          <Form.Item
            name="relationship"
            label="Mối quan hệ"
            rules={[{ required: true, message: "Vui lòng chọn mối quan hệ!" }]}
          >
            <AntInput type="select">
              <option value={Relationship.Mother}>Mẹ</option>
              <option value={Relationship.Father}>Bố</option>
              <option value={Relationship.Guardian}>Người giám hộ</option>
            </AntInput>
          </Form.Item>
          <Form.Item name="imageUrl" label="Đường dẫn hình ảnh">
            <AntInput placeholder="Nhập URL hình ảnh (tùy chọn)" />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default ChildProfileModal;
