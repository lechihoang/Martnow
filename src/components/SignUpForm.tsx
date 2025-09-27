"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/entities";
import { User, Mail, Lock, Eye, EyeOff, Store, ShoppingBag } from "lucide-react";

const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Tên phải có ít nhất 2 ký tự" }),
    username: z.string().min(3, { message: "Tên đăng nhập phải có ít nhất 3 ký tự" }),
    email: z.string().email({ message: "Email không hợp lệ" }),
    password: z.string().min(6, { message: "Mật khẩu phải có ít nhất 6 ký tự" }),
    confirmPassword: z.string().min(6, { message: "Vui lòng xác nhận mật khẩu" }),
    role: z.enum(["buyer", "seller"], { message: "Vui lòng chọn vai trò" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { signup } = useAuth();
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "buyer",
    },
  });

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    setLoading(true);
    const { confirmPassword: _, ...submitData } = data;
    try {
      const result = await signup(
        submitData.email, 
        submitData.password, 
        submitData.name, 
        submitData.username
      );
      if (result && !result.error) {
        toast.success("Đăng ký thành công!");
        form.reset();
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } else {
        toast.error("Đăng ký thất bại!");
      }
    } catch (error) {
      toast.error("Đăng ký thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Tạo tài khoản mới</h2>
          <p className="text-gray-600">Tham gia cùng chúng tôi ngay hôm nay</p>
        </div>

        {/* Form */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-100 p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Name and Username Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Họ và tên</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <Input 
                            {...field} 
                            placeholder="Nhập họ và tên"
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
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Tên đăng nhập</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Nhập tên đăng nhập"
                          className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

              {/* Password Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            className="pl-10 pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
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

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">Xác nhận mật khẩu</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <Input 
                            {...field} 
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Nhập lại mật khẩu"
                            className="pl-10 pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">Vai trò</FormLabel>
                    <FormControl>
                      <div className="grid grid-cols-2 gap-3">
                        <label className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                          field.value === 'buyer' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <input
                            type="radio"
                            value="buyer"
                            checked={field.value === 'buyer'}
                            onChange={field.onChange}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-3">
                            <ShoppingBag className={`w-6 h-6 ${field.value === 'buyer' ? 'text-blue-600' : 'text-gray-400'}`} />
                            <div>
                              <div className={`font-medium ${field.value === 'buyer' ? 'text-blue-900' : 'text-gray-900'}`}>
                                Người mua
                              </div>
                              <div className="text-sm text-gray-500">Mua sắm và đặt hàng</div>
                            </div>
                          </div>
                        </label>
                        
                        <label className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 ${
                          field.value === 'seller' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <input
                            type="radio"
                            value="seller"
                            checked={field.value === 'seller'}
                            onChange={field.onChange}
                            className="sr-only"
                          />
                          <div className="flex items-center gap-3">
                            <Store className={`w-6 h-6 ${field.value === 'seller' ? 'text-blue-600' : 'text-gray-400'}`} />
                            <div>
                              <div className={`font-medium ${field.value === 'seller' ? 'text-blue-900' : 'text-gray-900'}`}>
                                Người bán
                              </div>
                              <div className="text-sm text-gray-500">Bán hàng và quản lý</div>
                            </div>
                          </div>
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 transition-colors duration-200" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Đang đăng ký...
                  </div>
                ) : (
                  "Đăng ký"
                )}
              </Button>
            </form>
          </Form>



          {/* Sign In Link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Đã có tài khoản?{" "}
            <Link 
              href="/auth/login" 
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}