import React from "react";
import { Card, Tabs, Collapse } from "antd";

const { TabPane } = Tabs;
const { Panel } = Collapse;

const VaccineCard: React.FC<{ name: string; price: string; description: string }> = ({ name, price, description }) => (
  <Card title={name} style={{ width: 300, margin: "10px" }}>
    <p>{description}</p>
    <p style={{ fontWeight: "bold" }}>{price} đ</p>
  </Card>
);

const VaccineSelection: React.FC = () => (
  <div className="py-10 p-6 max-w-3xl mx-auto ">
    <h3 className="text-2xl font-bold">THÔNG TIN DỊCH VỤ</h3>
    <Tabs defaultActiveKey="1">
      <TabPane tab="Vắc xin gói" key="1">
        <Collapse>
          <Panel header="Vắc xin cho trẻ em / 0-9 Tháng" key="1"></Panel>
          <Panel header="Vắc xin cho trẻ em / 0-12 Tháng" key="2">
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              <VaccineCard name="Gói Hexaxim - Rotarix - Varivax" price="24,833,332" description="Gói vắc xin Hexaxim–Rotarix–Varilrix (0-12 tháng) có đủ các vắc xin cho trẻ ở 1 năm đầu đời" />
              <VaccineCard name="Gói Hexaxim - Rotateq - Varivax" price="25,218,252" description="Gói vắc xin Hexaxim–Rotatequ Varilrix (0-12 tháng) có đủ các vắc xin cho trẻ ở 1 năm đầu đời." />
            </div>
          </Panel>
          <Panel header="Vắc xin cho trẻ em / 0-24 Tháng" key="3"></Panel>
        </Collapse>
      </TabPane>
      <TabPane tab="Vắc xin lẻ" key="2">
        Nội dung vắc xin lẻ
      </TabPane>
    </Tabs>
  </div>
);

export default VaccineSelection;
