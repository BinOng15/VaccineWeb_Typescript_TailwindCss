import React from "react";
import CarouselVaccineTypes from "../../components/Carousel/CarouselVaccineTypes";
import VaccineTypes from "../../components/Vaccine/VaccineTypes";
import MainLayout from "../../components/Layout/MainLayout";

const VaccineTypesPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="mb-10">
        <CarouselVaccineTypes />
        <VaccineTypes />
      </div>
    </MainLayout>
  );
};

export default VaccineTypesPage;
