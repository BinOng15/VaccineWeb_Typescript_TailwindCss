import React from "react";
import CarouselIntroduction from "../../components/Carousel/Carouselintroduction";
import Content from "../../components/Introduction/Content";
import IconIntroduction from "../../components/Introduction/IconIntroduction";
import Content2 from "../../components/Introduction/Content2";

const Introductionpage: React.FC = () => {
  return (
    <div>
      <CarouselIntroduction />
      <Content />
      <IconIntroduction />
      <Content2 />
    </div>
  );
};

export default Introductionpage;
