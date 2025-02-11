import React from "react";
import { Carousel } from "antd";

const HomeCarousel: React.FC = () => {
  const onChange = (currentSlide: number) => {
    console.log(currentSlide);
  };

  return (
    <div className="relative w-full">
      {/* Khung Carousel căn giữa */}
      <div className="overflow-hidden shadow-lg">
        <Carousel afterChange={onChange} autoplay autoplaySpeed={2000}>
          {" "}
          {/* Chuyển slide mỗi 1 giây */}
          <div className="h-[500px]">
            <img
              src="https://hp.medcare.vn/wp-content/uploads/sites/5/2022/03/Banner-hang-muc-tiem-chung-scaled.jpg"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="h-[500px]">
            <img
              src="https://tiemchunggianguyen.com.vn/wp-content/uploads/2021/03/banner-tchung.jpg"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="h-[500px]">
            <img
              src="https://hongngochospital.vn/_default_upload_bucket/banner%20ti%C3%AAm.jpg"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="h-[500px]">
            <img
              src="https://cdn.nhathuoclongchau.com.vn/unsafe/2560x0/filters:quality(90)/https://cms-prod.s3-sgn09.fptcloud.com/BANNERWEB_6_IN_1_FR_1_1440x490_137ec11ded.png"
              className="h-full w-full object-cover"
            />
          </div>
        </Carousel>
      </div>
    </div>
  );
};

export default HomeCarousel;
