import React from "react";
import HomeCarousel from "../../components/Carousel/HomeCarousel";
import VaccineHome from "../../components/Home/VaccineHome";
import Introduction from "../../components/Home/Introduction";
import PreventionSection from "../../components/Home/PresentionSection";

const HomePage: React.FC = () => {
  return (
    <>
      <HomeCarousel />
      <VaccineHome />
      <Introduction />
      <PreventionSection />
    </>
  );
};

export default HomePage;
