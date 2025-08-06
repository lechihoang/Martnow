import { twMerge } from "tailwind-merge";
import { cn } from "@/lib/utils";
import PriceFormatter from "./PriceFormatter";

interface Props {
  price: number | undefined;
  discount: number | undefined;
  className?: string;
}
const PriceView = ({ price, discount, className }: Props) => {
  // Kiểm tra có discount thực sự hay không (phải > 0)
  const hasRealDiscount = discount !== undefined && discount !== null && discount > 0;
  
  // Tính giá sau giảm nếu có discount
  const discountedPrice = hasRealDiscount 
    ? price! - (price! * discount / 100) 
    : price;
  
  return (
    <div className="flex items-center gap-2">
      <PriceFormatter
        amount={discountedPrice}
        className={cn("text-shop_dark_green", className)}
      />
      {hasRealDiscount && price && (
        <PriceFormatter
          amount={price}
          className={twMerge(
            "line-through text-xs font-normal text-zinc-500",
            className
          )}
        />
      )}
    </div>
  );
};

export default PriceView;