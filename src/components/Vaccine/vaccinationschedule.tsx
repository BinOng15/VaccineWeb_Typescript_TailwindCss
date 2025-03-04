import React from "react";
import MainLayout from "../Layout/MainLayout";

const vaccineData = [
  {
    vaccine: "Lao",
    schedule: ["x", "", "", "", "", "", "", "", "", "", "", "x", "", "", ""],
  },
  {
    vaccine: "Viêm gan B",
    schedule: ["x", "", "x", "", "", "", "", "", "", "", "", "", "", "", "x"],
  },
  {
    vaccine: "Bạch hầu, ho gà, uốn ván",
    schedule: ["", "", "x", "", "x", "", "x", "", "", "", "", "x", "", "", ""],
  },
  {
    vaccine: "Bại liệt",
    schedule: ["", "", "x", "", "x", "", "x", "", "", "", "", "x", "", "", ""],
  },
  {
    vaccine: "Viêm phổi, viêm màng não do Hib",
    schedule: ["", "", "x", "", "x", "", "x", "", "", "", "", "x", "", "", ""],
  },
  {
    vaccine: "Tiêu chảy do Rota Virus",
    schedule: [
      "",
      "Phác đồ 2 hoặc 3 liều, mỗi liều cách nhau tối thiểu 1 tháng",
    ],
  },
  {
    vaccine: "Viêm màng não, nhiễm trùng huyết do phế cầu",
    schedule: ["", "", "x", "", "x", "", "x", "", "", "", "", "x", "", "", ""],
  },
  {
    vaccine: "Viêm màng não do não mô cầu nhóm B, C",
    schedule: ["", "", "", "", "", "", "", "", "x", "", "", "", "", "", ""],
  },
  {
    vaccine: "Cúm",
    schedule: [
      "",
      "",
      "",
      "",
      "Phác đồ: 2 liều tiêm cách nhau ít nhất 1 tháng, sau đó nhắc lại mỗi năm.",
    ],
  },
  {
    vaccine: "Sởi",
    schedule: ["", "", "", "", "", "", "", "", "", "", "", "x", "", "", ""],
  },
  {
    vaccine: "Viêm não Nhật Bản",
    schedule: ["", "", "", "", "", "", "", "", "x", "", "x", "x", "", "", ""],
  },
];

const VaccinationSchedule: React.FC = () => {
  return (
    <MainLayout>
      <div className="p-4 max-w-6xl mx-auto mb-10">
        <h2 className="text-xl font-bold text-center bg-gray-200 p-2 rounded-t-lg">
          LỊCH TIÊM CHỦNG CHO TRẺ
        </h2>
        <div className="overflow-x-auto bg-white border border-gray-300">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="border px-4 py-2 no-ellipsis" rowSpan={2}>
                  Tuổi / Vaccine
                </th>
                <th className="border px-4 py-2 " colSpan={9}>
                  Tháng
                </th>
                <th className="border px-4 py-2 no-ellipsis" colSpan={6}>
                  Tuổi
                </th>
              </tr>
              <tr className="bg-blue-900 text-white">
                {[
                  "Sơ sinh",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6",
                  "7",
                  "8",
                  "9",
                  "10-11",
                  "12",
                  "2",
                  "3-4",
                  "5-6",
                  "7-8",
                ].map((month) => (
                  <th key={month} className="border px-2 py-1">
                    {month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vaccineData.map((row, index) => (
                <tr key={index} className="odd:bg-gray-100">
                  <td className="border px-4 py-2 font-medium">
                    {row.vaccine}
                  </td>
                  {row.vaccine === "Cúm" ? (
                    <>
                      <td className="border px-2 py-1 text-center"></td>
                      <td className="border px-2 py-1 text-center"></td>
                      <td className="border px-2 py-1 text-center"></td>
                      <td className="border px-2 py-1 text-center"></td>
                      <td className="border px-2 py-1 text-center" colSpan={12}>
                        {row.schedule[4]}
                      </td>
                    </>
                  ) : row.vaccine === "Tiêu chảy do Rota Virus" ? (
                    <>
                      <td className="border px-2 py-1 text-center"></td>
                      <td className="border px-2 py-1 text-center" colSpan={4}>
                        {row.schedule[1]}
                      </td>
                      <td className="border px-2 py-1 text-center"></td>
                      <td className="border px-2 py-1 text-center"></td>
                      <td className="border px-2 py-1 text-center"></td>
                      <td className="border px-2 py-1 text-center"></td>
                      <td className="border px-2 py-1 text-center"></td>
                      <td className="border px-2 py-1 text-center"></td>
                      <td className="border px-2 py-1 text-center"></td>
                      <td className="border px-2 py-1 text-center"></td>
                      <td className="border px-2 py-1 text-center"></td>
                      <td className="border px-2 py-1 text-center"></td>
                    </>
                  ) : row.vaccine === "Bại liệt" ? (
                    <>
                      <td className="border px-2 py-1 text-center"></td>
                      <td className="border px-2 py-1 text-center"></td>
                      <td className="border px-2 py-1 text-center"></td>
                      <td className="border px-2 py-1 text-center"></td>
                      <td className="border px-2 py-1 text-center" colSpan={12}>
                        {row.schedule[4]}
                      </td>
                    </>
                  ) : (
                    row.schedule.map((cell, i) => (
                      <td key={i} className="border px-2 py-1 text-center">
                        {cell}
                      </td>
                    ))
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
};

export default VaccinationSchedule;
