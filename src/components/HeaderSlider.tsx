"use client";

import React, { useState, useEffect } from "react";
import { assets } from "@/assets/assets";

const HeaderSlider = () => {
  const sliderData = [
    {
      id: 1,
      title: "Khám Phá Thế Giới Ẩm Thực - Đặt Món Ngay Hôm Nay!",
      offer: "Ưu đãi có hạn giảm 30%",
      buttonText1: "Đặt ngay",
      buttonText2: "Khám phá thêm",
      imgSrc: assets.header_headphone_image,
    },
    {
      id: 2,
      title: "Giao Hàng Nhanh Chóng - Thức Ăn Tươi Ngon Đến Tận Nơi!",
      offer: "Nhanh tay, chỉ còn ít suất!",
      buttonText1: "Mua ngay",
      buttonText2: "Xem ưu đãi",
      imgSrc: assets.header_playstation_image,
    },
    {
      id: 3,
      title: "Chất Lượng Hàng Đầu - Thực Phẩm An Toàn Cho Gia Đình!",
      offer: "Ưu đãi đặc biệt giảm 40%",
      buttonText1: "Đặt hàng",
      buttonText2: "Tìm hiểu thêm",
      imgSrc: assets.header_macbook_image,
    },
  ];

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sliderData.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [sliderData.length]);

  const handleSlideChange = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="overflow-hidden relative w-full">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {sliderData.map((slide) => (
          <div
            key={slide.id}
            className="flex flex-col-reverse md:flex-row items-center justify-between bg-[#E6E9F2] py-16 md:py-20 md:px-14 px-5 mt-6 rounded-xl min-w-full"
          >
            <div className="md:pl-8 mt-10 md:mt-0">
              <p className="md:text-base text-orange-600 pb-1">{slide.offer}</p>
              <h1 className="max-w-lg md:text-[40px] md:leading-[48px] text-2xl font-semibold">
                {slide.title}
              </h1>
              <div className="flex items-center mt-4 md:mt-6">
                <button className="md:px-10 px-7 md:py-2.5 py-2 bg-orange-600 rounded-full text-white font-medium hover:bg-orange-700 transition-colors">
                  {slide.buttonText1}
                </button>
                <button className="group flex items-center gap-2 px-6 py-2.5 font-medium hover:text-orange-600 transition-colors">
                  {slide.buttonText2}
                  <span className="group-hover:translate-x-1 transition text-xl">
                    →
                  </span>
                </button>
              </div>
            </div>
            <div className="flex items-center flex-1 justify-center">
              <div className="md:w-96 w-64 md:h-96 h-64 bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl flex items-center justify-center">
                <div className="w-32 h-32 bg-orange-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">🍕</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 mt-8">
        {sliderData.map((_, index) => (
          <div
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`h-2 w-2 rounded-full cursor-pointer transition-colors ${
              currentSlide === index ? "bg-orange-600" : "bg-gray-500/30"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default HeaderSlider;