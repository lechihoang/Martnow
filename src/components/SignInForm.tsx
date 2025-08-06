"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";
import useUser from "@/hooks/useUser";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
  remember: z.boolean().optional(),
});

export default function LoginForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useUser();
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
      await login(data.email, data.password);
      toast.success("Đăng nhập thành công!");
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Đăng nhập thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold text-center mb-2">Welcome back</h2>
      <p className="text-center text-gray-500 mb-6">Enter your credentials to access your account</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="remember"
              render={({ field }) => (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                  />
                  Remember me
                </label>
              )}
            />
            <Link href="/forgot-password" className="text-sm text-gray-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : "Sign in"}
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
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}