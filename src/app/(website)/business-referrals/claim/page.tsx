"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  ChevronsUpDown,
  CircleCheck,
  Eye,
  EyeOff,
  Info,
  Loader2,
  LockKeyhole,
  MapPin,
  Search,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import AccountCreatedSuccessfulModal from "@/components/shared/account-created-successful-modal";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import {
  useLocationCities,
  useLocationStates,
} from "@/hooks/use-location-options";
import { useServiceCategories } from "@/hooks/use-service-categories";
import {
  ApiSuccess,
  PaginatedResponse,
  ReferralApiError,
  ReferralProfile,
  authHeaders,
  getReferralApiUrl,
  parseReferralResponse,
} from "@/lib/business-referrals";

const OTHER_CATEGORY = "__other__";

type TextFieldConfig = {
  name:
    | "businessName"
    | "ownerName"
    | "username"
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
    label: "Owner Name*",
    placeholder: "James Anderson",
  },
  {
    name: "username",
    label: "User Name*",
    placeholder: "Jamesnderson22",
  },
  {
    name: "businessEmail",
    label: "Business Email Address*",
    placeholder: "contact@mybusiness.com",
    type: "email",
  },
  {
    name: "businessWebsiteUrl",
    label: "Business Website URL (Optional)",
    placeholder: "https://mybusiness.com",
    type: "url",
  },
] as const satisfies TextFieldConfig[];

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/[0-9]/, "Password must contain at least one number.")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character.",
  );

const createFormSchema = (isExistingUser: boolean) =>
  z
    .object({
      businessName: z.string().min(1, "Business name is required."),
      ownerName: z.string().min(1, "Owner name is required."),
      username: z.string(),
      businessEmail: z
        .string()
        .email("Please enter a valid business email address."),
      businessWebsiteUrl: z
        .string()
        .trim()
        .refine(
          (value) =>
            value === "" || z.string().url().safeParse(value).success,
          "Please enter a valid website URL.",
        ),
      address: z.string(),
      serviceArea: z.string(),
      bio: z.string(),
      category: z.string().min(1, "Category is required."),
      requestedCategory: z.string().optional(),
      state: z.string().min(1, "State is required."),
      city: z.string(),
      password: z.string(),
      confirmPassword: z.string(),
      agreementAccepted: z
        .boolean()
        .refine((value) => value, "Please accept the terms and conditions."),
    })
    .superRefine((data, context) => {
      if (!isExistingUser && !data.username.trim()) {
        context.addIssue({
          code: "custom",
          message: "User name is required.",
          path: ["username"],
        });
      }

      if (!isExistingUser) {
        const passwordResult = passwordSchema.safeParse(data.password);
        passwordResult.error?.issues.forEach((issue) => {
          context.addIssue({
            code: "custom",
            message: issue.message,
            path: ["password"],
          });
        });
      }

      if (!isExistingUser && !data.confirmPassword) {
        context.addIssue({
          code: "custom",
          message: "Confirm password is required.",
          path: ["confirmPassword"],
        });
      } else if (
        !isExistingUser &&
        data.password !== data.confirmPassword
      ) {
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

      if (!data.city.trim()) {
        context.addIssue({
          code: "custom",
          message: "City is required.",
          path: ["city"],
        });
      }
    });

type FormValues = z.infer<ReturnType<typeof createFormSchema>>;

const PasswordInfoPopover = () => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        type="button"
        aria-label="Show password requirements"
        className="inline-flex rounded-full text-[#292D73] outline-none transition-colors hover:text-[#4365D0] focus-visible:ring-2 focus-visible:ring-[#4365D0] focus-visible:ring-offset-2"
      >
        <Info className="h-4 w-4" aria-hidden="true" />
      </button>
    </PopoverTrigger>
    <PopoverContent
      side="top"
      align="start"
      className="max-w-[280px] border-[#3E469B] bg-[#292D73] px-4 py-3 text-left text-sm text-white shadow-lg shadow-[#292D73]/25"
    >
      <p className="mb-1.5 font-semibold">Password must include:</p>
      <ul className="list-disc space-y-1 pl-4">
        <li>At least 8 characters</li>
        <li>One uppercase letter (A–Z)</li>
        <li>One lowercase letter (a–z)</li>
        <li>One number (0–9)</li>
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
          className="flex h-11 w-full items-center justify-between rounded-[9px] border border-[#D8DDE7] bg-white px-4 text-left text-sm font-medium text-[#20244A] shadow-none outline-none transition focus:border-[#292D73] focus:ring-4 focus:ring-[#292D73]/10 disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:text-[#98A2B3]"
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
        <div className="max-h-52 overflow-y-auto p-1">
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

type ClaimVerification = {
  valid: true;
  expiresAt: string;
  referralId: string;
  businessName: string;
  businessEmail: string;
  categoryName?: string;
  state?: string;
  city?: string;
  requiredAction: "authenticate_or_register";
};

type ClaimResult = {
  referralId: string;
  claimStatus: "claimed";
  businessOwnerId: string;
  username?: string;
  profileUrl: string;
  activeRole: "businessOwner";
  nextAction: "switch_profile";
  idempotent: boolean;
};

const BusinessListedSuccessModal = ({
  open,
  profileUrl,
}: {
  open: boolean;
  profileUrl?: string;
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#101828]/60 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="business-listed-success-title"
    >
      <div className="w-full max-w-[500px] overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_28px_80px_rgba(16,24,40,0.28)]">
        <div className="h-1.5 bg-[linear-gradient(90deg,#292D73_0%,#5962B8_55%,#75B8AE_100%)]" />
        <div className="px-6 py-8 text-center sm:px-10 sm:py-10">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#ECFDF3] ring-8 ring-[#F3FBF6]">
            <CircleCheck
              className="h-10 w-10 text-[#159455]"
              aria-hidden="true"
            />
          </div>

          <p className="mt-7 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#667085]">
            Business claimed
          </p>
          <h2
            id="business-listed-success-title"
            className="mx-auto mt-2 max-w-[380px] text-2xl font-extrabold leading-tight text-[#171A3A] sm:text-[28px]"
          >
            Business Directory Listed Successfully!
          </h2>
          <p className="mx-auto mt-3 max-w-[390px] text-sm leading-6 text-[#667085]">
            Your business has been claimed and added to the directory. You can
            now manage your business information, services, and profile from
            your dashboard.
          </p>

          <Link
            href={profileUrl || "/overview"}
            className="mt-7 inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#292D73] px-6 text-sm font-bold text-white shadow-[0_8px_20px_rgba(41,45,115,0.22)] transition hover:bg-[#20255F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4365D0] focus-visible:ring-offset-2"
          >
            Go to Dashboard
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
};

function ClaimBusinessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const claimToken = searchParams.get("token")?.trim() ?? "";
  const callbackPath = `/business-referrals/claim?token=${encodeURIComponent(claimToken)}`;
  const queryClient = useQueryClient();

  const categoriesQuery = useServiceCategories();
  const categories = categoriesQuery.data?.data ?? [];
  const statesQuery = useLocationStates();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successEmail, setSuccessEmail] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showListingSuccessModal, setShowListingSuccessModal] = useState(false);
  const [claimedProfileUrl, setClaimedProfileUrl] = useState<string>("/overview");
  const [terminalClaimError, setTerminalClaimError] = useState<{
    expired: boolean;
    message: string;
    title?: string;
    profileUrl?: string;
  } | null>(null);

  const { data: session, status, update: updateSession } = useSession();
  const sessionUser = session?.user as
    | {
        email?: string | null;
        role?: string;
        accessToken?: string;
        token?: string;
      }
    | undefined;
  const token = sessionUser?.accessToken ?? sessionUser?.token;
  const isExistingUser = Boolean(token);

  const formSchema = useMemo(
    () => createFormSchema(isExistingUser),
    [isExistingUser],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      ownerName: "",
      username: "",
      businessEmail: "",
      businessWebsiteUrl: "",
      address: "",
      serviceArea: "",
      bio: "",
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
  const states = statesQuery.data?.data ?? [];
  const selectedState = states.find(
    (state) => state.name === selectedStateName,
  );
  const stateOptions = states.map((state) => state.name);
  const citiesQuery = useLocationCities(selectedState);
  const cities = citiesQuery.data?.data.cities ?? [];

  const verificationQuery = useQuery({
    queryKey: ["business-referral-claim", claimToken],
    enabled: Boolean(claimToken),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    gcTime: 0,
    queryFn: async () => {
      const response = await fetch(
        `${getReferralApiUrl()}/business-referrals/claims/verify?token=${encodeURIComponent(claimToken)}`,
        { headers: { Accept: "application/json" }, cache: "no-store" },
      );
      return parseReferralResponse<ApiSuccess<ClaimVerification>>(response);
    },
  });

  const verification = verificationQuery.data?.data;

  useEffect(() => {
    if (!verification) return;
    form.setValue("businessName", verification.businessName || "");
    form.setValue("businessEmail", verification.businessEmail || "");
    if (verification.categoryName) {
      form.setValue("category", verification.categoryName);
    }
    if (verification.state) {
      form.setValue("state", verification.state);
    }
    if (verification.city) {
      form.setValue("city", verification.city);
    }
  }, [verification, form]);

  const accountEmailMismatch = Boolean(
    verification &&
      sessionUser?.email &&
      verification.businessEmail.toLowerCase() !==
        sessionUser.email.toLowerCase(),
  );

  const claimMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api/v1";

      if (isExistingUser) {
        if (!verification || !token) {
          throw new Error("Missing verification or session token.");
        }
        if (accountEmailMismatch) {
          throw new Error(
            `Please sign in with ${verification.businessEmail} to claim this business.`,
          );
        }

        const res = await fetch(
          `${getReferralApiUrl()}/business-referrals/${encodeURIComponent(verification.referralId)}/claims`,
          {
            method: "POST",
            headers: {
              ...authHeaders(token),
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              claimToken,
              businessEmail: verification.businessEmail,
              ownerName: values.ownerName.trim(),
              businessWebsiteUrl: values.businessWebsiteUrl.trim() || undefined,
              address: values.address.trim() || undefined,
              serviceArea: values.serviceArea.trim() || undefined,
              bio: values.bio.trim() || undefined,
            }),
          },
        );

        return parseReferralResponse<ApiSuccess<ClaimResult>>(res);
      }

      // Guest user registration flow
      const category =
        values.category === OTHER_CATEGORY ? "Other" : values.category;
      const requestedCategory =
        values.category === OTHER_CATEGORY
          ? values.requestedCategory?.trim()
          : undefined;
      const businessWebsiteUrl = values.businessWebsiteUrl.trim() || undefined;

      const payload = {
        ...values,
        businessWebsiteUrl,
        category,
        requestedCategory,
        state: values.state,
        city: values.city,
      };

      const res = await fetch(`${apiUrl}/auth/register/business-owner`, {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Business registration failed");
      }
      return data;
    },
    onSuccess: async (data, values) => {
      if (isExistingUser) {
        const claimResult = data.data as ClaimResult;
        setClaimedProfileUrl(claimResult.profileUrl || "/overview");

        try {
          const switchRes = await fetch(
            `${getReferralApiUrl()}/auth/switch-profile`,
            {
              method: "POST",
              headers: {
                ...authHeaders(token),
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ targetRole: "businessOwner" }),
            },
          );
          const switched = await parseReferralResponse<
            ApiSuccess<{
              accessToken?: string;
              token?: string;
              user?: Record<string, unknown>;
            }>
          >(switchRes);

          const updatedAccessToken =
            switched.data.accessToken ?? switched.data.token;
          if (updatedAccessToken) {
            await updateSession({
              user: {
                ...switched.data.user,
                role: "businessOwner",
                token: updatedAccessToken,
                accessToken: updatedAccessToken,
              },
            });
          }
        } catch {
          // Profile switch fallback handled on next page load
        }

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["user-profile"] }),
          queryClient.invalidateQueries({ queryKey: ["business-search"] }),
          queryClient.invalidateQueries({
            queryKey: ["business-referral-profile"],
          }),
          queryClient.invalidateQueries({ queryKey: ["my-business-referrals"] }),
        ]);

        toast.success("Business directory listed successfully!");
        setShowListingSuccessModal(true);
      } else {
        toast.success(
          data?.message || "Business account created successfully",
        );
        setSuccessEmail(values.businessEmail);
        setShowSuccessModal(true);
      }
      form.reset();
    },
    onError: async (error) => {
      if (error instanceof ReferralApiError && error.status === 401) {
        router.push(`/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
        return;
      }
      if (error instanceof ReferralApiError && error.status === 403) {
        toast.error(
          error.message ||
            "Your verified account email must match the business email.",
        );
        return;
      }
      if (error instanceof ReferralApiError && error.status === 404) {
        setTerminalClaimError({ expired: false, message: error.message });
        return;
      }
      if (
        error instanceof ReferralApiError &&
        (error.status === 409 || error.status === 410)
      ) {
        void queryClient.invalidateQueries({ queryKey: ["business-search"] });
        void queryClient.invalidateQueries({
          queryKey: ["business-referral-profile"],
        });
        let profileUrl: string | undefined;
        if (verification) {
          try {
            const params = new URLSearchParams({
              searchTerm: verification.businessName,
              limit: "100",
            });
            const response = await fetch(
              `${getReferralApiUrl()}/business-referrals?${params}`,
              { cache: "no-store" },
            );
            const referrals =
              await parseReferralResponse<PaginatedResponse<ReferralProfile>>(
                response,
              );
            const referral = referrals.data.find(
              (item) => item.id === verification.referralId,
            );
            if (referral) {
              profileUrl = referral.profileUrl;
            }
          } catch {
            // Ignore directory search fallback failure
          }
        }
        setTerminalClaimError({
          expired: error.status === 410,
          title: "Business claim unavailable",
          message: error.message,
          profileUrl,
        });
        return;
      }
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    },
  });

  const onSubmit = (values: FormValues) => {
    claimMutation.mutate(values);
  };

  const inputClassName =
    "h-11 rounded-[9px] border border-[#D8DDE7] bg-white px-4 text-sm font-medium text-[#20244A] shadow-none placeholder:font-normal placeholder:text-[#98A2B3] focus-visible:border-[#292D73] focus-visible:ring-4 focus-visible:ring-[#292D73]/10";
  const labelClassName = "text-[13px] font-semibold leading-normal text-[#344054]";
  const messageClassName = "text-xs font-normal leading-normal text-red-500";

  if (!claimToken || verificationQuery.isError || terminalClaimError) {
    const error = verificationQuery.error;
    const expired =
      terminalClaimError?.expired ||
      (error instanceof ReferralApiError && error.status === 410);
    return (
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F3F6FA] px-3 py-8 sm:px-5 md:py-12 lg:px-8">
        <div className="pointer-events-none absolute -left-28 top-10 h-80 w-80 rounded-full bg-[#DCE4FF]/70 blur-3xl" />
        <div className="pointer-events-none absolute -right-28 bottom-10 h-80 w-80 rounded-full bg-[#D9F1EC]/80 blur-3xl" />
        <div className="container max-w-lg">
          <div className="relative overflow-hidden rounded-[18px] border border-[#E1E6EE] bg-white p-8 text-center shadow-[0_24px_70px_rgba(28,35,70,0.13)]">
            <div className="absolute inset-x-0 top-0 h-1.5 bg-[linear-gradient(90deg,#292D73_0%,#5962B8_55%,#75B8AE_100%)]" />
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFF5E6] text-[#A56513]">
              <AlertCircle className="h-8 w-8" />
            </span>
            <h1 className="mt-5 text-2xl font-extrabold text-[#171A3A]">
              {terminalClaimError?.title ||
                (expired
                  ? "Claim link no longer available"
                  : "Invalid claim link")}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#667085]">
              {terminalClaimError?.message ||
                (error instanceof Error
                  ? error.message
                  : "This link is missing or is no longer valid. Ask the person who referred the business to resend the email.")}
            </p>
            {expired ? (
              <p className="mt-2 text-xs text-[#667085]">
                If the business has not been claimed, ask the referrer to send a
                new claim email from My Referrals.
              </p>
            ) : null}
            {terminalClaimError?.profileUrl ? (
              <Link
                href={terminalClaimError.profileUrl}
                className="mt-4 block text-sm font-bold text-[#292D73] underline"
              >
                View current business profile
              </Link>
            ) : null}
            <Link
              href="/services/businesses"
              className="mt-6 inline-flex h-11 items-center justify-center rounded-[9px] bg-primary px-6 text-sm font-bold text-white shadow-[0_8px_18px_rgba(41,45,115,0.22)] transition hover:bg-[#20255F]"
            >
              Business directory
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (verificationQuery.isPending || status === "loading") {
    return (
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F3F6FA] px-3 py-8 sm:px-5 md:py-12 lg:px-8">
        <div className="pointer-events-none absolute -left-28 top-10 h-80 w-80 rounded-full bg-[#DCE4FF]/70 blur-3xl" />
        <div className="pointer-events-none absolute -right-28 bottom-10 h-80 w-80 rounded-full bg-[#D9F1EC]/80 blur-3xl" />
        <Loader2 className="h-10 w-10 animate-spin text-[#292D73]" />
      </section>
    );
  }

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
                Claim Your Business
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-[13px] leading-5 text-[#667085]">
                Complete your business information to take ownership of your
                listing in our directory.
              </p>
            </div>

            {accountEmailMismatch && (
              <div className="mt-6 flex items-start gap-3 rounded-[12px] border border-amber-200 bg-[#FFFDF5] p-4 text-sm text-amber-900">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <div>
                  <p className="font-medium">
                    You are signed in as <strong>{sessionUser?.email}</strong>.
                    Please sign in with the verified account matching{" "}
                    <strong>{verification?.businessEmail}</strong> to claim this
                    listing.
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      void signOut({
                        callbackUrl: `/login?callbackUrl=${encodeURIComponent(
                          callbackPath,
                        )}`,
                      })
                    }
                    className="mt-2 text-xs font-bold text-[#292D73] underline underline-offset-2 hover:text-[#171A3A]"
                  >
                    Sign in with {verification?.businessEmail}
                  </button>
                </div>
              </div>
            )}

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
                    <h3 className="text-[16px] font-bold text-[#20244A]">
                      Business details
                    </h3>
                    <p className="text-[11px] text-[#98A2B3]">
                      Tell customers who you are and how to contact your
                      business.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-3">
                  {textFields
                    .filter(
                      (fieldConfig) =>
                        !isExistingUser || fieldConfig.name !== "username",
                    )
                    .map((fieldConfig) => (
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
                                readOnly={
                                  Boolean(verification) &&
                                  (fieldConfig.name === "businessName" ||
                                    fieldConfig.name === "businessEmail")
                                }
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
                        <FormLabel className={labelClassName}>Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="221B Baker Street"
                            className={inputClassName}
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
                          Service Area
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="15 miles around New York"
                            className={inputClassName}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className={messageClassName} />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className={labelClassName}>
                        Business Overview
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell customers about your business"
                          className="min-h-28 w-full resize-y rounded-[9px] border border-[#D8DDE7] bg-white px-4 py-3 text-sm font-medium text-[#20244A] shadow-none placeholder:font-normal placeholder:text-[#98A2B3] focus-visible:border-[#292D73] focus-visible:ring-4 focus-visible:ring-[#292D73]/10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className={messageClassName} />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-3 border-b border-[#EAECF0] pb-3 pt-1">
                  <span className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[#EAF7F4] text-[#28796E]">
                    <MapPin className="h-[18px] w-[18px]" />
                  </span>
                  <div>
                    <h3 className="text-[16px] font-bold text-[#20244A]">
                      Category & location
                    </h3>
                    <p className="text-[11px] text-[#98A2B3]">
                      Choose your main service and the area where your business
                      operates.
                    </p>
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
                        <FormControl>
                          <SearchableDropdown
                            value={
                              field.value === OTHER_CATEGORY
                                ? "Others"
                                : field.value
                            }
                            options={[
                              ...categories.map((category) => category.name),
                              "Others",
                            ]}
                            placeholder={
                              categoriesQuery.isPending
                                ? "Loading categories..."
                                : categoriesQuery.isError
                                  ? "Select Others to add a category"
                                  : "Select category"
                            }
                            searchPlaceholder="Search categories..."
                            emptyMessage="No category found."
                            loading={categoriesQuery.isPending}
                            onChange={(category) => {
                              const value =
                                category === "Others"
                                  ? OTHER_CATEGORY
                                  : category;
                              field.onChange(value);
                              if (value !== OTHER_CATEGORY) {
                                form.setValue("requestedCategory", "", {
                                  shouldDirty: true,
                                  shouldValidate: false,
                                });
                              }
                            }}
                          />
                        </FormControl>
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
                            This category will be submitted for review with your
                            business registration.
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
                            loading={
                              Boolean(selectedState) && citiesQuery.isPending
                            }
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

                {!isExistingUser && (
                  <>
                    <div className="flex items-center gap-3 border-b border-[#EAECF0] pb-3 pt-1">
                      <span className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[#FFF5E6] text-[#A56513]">
                        <LockKeyhole className="h-[18px] w-[18px]" />
                      </span>
                      <div>
                        <h3 className="text-[16px] font-bold text-[#20244A]">
                          Account security
                        </h3>
                        <p className="text-[11px] text-[#98A2B3]">
                          Choose a secure password to protect your business
                          account.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className={labelClassName}>
                              Password
                              <PasswordInfoPopover />
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  className={`${inputClassName} pr-12`}
                                  {...field}
                                />
                                <button
                                  type="button"
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A3A8B3] transition hover:text-[#292D73]"
                                  onClick={() =>
                                    setShowPassword((prev) => !prev)
                                  }
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
                              <PasswordInfoPopover />
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={
                                    showConfirmPassword ? "text" : "password"
                                  }
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
                  </>
                )}

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
                            href="/terms-and-condition"
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
                  disabled={claimMutation.isPending || accountEmailMismatch}
                  className="h-12 w-full rounded-[9px] bg-primary text-[14px] font-bold text-white shadow-[0_8px_18px_rgba(41,45,115,0.22)] transition hover:bg-[#20255F] hover:shadow-[0_10px_24px_rgba(41,45,115,0.28)] disabled:opacity-50"
                  type="submit"
                >
                  {claimMutation.isPending
                    ? isExistingUser
                      ? "Saving..."
                      : "Creating account..."
                    : isExistingUser
                      ? "Save Business Account"
                      : "Create Account"}
                </Button>

                {!isExistingUser && (
                  <p className="text-center text-sm font-medium leading-normal text-[#1A1A2E] xl:text-base">
                    Already have an account?{" "}
                    <Link
                      href={`/login?callbackUrl=${encodeURIComponent(callbackPath)}`}
                      className="font-extrabold text-primary"
                    >
                      Log In
                    </Link>
                  </p>
                )}
              </form>
            </Form>
          </div>
        </div>
      </div>

      <AccountCreatedSuccessfulModal
        open={showSuccessModal}
        email={successEmail}
      />
      <BusinessListedSuccessModal
        open={showListingSuccessModal}
        profileUrl={claimedProfileUrl}
      />
    </section>
  );
}

export default function ClaimBusinessPage() {
  return (
    <Suspense
      fallback={
        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F3F6FA] px-3 py-8 sm:px-5 md:py-12 lg:px-8">
          <div className="pointer-events-none absolute -left-28 top-10 h-80 w-80 rounded-full bg-[#DCE4FF]/70 blur-3xl" />
          <div className="pointer-events-none absolute -right-28 bottom-10 h-80 w-80 rounded-full bg-[#D9F1EC]/80 blur-3xl" />
          <Loader2 className="h-10 w-10 animate-spin text-[#292D73]" />
        </section>
      }
    >
      <ClaimBusinessContent />
    </Suspense>
  );
}
