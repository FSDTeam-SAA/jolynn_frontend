"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff, Quote } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import AccountCreatedSuccessfulModal from "./account-created-successful-modal";

const businessCategories = [
  "Plumbing",
  "Electricians",
  "HVAC",
  "Roofers",
  "Kitchen",
  "Fencing",
  "Flooring",
  "Painting",
];

type TextFieldConfig = {
  name:
    | "businessName"
    | "ownerName"
    | "username"
    | "personalEmail"
    | "sidequoteEmail"
    | "websiteUrl";
  label: string;
  placeholder: string;
  type?: "text" | "email" | "url";
};

const textFields: TextFieldConfig[] = [
  {
    name: "businessName",
    label: "Business Name*",
    placeholder: "Anderson Electric Co.",
  },
  {
    name: "ownerName",
    label: "Owner Name",
    placeholder: "James Anderson",
  },
  {
    name: "username",
    label: "User Name",
    placeholder: "Jamesnderson22",
  },
  {
    name: "personalEmail",
    label: "Personal Email Address*",
    placeholder: "you@gmail.com",
    type: "email",
  },
  {
    name: "sidequoteEmail",
    label: "Sidequote Email Address",
    placeholder: "Your Sidequote email",
    type: "email",
  },
  {
    name: "websiteUrl",
    label: "Business Website URL*",
    placeholder: "https://mybusiness.com",
    type: "url",
  },
] as const satisfies TextFieldConfig[];

const locationFields = [
  {
    name: "state",
    label: "State*",
    placeholder: "New York",
  },
  {
    name: "city",
    label: "City*",
    placeholder: "New York",
  },
] as const;

const formSchema = z
  .object({
    businessName: z.string().min(1, "Business name is required."),
    ownerName: z.string().min(1, "Owner name is required."),
    username: z.string().min(1, "User name is required."),
    personalEmail: z.string().email("Please enter a valid email address."),
    sidequoteEmail: z
      .string()
      .email("Please enter a valid Sidequote email address.")
      .optional()
      .or(z.literal("")),
    websiteUrl: z.string().url("Please enter a valid website URL."),
    aboutBusiness: z.string().min(10, "Please describe your business."),
    majorScope: z.string().min(5, "Please add your major scope of services."),
    category: z.string().min(1, "Category is required."),
    state: z.string().min(1, "State is required."),
    city: z.string().min(1, "City is required."),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters long."),
    confirmPassword: z.string().min(1, "Confirm password is required."),
    agreementAccepted: z
      .boolean()
      .refine((value) => value, "Please accept the terms and conditions."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof formSchema>;
type LocationFieldName = (typeof locationFields)[number]["name"];

const AddYourBusinessContainer = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successEmail, setSuccessEmail] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      ownerName: "",
      username: "",
      personalEmail: "",
      sidequoteEmail: "",
      websiteUrl: "",
      aboutBusiness: "",
      majorScope: "",
      category: "",
      state: "",
      city: "",
      password: "",
      confirmPassword: "",
      agreementAccepted: false,
    },
  });

  const { mutate, isPending } = useMutation({
    mutationKey: ["register-business"],
    mutationFn: async (values: FormValues) => {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";
      const res = await fetch(`${apiUrl}/auth/register/business`, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Business registration failed");
      }

      return data;
    },
    onSuccess: (data, values) => {
      toast.success(data?.message || "Business account created successfully");
      setSuccessEmail(values.personalEmail);
      setShowSuccessModal(true);
      form.reset();
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
    "h-10 rounded-[6px] border border-[#EDF0F5] bg-white px-4 text-[13px] font-medium text-[#292D73] shadow-[0_3px_10px_rgba(0,0,0,0.08)] placeholder:text-[#B7B7B7] focus-visible:ring-1 focus-visible:ring-[#292D73]";
  const labelClassName = "text-[13px] font-medium text-[#667481]";
  const messageClassName = "text-[11px] text-red-500";

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#292D73] via-[#7DBBD3] to-[#DFF0EE] px-4 py-10 sm:px-6 lg:px-8">
      <div className="container">
        <div className="mx-auto w-full max-w-[1320px] rounded-[12px] bg-white px-5 py-8 shadow-[0_16px_30px_rgba(17,24,39,0.20)] sm:px-8 lg:px-10">
          <div className="text-center">
            <div className="mx-auto flex h-[76px] w-[76px] items-center justify-center rounded-full bg-[#0987D9] text-white">
              <Quote className="h-10 w-10 fill-white" />
            </div>
            <h1 className="mt-4 text-[32px] font-extrabold leading-tight text-[#292D73] sm:text-[40px]">
              List Your Business
            </h1>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-8 space-y-4"
            >
              <div className="grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-3">
                {textFields.map((fieldConfig) => (
                  <FormField
                    key={fieldConfig.name}
                    control={form.control}
                    name={fieldConfig.name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelClassName}>
                          {fieldConfig.label}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type={fieldConfig.type || "text"}
                            placeholder={fieldConfig.placeholder}
                            className={inputClassName}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className={messageClassName} />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <FormField
                  control={form.control}
                  name="aboutBusiness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClassName}>
                        About Your business*
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Type here..."
                          className="min-h-[120px] rounded-[6px] border border-[#EDF0F5] bg-white px-4 py-4 text-[13px] font-medium text-[#292D73] shadow-[0_3px_10px_rgba(0,0,0,0.08)] placeholder:text-[#B7B7B7] focus-visible:ring-1 focus-visible:ring-[#292D73]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className={messageClassName} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="majorScope"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClassName}>
                        Major scope of services*
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Type here..."
                          className="min-h-[120px] rounded-[6px] border border-[#EDF0F5] bg-white px-4 py-4 text-[13px] font-medium text-[#292D73] shadow-[0_3px_10px_rgba(0,0,0,0.08)] placeholder:text-[#B7B7B7] focus-visible:ring-1 focus-visible:ring-[#292D73]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className={messageClassName} />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClassName}>
                        Category*
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className={inputClassName}>
                            <SelectValue placeholder="Plumbing" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {businessCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className={messageClassName} />
                    </FormItem>
                  )}
                />

                {locationFields.map((fieldConfig) => (
                  <FormField
                    key={fieldConfig.name}
                    control={form.control}
                    name={fieldConfig.name as LocationFieldName}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelClassName}>
                          {fieldConfig.label}
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder={fieldConfig.placeholder}
                            className={inputClassName}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className={messageClassName} />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClassName}>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="********"
                          className={`${inputClassName} pr-12`}
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3A8B3] transition hover:text-[#292D73]"
                          onClick={() => setShowPassword((prev) => !prev)}
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className={messageClassName} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClassName}>
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="********"
                          className={`${inputClassName} pr-12`}
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3A8B3] transition hover:text-[#292D73]"
                          onClick={() =>
                            setShowConfirmPassword((prev) => !prev)
                          }
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage className={messageClassName} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agreementAccepted"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-3">
                      <FormControl>
                        <Checkbox
                          id="agreementAccepted"
                          checked={field.value}
                          onCheckedChange={(checked) =>
                            field.onChange(Boolean(checked))
                          }
                          className="border-[#667481] data-[state=checked]:border-[#292D73] data-[state=checked]:bg-[#292D73] data-[state=checked]:text-white"
                        />
                      </FormControl>
                      <Label
                        htmlFor="agreementAccepted"
                        className="text-[13px] font-medium leading-[1.3] text-[#667481]"
                      >
                        I agree to the{" "}
                        <Link
                          href="/terms-and-conditions"
                          className="font-extrabold text-[#292D73]"
                        >
                          Terms and Conditions
                        </Link>
                      </Label>
                    </div>
                    <FormMessage className={messageClassName} />
                  </FormItem>
                )}
              />

              <Button
                disabled={isPending}
                className="h-12 w-full rounded-[6px] bg-[#292D73] text-[14px] font-extrabold text-white transition hover:bg-[#20255F]"
                type="submit"
              >
                {isPending ? "Creating account..." : "Create Account"}
              </Button>

              <p className="text-center text-[14px] font-medium text-[#1A1A2E]">
                Already have an account?{" "}
                <Link href="/login" className="font-extrabold text-[#292D73]">
                  Log In
                </Link>
              </p>
            </form>
          </Form>
        </div>
      </div>

      <AccountCreatedSuccessfulModal
        open={showSuccessModal}
        email={successEmail}
      />
    </section>
  );
};

export default AddYourBusinessContainer;
