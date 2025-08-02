import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Category } from "../types/entities";

interface ProductCategoryProps {
  category: Category;
  variant?: "badge" | "link" | "text";
  className?: string;
}

const ProductCategory = ({ 
  category, 
  variant = "badge",
  className 
}: ProductCategoryProps) => {
  const baseClasses = "text-xs font-medium";
  
  const variantClasses = {
    badge: "bg-blue-100 text-blue-800 px-2 py-1 rounded-full inline-block",
    link: "text-blue-600 hover:text-blue-800 hover:underline transition-colors",
    text: "text-gray-600"
  };

  const content = (
    <span className={cn(
      baseClasses,
      variantClasses[variant],
      className
    )}>
      {category.name}
    </span>
  );

  if (variant === "link") {
    return (
      <Link href={`/category/${category.id}`}>
        {content}
      </Link>
    );
  }

  return content;
};

export default ProductCategory;
