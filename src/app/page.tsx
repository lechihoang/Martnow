
import HomeBanner from "../components/HomeBanner";
import ProductCard from "../components/ProductCard";
import Container from "../components/Container";
import type { Product, Seller, Category } from "../types/entities";

export default function Home() {
  // Giá trị giả cho seller và category để demo
  const sampleSeller: Seller = {
    id: 1,
    user: {
      id: 1,
      name: "Người bán demo",
      username: "seller1",
      email: "seller1@email.com",
      role: "seller",
      password: "",
    },
    shopName: "Tiệm bánh demo",
    shopAddress: "123 Đường Demo",
    shopPhone: "0123456789",
    description: "Shop bán bánh demo",
    products: [],
  };

  const sampleCategory: Category = {
    id: 1,
    name: "Bánh mì",
    description: "Các loại bánh mì",
    products: [],
  };

  const sampleProduct: Product & { discount?: number } = {
    id: 1,
    name: "Bánh mì đặc biệt",
    description: "Bánh mì thơm ngon, giòn rụm.",
    price: 25000,
    imageUrl: "/images/banhmi.jpeg",
    isAvailable: true,
    stock: 0,
    seller: sampleSeller,
    category: sampleCategory,
    discount: 10,
  };
  return (
    <div>
      <HomeBanner />
      <Container className="flex flex-col lg:px-0 my-10">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-10">
            <ProductCard product={sampleProduct} />
        </div>
      </Container>
      
    </div>
  );
}
