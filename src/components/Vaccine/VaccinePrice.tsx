import React from "react";

interface Vaccine {
  id: number;
  name: string;
  disease: string;
  schedule: string;
  price: string;
  availability: string;
}

const vaccines: Vaccine[] = [
  {
    id: 1,
    name: "BCG (Việt Nam)",
    disease: "Lao",
    schedule: "1 mũi duy nhất",
    price: "Miễn phí",
    availability: "Có",
  },
  {
    id: 2,
    name: "Engerix B 1ml (Bỉ)",
    disease: "Viêm Gan B",
    schedule: "Tiêm 1 mũi, nếu chưa đủ thì tiêm bổ sung",
    price: "110.000",
    availability: "Có",
  },
  {
    id: 3,
    name: "Infanrix hexa (Bỉ)",
    disease: "Bạch hầu, ho gà, uốn ván, viêm gan B",
    schedule: "Tiêm từ 2 tháng tuổi, 3 mũi cơ bản + 1 nhắc lại",
    price: "730.000",
    availability: "Có",
  },
  {
    id: 4,
    name: "Hexaxim (Pháp)",
    disease: "Bạch hầu, ho gà, uốn ván, viêm gan B",
    schedule: "Tiêm từ 2 tháng tuổi, 3 mũi cơ bản + 1 nhắc lại",
    price: "950.000",
    availability: "Có",
  },
  {
    id: 5,
    name: "Pentaxim (Pháp)",
    disease: "Bạch hầu, ho gà, uốn ván, bại liệt",
    schedule: "Tiêm từ 2 tháng tuổi, 3 mũi cơ bản + 1 nhắc lại",
    price: "790.000",
    availability: "Có",
  },
  {
    id: 6,
    name: "Rotarix (Bi)",
    disease: "Phòng bệnh viêm dạ dày ruột do Rotaviruts",
    schedule: "Uống từ 2 tháng trở ra, 2 liều, mỗi tháng 1 liều (trc 6 tháng)",
    price: "940.000",
    availability: "Có",
  },
  {
    id: 7,
    name: "Rotateq (Mỹ)",
    disease: "Phòng bệnh viêm dạ dày ruột do Rotaviruts",
    schedule: "Uống 3 liều, mỗi tháng 1 liều ( trc 8 tháng)",
    price: "940.000",
    availability: "Có",
  },
  {
    id: 8,
    name: "Rotavin (VN)",
    disease: "Phòng bệnh viêm dạ dày ruột do Rotaviruts",
    schedule: "Uống từ 2 tháng trở ra, 2 liều, mỗi tháng 1 liều (trc 6 tháng)",
    price: "940.000",
    availability: "Có",
  },
  {
    id: 9,
    name: "Synflorix (Bi)",
    disease: "Phòng bệnh viêm phối viêm tai giữa do phế cầu",
    schedule:
      "tiêm từ 2 tháng trở ra, tiêm 3 mũi 3 tháng liên tiếp, mũi 4 nhắc lại sau mũi 3 là 6 tháng",
    price: "790.000",
    availability: "Có",
  },
  {
    id: 10,
    name: "VaxiGrip 0.25ml (Pháp)",
    disease: "Phòng bệnh cúm TE",
    schedule:
      "Tiêm từ 6 tháng trở ra, năm đầu tiêm 2 mũi, mỗi mũi cách nhau 1 tháng, từ năm sau trở đi mỗi năm tiêm 1 mũi",
    price: "790.000",
    availability: "Có",
  },
  {
    id: 11,
    name: "VaxiGrip 0.5ml (Pháp)",
    disease: "Phòng bệnh cúm Từ 3 Tuổi trở lên.",
    schedule:
      "Tiêm từ 6 tháng trở ra, năm đầu tiêm 2 mũi, mỗi mũi cách nhau 1 tháng, từ năm sau trở đi mỗi năm tiêm 1 mũi",
    price: "340.000",
    availability: "Có",
  },
  {
    id: 12,
    name: "VA . Mengoc BC (Cuba)",
    disease: "Phòng bệnh não mô cầu BC",
    schedule: "Tiềm từ 6 tháng trở ra, mũi 1 cách mũi 2 tối thiểu 45 ngày",
    price: "940.000",
    availability: "Có",
  },
  {
    id: 13,
    name: "MMR II (Mỹ)",
    disease: "Vắc xin Phòng bệnh Sởi -quai bị - rubella",
    schedule: "Tiêm từ 1 tuổi trở ra",
    price: "200.000",
    availability: "Có",
  },
  {
    id: 14,
    name: "Varivax ( Mỹ)",
    disease: "Vắc xin phòng thủy đậu",
    schedule: "Tiêm từ 1 tuổi trở ra",
    price: "240.000",
    availability: "Có",
  },
  {
    id: 15,
    name: "Varicella ( Hàn Quốc)",
    disease: "Vắc xin phòng thủy đậu",
    schedule: "Tiêm từ 1 tuổi trở ra",
    price: "Tiêm từ 1 tuổi trở ra",
    availability: "Có",
  },
  {
    id: 16,
    name: "Jevax ( Việt Nam)",
    disease: "Vắc xin phòng viêm não nhật bản",
    schedule: "Tiêm từ 1 tuổi trở ra, 1 tuần sau tiêm müi 2",
    price: "940.000",
    availability: "Có",
  },
  {
    id: 17,
    name: "Havax (VN)",
    disease: "Viêm gan A",
    schedule: "Tiêm từ 2 tuổi trở ra, tiêm 2 mũi, mũi 1 cách mũi 2 6 tháng",
    price: "940.000",
    availability: "Có",
  },
  {
    id: 18,
    name: "Twinrix (BI)",
    disease: "Viêm gan A và B",
    schedule: "Tiêm 3 mũi 3 tháng liên tiếp, 1 mũi năm sau nhắc lại)",
    price: "940.000",
    availability: "Có",
  },
  {
    id: 19,
    name: "Avaxim 80UI (Pháp)",
    disease: "Viêm gan A",
    schedule: "Từ 1 tuổi trở ra, mũi 1 cách mũi 2 6 tháng",
    price: "940.000",
    availability: "Có",
  },
  {
    id: 20,
    name: "Tetraxim 0.5 (Pháp)",
    disease: "Phòng bạch cầu, ho gà, uốn ván,bại liệt",
    schedule: "Tiêm từ 2 tuổi trở ra",
    price: "260.000",
    availability: "Có",
  },
  {
    id: 21,
    name: "Tả uống (m- ORCVAX)",
    disease: "Phòng bệnh tả",
    schedule: "",
    price: "640.000",
    availability: "Có",
  },
  {
    id: 22,
    name: "Mvvac (VN)",
    disease: "Phòng sởi",
    schedule: "Tiêm từ 9 tháng trở ra",
    price: "150.000",
    availability: "Có",
  },
];

const VaccinePrice: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-bold text-center p-2 rounded-t-lg ">
        Bảng Giá Vắc-Xin
      </h2>
      <div className="overflow-x-auto">
        <table className="w-4/4 ml-10 mr-5 border bg-white border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border px-4 py-2">STT</th>
              <th className="border px-4 py-2">Tên Vắc-Xin</th>
              <th className="border px-4 py-2">Phòng Bệnh</th>
              <th className="border px-4 py-2">Phác Đồ</th>
              <th className="border px-4 py-2">Đơn Giá (VNĐ)</th>
              <th className="border px-4 py-2">Tình Trạng</th>
            </tr>
          </thead>
          <tbody>
            {vaccines.map((vaccine) => (
              <tr key={vaccine.id} className="hover:bg-gray-100">
                <td className="border px-4 py-2 text-center">{vaccine.id}</td>
                <td className="border px-4 py-2">{vaccine.name}</td>
                <td className="border px-4 py-2">{vaccine.disease}</td>
                <td className="border px-4 py-2">{vaccine.schedule}</td>
                <td className="border px-4 py-2 text-right">{vaccine.price}</td>
                <td className="border px-4 py-2 text-center">
                  {vaccine.availability}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VaccinePrice;
