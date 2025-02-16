import React from 'react';



const Content: React.FC= () => {
  return (
   <div className="flex flex-col md:flex-row items-center gap-28 p-28">

      <div className="md:w-1/2">
        <h2 className="text-3xl font-semibold text-black">
          TRUNG TÂM TIÊM CHỦNG VACCINE FOR CHILD
        </h2>
        <p className="mt-4 text-gray-700">
          Chào mừng quý phụ huynh đến với Trung Tâm Vaccine For Child – nơi bảo vệ sức khỏe và đồng hành cùng sự phát triển toàn diện của trẻ!
        </p>
        <p className="mt-1 text-gray-700">
          Vaccine For Child là trung tâm tiêm chủng uy tín hàng đầu, chúng tôi cung cấp các dịch vụ tiêm phòng chuyên sâu dành cho trẻ em từ 0 đến 24 tháng tuổi. Với đội ngũ bác sĩ và nhân viên y tế tận tâm, giàu kinh nghiệm, cùng các loại vắc xin đạt chuẩn quốc tế, chúng tôi cam kết mang lại độ an toàn và hiệu quả tối ưu cho trẻ.
        </p>
        <p className="mt-2 text-gray-700">
          Chúng tôi luôn trợ giúp để đảm bảo bé được tiêm phòng đầy đủ và đúng lịch, giúp phòng ngừa các bệnh truyền nhiễm nguy hiểm như bạch hầu, uốn ván, sởi, quai bị, rubella, viêm màng não... Mỗi mũi tiêm không chỉ là sự bảo vệ sức khỏe mà còn là bước đi quan trọng để xây dựng nền tảng miễn dịch tốt cho các em nhỏ.
        </p>
        <p className="mt-2 text-gray-700">
          Vaccine For Child tự hào đồng hành cùng quý phụ huynh trong hành trình chăm sóc sức khỏe toàn diện cho con em mình.
        </p>
      </div>
      <div className="md:w-1/2 flex justify-center">
        <img src="https://suckhoedoisong.qltns.mediacdn.vn/324455921873985536/2023/7/19/anh-chup-man-hinh-2023-07-19-luc-111414-16897400826651175857200.png" alt="Trung tâm tiêm chủng" className="w-full rounded-lg shadow-lg" />
      </div>
    </div>
  );
};

export default Content;

