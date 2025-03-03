import React from "react";
import HomeCarousel from "../../components/Carousel/HomeCarousel";
import VaccineHome from "../../components/Home/VaccineHome";
import Introduction from "../../components/Home/Introduction";
import PreventionSection from "../../components/Home/PresentionSection";
import MainLayout from "../../components/Layout/MainLayout";

const HomePage: React.FC = () => {
  return (
    <>
      <MainLayout>
        <HomeCarousel />
        <VaccineHome />
        <Introduction />
        <PreventionSection />
      </MainLayout>
    </>
  );
};

export default HomePage;
