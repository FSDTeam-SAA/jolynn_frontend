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
    firstName: z
      .string()
      .trim()
      .min(1, { message: "Please enter your first name." }),
    lastName: z
      .string()
      .trim()
      .min(1, { message: "Please enter your last name." }),
    username: z
      .string()
      .trim()
      .min(1, { message: "Please choose a public username." })
      .regex(/^[a-z0-9_-]{3,30}$/, {
        message:
          "Username must be 3–30 characters using lowercase letters, numbers, underscores, or hyphens.",
      }),
    email: z
      .string()
      .trim()
      .min(1, { message: "Please enter your email address." })
      .email({ message: "Enter a valid email address, for example name@example.com." }),
    phoneNumber: z
      .string()
      .trim()
      .refine(
        (value) => !value || /^[+\d][\d\s()-]{7,19}$/.test(value),
        { message: "Enter a valid phone number or leave this field blank." },
      ),
    password: z
      .string()
      .min(1, { message: "Please create a password." })
      .min(6, { message: "Your password must contain at least 6 characters." }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please enter your password again to confirm it." }),
    agreementAccepted: z
      .boolean()
      .refine((value) => value, { message: "Please accept the terms and conditions." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "The passwords do not match. Please enter the same password in both fields.",
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
      const { phoneNumber, ...requiredValues } = values;
      const payload = {
        ...requiredValues,
        ...(phoneNumber ? { phoneNumber } : {}),
      };
      const res = await fetch(`${apiUrl}/auth/register/user`, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        const apiMessage = data?.message;
        const message = Array.isArray(apiMessage)
          ? apiMessage.join(" ")
          : typeof apiMessage === "string"
            ? apiMessage
            : "We couldn't create your account. Please check your details and try again.";
        throw new Error(message);
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
    "auth-input h-11 w-full rounded-[8px] border border-[#F5F3FA] bg-white px-4 py-0 text-base font-medium leading-normal text-[#1A1A2E] caret-[#1A1A2E] shadow-[0px_0px_10px_0px_#00000026] placeholder:text-[#667481] focus:bg-white md:h-[48px]";
  const labelClassName =
    "flex items-center gap-1 text-base font-semibold leading-[120%] text-[#4365D0]";

  return (
    <div className="flex h-full w-full items-center justify-center px-4 py-2">
      <div className="w-full max-w-[680px] rounded-[16px] bg-white p-3 shadow-[0px_5px_10px_0px_#00000029] sm:p-5 md:p-6">
        <div className="flex items-center justify-center mb-1 sm:mb-2">
          <Link href="/">
            <Image
              src="/assets/images/logo.png"
              alt="Logo"
              width={100}
              height={100}
              className="h-12 w-12 sm:h-16 sm:w-16 md:h-[72px] md:w-[72px]"
            />
          </Link>
        </div>

        <h3 className="text-xl font-extrabold text-primary text-center leading-[120%] sm:text-2xl md:text-3xl">
          Create Your Account
        </h3>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-2 pt-2 sm:space-y-3 sm:pt-3"
          >
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
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

            </div>

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClassName}>
                    Public Username *
                  </FormLabel>
                  <FormControl>
                    <Input
                      autoComplete="username"
                      className={inputClassName}
                      placeholder="Choose a screen name"
                      {...field}
                      onChange={(event) =>
                        field.onChange(event.target.value.toLowerCase())
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClassName}>Email Address *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      className={inputClassName}
                      placeholder="Enter your email address"
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
                    Phone Number <span className="font-normal text-[#667481]">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      className={inputClassName}
                      placeholder="+1 (201) 555-0123"
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
                        className={`${inputClassName} signup-password-input pr-12`}
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
                        className={`${inputClassName} signup-password-input pr-12`}
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
              className="text-base font-semibold text-white leading-[120%] rounded-[8px] w-full h-11 lg:h-[48px] bg-primary"
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
