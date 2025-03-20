/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Modal, Form, Select, Button, notification } from "antd";
import vaccineDiseaseService from "../../service/vaccineDiseaseService";
import vaccineService from "../../service/vaccineService";
import diseaseService from "../../service/diseaseService";
import { CreateVaccineDiseaseDTO } from "../../models/VaccineDisease";
import { VaccineResponseDTO } from "../../models/Vaccine";
import { DiseaseResponseDTO } from "../../models/Disease";

const { Option } = Select;

interface AddVaccineDiseaseModalProps {
    visible: boolean;
    onClose: () => void;
    refreshVaccineDiseases: () => void;
}

const AddVaccineDiseaseModal: React.FC<AddVaccineDiseaseModalProps> = ({
    visible,
    onClose,
    refreshVaccineDiseases,
}) => {
    const [form] = Form.useForm();
    const [vaccines, setVaccines] = useState<VaccineResponseDTO[]>([]);
    const [diseases, setDiseases] = useState<DiseaseResponseDTO[]>([]);
    const [loading, setLoading] = useState(false);

    // Lấy danh sách vaccine và disease khi modal mở
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const vaccineList = await vaccineService.getAllVaccines();
                const diseaseList = await diseaseService.getAllDiseases();
                setVaccines(vaccineList);
                setDiseases(diseaseList);
            } catch (error) {
                console.error("Error fetching vaccines or diseases:", error);
                notification.error({
                    message: "Error",
                    description: "Failed to load vaccines or diseases!",
                });
            } finally {
                setLoading(false);
            }
        };
        if (visible) {
            fetchData();
        }
    }, [visible]);

    const handleSubmit = async (values: any) => {
        try {
            const vaccineDiseaseData: CreateVaccineDiseaseDTO = {
                vaccineId: values.vaccineId,
                diseaseId: values.diseaseId,
            };

            console.log("Vaccine-Disease Data to Send:", vaccineDiseaseData);
            await vaccineDiseaseService.createVaccineDisease(vaccineDiseaseData);
            notification.success({
                message: "Success",
                description: "Mối quan hệ giữa đã được tạo thành công!",
            });

            form.resetFields();
            refreshVaccineDiseases();
            onClose();
        } catch (error: any) {
            console.error("Error creating vaccine-disease:", error.response?.data);
            notification.error({
                message: "Error",
                description: error?.response?.data?.message || "Có lỗi khi tạo mối quan hệ!",
            });
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title="Tạo mới mối quan hệ Bệnh - Vắc xin"
            open={visible}
            onCancel={handleCancel}
            footer={null}
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                    label="Bệnh"
                    name="diseaseId"
                    rules={[{ required: true, message: "Hãy chọn bệnh!" }]}
                >
                    <Select
                        placeholder="Chọn bệnh"
                        loading={loading}
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {diseases.map((disease) => (
                            <Option key={disease.diseaseId} value={disease.diseaseId}>
                                {disease.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    label="Vắc xin"
                    name="vaccineId"
                    rules={[{ required: true, message: "Hãy chọn vắc xin!" }]}
                >
                    <Select
                        placeholder="Chọn vắc xin"
                        loading={loading}
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
                        }
                    >
                        {vaccines.map((vaccine) => (
                            <Option key={vaccine.vaccineId} value={vaccine.vaccineId}>
                                {vaccine.name}
                            </Option>
                        ))}
                    </Select>
                </Form.Item>



                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Xác nhận
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddVaccineDiseaseModal;