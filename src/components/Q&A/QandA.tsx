import React from 'react'
const faqs = [
  {
    img: "https://hongngochospital.vn/wp-content/uploads/2020/02/lich-tiem-phong-cho-be-1.jpg",
    question: "Tại sao cần tiêm cho trẻ dưới 24 tháng tuổi?",
    answer:
      "Thưa bác sĩ, việc tiêm chủng cho trẻ dưới 24 tháng tuổi có tác dụng gì",
  },
  {
    img: "https://suckhoedoisong.qltns.mediacdn.vn/324455921873985536/2022/3/19/thu-tuong-yeu-cau-bo-y-te-nghien-cuu-viec-tiem-vaccine-phong-covid-19-cho-tre-3-5-tuoi-1647697457078324420654.jpg",
    question: "Lịch tiêm cho trẻ dưới 24 tháng tuổi như thế nào?",
    answer: "Lịch tiêm chủng cho trẻ dưới 24 tháng tuổi sẽ như thế nào",
  },
  {
    img: "https://cdn.nhathuoclongchau.com.vn/unsafe/800x0/https://cms-prod.s3-sgn09.fptcloud.com/lich_tiem_chung_cho_tre_tu_0_12_tuoi_1_55e948a650.jpg",
    question: "Trẻ bị bệnh có thể tiêm chủng được không?",
    answer:
      "Thưa bác sĩ, nếu trẻ bị sốt cao, ho nặng, tiêu chảy cấp thì có tiêm được không",
  },
  {
    img: "https://danangtv.vn/Uploads/TinTuc/tiem_vaccine_tre_em_1404.jpg",
    question: "Tiêm vắc-xin có tác dụng phụ không?",
    answer: "Thưa bác sĩ, tiêm vắc xin có tác dụng phụ không",
  },
  {
    img: "https://cdn.thuvienphapluat.vn/uploads/tintuc/2024/06/18/cac-loai-vaccine%20-bat-buoc-cho-tre-em.png",
    question: "Cần chuẩn bị gì trước khi đưa trẻ đi tiêm?",
    answer: "Thưa bác sĩ, cần chuẩn bị gì trước khi đưa trẻ đi tiêm",
  },
  {
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXNdVPJcqGi47ZwdZ262WrVwgSSHh1ehFopw&s",
    question: "Sau khi tiêm, cần chăm sóc trẻ như thế nào?",
    answer: "Thưa bác sĩ, sau khi tiêm thì cần chăm sóc trẻ như thế nào",
  },
];

const  QandA: React.FC = () => {
  return (
  
        <div className="bg-white shadow-lg rounded-lg p-4 w-[300px] mt-5">
          <h2 className="bg-blue-500 text-white text-lg font-semibold p-3 rounded-t-lg">
            CÂU HỎI THƯỜNG GẶP
          </h2>
          <div className="space-y-3 p-2 mt-4">
            {faqs.map((faq, index) => (
              <div key={index} className="flex space-x-3 items-start">
                <img
                  src={faq.img}
                  alt="faq"
                  className="w-20 h-20 object-cover rounded-md"
                />
                <div>
                  <p className="font-semibold text-sm">{faq.question}</p>
                  <p className="text-xs text-gray-600">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
  
  )
}

export default QandA
