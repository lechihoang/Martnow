"use client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    // Gọi API backend để logout (xóa cookie refreshToken)
    await fetch("http://localhost:3001/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    // Xóa user và accessToken ở localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    toast.success("Đã đăng xuất!");
    router.push("/");
    // Reload lại trang để cập nhật UI
    window.location.reload();
  };

  return (
    <button
      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-darkColor"
      onClick={handleLogout}
    >
      Đăng xuất
    </button>
  );
}
