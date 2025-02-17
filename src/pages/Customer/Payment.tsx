import React from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";




const PaymentMethod: React.FC = () => {

   const navigate = useNavigate();

  const handleHome = (): void => {
    navigate('/'); // This will navigate to the home page
  };
//

  return (
    <div className="max-w-4xl mx-auto p-6   rounded-xl">
      <h2 className="text-3xl font-semibold text-center mb-6">THANH TOÁN</h2>
      <p className="text-center mb-6 text-gray-600">
        Hãy lựa chọn phương thức thanh toán cho việc xin của bạn
      </p>

      {/* Phương thức thanh toán */}
      <div className="space-y-4">
        <div className=" bg-white flex items-center justify-start p-4 border border-blue-200 rounded-lg">
        <img 
            src="https://payos.vn/wp-content/uploads/sites/13/2023/07/Untitled-design-8.svg" 
            alt="PayPal" 
            className="mr-4 w-12 h-12"
/>
          <p className="text-lg font-medium">Thanh toán trực tuyến qua PayOs</p>
        </div>
        <div className=" bg-white flex items-center justify-start p-4 border border-blue-200 rounded-lg">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/QR_code_for_mobile_English_Wikipedia.svg/1200px-QR_code_for_mobile_English_Wikipedia.svg.png"
            alt="PayAtCenter"
            className="mr-4 w-12 h-12"
          />
          <p className="text-lg font-medium">Thanh toán trực tiếp tại trung tâm</p>
        </div>
      </div>

      {/* Nút thanh toán */}
      <div className="flex justify-between mt-6">
        <Button type="default" className="w-1/3 text-blue-700" onClick={handleHome}>
          Quay lại
        </Button>
        <Button
          type="primary"
          className="w-1/3 bg-blue-700 hover:bg-blue-600 text-white"
        
        >
          Tiếp tục thanh toán
        </Button>
      </div>
    </div>
  );
};

export default PaymentMethod;
