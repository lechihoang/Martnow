import React from 'react'
import Link from "next/link";

const SignIn = () => {
  return (
    <div className="text-sm capitalize font-semibold text-lightColor whitespace-nowrap">
        <Link
          href={"/register"}
          className={`hover:text-shop_light_green hoverEffect relative group `}
        >
          Đăng kí
          <span
            className={`absolute -bottom-0.5 left-1/2 w-0 h-0.5 bg-shop_light_green group-hover:w-1/2 hoverEffect group-hover:left-0`}
          />
          <span
            className={`absolute -bottom-0.5 right-1/2 w-0 h-0.5 bg-shop_light_green group-hover:w-1/2 hoverEffect group-hover:right-0`}
          />
        </Link>
    </div>
  )
}

export default SignIn