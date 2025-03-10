import React from "react";
import { Modal, Descriptions } from "antd";
import { DiseaseResponseDTO } from "../../models/Disease";

interface ViewDiseaseModalProps {
  disease: DiseaseResponseDTO;
  visible: boolean;
  onClose: () => void;
}

const ViewDiseaseModal: React.FC<ViewDiseaseModalProps> = ({
  disease,
  visible,
  onClose,
}) => {
  return (
    <Modal
      title="CHI TIẾT BỆNH"
      open={visible}
      onCancel={onClose}
      footer={null}
    >
      <Descriptions bordered column={1}>
        <Descriptions.Item label="ID">{disease.diseaseId}</Descriptions.Item>
        <Descriptions.Item label="Tên bệnh">{disease.name}</Descriptions.Item>
        <Descriptions.Item label="Mô tả">{disease.description}</Descriptions.Item>
      </Descriptions>
    </Modal>
  );
};

export default ViewDiseaseModal;