import React from "react";
import { DatePicker, Button } from "antd";
import VaccineRegistration from "../../components/VaccineRegist/VaccineRegistration";
import VaccineSelection from "../../components/VaccineRegist/VaccineSelection";
import { useNavigate } from "react-router-dom";

const VaccineRegistationPage: React.FC = () => {
  const navigate = useNavigate();

  const handleHome = (): void => {
    navigate("/Payment"); // This will navigate to the home page
  };
  //
  return (
    <>
      <div className="mb-10 max-w-3xl mx-auto">
        <VaccineRegistration />
        <VaccineSelection />
        <div className="px-6 block text-sm font-medium text-gray-700 ">
          <label className="block mb-3">
            <span className="text-red-500">*</span>Ngày mong muốn tiêm
          </label>
          <DatePicker style={{ width: "100%" }} placeholder="Ngày/tháng/năm" />
          <Button
            onClick={handleHome}
            type="primary"
            style={{ marginTop: "20px", width: "100%" }}
          >
            Đăng ký tiêm{" "}
          </Button>
        </div>
      </div>
    </>
  );
};

export default VaccineRegistationPage;
