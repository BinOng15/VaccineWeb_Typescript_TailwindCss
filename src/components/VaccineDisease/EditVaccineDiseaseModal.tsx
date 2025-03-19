/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Modal, Form, Select, Button, message } from "antd";
import vaccineDiseaseService from "../../service/vaccineDiseaseService";
import vaccineService from "../../service/vaccineService";
import diseaseService from "../../service/diseaseService";
import { UpdateVaccineDiseaseDTO, VaccineDiseaseResponseDTO } from "../../models/VaccineDisease";
import { VaccineResponseDTO } from "../../models/Vaccine";
import { DiseaseResponseDTO } from "../../models/Disease";

const { Option } = Select;

interface EditVaccineDiseaseModalProps {
    vaccineDisease: VaccineDiseaseResponseDTO;
    visible: boolean;
    onClose: () => void;
    refreshVaccineDiseases: () => void;
}

const EditVaccineDiseaseModal: React.FC<EditVaccineDiseaseModalProps> = ({
    vaccineDisease,
    visible,
    onClose,
    refreshVaccineDiseases,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [vaccines, setVaccines] = useState<VaccineResponseDTO[]>([]);
    const [diseases, setDiseases] = useState<DiseaseResponseDTO[]>([]);

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
                message.error("Failed to load vaccines or diseases!");
            } finally {
                setLoading(false);
            }
        };
        if (visible) {
            fetchData();
        }
    }, [visible]);

    // Khởi tạo form với dữ liệu hiện tại
    useEffect(() => {
        if (visible && vaccineDisease) {
            form.setFieldsValue({
                vaccineId: vaccineDisease.vaccineId,
                diseaseId: vaccineDisease.diseaseId,
            });
        }
    }, [vaccineDisease, visible, form]);

    const handleSubmit = async (values: any) => {
        setLoading(true);
        try {
            const vaccineDiseaseData: UpdateVaccineDiseaseDTO = {
                vaccineId: values.vaccineId,
                diseaseId: values.diseaseId,
            };

            console.log("Updated Vaccine-Disease Data to Send:", vaccineDiseaseData);
            const success = await vaccineDiseaseService.updateVaccineDisease(
                vaccineDisease.vaccineDiseaseId,
                vaccineDiseaseData
            );
            if (success) {
                message.success("Vaccine-Disease relationship updated successfully");
                refreshVaccineDiseases();
                onClose();
            } else {
                message.error("Failed to update vaccine-disease relationship");
            }
        } catch (error) {
            console.error("Error updating vaccine-disease:", error);
            message.error("Failed to update vaccine-disease: " + (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title="Chỉnh sửa mối quan hệ Bệnh - Vắc xin"
            visible={visible}
            onCancel={handleCancel}
            footer={null}
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
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

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Cập nhật
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditVaccineDiseaseModal;