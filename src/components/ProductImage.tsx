import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src: string;
  alt: string;
  isAvailable?: boolean;
  className?: string;
  priority?: boolean;
  size?: "small" | "medium" | "large";
}

const ProductImage = ({ 
  src, 
  alt, 
  isAvailable = true, 
  className,
  priority = false,
  size = "medium"
}: ProductImageProps) => {
  const sizeClasses = {
    small: "h-40",
    medium: "h-64", 
    large: "h-80"
  };

  return (
    <div className={cn(
      "relative overflow-hidden bg-shop_light_bg group",
      className
    )}>
      <Image
        src={src || '/default.jpg'}
        alt={alt}
        width={500}
        height={500}
        priority={priority}
        className={cn(
          "w-full object-contain transition-transform duration-500",
          sizeClasses[size],
          isAvailable 
            ? "group-hover:scale-105" 
            : "opacity-50 grayscale"
        )}
      />
      {!isAvailable && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Hết hàng
          </span>
        </div>
      )}
    </div>
  );
};

export default ProductImage;
