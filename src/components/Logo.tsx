import { cn } from "../lib/utils";
import Link from "next/link";
import React from "react";

const Logo = ({
  className,
  spanDesign,
}: {
  className?: string;
  spanDesign?: string;
}) => {
  return (
    <Link href={"/"} className="inline-flex">
      <h2
        className={cn(
          "text-2xl text-shop_orange font-black tracking-wider uppercase font-sans",
          className
        )}
      >
        Foodee
      </h2>
    </Link>
  );
};

export default Logo;