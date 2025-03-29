import React, { useState, useEffect } from "react";
import vaccineService from "../../service/vaccineService";

interface VaccineDisplay {
  vaccineId: number;
  name: string;
  image: string;
}

const VaccineTypes: React.FC = () => {
  const [vaccines, setVaccines] = useState<VaccineDisplay[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const vaccineData = await vaccineService.getAllVaccines();

        console.log("Vaccines:", vaccineData);

        const mappedVaccines: VaccineDisplay[] = vaccineData.map((vaccine) => ({
          vaccineId: vaccine.vaccineId,
          name: vaccine.name,
          image: vaccine.image,
        }));

        setVaccines(mappedVaccines);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <section className="relative px-10 py-10 h-[62vh] text-center bg-white">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 relative z-10 uppercase">
        Các loại vắc xin tại trung tâm
      </h2>

      {/* Product Grid */}
      {loading ? (
        <div className="text-center">Đang tải dữ liệu...</div>
      ) : (
        <div className="flex justify-center gap-4 relative z-10">
          {vaccines.slice(0, 5).map((vaccine) => (
            <div
              key={vaccine.vaccineId}
              className="bg-white p-4 rounded-lg shadow-md w-1/5 uppercase"
            >
              <img
                src={vaccine.image}
                alt={vaccine.name}
                className="w-full h-48 object-cover rounded-lg"
              />
              <h3 className="text-md font-semibold mt-2">{vaccine.name}</h3>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default VaccineTypes;
