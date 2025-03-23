import React from "react";
import VaccineTypes from "../../components/Vaccine/VaccineTypes";
import MainLayout from "../../components/Layout/MainLayout";

const VaccineTypesPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="mb-10">
        <VaccineTypes />
      </div>
    </MainLayout>
  );
};

export default VaccineTypesPage;
