import React from "react";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, 
  Users, 
  Shield, 
  Truck, 
  Star, 
  Heart,
  CheckCircle,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

const IntroductionPage = () => {
  const features = [
    {
      icon: ShoppingBag,
      title: "Mua sắm tiện lợi",
      description: "Khám phá hàng nghìn sản phẩm chất lượng từ các cửa hàng uy tín"
    },
    {
      icon: Users,
      title: "Cộng đồng đáng tin cậy",
      description: "Kết nối với người bán và người mua trong môi trường an toàn"
    },
    {
      icon: Shield,
      title: "Bảo mật tuyệt đối",
      description: "Thông tin cá nhân và thanh toán được bảo vệ an toàn"
    },
    {
      icon: Truck,
      title: "Giao hàng nhanh chóng",
      description: "Dịch vụ giao hàng đáng tin cậy với thời gian giao hàng linh hoạt"
    },
    {
      icon: Star,
      title: "Đánh giá chất lượng",
      description: "Hệ thống đánh giá và nhận xét giúp bạn chọn sản phẩm tốt nhất"
    },
    {
      icon: Heart,
      title: "Dịch vụ khách hàng",
      description: "Hỗ trợ 24/7 với đội ngũ chăm sóc khách hàng chuyên nghiệp"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Sản phẩm" },
    { number: "500+", label: "Cửa hàng" },
    { number: "50,000+", label: "Khách hàng" },
    { number: "99%", label: "Hài lòng" }
  ];

  const benefits = [
    "Không phí ẩn, giá cả minh bạch",
    "Thanh toán an toàn qua VNPay",
    "Hoàn tiền 100% nếu không hài lòng",
    "Giao hàng toàn quốc",
    "Hỗ trợ đổi trả trong 7 ngày",
    "Tích điểm thưởng cho mỗi đơn hàng"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 px-6 md:px-16 lg:px-32" style={{backgroundColor: '#E6E9F2'}}>
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-medium text-gray-900 mb-6">
            Chào mừng đến với{" "}
            <span className="text-orange-600">MartNow</span>
          </h1>
            <p className="text-base text-gray-600 mb-8 leading-relaxed">
              Nền tảng mua sắm trực tuyến hàng đầu Việt Nam, kết nối người mua và người bán
              trong môi trường an toàn, minh bạch và tiện lợi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/shop">
                <button className="btn-primary px-8 py-3 flex items-center justify-center gap-2 group">
                  Khám phá ngay
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/auth/register">
                <button className="btn-outline px-8 py-3">
                  Đăng ký miễn phí
                </button>
              </Link>
            </div>
          </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-6 md:px-16 lg:px-32">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl md:text-3xl font-semibold text-orange-600 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 md:px-16 lg:px-32">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-medium text-gray-900 mb-4">
            Tại sao chọn MartNow?
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Chúng tôi cam kết mang đến trải nghiệm mua sắm tốt nhất với những tính năng độc đáo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="card-quickcart p-6">
              <div className="w-12 h-12 bg-gray-500/10 rounded-full flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-6 md:px-16 lg:px-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl font-medium text-gray-900 mb-4">
              Lợi ích khi sử dụng MartNow
            </h2>
            <p className="text-base text-gray-600 mb-6 leading-relaxed">
              Chúng tôi cam kết mang đến những lợi ích thiết thực nhất cho người dùng,
              từ việc mua sắm an toàn đến dịch vụ hậu mãi chu đáo.
            </p>
            <div className="grid grid-cols-1 gap-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card-quickcart p-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Bắt đầu ngay hôm nay
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Tham gia cộng đồng MartNow và trải nghiệm mua sắm tuyệt vời
              </p>
              <div className="space-y-3">
                <Link href="/auth/register">
                  <button className="btn-primary w-full">
                    Đăng ký tài khoản
                  </button>
                </Link>
                <Link href="/shop">
                  <button className="btn-outline w-full">
                    Khám phá sản phẩm
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 md:px-16 lg:px-32 bg-orange-600">
        <div className="text-center text-white">
          <h2 className="text-2xl font-medium mb-4">
            Sẵn sàng trải nghiệm?
          </h2>
          <p className="text-base mb-6 opacity-90 max-w-2xl mx-auto">
            Tham gia cùng hàng nghìn người dùng đang tin tưởng và sử dụng MartNow mỗi ngày
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop">
              <button className="btn-secondary px-8 py-3">
                Bắt đầu mua sắm
              </button>
            </Link>
            <Link href="/blog">
              <button className="px-8 py-3 border border-white text-white bg-transparent hover:bg-white hover:text-orange-600 transition-all rounded-lg">
                Đọc tin tức
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IntroductionPage;
