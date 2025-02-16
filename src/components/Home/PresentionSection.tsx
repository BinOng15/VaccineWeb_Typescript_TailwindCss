import React from "react";

const PreventionSection: React.FC = () => {
  return (
    <div className="w-full flex flex-col lg:flex-row h-[62vh] bg-white">
      {/* Cột trái: Hình ảnh */}
      <div className="w-full lg:w-1/2">
        <img
          src="image/center.png"
          alt="Vaccine Center"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Cột phải: Hình nền + Overlay */}
      <div className="w-full lg:w-1/2 relative">
        {/* Hình nền */}
        <img
          src="image/blue.png" // Đổi tên hình ảnh tùy vào file bạn có
          alt="Prevention Background"
          className="w-full h-full object-cover"
        />
//hhh 
        {/* Overlay xanh đậm */}
        <div className="absolute inset-0 bg-blue-900 bg-opacity-70 flex flex-col justify-center px-8 py-12 text-white">
          <p className="text-sm uppercase tracking-widest">
            Trung tâm tiêm chủng cho trẻ - Vaccine For Child
          </p>
          <h2 className="text-3xl font-bold mt-2">
            CHUNG TAY ĐẨY LÙI BỆNH TRUYỀN NHIỄM
          </h2>
          <p className="mt-4 text-lg">
            Số 1 về Vắc-xin phòng bệnh cho trẻ sơ sinh, với đội ngũ chuyên gia
            giàu kinh nghiệm và hệ thống phòng tiêm rộng khắp cả nước.
          </p>

          <button className="mt-6 px-6 py-3 bg-white w-[20vh] text-blue-900 font-semibold rounded-full shadow-lg hover:bg-gray-100">
            Tìm hiểu thêm
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreventionSection;
