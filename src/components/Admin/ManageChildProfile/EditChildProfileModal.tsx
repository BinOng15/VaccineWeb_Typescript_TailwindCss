/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Modal, Form, Input, Select, DatePicker, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import moment from "moment";
import { UpdateChildProfileDTO, ChildProfileResponseDTO } from "../../../models/ChildProfile";
import childProfileService from "../../../service/childProfileService";
import { Gender } from "../../../models/Type/enum";

const { Option } = Select;

interface EditChildProfileModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    profile: ChildProfileResponseDTO | null;
}

const EditChildProfileModal: React.FC<EditChildProfileModalProps> = ({
    visible,
    onClose,
    onSuccess,
    profile,
}) => {
    const [form] = Form.useForm();
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (profile) {
            form.setFieldsValue({
                fullName: profile.fullName,
                dateOfBirth: profile.dateOfBirth
                    ? moment(profile.dateOfBirth, "DD/MM/YYYY")
                    : null,
                gender: profile.gender.toString(),
                relationship: profile.relationship.toString(),
            });
        }
    }, [profile, form]);

    const handleSubmit = async (values: any) => {
        if (!profile) return;

        setLoading(true);
        try {
            const childData: UpdateChildProfileDTO = {
                fullName: values.fullName,
                dateOfBirth: values.dateOfBirth
                    ? values.dateOfBirth.format("DD/MM/YYYY")
                    : undefined,
                gender: values.gender ? parseInt(values.gender, 10) : undefined,
                relationship: values.relationship
                    ? parseInt(values.relationship, 10)
                    : undefined,
                profilePicture: file || undefined,
            };

            await childProfileService.updateChildProfile(profile.childId, childData);
            message.success("Cập nhật hồ sơ trẻ em thành công!");
            form.resetFields();
            setFile(null);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Lỗi khi cập nhật hồ sơ trẻ em:", error);
            message.error("Cập nhật hồ sơ trẻ em thất bại!");
        } finally {
            setLoading(false);
        }
    };

    const handleUploadChange = (info: any) => {
        if (info.fileList.length > 0) {
            setFile(info.fileList[0].originFileObj);
        } else {
            setFile(null);
        }
    };

    return (
        <Modal
            title="CHỈNH SỬA HỒ SƠ TRẺ EM"
            visible={visible}
            onCancel={onClose}
            footer={null}
            centered
        >
            <Form form={form} onFinish={handleSubmit} layout="vertical">
                <Form.Item
                    label="Họ và tên"
                    name="fullName"
                    rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
                >
                    <Input placeholder="Nhập họ và tên" />
                </Form.Item>

                <Form.Item
                    label="Ngày sinh"
                    name="dateOfBirth"
                    rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
                >
                    <DatePicker
                        format="DD/MM/YYYY"
                        placeholder="Chọn ngày sinh"
                        style={{ width: "100%" }}
                        disabledDate={(current) =>
                            current && current > moment().endOf("day")
                        }
                    />
                </Form.Item>

                <Form.Item
                    label="Giới tính"
                    name="gender"
                    rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
                >
                    <Select placeholder="Chọn giới tính">
                        <Option value={Gender.Male.toString()}>Nam</Option>
                        <Option value={Gender.Female.toString()}>Nữ</Option>
                        <Option value={Gender.Unknown.toString()}>Không xác định</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Mối quan hệ với phụ huynh"
                    name="relationship"
                    rules={[{ required: true, message: "Vui lòng chọn mối quan hệ!" }]}
                >
                    <Select placeholder="Chọn mối quan hệ">
                        <Option value="1">Mẹ</Option>
                        <Option value="2">Bố</Option>
                        <Option value="3">Người giám hộ</Option>
                    </Select>
                </Form.Item>

                <Form.Item label="Ảnh đại diện" name="profilePicture">
                    <Upload
                        beforeUpload={() => false} // Ngăn upload tự động
                        onChange={handleUploadChange}
                        maxCount={1}
                        accept="image/*"
                        defaultFileList={
                            profile?.imageUrl
                                ? [
                                    {
                                        uid: "-1",
                                        name: "image.png",
                                        status: "done",
                                        url: profile.imageUrl,
                                    },
                                ]
                                : []
                        }
                    >
                        <Button icon={<UploadOutlined />}>Tải lên ảnh</Button>
                    </Upload>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Cập nhật hồ sơ
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditChildProfileModal;