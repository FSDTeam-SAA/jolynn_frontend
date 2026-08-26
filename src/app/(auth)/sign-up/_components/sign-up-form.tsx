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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  useLocationCities,
  useLocationStates,
} from "@/hooks/use-location-options";
import { useState } from "react";
import { toast } from "sonner";
import { Check, ChevronsUpDown, Eye, EyeOff, Info, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import AccountCreatedSuccessfulModal from "@/components/shared/account-created-successful-modal";

const VIRTUAL_STATE = "Virtual";

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
    state: z.string().min(1, { message: "Please select your state." }),
    city: z.string(),
    password: z
      .string()
      .min(1, { message: "Please create a password." })
      .min(8, { message: "Your password must contain at least 8 characters." })
      .regex(/[A-Z]/, {
        message: "Your password must contain at least one uppercase letter.",
      })
      .regex(/[a-z]/, {
        message: "Your password must contain at least one lowercase letter.",
      })
      .regex(/[0-9]/, {
        message: "Your password must contain at least one number.",
      })
      .regex(/[^A-Za-z0-9]/, {
        message: "Your password must contain at least one special character.",
      }),
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
  })
  .refine((data) => data.state === VIRTUAL_STATE || Boolean(data.city.trim()), {
    message: "Please select your city unless the location is Virtual.",
    path: ["city"],
  });

type FormValues = z.infer<typeof formSchema>;

const PasswordInfoTooltip = () => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        type="button"
        aria-label="Show password requirements"
        className="inline-flex rounded-full text-[#4365D0] outline-none transition-colors hover:text-[#2949b2] focus-visible:ring-2 focus-visible:ring-[#4365D0] focus-visible:ring-offset-2"
      >
        <Info size={16} aria-hidden="true" />
      </button>
    </PopoverTrigger>
    <PopoverContent
      side="top"
      align="start"
      className="max-w-[280px] border-primary bg-primary px-4 py-3 text-left text-sm text-primary-foreground"
    >
      <p className="mb-1.5 font-semibold">Password must include:</p>
      <ul className="list-disc space-y-1 pl-4">
        <li>At least 8 characters</li>
        <li>One uppercase letter (A-Z)</li>
        <li>One lowercase letter (a-z)</li>
        <li>One number (0-9)</li>
        <li>One special character (e.g. !, @, #, $)</li>
      </ul>
    </PopoverContent>
  </Popover>
);

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
          className="flex h-10 w-full items-center justify-between rounded-[8px] border border-[#F5F3FA] bg-white px-4 text-left text-base font-medium text-[#1A1A2E] shadow-[0px_0px_10px_0px_#00000026] outline-none focus:ring-2 focus:ring-[#4365D0]/20 disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:text-[#98A2B3] md:h-11"
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

const SignupForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successEmail, setSuccessEmail] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      phoneNumber: "",
      state: "",
      city: "",
      password: "",
      confirmPassword: "",
      agreementAccepted: false,
    },
  });
  const statesQuery = useLocationStates();
  const states = statesQuery.data?.data ?? [];
  const selectedStateName = form.watch("state");
  const selectedState = states.find(
    (state) => state.name === selectedStateName,
  );
  const stateOptions = [VIRTUAL_STATE, ...states.map((state) => state.name)];
  const isVirtualLocation = selectedStateName === VIRTUAL_STATE;
  const citiesQuery = useLocationCities(selectedState);
  const cities = citiesQuery.data?.data.cities ?? [];

  const { mutate, isPending } = useMutation({
    mutationKey: ["register-user"],
    mutationFn: async (values: FormValues) => {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";
      const { phoneNumber, ...requiredValues } = values;
      const payload = {
        ...requiredValues,
        state: values.state,
        city: values.state === VIRTUAL_STATE ? null : values.city,
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
    onSuccess: (data, values) => {
      // toast.success(data?.message || "User registered successfully");
      setSuccessEmail(values.email);
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
    "auth-input h-10 w-full rounded-[8px] border border-[#F5F3FA] bg-white px-4 py-0 text-base font-medium leading-normal text-[#1A1A2E] caret-[#1A1A2E] shadow-[0px_0px_10px_0px_#00000026] placeholder:text-[#667481] focus:bg-white md:h-11";
  const labelClassName =
    "flex items-center gap-1 text-base font-semibold leading-[120%] text-[#4365D0]";

  return (
    <div className="flex min-h-full w-full items-center justify-center px-4 py-2">
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
                    <FormLabel className={labelClassName}>First Name *</FormLabel>
                    <FormControl>
                      <Input
                        className={inputClassName}
                        placeholder="Type your first name"
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
                    <FormLabel className={labelClassName}>Last Name *</FormLabel>
                    <FormControl>
                      <Input
                        className={inputClassName}
                        placeholder="Type your last name"
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClassName}>State *</FormLabel>
                    <FormControl>
                      <SearchableDropdown
                        value={field.value}
                        options={stateOptions}
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
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={labelClassName}>City *</FormLabel>
                    <FormControl>
                      <SearchableDropdown
                        value={field.value}
                        options={cities}
                        placeholder={
                          isVirtualLocation
                            ? "Not required for Virtual"
                            : !selectedState
                              ? "Select a state first"
                              : citiesQuery.isError
                                ? "Cities unavailable"
                                : "Select city"
                        }
                        searchPlaceholder="Search cities..."
                        emptyMessage="No city found."
                        loading={Boolean(selectedState) && citiesQuery.isPending}
                        disabled={
                          isVirtualLocation ||
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
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClassName}>
                    Create Password
                    <PasswordInfoTooltip />
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        className={`${inputClassName} signup-password-input pr-12`}
                        // placeholder="********"
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
                  <FormLabel className={labelClassName}>
                    Confirm Password
                    <PasswordInfoTooltip />
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        className={`${inputClassName} signup-password-input pr-12`}
                        // placeholder="********"
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
                      className="text-sm md:text-base font-medium text-black leading-[120%]"
                      htmlFor="agreementAccepted"
                    >
                      I agree to the <Link href="/terms-and-condition" className="text-[#4365D0] underline">Terms and Conditions</Link> and <Link href="/privacy-policy" className="text-[#4365D0] underline">Privacy Policy</Link>.
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
      <AccountCreatedSuccessfulModal
        open={showSuccessModal}
        email={successEmail}
      />
    </div>
  );
};

export default SignupForm;
