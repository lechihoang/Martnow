"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const HeaderSlider = () => {
  const sliderData = [
    {
      id: 1,
      title: "Khám Phá Thế Giới Ẩm Thực - Đặt Món Ngay Hôm Nay!",
      offer: "Ưu đãi có hạn giảm 30%",
      buttonText: "Đặt ngay",
      imgSrc: "/header1.png",
    },
    {
      id: 2,
      title: "Giao Hàng Nhanh Chóng - Thức Ăn Tươi Ngon Đến Tận Nơi!",
      offer: "Nhanh tay, chỉ còn ít suất!",
      buttonText: "Mua ngay",
      imgSrc: "/header2.jpg",
    },
    {
      id: 3,
      title: "Chất Lượng Hàng Đầu - Thực Phẩm An Toàn Cho Gia Đình!",
      offer: "Ưu đãi đặc biệt giảm 40%",
      buttonText: "Đặt hàng",
      imgSrc: "/header3.jpg",
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
    <div className="overflow-hidden relative w-full mt-6">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          transform: `translateX(-${currentSlide * 100}%)`,
        }}
      >
        {sliderData.map((slide) => (
          <div
            key={slide.id}
            className="relative min-w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden"
          >
            {/* Background Image */}
            <Image
              src={slide.imgSrc}
              alt={slide.title}
              fill
              className="object-cover"
              priority={slide.id === 1}
            />
            
            {/* Content */}
            <div className="relative h-full flex items-center px-6 md:px-12 lg:px-20">
              <div className="max-w-xl lg:max-w-2xl space-y-4 md:space-y-6">
                <div className="inline-block">
                  <span className="px-4 py-1.5 bg-amber-500/90 backdrop-blur-sm text-white text-xs md:text-sm font-bold rounded-full shadow-lg">
                    {slide.offer}
                  </span>
                </div>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
                  {slide.title}
                </h1>
                <button className="px-10 py-3.5 bg-emerald-600 rounded-full text-white text-base md:text-lg font-bold hover:bg-emerald-700 transition-all hover:scale-105 shadow-2xl">
                  {slide.buttonText}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots Navigation */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {sliderData.map((_, index) => (
          <button
            key={index}
            onClick={() => handleSlideChange(index)}
            className={`h-2.5 rounded-full cursor-pointer transition-all ${currentSlide === index
              ? "bg-emerald-600 w-8"
              : "bg-gray-400 w-2.5 hover:bg-gray-500"
              }`}
            aria-label={`Go to slide ${index + 1}`}
          ></button>
        ))}
      </div>
    </div>
  );
};

export default HeaderSlider;