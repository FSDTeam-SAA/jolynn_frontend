"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
});

const LoginForm = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });
    console.log(res)
      if (res?.error) {
        throw new Error(res.error);
      }

      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h3 className="text-2xl mb-16 md:text-[28px] lg:text-[32px] font-extrabold text-[#82B7B4] text-center leading-[120%]">
        Hello, Welcome!
      </h3>

      <div className="w-full md:w-[547px] p-3 md:p-7 lg:p-8 rounded-[16px] bg-white shadow-[0px_5px_10px_0px_#00000029]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-5 md:pt-6">
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1 text-base font-medium leading-[120%] text-[#499FC0] pb-2">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      className="w-full h-[48px] text-base font-medium leading-[120%] text-[#293440] rounded-[8px] p-4 border border-[#0000004D] placeholder:text-[#787878]"
                      placeholder="Enter your Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1 text-base font-medium leading-[120%] text-[#499FC0] pb-2">
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        className="w-full h-[48px] text-base font-medium leading-[120%] text-[#293440] rounded-[8px] p-4 border border-[#0000004D] placeholder:text-[#787878]"
                        placeholder="Enter your Password"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword((prev) => !prev)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <Link href="/forgot-password"> 
            <p className="text-base text-end mt-3 font-medium leading-[120%] text-[#499FC0]">
              Forgot Password?
            </p>
            </Link>
            <Button
              disabled={isLoading}
              className="text-base font-medium text-[#F8FAF9] leading-[120%] rounded-[8px] w-full h-[48px] bg-primary"
              type="submit"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default LoginForm;
