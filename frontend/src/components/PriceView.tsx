import { cn } from "@/lib/utils";
import PriceFormatter from "./PriceFormatter";

interface Props {
  price: number | undefined;
  discount: number | undefined;
  discountedPrice?: number | undefined;
  className?: string;
}
const PriceView = ({ price, discount, discountedPrice, className }: Props) => {
  // Kiểm tra có discount thực sự hay không (phải > 0)
  const hasRealDiscount = discount !== undefined && discount !== null && discount > 0;
  
  // Sử dụng discountedPrice từ API nếu có, nếu không thì tính toán
  const finalDiscountedPrice = discountedPrice !== undefined 
    ? discountedPrice 
    : (hasRealDiscount ? price! * (100 - discount) / 100 : price);
  
  return (
    <div className="flex items-center gap-2">
      <PriceFormatter
        amount={finalDiscountedPrice}
        className={cn("text-shop_dark_green", className)}
      />
    </div>
  );
};

export default PriceView;