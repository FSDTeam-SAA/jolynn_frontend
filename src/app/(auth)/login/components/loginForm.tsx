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
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." }),
    rememberMe: z.boolean(),
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
      rememberMe: true,
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
      console.log(res);
      if (res?.error) {
        throw new Error(res.error);
      }

      toast.success("Login successful!");
      router.push("/");
    } catch (error) {
      console.error("Login failed:", error);
      toast.error((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full flex items-center justify-center px-4">
      <div className="w-full md:w-[547px] p-3 md:p-7 lg:p-8 rounded-[16px] bg-white shadow-[0px_5px_10px_0px_#00000029]">
        <div className="flex items-center justify-center mb-4">
          <Link href="/">
            <Image
              src="/assets/images/logo.png"
              alt="Logo"
              width={100}
              height={100}
              className="w-[90px] h-[90px]"
            />
          </Link>
        </div>

        <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-primary text-center leading-[120%]">
          Log in to your account
        </h3>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-5 md:pt-6"
          >
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1 text-base font-semibold leading-[120%] text-[#4365D0] pb-2">
                    Email Address/Username
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      className="w-full h-[48px] text-base font-medium leading-[120%] text-primary rounded-[8px] p-4 border border-[#F5F3FA] placeholder:text-[#667481] shadow-[0px_0px_10px_0px_#00000026]"
                      placeholder="Type your email or username"
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
                  <FormLabel className="flex items-center gap-1 text-base font-semibold leading-[120%] text-[#4365D0] pb-2">
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        className="w-full h-[48px] text-base font-medium leading-[120%] text-primary rounded-[8px] p-4 border border-[#F5F3FA] placeholder:text-[#667481] shadow-[0px_0px_10px_0px_#00000026]"
                        placeholder="********"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword((prev) => !prev)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff size={20} className="text-[#4365D0]"/>
                        ) : (
                          <Eye size={20} className="text-[#4365D0]"/>
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <div className="w-full flex items-center justify-between">
                  <FormItem className="flex items-center gap-[10px]">
                    <FormControl className="mt-1">
                      <Checkbox
                        id="rememberMe"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-primary data-[state=checked]:text-white border-primary"
                      />
                    </FormControl>
                    <Label
                      className="text-sm md:text-base font-medium text-[#4365D0] leading-[120%]"
                      htmlFor="rememberMe"
                    >
                      Remember Me
                    </Label>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                  <Link
                    className="text-sm md:text-base font-semibold text-[#667481] cursor-pointer leading-[120%] hover:underline"
                    href="/forgot-password"
                  >
                    Forgot Password?
                  </Link>
                </div>
              )}
            />
            <Button
              disabled={isLoading}
               className="text-base font-semibold text-white leading-[120%] rounded-[8px] w-full h-[48px] bg-primary"
              type="submit"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>

             <p className="text-sm md:text-base text-[#1A1A2E] font-normal text-center pt-1 leading-[120%] ">Don’t Have an account? <Link className="text-[#23547B] underline" href="/sign-up">Sign up</Link></p>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default LoginForm;
