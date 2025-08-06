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
import useUser from "@/hooks/useUser";
import { UserRole } from "@/types/entities";

const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Name is required" }),
    username: z.string().min(3, { message: "Username is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z.string().min(6, { message: "Please confirm your password" }),
    role: z.enum(["buyer", "seller"], { message: "Role is required" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { register } = useUser();
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
    const { confirmPassword, ...submitData } = data;
    try {
      await register({
        ...submitData,
        role: submitData.role as UserRole,
      });
      toast.success("Đăng ký thành công!");
      form.reset();
      // Không cần redirect, user đã được login và Header sẽ tự động cập nhật
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đăng ký thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold text-center mb-2">Create your account</h2>
      <p className="text-center text-gray-500 mb-6">Enter your details to register</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Your name" />
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
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Username" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} type="email" placeholder="Email" />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="Password" />
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
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="Confirm Password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <select {...field} className="w-full border rounded px-3 py-2">
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : "Sign up"}
          </Button>
        </form>
      </Form>
      <div className="flex items-center my-4">
        <div className="flex-grow h-px bg-gray-200" />
        <span className="mx-2 text-gray-400 text-xs">OR CONTINUE WITH</span>
        <div className="flex-grow h-px bg-gray-200" />
      </div>
      <div className="flex gap-2 mb-4">
        <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
          <span>🐱</span> Github
        </Button>
        <Button variant="outline" className="flex-1 flex items-center justify-center gap-2">
          <span>✉️</span> Google
        </Button>
      </div>
      <p className="text-center text-sm">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}