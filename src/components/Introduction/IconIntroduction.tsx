import React from "react";
import { FaSyringe, FaTags, FaLock, FaShieldVirus } from "react-icons/fa";

interface Benefit {
  icon: JSX.Element;
  text: string;
}

const benefits: Benefit[] = [
  {
    icon: <FaSyringe className="w-10 h-10 text-blue-900" />,
    text: "Ưu tiên vắc-xin khan hiếm cho khách hàng đã tiêm mũi đầu",
  },
  {
    icon: <FaTags className="w-10 h-10 text-blue-900" />,
    text: "Cung cấp vắc-xin bình ổn giá và trợ giá",
  },
  {
    icon: <FaLock className="w-10 h-10 text-blue-900" />,
    text: "Mũi vắc-xin lẻ sẽ không phát sinh thêm chi phí",
  },
  {
    icon: <FaShieldVirus className="w-10 h-10 text-blue-900" />,
    text: "Không áp dụng tiêm 3 mũi cho trẻ trong 1 lần",
  },
];

const IconIntroduction: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row justify-center items-center gap-28 p-6 rounded-xl  w-full  mx-auto">
      {benefits.map((benefit, index) => (
        <div key={index} className="flex flex-col items-center text-center max-w-[200px]">
          {benefit.icon}
          <p className="mt-3 text-sm font-medium text-gray-900">{benefit.text}</p>
        </div>
        
      ))}
    </div>
    
    
    
  );
};

export default IconIntroduction;
