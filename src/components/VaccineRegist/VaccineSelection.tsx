import React, { useState } from "react";
import { Card, Tabs, Collapse, Button, Tag } from "antd";

const { TabPane } = Tabs;
const { Panel } = Collapse;

const VaccineCard: React.FC<{
  name: string;
  price: string;
  description: string;
  onSelect: () => void;
  isSelected: boolean;
}> = ({ name, price, description, onSelect, isSelected }) => (
  <Card title={name} style={{ width: 300, margin: "10px" }}>
    <p>{description}</p>
    <p style={{ fontWeight: "bold" }}>{price} đ</p>
    <Button
      onClick={onSelect}
      type={isSelected ? "default" : "primary"}
      style={{ width: "100%" }}
    >
      {isSelected ? "Đã chọn" : "Chọn"}
    </Button>
  </Card>
);

const VaccineSelection: React.FC = () => {
  const [selectedVaccines, setSelectedVaccines] = useState<string[]>([]);

  // Hàm xử lý khi chọn vắc xin
  const handleSelectVaccine = (vaccineName: string) => {
    setSelectedVaccines((prevSelected) => {
      if (prevSelected.includes(vaccineName)) {
        return prevSelected.filter((vaccine) => vaccine !== vaccineName);
      } else {
        return [...prevSelected, vaccineName];
      }
    });
  };

  return (
    <div className="py-10 p-6 max-w-3xl mx-auto ">
      <h3 className="text-2xl font-bold">THÔNG TIN DỊCH VỤ</h3>

      {/* Hiển thị các vắc xin đã chọn */}
      <div className="mt-6">
        <h4 className="text-xl font-semibold">Vắc xin đã chọn:</h4>
        {selectedVaccines.length > 0 ? (
          <div>
            {selectedVaccines.map((vaccine, index) => (
              <Tag color="blue" key={index} style={{ margin: "5px" }}>
                {vaccine}
              </Tag>
            ))}
          </div>
        ) : (
          <p>Chưa có vắc xin nào được chọn.</p>
        )}
      </div>

      <Tabs defaultActiveKey="1">
        <TabPane tab="Vắc xin gói" key="1">
          <Collapse>
            <Panel header="Vắc xin cho trẻ em / 0-9 Tháng" key="1">
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                <VaccineCard
                  name="Gói Hexaxim - Rotarix - Varivax"
                  price="24,833,332"
                  description="Gói vắc xin Hexaxim–Rotarix–Varilrix (0-9 tháng) có đủ các vắc xin cho trẻ ở 1 năm đầu đời"
                  onSelect={() =>
                    handleSelectVaccine("Gói Hexaxim - Rotarix - Varivax")
                  }
                  isSelected={selectedVaccines.includes(
                    "Gói Hexaxim - Rotarix - Varivax"
                  )}
                />
                <VaccineCard
                  name="Gói Hexaxim - Rotateq - Varivax"
                  price="25,218,252"
                  description="Gói vắc xin Hexaxim–Rotatequ Varilrix (0-9 tháng) có đủ các vắc xin cho trẻ ở 1 năm đầu đời."
                  onSelect={() =>
                    handleSelectVaccine("Gói Hexaxim - Rotateq - Varivax")
                  }
                  isSelected={selectedVaccines.includes(
                    "Gói Hexaxim - Rotateq - Varivax"
                  )}
                />
              </div>
            </Panel>
            <Panel header="Vắc xin cho trẻ em / 0-12 Tháng" key="2">
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                <VaccineCard
                  name="Gói Hexaxim - Rotarix - Varivax"
                  price="24,833,332"
                  description="Gói vắc xin Hexaxim–Rotarix–Varilrix (0-12 tháng) có đủ các vắc xin cho trẻ ở 1 năm đầu đời"
                  onSelect={() =>
                    handleSelectVaccine("Gói Hexaxim - Rotarix - Varivax")
                  }
                  isSelected={selectedVaccines.includes(
                    "Gói Hexaxim - Rotarix - Varivax"
                  )}
                />
                <VaccineCard
                  name="Gói Hexaxim - Rotateq - Varivax"
                  price="25,218,252"
                  description="Gói vắc xin Hexaxim–Rotatequ Varilrix (0-12 tháng) có đủ các vắc xin cho trẻ ở 1 năm đầu đời."
                  onSelect={() =>
                    handleSelectVaccine("Gói Hexaxim - Rotateq - Varivax")
                  }
                  isSelected={selectedVaccines.includes(
                    "Gói Hexaxim - Rotateq - Varivax"
                  )}
                />
              </div>
            </Panel>
            <Panel header="Vắc xin cho trẻ em / 0-24 Tháng" key="3">
              <div style={{ display: "flex", flexWrap: "wrap" }}>
                <VaccineCard
                  name="Gói Hexaxim - Rotarix - Varivax"
                  price="24,833,332"
                  description="Gói vắc xin Hexaxim–Rotarix–Varilrix (0-24 tháng) có đủ các vắc xin cho trẻ ở 1 năm đầu đời"
                  onSelect={() =>
                    handleSelectVaccine("Gói Hexaxim - Rotarix - Varivax")
                  }
                  isSelected={selectedVaccines.includes(
                    "Gói Hexaxim - Rotarix - Varivax"
                  )}
                />
                <VaccineCard
                  name="Gói Hexaxim - Rotateq - Varivax"
                  price="25,218,252"
                  description="Gói vắc xin Hexaxim–Rotatequ Varilrix (0-24 tháng) có đủ các vắc xin cho trẻ ở 1 năm đầu đời."
                  onSelect={() =>
                    handleSelectVaccine("Gói Hexaxim - Rotateq - Varivax")
                  }
                  isSelected={selectedVaccines.includes(
                    "Gói Hexaxim - Rotateq - Varivax"
                  )}
                />
              </div>
            </Panel>
          </Collapse>
        </TabPane>

        <TabPane tab="Vắc xin lẻ" key="2">
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <VaccineCard
              name="Gói Hexaxim - Rotarix - Varivax"
              price="24,833,332"
              description="Gói vắc xin Hexaxim–Rotarix–Varilrix (0-9 tháng) có đủ các vắc xin cho trẻ ở 1 năm đầu đời"
              onSelect={() =>
                handleSelectVaccine("Gói Hexaxim - Rotarix - Varivax")
              }
              isSelected={selectedVaccines.includes(
                "Gói Hexaxim - Rotarix - Varivax"
              )}
            />
            <VaccineCard
              name="Gói Hexaxim - Rotateq - Varivax"
              price="25,218,252"
              description="Gói vắc xin Hexaxim–Rotatequ Varilrix (0-9 tháng) có đủ các vắc xin cho trẻ ở 1 năm đầu đời."
              onSelect={() =>
                handleSelectVaccine("Gói Hexaxim - Rotateq - Varivax")
              }
              isSelected={selectedVaccines.includes(
                "Gói Hexaxim - Rotateq - Varivax"
              )}
            />
            <VaccineCard
              name="Gói Hexaxim - Rotarix - Varivax"
              price="24,833,332"
              description="Gói vắc xin Hexaxim–Rotarix–Varilrix (0-12 tháng) có đủ các vắc xin cho trẻ ở 1 năm đầu đời"
              onSelect={() =>
                handleSelectVaccine("Gói Hexaxim - Rotarix - Varivax")
              }
              isSelected={selectedVaccines.includes(
                "Gói Hexaxim - Rotarix - Varivax"
              )}
            />
            <VaccineCard
              name="Gói Hexaxim - Rotateq - Varivax"
              price="25,218,252"
              description="Gói vắc xin Hexaxim–Rotatequ Varilrix (0-12 tháng) có đủ các vắc xin cho trẻ ở 1 năm đầu đời."
              onSelect={() =>
                handleSelectVaccine("Gói Hexaxim - Rotateq - Varivax")
              }
              isSelected={selectedVaccines.includes(
                "Gói Hexaxim - Rotateq - Varivax"
              )}
            />
            <VaccineCard
              name="Gói Hexaxim - Rotarix - Varivax"
              price="24,833,332"
              description="Gói vắc xin Hexaxim–Rotarix–Varilrix (0-24 tháng) có đủ các vắc xin cho trẻ ở 1 năm đầu đời"
              onSelect={() =>
                handleSelectVaccine("Gói Hexaxim - Rotarix - Varivax")
              }
              isSelected={selectedVaccines.includes(
                "Gói Hexaxim - Rotarix - Varivax"
              )}
            />
            <VaccineCard
              name="Gói Hexaxim - Rotateq - Varivax"
              price="25,218,252"
              description="Gói vắc xin Hexaxim–Rotatequ Varilrix (0-24 tháng) có đủ các vắc xin cho trẻ ở 1 năm đầu đời."
              onSelect={() =>
                handleSelectVaccine("Gói Hexaxim - Rotateq - Varivax")
              }
              isSelected={selectedVaccines.includes(
                "Gói Hexaxim - Rotateq - Varivax"
              )}
            />
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default VaccineSelection;
