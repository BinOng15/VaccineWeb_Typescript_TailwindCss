import React from "react";
import { Link } from "react-router-dom";

const vaccinePackages = [
  {
    age: "2 tháng",
    disease: "Tiêu chảy do rota virus",
    vaccineName: "Rotarix",
    manufacturer: "GSK/Bỉ",
    doses: [2, 2, 2, 2, 2],
  },
  {
    age: "2 tháng",
    disease:
      "Bạch hầu, Ho gà, Uốn ván, Bại liệt, Các bệnh do Hib, Viêm gan B (6 trong 1)",
    vaccineName: "Hexaxim",
    manufacturer: "Sanofi/Pháp",
    doses: [4, 3, 4, 3, 4],
  },
  {
    age: "2 tháng",
    disease: "Hội chứng nhiễm trùng, viêm màng não, viêm phổi",
    vaccineName: "Synflorix",
    manufacturer: "GSK/Bỉ",
    doses: [4, 3, 3, 4, 4],
  },
  {
    age: "6 tháng",
    disease: "Cúm",
    vaccineName: "Vaxigrip tetra",
    manufacturer: "Sanofi/Pháp",
    doses: [3, 1, 2, 2, 2],
  },
  {
    age: "9 tháng",
    disease: "Sởi",
    vaccineName: "Mvvac",
    manufacturer: "Polyvac/Việt Nam",
    doses: [1, 1, 1, 1, 1],
  },
  {
    age: "9 tháng",
    disease: "Viêm não Nhật bản",
    vaccineName: "Imojev",
    manufacturer: "Sanofi/Thái Lan",
    doses: [1, 1, 1, 1, 1],
  },
  {
    age: "9 tháng",
    disease: "Viêm màng não do mô cầu tuýp A, C, Y, W",
    vaccineName: "Menactra",
    manufacturer: "Sanofi/Mỹ",
    doses: [2, 2, 2, 1, 1],
  },
  {
    age: "9 tháng",
    disease: "Thủy Đậu",
    vaccineName: "Varilrix",
    manufacturer: "GSK/Bỉ",
    doses: [2, 1, 1, 2, 1],
  },
  {
    age: "12 tháng",
    disease: "Sởi-Quai bị-Rubella",
    vaccineName: "MMR-II",
    manufacturer: "Merck/Mỹ",
    doses: [1, 2, 2, 2, 2],
  },
  {
    age: "12 tháng",
    disease: "Viêm gan A, B",
    vaccineName: "Twinrix",
    manufacturer: "GSK/Bỉ",
    doses: [1, 2, 1, 2, 1],
  },
  {
    age: "24 tháng",
    disease: "Thương hàn",
    vaccineName: "Typhoid Vi",
    manufacturer: "Davac/Việt Nam",
    doses: [2, 1, 2, 2, 1],
  },
  {
    age: "24 tháng",
    disease: "Tả",
    vaccineName: "mOrcvax",
    manufacturer: "Vabiotech/Việt Nam",
    doses: [2, 1, 1, 2, 2],
  },
];

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

const VaccinePackage: React.FC = () => {
  // Tổng số liều cho các độ tuổi
  const totalDosesByAge = {
    "6 tháng": 9,
    "9 tháng": 14,
    "12 tháng": 19,
    "24 tháng": 26,
  };

  // Giá gói cho các độ tuổi
  const packagePricesByAge = {
    "6 tháng": 9942000,
    "9 tháng": 14227200,
    "12 tháng": 19165200,
    "24 tháng": 22806000,
  };

  // Giá gói ưu đãi cho các độ tuổi
  const discountPricesByAge = {
    "6 tháng": 9544000,
    "9 tháng": 13516200,
    "12 tháng": 18015200,
    "24 tháng": 21210000,
  };

  // Số tiền ưu đãi cho các độ tuổi
  const discountAmountsByAge = {
    "6 tháng": 398000,
    "9 tháng": 711000,
    "12 tháng": 1150000,
    "24 tháng": 1596000,
  };

  return (
    <div className="max-w-7xl mx-auto p-4 flex">
      <div className="w-3/4">
        <nav className="text-sm text-gray-600 mb-4 mt-2">
          <Link to="/" className="text-blue-500">
            Trang chủ
          </Link>
          &gt; Gói vắc xin cho trẻ em
        </nav>
        <h2 className="text-2xl font-bold mb-6">GÓI VẮC XIN CHO TRẺ EM</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 text-center">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Tuổi</th>
                <th className="border p-2">Phòng Bệnh</th>
                <th className="border p-2">Tên Vắc Xin</th>
                <th className="border p-2">Nhà Sản Xuất</th>
                <th className="border p-2">Số Mũi Theo Phác Đồ</th>
                <th className="border p-2">6 tháng</th>
                <th className="border p-2">9 tháng</th>
                <th className="border p-2">12 tháng</th>
                <th className="border p-2">24 tháng</th>
              </tr>
            </thead>
            <tbody>
              {vaccinePackages.map((pkg, index) => (
                <tr key={index} className="border">
                  <td className="border p-2">{pkg.age}</td>
                  <td className="border p-2">{pkg.disease}</td>
                  <td className="border p-2">{pkg.vaccineName}</td>
                  <td className="border p-2">{pkg.manufacturer}</td>
                  {pkg.doses.map((dose, i) => (
                    <td key={i} className="border p-2 text-center">
                      {dose}
                    </td>
                  ))}
                </tr>
              ))}
              {/* Dòng thông tin tổng kết cho từng độ tuổi */}
              <tr className="border">
                <td colSpan={5} className="border p-2 font-semibold">
                  Tổng số liều
                </td>
                <td className="border p-2">{totalDosesByAge["6 tháng"]}</td>
                <td className="border p-2">{totalDosesByAge["9 tháng"]}</td>
                <td className="border p-2">{totalDosesByAge["12 tháng"]}</td>
                <td className="border p-2">{totalDosesByAge["24 tháng"]}</td>
              </tr>
              {/* Dòng giá gói */}
              <tr className="border">
                <td colSpan={5} className="border p-2 font-semibold">
                  Giá gói
                </td>
                <td className="border p-2">
                  {packagePricesByAge["6 tháng"].toLocaleString()}
                </td>
                <td className="border p-2">
                  {packagePricesByAge["9 tháng"].toLocaleString()}
                </td>
                <td className="border p-2">
                  {packagePricesByAge["12 tháng"].toLocaleString()}
                </td>
                <td className="border p-2">
                  {packagePricesByAge["24 tháng"].toLocaleString()}
                </td>
              </tr>
              {/* Dòng giá gói ưu đãi */}
              <tr className="border">
                <td colSpan={5} className="border p-2 font-semibold">
                  Giá gói ưu đãi
                </td>
                <td className="border p-2">
                  {discountPricesByAge["6 tháng"].toLocaleString()}
                </td>
                <td className="border p-2">
                  {discountPricesByAge["9 tháng"].toLocaleString()}
                </td>
                <td className="border p-2">
                  {discountPricesByAge["12 tháng"].toLocaleString()}
                </td>
                <td className="border p-2">
                  {discountPricesByAge["24 tháng"].toLocaleString()}
                </td>
              </tr>
              {/* Dòng số tiền ưu đãi */}
              <tr className="border">
                <td colSpan={5} className="border p-2 font-semibold">
                  Số tiền ưu đãi
                </td>
                <td className="border p-2">
                  {discountAmountsByAge["6 tháng"].toLocaleString()}
                </td>
                <td className="border p-2">
                  {discountAmountsByAge["9 tháng"].toLocaleString()}
                </td>
                <td className="border p-2">
                  {discountAmountsByAge["12 tháng"].toLocaleString()}
                </td>
                <td className="border p-2">
                  {discountAmountsByAge["24 tháng"].toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Thông tin về phí đặt giữ */}
        <div className="mt-10 bg-white p-4 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Thông Tin Phí Đặt Giữ</h3>
          <p className="text-xl font-semibold">
            Lưu ý: Tổng Giá trị Gói vắc xin = Tổng giá trị các mũi tiêm lẻ (hoặc
            giá ưu đãi nếu có) + Khoảng 10% phí đặt giữ theo yêu cầu*
          </p>
          <p className="text-xpl text-gray-600 mt-4">
            <strong>(*) Phí đặt giữ bao gồm:</strong>
            <ul className="list-disc ml-6 mt-2 space-y-2">
              <li>
                <strong>
                  Phí bảo quản, lưu trữ vắc xin theo tiêu chuẩn Quốc tế;
                </strong>
              </li>
              <li>
                <strong>Phí chống trượt giá vắc xin:</strong> Khách hàng sẽ
                không phải thanh toán thêm bất cứ khoản chi phí phát sinh nào
                trong suốt quá trình đặt giữ. Số tiền chênh lệch nếu vắc xin
                tăng giá sau đó theo biến động thị trường Khách hàng cũng không
                phải chi trả;
              </li>
              <li>
                <strong>
                  Phí các dịch vụ chăm sóc Khách hàng trên đa nền tảng:
                </strong>{" "}
                dịch vụ tư vấn tổng đài tin nhắn (SMS)/cuộc gọi nhắc lịch tiêm;
                dịch vụ cung cấp thông tin, chăm sóc Khách hàng qua mạng xã hội,
                trực tiếp tại trung tâm…;
              </li>
              <li>
                <strong>
                  Phí lưu trữ thông tin lịch sử tiêm chủng trọn đời;
                </strong>
              </li>
              <li>
                <strong>
                  Phí dịch vụ ưu tiên phục vụ tại các trung tâm trên toàn quốc:
                </strong>
                Trải nghiệm cơ sở hạ tầng rộng lớn, cơ sở vật chất hiện đại,
                phòng khám phòng tiêm chuyên biệt, đầy đủ các phòng và khu vực
                chức năng, trang bị đầy đủ thiết bị cao cấp…;
              </li>
              <li>
                <strong>
                  Phí sử dụng tất cả tiện ích cao cấp tại trung tâm:
                </strong>{" "}
                Khu vui chơi trẻ em rộng rãi sinh động, nước uống tiệt trùng,
                phòng cho mẹ và bé, khu vệ sinh riêng cho trẻ em, khu vực thay
                tã/bỉm cho trẻ với đa dạng các loại bỉm/tã đủ size, khăn giấy
                ướt/khô, sạc thiết bị di động, miễn phí hoặc hỗ trợ phí giữ xe…;
              </li>
              <li>
                <strong>
                  Phí dành cho hệ thống cấp cứu, xử trí phản ứng sau tiêm ngay
                  tại trung tâm VNVC (nếu có);
                </strong>
              </li>
              <li>
                <strong>Phí cho tài liệu, ấn phẩm phục vụ Khách hàng</strong>{" "}
                (sổ tiêm, phiếu tiêm, tài liệu thông tin về các bệnh dịch, vắc
                xin, các chương trình giáo dục cộng đồng về vắc xin và tiêm
                chủng…).
              </li>
            </ul>
          </p>
        </div>
      </div>

      {/* Câu hỏi thường gặp */}
      <div className="w-1/4 ml-10">
        <div className="bg-white shadow-lg rounded-lg p-4 w-[300px]">
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
      </div>
    </div>
  );
};

export default VaccinePackage;
