import React from "react";
import { DatePicker, Button } from "antd";
import VaccineRegistration from "../../components/VaccineRegist/VaccineRegistration";
import VaccineSelection from "../../components/VaccineRegist/VaccineSelection";

const MainForm: React.FC = () => (
  <div className=" max-w-3xl mx-auto">
    <VaccineRegistration />
    <VaccineSelection />
    <div className="px-6 block text-sm font-medium text-gray-700 ">
         <label className="block mb-3" >*Ngày mong muốn tiêm</label>
    <DatePicker  style={{ width: "100%" }} placeholder="Ngày/tháng/năm" />
    <Button type="primary" style={{ marginTop: "20px", width: "100%" }}>Đăng ký tiêm</Button>
    </div>
   
  </div>
);

export default MainForm;
