"use client";

import { useProfileQuery } from "@/hooks/APicalling";
import { useServiceCategories } from "@/hooks/use-service-categories";
import { useMutation } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Sparkles,
  UserRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

type FormValues = {
  name: string;
  email: string;
  zipCode: string;
  category: string;
  customCategory: string;
  phone: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;

type HelpWantedPayload = {
  username: string;
  email: string;
  zipcode: string;
  category: string;
  requestedCategory?: string;
  phone: string;
  message: string;
};

type HelpWantedResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: HelpWantedPayload & {
    _id: string;
    createdAt: string;
    updatedAt: string;
  };
};

const OTHER_CATEGORY = "__other__";
const MESSAGE_LIMIT = 1000;

const initialValues: FormValues = {
  name: "",
  email: "",
  zipCode: "",
  category: "",
  customCategory: "",
  phone: "",
  message: "",
};

const fieldClassName =
  "h-11 w-full rounded-[10px] border bg-white pl-11 pr-4 text-[14px] font-medium text-[#20244A] outline-none transition placeholder:font-normal placeholder:text-[#98A2B3] focus:border-[#292D73] focus:ring-4 focus:ring-[#292D73]/10";

const validateField = (
  field: keyof FormValues,
  values: FormValues,
): string | undefined => {
  const value = values[field].trim();

  switch (field) {
    case "name":
      if (!value) return "Please enter your name.";
      if (value.length < 2) return "Name must be at least 2 characters.";
      if (value.length > 80) return "Name must be 80 characters or fewer.";
      return undefined;
    case "email":
      if (!value) return "Please enter your email address.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        return "Please enter a valid email address.";
      return undefined;
    case "zipCode":
      if (!value) return "Please enter your zip or postal code.";
      if (!/^[A-Za-z0-9][A-Za-z0-9 -]{1,10}[A-Za-z0-9]$/.test(value))
        return "Please enter a valid zip or postal code.";
      return undefined;
    case "category":
      if (!value) return "Please select a service category.";
      return undefined;
    case "customCategory":
      if (values.category !== OTHER_CATEGORY) return undefined;
      if (!value) return "Please enter the service category you need.";
      if (value.length < 2) return "Category must be at least 2 characters.";
      if (value.length > 80) return "Category must be 80 characters or fewer.";
      return undefined;
    case "phone": {
      if (!value) return "Please enter your phone number.";
      const digits = value.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15)
        return "Phone number must contain 7 to 15 digits.";
      if (!/^[+()\d\s.-]+$/.test(value))
        return "Please enter a valid phone number.";
      return undefined;
    }
    case "message":
      if (!value) return "Please describe the service you need.";
      if (value.length < 20)
        return "Please add at least 20 characters so providers can understand your request.";
      if (value.length > MESSAGE_LIMIT)
        return `Message must be ${MESSAGE_LIMIT} characters or fewer.`;
      return undefined;
  }
};

const validateForm = (values: FormValues): FormErrors => {
  const fields: (keyof FormValues)[] = [
    "name",
    "email",
    "zipCode",
    "category",
    "customCategory",
    "phone",
    "message",
  ];

  return fields.reduce<FormErrors>((errors, field) => {
    const error = validateField(field, values);
    if (error) errors[field] = error;
    return errors;
  }, {});
};

type FieldProps = {
  id: keyof FormValues;
  label: string;
  icon: LucideIcon;
  error?: string;
  children: React.ReactNode;
  hint?: string;
};

const Field = ({
  id,
  label,
  icon: Icon,
  error,
  children,
  hint,
}: FieldProps) => (
  <div>
    <label htmlFor={id} className="text-[13px] font-bold text-[#344054]">
      {label} <span className="text-[#D92D20]">*</span>
    </label>
    <div className="relative mt-2">
      <Icon
        className="pointer-events-none absolute left-4 top-1/2 z-10 h-[17px] w-[17px] -translate-y-1/2 text-[#667085]"
        aria-hidden="true"
      />
      {children}
    </div>
    {error ? (
      <p id={`${id}-error`} role="alert" className="mt-1.5 text-[12px] font-medium text-[#D92D20]">
        {error}
      </p>
    ) : hint ? (
      <p className="mt-1.5 text-[11px] text-[#98A2B3]">{hint}</p>
    ) : null}
  </div>
);

const CreateJobPostForm = () => {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [formMessage, setFormMessage] = useState("");
  const prefilledProfileId = useRef<string | null>(null);
  const sessionUser = session?.user as
    | {
        token?: string;
        accessToken?: string;
        username?: string;
        firstName?: string;
        lastName?: string;
        name?: string;
        email?: string | null;
        phoneNumber?: string;
      }
    | undefined;
  const token = sessionUser?.accessToken ?? sessionUser?.token;
  const profileQuery = useProfileQuery(token);
  const profile = profileQuery.data?.data;
  const categoriesQuery = useServiceCategories();
  const categoryOptions = useMemo(
    () => {
      const categories = categoriesQuery.data?.data ?? [];
      return Array.from(
        new Map(
          categories
            .filter(
              (category) =>
                category.name?.trim() &&
                category.status === "approved" &&
                category.isActive,
            )
            .map((category) => [
              category.name.trim().toLowerCase(),
              category,
            ]),
        ).values(),
      );
    },
    [categoriesQuery.data?.data],
  );

  useEffect(() => {
    if (!sessionUser) return;

    const sessionName =
      sessionUser.username ||
      [sessionUser.firstName, sessionUser.lastName].filter(Boolean).join(" ") ||
      sessionUser.name ||
      "";

    setValues((current) => ({
      ...current,
      name: current.name || sessionName,
      email: current.email || sessionUser.email || "",
      phone: current.phone || sessionUser.phoneNumber || "",
    }));
  }, [sessionUser]);

  useEffect(() => {
    if (!profile || prefilledProfileId.current === profile._id) return;

    const profileName =
      profile.username ||
      profile.fullName ||
      [profile.firstName, profile.lastName].filter(Boolean).join(" ");

    setValues((current) => ({
      ...current,
      name: current.name || profileName,
      email: current.email || profile.email || "",
      zipCode: current.zipCode || profile.postcode || "",
      phone: current.phone || profile.phoneNumber || "",
    }));
    prefilledProfileId.current = profile._id;
  }, [profile]);

  const { mutate, isPending } = useMutation<
    HelpWantedResponse,
    Error,
    HelpWantedPayload
  >({
    mutationKey: ["create-help-wanted"],
    mutationFn: async (payload) => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) throw new Error("The help wanted service is not configured.");

      const response = await fetch(`${apiUrl}/help-wanted`, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as HelpWantedResponse;

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to submit your request.");
      }
      return result;
    },
    onSuccess: (result) => {
      setValues(initialValues);
      setErrors({});
      setTouched({});
      setFormMessage(result.message);
      toast.success(result.message);
      router.push("/job-posts");
    },
    onError: (error) => {
      setFormMessage(error.message);
      toast.error(error.message);
    },
  });

  const updateValue = (field: keyof FormValues, value: string) => {
    const nextValues = { ...values, [field]: value };
    if (field === "category" && value !== OTHER_CATEGORY) {
      nextValues.customCategory = "";
    }
    setValues(nextValues);
    if (touched[field] || errors[field]) {
      setErrors((current) => ({
        ...current,
        [field]: validateField(field, nextValues),
        ...(field === "category"
          ? { customCategory: validateField("customCategory", nextValues) }
          : {}),
      }));
    }
    if (formMessage) setFormMessage("");
  };

  const handleBlur = (field: keyof FormValues) => {
    setTouched((current) => ({ ...current, [field]: true }));
    setErrors((current) => ({
      ...current,
      [field]: validateField(field, values),
    }));
  };

  const errorProps = (field: keyof FormValues) => ({
    "aria-invalid": Boolean(errors[field]),
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormMessage("");
    const nextErrors = validateForm(values);
    setErrors(nextErrors);
    setTouched({
      name: true,
      email: true,
      zipCode: true,
      category: true,
      customCategory: true,
      phone: true,
      message: true,
    });

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please check the highlighted fields.");
      requestAnimationFrame(() => {
        document
          .querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus();
      });
      return;
    }

    mutate({
      username: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      zipcode: values.zipCode.trim(),
      category:
        values.category === OTHER_CATEGORY
          ? "Other"
          : values.category.trim(),
      ...(values.category === OTHER_CATEGORY
        ? { requestedCategory: values.customCategory.trim() }
        : {}),
      phone: values.phone.trim(),
      message: values.message.trim(),
    });
  };

  return (
    <section className="relative overflow-hidden bg-[#F5F7FB] px-4 py-6 sm:px-6 md:py-8 lg:px-8">
      <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-[#DCE4FF]/55 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-16 h-72 w-72 rounded-full bg-[#DDF4EE]/70 blur-3xl" />

      <div className="relative mx-auto max-w-[1120px]">
        <div className="mb-5 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D9DDF2] bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#292D73] shadow-sm">
            <Sparkles className="h-3.5 w-3.5" />
            Find the right professional
          </span>
          <h1 className="mx-auto mt-2.5 max-w-2xl text-[27px] font-extrabold leading-tight text-[#171A3A] sm:text-[32px] md:text-[36px]">
            Tell us what service you need
          </h1>
          <p className="mx-auto mt-1.5 max-w-xl text-[12px] leading-5 text-[#667085] sm:text-[13px]">
            Share a few details about your request so local professionals can understand how they can help.
          </p>
        </div>

        <div className="grid overflow-hidden rounded-[18px] border border-[#E1E5EC] bg-white shadow-[0_24px_70px_rgba(28,35,70,0.12)] lg:grid-cols-[330px_minmax(0,1fr)]">
          <aside className="relative overflow-hidden bg-[#292D73] p-6 text-white sm:p-7">
            <div className="absolute -right-20 -top-16 h-56 w-56 rounded-full border-[36px] border-white/5" />
            <div className="relative">
              <div className="flex h-11 w-11 items-center justify-center rounded-[11px] bg-white/12 ring-1 ring-white/15">
                <Wrench className="h-5 w-5 text-[#F4D48A]" />
              </div>
              <h2 className="mt-4 text-[20px] font-bold">Create your help post</h2>
              <p className="mt-2 text-[12px] leading-5 text-[#D8DBF1]">
                A clear request helps service providers respond with more useful information.
              </p>

              <ol className="mt-6 space-y-4">
                {[
                  ["01", "Your details", "Tell providers how to reach you."],
                  ["02", "Service category", "Choose a service or add your own."],
                  ["03", "Request details", "Explain the work, timing, and needs."],
                ].map(([number, title, description]) => (
                  <li key={number} className="flex gap-3.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-extrabold text-[#F4D48A] ring-1 ring-white/15">
                      {number}
                    </span>
                    <div>
                      <p className="text-[13px] font-bold">{title}</p>
                      <p className="mt-0.5 text-[11px] leading-5 text-[#BFC4E1]">{description}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-6 rounded-[12px] border border-white/10 bg-white/[0.07] p-3.5">
                <div className="flex items-start gap-3">
                  <CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-[#F4D48A]" />
                  <p className="text-[11px] leading-5 text-[#D8DBF1]">
                    Review your contact details before posting. They help interested providers connect with you.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div className="p-5 sm:p-6 lg:p-7">
            {profile && (
              <div className="mb-4 flex items-start gap-3 rounded-[10px] border border-[#BDE4DA] bg-[#F0FAF7] px-4 py-2.5 text-[11px] leading-5 text-[#35665D]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16857A]" aria-hidden="true" />
                <p>
                  Your saved profile details have been added. You can update them for this post if needed.
                </p>
              </div>
            )}

            {token && profileQuery.isError && (
              <div role="alert" className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-2.5 text-[11px] text-amber-800">
                <span>We couldn&apos;t load your saved profile details.</span>
                <button type="button" onClick={() => profileQuery.refetch()} className="font-bold text-[#292D73] underline underline-offset-2">
                  Try again
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-[#98A2B3]">Contact information</p>
                <h2 className="mt-0.5 text-[18px] font-bold text-[#20244A]">How can providers reach you?</h2>
              </div>

              <div className="mt-4 grid gap-x-5 gap-y-3.5 sm:grid-cols-2">
                <Field id="name" label="Your name" icon={UserRound} error={errors.name}>
                  <input
                    id="name"
                    autoComplete="name"
                    maxLength={80}
                    value={values.name}
                    onChange={(event) => updateValue("name", event.target.value)}
                    onBlur={() => handleBlur("name")}
                    placeholder="Enter your name"
                    className={`${fieldClassName} ${errors.name ? "border-[#FDA29B]" : "border-[#D0D5DD]"}`}
                    {...errorProps("name")}
                  />
                </Field>

                <Field id="email" label="Email address" icon={Mail} error={errors.email}>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={values.email}
                    onChange={(event) => updateValue("email", event.target.value)}
                    onBlur={() => handleBlur("email")}
                    placeholder="you@example.com"
                    className={`${fieldClassName} ${errors.email ? "border-[#FDA29B]" : "border-[#D0D5DD]"}`}
                    {...errorProps("email")}
                  />
                </Field>

                <Field id="phone" label="Phone number" icon={Phone} error={errors.phone}>
                  <input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    maxLength={25}
                    value={values.phone}
                    onChange={(event) => updateValue("phone", event.target.value)}
                    onBlur={() => handleBlur("phone")}
                    placeholder="+1 (555) 000-0000"
                    className={`${fieldClassName} ${errors.phone ? "border-[#FDA29B]" : "border-[#D0D5DD]"}`}
                    {...errorProps("phone")}
                  />
                </Field>

                <Field id="zipCode" label="Zip / postal code" icon={MapPin} error={errors.zipCode}>
                  <input
                    id="zipCode"
                    autoComplete="postal-code"
                    maxLength={12}
                    value={values.zipCode}
                    onChange={(event) => updateValue("zipCode", event.target.value)}
                    onBlur={() => handleBlur("zipCode")}
                    placeholder="Enter your zip code"
                    className={`${fieldClassName} ${errors.zipCode ? "border-[#FDA29B]" : "border-[#D0D5DD]"}`}
                    {...errorProps("zipCode")}
                  />
                </Field>
              </div>

              <div className="my-5 h-px bg-[#EAECF0]" />

              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.13em] text-[#98A2B3]">Service details</p>
                <h2 className="mt-0.5 text-[18px] font-bold text-[#20244A]">What kind of help do you need?</h2>
              </div>

              <div className="mt-4">
                <Field
                  id="category"
                  label="Service category"
                  icon={Wrench}
                  error={errors.category}
                  hint={categoriesQuery.isPending ? "Loading available services..." : "Choose the closest match for your request."}
                >
                  <select
                    id="category"
                    value={values.category}
                    onChange={(event) => updateValue("category", event.target.value)}
                    onBlur={() => handleBlur("category")}
                    className={`${fieldClassName} appearance-none pr-11 ${errors.category ? "border-[#FDA29B]" : "border-[#D0D5DD]"}`}
                    {...errorProps("category")}
                  >
                    <option value="">
                      {categoriesQuery.isPending
                        ? "Loading categories..."
                        : categoriesQuery.isError
                          ? "Select Others to add a category"
                          : "Select a category"}
                    </option>
                    {categoryOptions.map((category) => (
                      <option key={category._id} value={category.name.trim()}>
                        {category.name.trim()}
                      </option>
                    ))}
                    <option value={OTHER_CATEGORY}>Others</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" aria-hidden="true" />
                </Field>

                {categoriesQuery.isError && (
                  <div className="mt-2 flex items-center gap-2 text-[12px] text-amber-700">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>Service list is unavailable.</span>
                    <button type="button" onClick={() => categoriesQuery.refetch()} className="font-bold text-[#292D73] underline underline-offset-2">
                      Retry
                    </button>
                  </div>
                )}
              </div>

              {values.category === OTHER_CATEGORY && (
                <div className="mt-3.5 rounded-[12px] border border-[#D9DDF2] bg-[#F8F9FF] p-3.5">
                  <Field
                    id="customCategory"
                    label="Add your category"
                    icon={Sparkles}
                    error={errors.customCategory}
                    hint="Enter the service name that best describes your request."
                  >
                    <input
                      id="customCategory"
                      maxLength={80}
                      autoFocus
                      value={values.customCategory}
                      onChange={(event) => updateValue("customCategory", event.target.value)}
                      onBlur={() => handleBlur("customCategory")}
                      placeholder="e.g. Solar panel maintenance"
                      className={`${fieldClassName} ${errors.customCategory ? "border-[#FDA29B]" : "border-[#D0D5DD]"}`}
                      {...errorProps("customCategory")}
                    />
                  </Field>
                </div>
              )}

              <div className="mt-3.5">
                <label htmlFor="message" className="text-[13px] font-bold text-[#344054]">
                  Describe your request <span className="text-[#D92D20]">*</span>
                </label>
                <div className="relative mt-2">
                  <MessageSquareText className="pointer-events-none absolute left-4 top-4 h-[17px] w-[17px] text-[#667085]" aria-hidden="true" />
                  <textarea
                    id="message"
                    rows={4}
                    maxLength={MESSAGE_LIMIT}
                    value={values.message}
                    onChange={(event) => updateValue("message", event.target.value)}
                    onBlur={() => handleBlur("message")}
                    placeholder="Describe the service, preferred timeline, location details, and anything else a provider should know..."
                    className={`min-h-[108px] w-full resize-y rounded-[10px] border bg-white py-3 pl-11 pr-4 text-[14px] leading-5 text-[#20244A] outline-none transition placeholder:text-[#98A2B3] focus:border-[#292D73] focus:ring-4 focus:ring-[#292D73]/10 ${errors.message ? "border-[#FDA29B]" : "border-[#D0D5DD]"}`}
                    {...errorProps("message")}
                  />
                </div>
                <div className="mt-1.5 flex items-start justify-between gap-3">
                  {errors.message ? (
                    <p id="message-error" role="alert" className="text-[12px] font-medium text-[#D92D20]">{errors.message}</p>
                  ) : (
                    <p className="text-[11px] text-[#98A2B3]">Include enough detail to receive a relevant response.</p>
                  )}
                  <span className="shrink-0 text-[11px] tabular-nums text-[#98A2B3]">
                    {values.message.length}/{MESSAGE_LIMIT}
                  </span>
                </div>
              </div>

              {formMessage && (
                <p role="status" className="mt-4 rounded-[8px] bg-[#F2F4F7] px-4 py-3 text-center text-[13px] font-medium text-[#292E78]">
                  {formMessage}
                </p>
              )}

              <div className="mt-5 flex flex-col-reverse gap-3 border-t border-[#EAECF0] pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] leading-5 text-[#98A2B3]">
                  Fields marked with <span className="text-[#D92D20]">*</span> are required.
                </p>
                <button
                  type="submit"
                  disabled={isPending || sessionStatus === "loading"}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[9px] bg-[#292D73] px-7 text-[14px] font-extrabold text-white shadow-[0_8px_18px_rgba(41,45,115,0.24)] transition hover:bg-[#20245F] hover:shadow-[0_10px_24px_rgba(41,45,115,0.30)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#292D73]/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? "Publishing..." : "Publish Help Post"}
                  {!isPending && <ArrowRight className="h-4 w-4" />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CreateJobPostForm;
