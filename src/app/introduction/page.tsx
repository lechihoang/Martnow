import React from "react";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";

const IntroductionPage = () => {
  return (
    <div className="flex flex-col w-full">
      {/* Section 1: Hero Giới thiệu */}
      <section className="relative w-full min-h-[380px] md:min-h-[480px] flex items-center bg-shop_dark_green text-white">
        {/* Ảnh nền có thể thêm sau */}
        <div className="absolute inset-0 w-full h-full bg-black/40 z-0" style={{ pointerEvents: 'none' }} />
        <Container className="relative z-10 py-16 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 flex flex-col gap-4 md:gap-6">
            <h1 className="text-3xl md:text-5xl font-bold mb-2">Chúng tôi là ai?</h1>
            <p className="text-lg md:text-xl max-w-xl text-white/90">
              <span className="font-semibold text-shop_orange">Foodee</span> là nền tảng thương mại điện tử về đồ ăn, hoạt động từ năm 2020, kết nối hàng ngàn người bán và người mua trên toàn quốc. Chúng tôi mang đến trải nghiệm mua bán thực phẩm tiện lợi, an toàn và đa dạng.
            </p>
            <div className="flex flex-wrap gap-6 mt-4">
              <div className="flex flex-col items-center">
                <span className="text-2xl md:text-3xl font-bold text-shop_light_green">5+</span>
                <span className="text-sm md:text-base">Năm hoạt động</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl md:text-3xl font-bold text-shop_light_green">50.000+</span>
                <span className="text-sm md:text-base">Khách hàng</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl md:text-3xl font-bold text-shop_light_green">2.000+</span>
                <span className="text-sm md:text-base">Nhà bán hàng</span>
              </div>
            </div>
          </div>
          {/* Ảnh hero, có thể thêm sau */}
          <div className="flex-1 flex justify-center items-center">
            <div className="w-[260px] h-[260px] md:w-[340px] md:h-[340px] rounded-2xl overflow-hidden bg-shop_light_pink border-4 border-shop_light_pink shadow-xl flex items-center justify-center">
              {/* <Image src="/images/banhmi.jpeg" alt="Foodee" fill className="object-cover object-center" /> */}
              {/* Để trống, bạn có thể thêm ảnh sau */}
            </div>
          </div>
        </Container>
      </section>

      {/* Section 2: Sứ mệnh & Giá trị */}
      <section className="w-full bg-white py-16">
        <Container className="flex flex-col md:flex-row items-center gap-12">
          {/* Ảnh minh họa, có thể thêm sau */}
          <div className="flex-1 flex flex-col gap-8">
            <h2 className="text-2xl md:text-3xl font-bold text-shop_dark_green mb-2">Nhiệm vụ của chúng tôi</h2>
            <ul className="list-disc pl-5 text-base text-darkColor/80 space-y-2">
              <li><span className="font-semibold text-shop_light_green">Kết nối cộng đồng yêu ẩm thực</span> trên khắp cả nước.</li>
              <li><span className="font-semibold text-shop_light_green">Thúc đẩy kinh doanh địa phương</span> và hỗ trợ các nhà bán hàng nhỏ lẻ.</li>
              <li><span className="font-semibold text-shop_light_green">Đảm bảo chất lượng, minh bạch, an toàn</span> cho từng sản phẩm.</li>
              <li><span className="font-semibold text-shop_light_green">Trải nghiệm mua sắm tiện lợi, hiện đại</span> cho mọi khách hàng.</li>
            </ul>
          </div>
          <div className="flex-1 flex flex-col gap-6">
            <div className="w-full h-[220px] md:h-[320px] rounded-2xl bg-shop_light_pink border-4 border-shop_light_pink shadow-xl flex items-center justify-center">
              {/* <Image src="/images/mission.jpg" alt="Sứ mệnh Foodee" fill className="object-cover object-center" /> */}
            </div>
          </div>
        </Container>
      </section>

      {/* Section 3: Vì sao chọn Foodee? */}
      <section className="w-full bg-shop_dark_green py-16 text-white">
        <Container className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 flex flex-col gap-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-shop_orange">Tại sao lại là Foodee?</h2>
            <p className="text-lg md:text-xl text-white/90 max-w-xl">
              Foodee không chỉ là nơi mua bán thực phẩm, mà còn là nơi truyền cảm hứng ẩm thực, kết nối cộng đồng và lan tỏa giá trị bền vững. Mỗi đơn hàng là một trải nghiệm, mỗi sản phẩm là một câu chuyện.
            </p>
            <ul className="list-disc pl-5 text-base space-y-2">
              <li>Giao diện hiện đại, dễ sử dụng, tối ưu cho mọi thiết bị.</li>
              <li>Đội ngũ hỗ trợ tận tâm, sẵn sàng đồng hành cùng bạn.</li>
              <li>Chính sách bảo vệ quyền lợi khách hàng và nhà bán hàng rõ ràng.</li>
            </ul>
            <Button className="mt-6 w-fit bg-shop_light_green hover:bg-shop_btn_dark_green text-white px-8 py-3 text-lg rounded-md shadow-md" asChild>
              <a href="/shop">Khám phá ngay</a>
            </Button>
          </div>
          <div className="flex-1 flex flex-col gap-6">
            <div className="w-full h-[220px] md:h-[320px] rounded-2xl bg-shop_light_pink border-4 border-shop_light_pink shadow-xl flex items-center justify-center">
              {/* <Image src="/images/why-foodee.jpg" alt="Vì sao chọn Foodee" fill className="object-cover object-center" /> */}
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

export default IntroductionPage;
