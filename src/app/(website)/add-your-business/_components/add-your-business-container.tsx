"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Eye, EyeOff } from "lucide-react";
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
import Image from "next/image";

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
    | "businessEmail"
    | "businessWebsiteUrl";
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
    name: "businessEmail",
    label: "Business Email Address*",
    placeholder: "contact@mybusiness.com",
    type: "email",
  },
  {
    name: "businessWebsiteUrl",
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
    businessEmail: z
      .string()
      .email("Please enter a valid business email address."),
    businessWebsiteUrl: z.string().url("Please enter a valid website URL."),
    address: z.string().min(1, "Address is required."),
    serviceArea: z.string().min(1, "Service area is required."),
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

type RegisterBusinessOwnerResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    role: string;
    businessName: string;
    businessEmail: string;
    businessWebsiteUrl: string;
    serviceArea: string;
    category: string;
    city: string;
    state: string;
    address: string;
    status: string;
    agreementAccepted: boolean;
    createdAt: string;
    updatedAt: string;
  };
};

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
      businessEmail: "",
      businessWebsiteUrl: "",
      address: "",
      serviceArea: "",
      category: "",
      state: "",
      city: "",
      password: "",
      confirmPassword: "",
      agreementAccepted: false,
    },
  });

  const { mutate, isPending } = useMutation<
    RegisterBusinessOwnerResponse,
    Error,
    FormValues
  >({
    mutationKey: ["register-business"],
    mutationFn: async (values: FormValues) => {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";
      const res = await fetch(`${apiUrl}/auth/register/business-owner`, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const data = (await res.json()) as RegisterBusinessOwnerResponse;

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
    "h-10 rounded-[8px] border border-[#F5F3FA] bg-white px-4 text-sm font-medium text-primary shadow-[2px_4px_5px_0px_#0000000A] placeholder:text-[#BCBCBC] focus-visible:ring-1 focus-visible:ring-[#292D73]";
  const labelClassName = "text-sm md:text-base font-normal leading-normal text-[#667481]";
  const messageClassName = "text-xs font-normal leading-normal text-red-500";

  return (
    <section className="min-h-screen bg-[linear-gradient(180deg,_#292D73_0%,_#91C7D9_50%,_#CBE4E3_100%),_linear-gradient(0deg,_rgba(0,0,0,0.2),_rgba(0,0,0,0.2))] px-2 py-10 md:px-4 lg:px-6">
      <div className="container">
        <div className="mx-auto w-full max-w-[1320px] rounded-[12px] bg-white px-5 py-8 shadow-[0_16px_30px_rgba(17,24,39,0.20)] sm:px-8 lg:px-10">
          <div className="text-center">
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
            <h2 className="mt-4 text-2xl md:text-3xl lg:text-4xl xl:text-[40px] font-bold leading-normal text-primary">
              List Your Business
            </h2>
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
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClassName}>
                        Address*
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="221B Baker Street"
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
                  name="serviceArea"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClassName}>
                        Service Area*
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="15 miles around New York"
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
                        value={field.value}
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
                        className="text-sm xl:text-base font-medium leading-[1.3] text-[#667481`]"
                      >
                        I agree to the{" "}
                        <Link
                          href="/terms-and-conditions"
                          className="font-semibold text-primary"
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
                className="h-12 w-full rounded-[8px] bg-primary text-[14px] font-semibold text-white transition hover:bg-[#20255F]"
                type="submit"
              >
                {isPending ? "Creating account..." : "Create Account"}
              </Button>

              <p className="text-center text-sm xl:text-base leading-normal font-medium text-[#1A1A2E]">
                Already have an account?{" "}
                <Link href="/login" className="font-extrabold text-primary">
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
