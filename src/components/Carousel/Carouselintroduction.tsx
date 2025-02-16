import React from 'react';
import 'antd/dist/reset.css';

const CarouselIntroduction: React.FC = () => {
  return (
    <div className="w-full relative">
      <div className="relative">
        <img src="image/intro.png" alt="Giới thiệu" className="w-full h-auto rounded-lg" />
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <h2 className="text-white text-3xl font-semibold">Giới Thiệu</h2>
        </div>
      </div>
    </div>
  );
}

export default CarouselIntroduction;