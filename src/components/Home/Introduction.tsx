import React from "react";
import {
  FaSyringe,
  FaTags,
  FaClinicMedical,
  FaShieldVirus,
} from "react-icons/fa";

const Introduction: React.FC = () => {
  return (
    <div className="bg-blue-100 py-10 relative h-[62vh] p-10">
      <div className="container mx-auto px-6 lg:flex lg:items-center relative">
        {/* Cột trái: Nội dung giới thiệu */}
        <div className="lg:w-1/2 p-10 ml-28">
          <h2 className="text-3xl font-bold text-[#102A83]">Giới thiệu</h2>
          <p className="text-black mt-4">
            Chào mừng quý phụ huynh đến với <strong>Vaccine For Child</strong> –
            nơi bảo vệ sức khỏe và tương lai cho trẻ! Chúng tôi cung cấp dịch vụ
            tiêm chủng vắc xin an toàn, hiệu quả với đội ngũ y bác sĩ tận tâm và
            trang thiết bị hiện đại.
          </p>
          <p className="text-black mt-2">
            <strong>Vaccine For Child</strong> cam kết mang đến trải nghiệm tiêm
            chủng nhẹ nhàng, thân thiện, cùng hệ thống nhắc lịch thông minh,
            giúp trẻ phát triển khỏe mạnh, ngăn ngừa bệnh tật.
          </p>
          <p className="font-semibold text-blue-800 mt-2">
            Vaccine For Child – Đồng hành vì sức khỏe con bạn!
          </p>
          <button className="mt-4 px-5 py-2 bg-[#102A83] text-white rounded-full flex items-center space-x-2">
            <span>📘</span>
            <span>Tìm hiểu thêm</span>
          </button>
        </div>

        {/* Cột phải: Lợi ích & Hình ảnh */}
        <div className="lg:w-1/2 relative mr-28">
          {/* Hình nền dấu cộng xanh */}
          <img
            src="image/heal.png"
            alt="Health Background"
            className="absolute right-0 top-0 w-[60%] lg:w-[50%] opacity-80"
          />

          {/* Lợi ích */}
          <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-6 p-10">
            <div className="flex items-center space-x-4">
              <FaSyringe className="text-blue-900 text-3xl" />
              <span className="text-gray-800 font-medium">
                Ưu tiên vắc xin khan hiếm cho khách hàng đã tiêm mũi đầu
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <FaTags className="text-blue-900 text-3xl" />
              <span className="text-gray-800 font-medium">
                Cung cấp vắc xin bình ổn giá và trợ giá
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <FaClinicMedical className="text-blue-900 text-3xl" />
              <span className="text-gray-800 font-medium">
                Mũi vắc xin lẻ sẽ không phát sinh thêm chi phí
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <FaShieldVirus className="text-blue-900 text-3xl" />
              <span className="text-gray-800 font-medium">
                Không áp dụng tiêm 3 mũi cho trẻ trong 1 lần
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Introduction;
