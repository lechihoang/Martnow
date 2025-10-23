import { cn } from "@/lib/utils";

interface ProductStockProps {
  stock: number;
  isAvailable?: boolean;
  showLabel?: boolean;
  className?: string;
}

const ProductStock = ({ 
  stock, 
  isAvailable = true,
  showLabel = true,
  className 
}: ProductStockProps) => {
  const getStockStatus = () => {
    if (!isAvailable || stock === 0) {
      return {
        text: "Đã hết hàng",
        color: "text-red-600",
        bgColor: "bg-red-50"
      };
    }
    
    if (stock <= 5) {
      return {
        text: `Chỉ còn ${stock} sản phẩm`,
        color: "text-orange-600",
        bgColor: "bg-orange-50"
      };
    }
    
    if (stock <= 20) {
      return {
        text: `${stock} sản phẩm có sẵn`,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50"
      };
    }
    
    return {
      text: `${stock} sản phẩm có sẵn`,
      color: "text-green-600",
      bgColor: "bg-green-50"
    };
  };

  const stockStatus = getStockStatus();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showLabel && (
        <span className="text-sm text-gray-500 font-medium">
          Tình trạng:
        </span>
      )}
      <span className={cn(
        "text-sm font-semibold px-2 py-1 rounded-full",
        stockStatus.color,
        stockStatus.bgColor
      )}>
        {stockStatus.text}
      </span>
    </div>
  );
};

export default ProductStock;
