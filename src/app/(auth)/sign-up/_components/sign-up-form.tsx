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
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";

const formSchema = z
  .object({
    firstName: z.string().min(1, { message: "First name is required." }),
    lastName: z.string().min(1, { message: "Last name is required." }),
    username: z.string().min(1, { message: "Username is required." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    phoneNumber: z.string().min(1, { message: "Phone number is required." }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long." }),
    confirmPassword: z.string().min(1, { message: "Confirm password is required." }),
    agreementAccepted: z
      .boolean()
      .refine((value) => value, { message: "Please accept the terms and conditions." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

const SignupForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      agreementAccepted: false,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["register-user"],
    mutationFn: async (values: FormValues) => {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";
      const res = await fetch(`${apiUrl}/auth/register/user`, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Registration failed");
      }

      return data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "User registered successfully");
      router.push("/login");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    },
  });

  const onSubmit = (values: FormValues) => {
    mutate(values);
  };

  const inputClassName =
    "w-full h-11 md:h-[48px] text-base font-medium leading-[120%] text-primary rounded-[8px] p-4 border border-[#F5F3FA] placeholder:text-[#667481] shadow-[0px_0px_10px_0px_#00000026]";
  const labelClassName =
    "flex items-center gap-1 text-base font-semibold leading-[120%] text-[#4365D0]";

  return (
    <div className="w-full flex items-center justify-center px-4">
      <div className="w-full md:w-[647px] p-3 md:p-7 lg:p-8 rounded-[16px] bg-white shadow-[0px_5px_10px_0px_#00000029]">
        <div className="flex items-center justify-center mb-2 md:mb-4">
          <Link href="/">
            <Image
              src="/assets/images/logo.png"
              alt="Logo"
              width={100}
              height={100}
              className="w-16 md:w-[90px] h-16 md:h-[90px]"
            />
          </Link>
        </div>

        <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-primary text-center leading-[120%]">
          Create Your Account
        </h3>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3 md:space-y-4 pt-3 md:pt-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClassName}>First Name</FormLabel>
                    <FormControl>
                      <Input
                        className={inputClassName}
                        placeholder="Type your name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClassName}>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        className={inputClassName}
                        placeholder="Type your name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClassName}>User Name</FormLabel>
                    <FormControl>
                      <Input
                        className={inputClassName}
                        placeholder="Type your username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClassName}>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      className={inputClassName}
                      placeholder="Sidequote your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClassName}>
                    Contact number ( opt)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      className={inputClassName}
                      placeholder="0215874167122"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClassName}>Create Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        className={inputClassName}
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
                          <EyeOff size={20} className="text-[#4365D0]" />
                        ) : (
                          <Eye size={20} className="text-[#4365D0]" />
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
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClassName}>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        className={inputClassName}
                        placeholder="********"
                        {...field}
                      />
                      <button
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff size={20} className="text-[#4365D0]" />
                        ) : (
                          <Eye size={20} className="text-[#4365D0]" />
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
              name="agreementAccepted"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-[10px]">
                    <FormControl>
                      <Checkbox
                        id="agreementAccepted"
                        checked={field.value}
                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                        className="data-[state=checked]:bg-primary data-[state=checked]:text-white border-primary"
                      />
                    </FormControl>
                    <Label
                      className="text-sm md:text-base font-medium text-[#4365D0] leading-[120%]"
                      htmlFor="agreementAccepted"
                    >
                      I agree to the <span className="text-[#667481]">Terms and Conditions</span> 
                    </Label>
                  </div>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <Button
              disabled={isPending}
              className="text-base font-semibold text-white leading-[120%] rounded-[8px] w-full h-[48px] bg-primary"
              type="submit"
            >
              {isPending ? "Signing up..." : "Sign up"}
            </Button>

            <p className="text-sm md:text-base text-[#1A1A2E] font-normal text-center pt-1 leading-[120%] ">
              Already have an account?{" "}
              <Link className="text-[#23547B] underline" href="/login">
                Log In
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SignupForm;
