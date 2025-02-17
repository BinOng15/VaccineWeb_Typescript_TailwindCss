import React from "react";
import { DatePicker, Button } from "antd";
import VaccineRegistration from "../../components/VaccineRegist/VaccineRegistration";
import VaccineSelection from "../../components/VaccineRegist/VaccineSelection";
import { useNavigate } from "react-router-dom";




const MainForm: React.FC = () => { 
  const navigate = useNavigate();

  const handleHome = (): void => {
    navigate('/Payment'); // This will navigate to the home page
  };
//
 return (
    <><div className=" max-w-3xl mx-auto">
    <VaccineRegistration />
    <VaccineSelection />
    <div className="px-6 block text-sm font-medium text-gray-700 ">
         <label className="block mb-3" >*Ngày mong muốn tiêm</label>
    <DatePicker  style={{ width: "100%" }} placeholder="Ngày/tháng/năm" />
    <Button onClick={handleHome} type="primary" style={{ marginTop: "20px", width: "100%" }}>Đăng ký tiêm </Button>
    </div>
   
  </div></>
  
);}




export default MainForm;
