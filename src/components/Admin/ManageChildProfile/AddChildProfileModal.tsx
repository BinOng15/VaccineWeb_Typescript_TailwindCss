/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Modal, Form, Input, Select, DatePicker, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import moment from "moment";
import { CreateChildProfileDTO } from "../../../models/ChildProfile";
import childProfileService from "../../../service/childProfileService";
import { Gender } from "../../../models/Type/enum";

const { Option } = Select;

interface AddChildProfileModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userId: number; // userId của người dùng hiện tại
}

const AddChildProfileModal: React.FC<AddChildProfileModalProps> = ({
    visible,
    onClose,
    onSuccess,
    userId,
}) => {
    const [form] = Form.useForm();
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const childData: CreateChildProfileDTO = {
                userId: userId,
                fullName: values.fullName,
                dateOfBirth: values.dateOfBirth.format("DD/MM/YYYY"),
                gender: parseInt(values.gender, 10),
                relationship: parseInt(values.relationship, 10),
                profilePicture: file!,
            };

            await childProfileService.createChildProfile(childData);
            message.success("Tạo hồ sơ trẻ em thành công!");
            form.resetFields();
            setFile(null);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Lỗi khi tạo hồ sơ trẻ em:", error);
            message.error("Tạo hồ sơ trẻ em thất bại!");
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
            title="THÊM HỒ SƠ TRẺ EM"
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

                <Form.Item
                    label="Ảnh đại diện"
                    name="profilePicture"
                    rules={[{ required: true, message: "Vui lòng tải lên ảnh đại diện!" }]}
                >
                    <Upload
                        beforeUpload={() => false} // Ngăn upload tự động
                        onChange={handleUploadChange}
                        maxCount={1}
                        accept="image/*"
                    >
                        <Button icon={<UploadOutlined />}>Tải lên ảnh</Button>
                    </Upload>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} block>
                        Tạo hồ sơ
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddChildProfileModal;