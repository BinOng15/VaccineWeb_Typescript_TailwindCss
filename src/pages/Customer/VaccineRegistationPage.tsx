import React, { useState } from "react";
import { DatePicker, Button, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import VaccineRegistration from "../../components/VaccineRegist/VaccineRegistration";
import VaccineSelection from "../../components/VaccineRegist/VaccineSelection";
import MainLayout from "../../components/Layout/MainLayout";

const VaccineRegistationPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleRegister = () => {
    setIsModalOpen(true);
  };

  const handleBackToHome = () => {
    setIsModalOpen(false);
    navigate("/"); // Quay lại trang chủ
  };

  return (
    <MainLayout>
      <div className="mb-10 max-w-3xl mx-auto">
        <VaccineRegistration />
        <VaccineSelection />
        <div className="px-6 block text-sm font-medium text-gray-700">
          <label className="block mb-3">
            <span className="text-red-500">*</span> Ngày mong muốn tiêm
          </label>
          <DatePicker style={{ width: "100%" }} placeholder="Ngày/tháng/năm" />
          <Button
            type="primary"
            style={{ marginTop: "20px", width: "100%" }}
            onClick={handleRegister}
          >
            Đăng ký tiêm
          </Button>
        </div>

        {/* Modal Thông báo */}
        <Modal
          title="Đăng ký thành công"
          open={isModalOpen}
          footer={null}
          onCancel={handleBackToHome}
          centered
        >
          <p className="text-lg">
            Bạn đã đăng ký tiêm thành công, vui lòng theo dõi mail để theo dõi
            lịch tới trung tâm tiêm chủng.
          </p>
          <div className="text-center mt-4">
            <Button type="primary" onClick={handleBackToHome}>
              Quay lại trang chủ
            </Button>
          </div>
        </Modal>
      </div>
    </MainLayout>
  );
};

export default VaccineRegistationPage;
