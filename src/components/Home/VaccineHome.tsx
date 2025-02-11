import React from "react";

const VaccineHome: React.FC = () => {
  // Danh sách sản phẩm
  const products = [
    {
      name: "Vắc xin sốt xuất huyết",
      image: "https://vnvc.vn/wp-content/uploads/2024/09/vacxin-qdenga.jpg",
    },
    {
      name: "Vắc xin 6IN1",
      image: "https://vnvc.vn/wp-content/uploads/2018/06/vaccine-hexaxim.jpg",
    },
    {
      name: "Vắc xin Engerix B (Bỉ)",
      image: "https://vnvc.vn/wp-content/uploads/2017/04/vac-xin-engerix-b.jpg",
    },
    {
      name: "Vắc xin Rotavin (Việt Nam)",
      image: "https://vnvc.vn/wp-content/uploads/2020/05/vac-xin-rotavin-1.jpg",
    },
    {
      name: "Vắc xin Imojev (Thái Lan)",
      image: "https://vnvc.vn/wp-content/uploads/2019/07/vac-xin-imojev.jpg",
    },
  ];

  return (
    <section className="relative px-10 py-10 h-[62vh] text-center bg-white">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 relative z-10 uppercase">
        Các loại vắc xin tại trung tâm
      </h2>

      {/* Product Grid */}
      <div className="flex justify-center gap-4 relative z-10">
        {products.map((product, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-md w-1/5 uppercase"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover rounded-lg"
            />
            <h3 className="text-md font-semibold mt-2">{product.name}</h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default VaccineHome;
