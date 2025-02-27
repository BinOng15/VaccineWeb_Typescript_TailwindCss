import QandA from "../../components/Q&A/QandA";
import VaccinePrice from "../../components/Vaccine/VaccinePrice";
import { Row, Col } from "antd";
function VaccinePricePage() {
  return (
    <Row className="mb-10">
      {" "}
      {/* Giảm gutter để khoảng cách giữa hai phần nhỏ hơn */}
      <Col span={16}>
        {" "}
        {/* 7 phần */}
        <VaccinePrice />
      </Col>
      <Col className="mt-11" span={8}>
        {" "}
        {/* 3 phần */}
        <QandA />
      </Col>
    </Row>
  );
}

export default VaccinePricePage;
