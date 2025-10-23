"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Email không hợp lệ" }),
  password: z.string().min(1, { message: "Mật khẩu là bắt buộc" }),
  remember: z.boolean().optional(),
});

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signin } = useAuth();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      console.log('Đang đăng nhập với:', data.email);
      const result = await signin(data.email, data.password);
      console.log('Kết quả đăng nhập:', result);

      if (result.error) {
        toast.error(result.error || "Đăng nhập thất bại!");
      } else {
        toast.success("Đăng nhập thành công!");
        // Không cần router.push("/") vì useAuth đã xử lý chuyển hướng
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      toast.error("Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại</h2>
          <p className="text-gray-600">Đăng nhập vào tài khoản của bạn</p>
        </div>

        {/* Form */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input 
                          {...field} 
                          type="email" 
                          placeholder="Nhập email của bạn"
                          className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Mật khẩu</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="Nhập mật khẩu"
                          className="pl-10 pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between">
                <FormField
                  control={form.control}
                  name="remember"
                  render={({ field }) => (
                    <label className="flex items-center gap-2 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Ghi nhớ đăng nhập
                    </label>
                  )}
                />
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200 font-medium"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 transition-colors duration-200" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang đăng nhập...
                  </div>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </form>
          </Form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-200" />
            <span className="mx-4 text-gray-400 text-sm font-medium">HOẶC</span>
            <div className="flex-grow h-px bg-gray-200" />
          </div>



          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Chưa có tài khoản?{" "}
            <Link 
              href="/auth/register" 
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
            >
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}