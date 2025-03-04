import React from "react";
import VaccinePackage from "../../components/VaccinePackage/VaccinePackage";
import MainLayout from "../../components/Layout/MainLayout";

const VaccinePackagePage: React.FC = () => {
  return (
    <MainLayout>
      <div className="bg-white">
        <VaccinePackage />
      </div>
    </MainLayout>
  );
};

export default VaccinePackagePage;
