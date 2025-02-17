import React from "react";
import CarouselVaccineTypes from "../../components/Carousel/CarouselVaccineTypes";
import VaccineTypes from "../../components/Vaccine/VaccineTypes";

const VaccineTypesPage: React.FC = () => {
  return (
    <div>
      <CarouselVaccineTypes />
      <VaccineTypes />
    </div>
  );
};

export default VaccineTypesPage;
