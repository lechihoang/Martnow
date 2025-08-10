"use client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import useUser from "@/hooks/useUser";

export default function LogoutButton() {
  const router = useRouter();
  const { logout } = useUser();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Đã đăng xuất!");
      router.push("/");
    } catch {
      toast.error("Có lỗi xảy ra khi đăng xuất");
      // Fallback: force logout locally
      localStorage.removeItem("user");
      router.push("/");
      window.location.reload();
    }
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
