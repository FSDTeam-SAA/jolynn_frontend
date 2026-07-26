"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  BriefcaseBusiness,
  Check,
  ChevronsUpDown,
  Eye,
  EyeOff,
  LockKeyhole,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { useServiceCategories } from "@/hooks/use-service-categories";
import {
  useLocationCities,
  useLocationStates,
} from "@/hooks/use-location-options";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import AccountCreatedSuccessfulModal from "./account-created-successful-modal";
import Image from "next/image";

const OTHER_CATEGORY = "__other__";

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

const formSchema = z.object({
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
    requestedCategory: z.string().optional(),
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
  .superRefine((data, context) => {
    if (data.password !== data.confirmPassword) {
      context.addIssue({
        code: "custom",
        message: "Passwords don't match.",
        path: ["confirmPassword"],
      });
    }

    if (
      data.category === OTHER_CATEGORY &&
      (!data.requestedCategory || data.requestedCategory.trim().length < 2)
    ) {
      context.addIssue({
        code: "custom",
        message: "Please enter the category your business needs.",
        path: ["requestedCategory"],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

type SearchableDropdownProps = {
  value: string;
  options: string[];
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  disabled?: boolean;
  loading?: boolean;
  onChange: (value: string) => void;
};

const SearchableDropdown = ({
  value,
  options,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  disabled = false,
  loading = false,
  onChange,
}: SearchableDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.trim().toLowerCase()),
  );

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setSearchTerm("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled || loading}
          aria-expanded={open}
          className="flex h-10 w-full items-center justify-between rounded-[8px] border border-[#F5F3FA] bg-white px-4 text-left text-sm font-medium text-primary shadow-[2px_4px_5px_0px_#0000000A] outline-none focus:ring-1 focus:ring-[#292D73] disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:text-[#98A2B3]"
        >
          <span className="truncate">
            {loading ? "Loading..." : value || placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <div className="flex items-center border-b px-3">
          <Search className="h-4 w-4 shrink-0 text-[#98A2B3]" />
          <input
            autoFocus
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full bg-transparent px-2 text-sm text-primary outline-none placeholder:text-[#98A2B3]"
          />
        </div>
        <div className="max-h-60 overflow-y-auto p-1">
          {filteredOptions.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-[#667085]">
              {emptyMessage}
            </p>
          ) : (
            filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                  setSearchTerm("");
                }}
                className="flex w-full items-center rounded px-3 py-2 text-left text-sm text-[#344054] hover:bg-[#F2F4F7] focus:bg-[#F2F4F7] focus:outline-none"
              >
                <Check
                  className={`mr-2 h-4 w-4 ${value === option ? "opacity-100" : "opacity-0"}`}
                />
                {option}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

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
  const categoriesQuery = useServiceCategories();
  const categories = categoriesQuery.data?.data ?? [];
  const statesQuery = useLocationStates();
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
      requestedCategory: "",
      state: "",
      city: "",
      password: "",
      confirmPassword: "",
      agreementAccepted: false,
    },
  });
  const selectedCategory = form.watch("category");
  const selectedStateName = form.watch("state");
  const selectedState = statesQuery.data?.data.find(
    (state) => state.name === selectedStateName,
  );
  const citiesQuery = useLocationCities(selectedState);
  const states = statesQuery.data?.data ?? [];
  const cities = citiesQuery.data?.data.cities ?? [];

  const { mutate, isPending } = useMutation<
    RegisterBusinessOwnerResponse,
    Error,
    FormValues
  >({
    mutationKey: ["register-business"],
    mutationFn: async (values: FormValues) => {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";
      const payload = {
        ...values,
        category:
          values.category === OTHER_CATEGORY ? "Other" : values.category,
        requestedCategory:
          values.category === OTHER_CATEGORY
            ? values.requestedCategory?.trim()
            : undefined,
      };
      const res = await fetch(`${apiUrl}/auth/register/business-owner`, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
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
    "h-11 rounded-[9px] border border-[#D8DDE7] bg-white px-4 text-sm font-medium text-[#20244A] shadow-none placeholder:font-normal placeholder:text-[#98A2B3] focus-visible:border-[#292D73] focus-visible:ring-4 focus-visible:ring-[#292D73]/10";
  const labelClassName = "text-[13px] font-semibold leading-normal text-[#344054]";
  const messageClassName = "text-xs font-normal leading-normal text-red-500";

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#F3F6FA] px-3 py-8 sm:px-5 md:py-12 lg:px-8">
      <div className="pointer-events-none absolute -left-28 top-10 h-80 w-80 rounded-full bg-[#DCE4FF]/70 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-10 h-80 w-80 rounded-full bg-[#D9F1EC]/80 blur-3xl" />
      <div className="container">
        <div className="relative mx-auto w-full max-w-[1180px] overflow-hidden rounded-[18px] border border-[#E1E6EE] bg-white shadow-[0_24px_70px_rgba(28,35,70,0.13)]">
          <div className="h-1.5 bg-[linear-gradient(90deg,#292D73_0%,#5962B8_55%,#75B8AE_100%)]" />
          <div className="px-5 py-7 sm:px-8 lg:px-10 lg:py-8">
          <div className="text-center">
            <Link href="/" className="inline-flex">
              <Image
                src="/assets/images/logo.png"
                alt="Logo"
                width={64}
                height={64}
                className="h-16 w-16 object-contain"
              />
            </Link>
            <span className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full border border-[#D9DDF2] bg-[#F8F9FF] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#292D73]">
              <Sparkles className="h-3.5 w-3.5" />
              Grow your local presence
            </span>
            <h2 className="mt-3 text-[28px] font-extrabold leading-tight text-[#171A3A] sm:text-[34px]">
              List Your Business
            </h2>
            <p className="mx-auto mt-2 max-w-2xl text-[13px] leading-5 text-[#667085]">
              Create a professional business profile and make it easier for local customers to discover your services.
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-7 space-y-6"
            >
              <div className="flex items-center gap-3 border-b border-[#EAECF0] pb-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[#EEF0FF] text-[#292D73]">
                  <BriefcaseBusiness className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <h3 className="text-[16px] font-bold text-[#20244A]">Business details</h3>
                  <p className="text-[11px] text-[#98A2B3]">Tell customers who you are and how to contact your business.</p>
                </div>
              </div>
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
                          className="min-h-[96px] rounded-[9px] border border-[#D8DDE7] bg-white px-4 py-3 text-[13px] font-medium text-[#20244A] shadow-none placeholder:text-[#98A2B3] focus-visible:border-[#292D73] focus-visible:ring-4 focus-visible:ring-[#292D73]/10"
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
                          className="min-h-[96px] rounded-[9px] border border-[#D8DDE7] bg-white px-4 py-3 text-[13px] font-medium text-[#20244A] shadow-none placeholder:text-[#98A2B3] focus-visible:border-[#292D73] focus-visible:ring-4 focus-visible:ring-[#292D73]/10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className={messageClassName} />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center gap-3 border-b border-[#EAECF0] pb-3 pt-1">
                <span className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[#EAF7F4] text-[#28796E]">
                  <MapPin className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <h3 className="text-[16px] font-bold text-[#20244A]">Category & location</h3>
                  <p className="text-[11px] text-[#98A2B3]">Choose your main service and the area where your business operates.</p>
                </div>
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
                        onValueChange={(value) => {
                          field.onChange(value);
                          if (value !== OTHER_CATEGORY) {
                            form.setValue("requestedCategory", "", {
                              shouldDirty: true,
                              shouldValidate: false,
                            });
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className={inputClassName}>
                            <SelectValue
                              placeholder={
                                categoriesQuery.isPending
                                  ? "Loading categories..."
                                  : categoriesQuery.isError
                                    ? "Select Others to add a category"
                                    : "Select category"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category._id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                          <SelectItem value={OTHER_CATEGORY}>Others</SelectItem>
                        </SelectContent>
                      </Select>
                      {categoriesQuery.isError && (
                        <button
                          type="button"
                          onClick={() => categoriesQuery.refetch()}
                          className="text-xs font-medium text-red-600 hover:underline"
                        >
                          Category list unavailable. Retry, or select Others
                        </button>
                      )}
                      <FormMessage className={messageClassName} />
                    </FormItem>
                  )}
                />

                {selectedCategory === OTHER_CATEGORY && (
                  <FormField
                    control={form.control}
                    name="requestedCategory"
                    render={({ field }) => (
                      <FormItem className="rounded-[10px] border border-[#D9DDF2] bg-[#F8F9FF] p-3 md:col-span-2">
                        <FormLabel className={labelClassName}>
                          Add your required category*
                        </FormLabel>
                        <FormControl>
                          <Input
                            autoFocus
                            maxLength={80}
                            placeholder="e.g. Solar panel installation"
                            className={inputClassName}
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <p className="text-[11px] leading-4 text-[#667085]">
                          This category will be submitted for review with your business registration.
                        </p>
                        <FormMessage className={messageClassName} />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClassName}>State*</FormLabel>
                      <FormControl>
                        <SearchableDropdown
                          value={field.value}
                          options={states.map((state) => state.name)}
                          placeholder={
                            statesQuery.isError
                              ? "States unavailable"
                              : "Select state"
                          }
                          searchPlaceholder="Search states..."
                          emptyMessage="No state found."
                          loading={statesQuery.isPending}
                          disabled={statesQuery.isError || states.length === 0}
                          onChange={(stateName) => {
                            field.onChange(stateName);
                            form.setValue("city", "", {
                              shouldDirty: true,
                              shouldValidate: false,
                            });
                          }}
                        />
                      </FormControl>
                      {statesQuery.isError && (
                        <button
                          type="button"
                          onClick={() => statesQuery.refetch()}
                          className="text-xs font-medium text-red-600 hover:underline"
                        >
                          Unable to load states. Try again
                        </button>
                      )}
                      <FormMessage className={messageClassName} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClassName}>City*</FormLabel>
                      <FormControl>
                        <SearchableDropdown
                          value={field.value}
                          options={cities}
                          placeholder={
                            !selectedState
                              ? "Select a state first"
                              : citiesQuery.isError
                                ? "Cities unavailable"
                                : "Select city"
                          }
                          searchPlaceholder="Search cities..."
                          emptyMessage="No city found."
                          loading={Boolean(selectedState) && citiesQuery.isPending}
                          disabled={
                            !selectedState ||
                            citiesQuery.isError ||
                            (!citiesQuery.isPending && cities.length === 0)
                          }
                          onChange={field.onChange}
                        />
                      </FormControl>
                      {selectedState && citiesQuery.isError && (
                        <button
                          type="button"
                          onClick={() => citiesQuery.refetch()}
                          className="text-xs font-medium text-red-600 hover:underline"
                        >
                          Unable to load cities. Try again
                        </button>
                      )}
                      <FormMessage className={messageClassName} />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center gap-3 border-b border-[#EAECF0] pb-3 pt-1">
                <span className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[#FFF5E6] text-[#A56513]">
                  <LockKeyhole className="h-[18px] w-[18px]" />
                </span>
                <div>
                  <h3 className="text-[16px] font-bold text-[#20244A]">Account security</h3>
                  <p className="text-[11px] text-[#98A2B3]">Choose a secure password to protect your business account.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
              </div>

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
                        className="text-sm font-medium leading-[1.3] text-[#667481]"
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
                className="h-12 w-full rounded-[9px] bg-primary text-[14px] font-bold text-white shadow-[0_8px_18px_rgba(41,45,115,0.22)] transition hover:bg-[#20255F] hover:shadow-[0_10px_24px_rgba(41,45,115,0.28)]"
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
      </div>

      <AccountCreatedSuccessfulModal
        open={showSuccessModal}
        email={successEmail}
      />
    </section>
  );
};

export default AddYourBusinessContainer;
