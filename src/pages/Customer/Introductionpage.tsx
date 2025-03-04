import React from "react";
import CarouselIntroduction from "../../components/Carousel/Carouselintroduction";
import Content from "../../components/Introduction/Content";
import IconIntroduction from "../../components/Introduction/IconIntroduction";
import Content2 from "../../components/Introduction/Content2";
import MainLayout from "../../components/Layout/MainLayout";

const Introductionpage: React.FC = () => {
  return (
    <div>
      <MainLayout>
        <CarouselIntroduction />
        <Content />
        <IconIntroduction />
        <Content2 />
      </MainLayout>
    </div>
  );
};

export default Introductionpage;
