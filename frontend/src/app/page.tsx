
import HeaderSlider from "../components/HeaderSlider";
import CategoryExplorer from "../components/CategoryExplorer";
import FeaturedProducts from "../components/FeaturedProducts";

export default function Home() {
  return (
    <div>
      {/* Hero Slider */}
      <HeaderSlider />

      {/* Category Explorer */}
      <CategoryExplorer />

      <div>
        {/* Featured Products Section */}
        <FeaturedProducts />

      {/* Features Section */}
      <section className="py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-medium text-gray-900 mb-4">
            Tại sao chọn MartNow?
          </h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            Chúng tôi cam kết mang đến trải nghiệm mua sắm tạp hóa tốt nhất cho bạn
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <div className="text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Giao hàng siêu nhanh</h3>
            <p className="text-xs text-gray-600">30 phút</p>
          </div>

          {/* Feature 2 */}
          <div className="text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Chất lượng đảm bảo</h3>
            <p className="text-xs text-gray-600">100% chính hãng</p>
          </div>

          {/* Feature 3 */}
          <div className="text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Giá cạnh tranh</h3>
            <p className="text-xs text-gray-600">Ưu đãi hấp dẫn</p>
          </div>

          {/* Feature 4 */}
          <div className="text-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">24/7 hỗ trợ</h3>
            <p className="text-xs text-gray-600">Luôn sẵn sàng</p>
          </div>
        </div>
        </section>
      </div>
    </div>
  );
}
