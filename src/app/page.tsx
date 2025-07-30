
import HomeBanner from "../components/HomeBanner";
import ProductCard from "../components/ProductCard";
import Container from "../components/Container";
import Header from "../components/Header";
import Footer from "../components/Footer";
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


  // Tạo danh sách 11 sản phẩm mẫu
  const sampleProducts: (Product & { discount?: number })[] = [
    {
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
    },
    {
      id: 2,
      name: "Bánh mì thịt",
      description: "Bánh mì kẹp thịt truyền thống.",
      price: 20000,
      imageUrl: "/images/banhmi.jpeg",
      isAvailable: true,
      stock: 10,
      seller: sampleSeller,
      category: sampleCategory,
      discount: 5,
    },
    {
      id: 3,
      name: "Bánh mì trứng",
      description: "Bánh mì kẹp trứng chiên.",
      price: 18000,
      imageUrl: "/images/banhmi.jpeg",
      isAvailable: true,
      stock: 8,
      seller: sampleSeller,
      category: sampleCategory,
      discount: 0,
    },
    {
      id: 4,
      name: "Bánh mì chả lụa",
      description: "Bánh mì kẹp chả lụa thơm ngon.",
      price: 22000,
      imageUrl: "/images/banhmi.jpeg",
      isAvailable: true,
      stock: 12,
      seller: sampleSeller,
      category: sampleCategory,
      discount: 7,
    },
    {
      id: 5,
      name: "Bánh mì pate",
      description: "Bánh mì pate béo ngậy.",
      price: 21000,
      imageUrl: "/images/banhmi.jpeg",
      isAvailable: true,
      stock: 15,
      seller: sampleSeller,
      category: sampleCategory,
      discount: 0,
    },
    {
      id: 6,
      name: "Bánh mì xíu mại",
      description: "Bánh mì kẹp xíu mại nóng hổi.",
      price: 23000,
      imageUrl: "/images/banhmi.jpeg",
      isAvailable: true,
      stock: 9,
      seller: sampleSeller,
      category: sampleCategory,
      discount: 8,
    },
    {
      id: 7,
      name: "Bánh mì gà xé",
      description: "Bánh mì kẹp gà xé cay.",
      price: 24000,
      imageUrl: "/images/banhmi.jpeg",
      isAvailable: true,
      stock: 7,
      seller: sampleSeller,
      category: sampleCategory,
      discount: 0,
    },
    {
      id: 8,
      name: "Bánh mì cá hộp",
      description: "Bánh mì kẹp cá hộp đậm đà.",
      price: 26000,
      imageUrl: "/images/banhmi.jpeg",
      isAvailable: true,
      stock: 6,
      seller: sampleSeller,
      category: sampleCategory,
      discount: 12,
    },
    {
      id: 9,
      name: "Bánh mì bò nướng",
      description: "Bánh mì kẹp bò nướng thơm lừng.",
      price: 28000,
      imageUrl: "/images/banhmi.jpeg",
      isAvailable: true,
      stock: 5,
      seller: sampleSeller,
      category: sampleCategory,
      discount: 0,
    },
    {
      id: 10,
      name: "Bánh mì phô mai",
      description: "Bánh mì kẹp phô mai béo ngậy.",
      price: 27000,
      imageUrl: "/images/banhmi.jpeg",
      isAvailable: true,
      stock: 11,
      seller: sampleSeller,
      category: sampleCategory,
      discount: 6,
    },
    {
      id: 11,
      name: "Bánh mì chay",
      description: "Bánh mì kẹp rau củ chay.",
      price: 19000,
      imageUrl: "/images/banhmi.jpeg",
      isAvailable: true,
      stock: 13,
      seller: sampleSeller,
      category: sampleCategory,
      discount: 0,
    },
  ];

  
  return (
    <div>
      <HomeBanner />
      <Container className="flex flex-col lg:px-0 my-10">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-10">
          {sampleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </Container>
    </div>
  );
}
