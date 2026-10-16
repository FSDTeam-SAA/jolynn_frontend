"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Building2, ChevronDown, ImagePlus, Search, Star, X } from "lucide-react";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLocationCities, useLocationStates } from "@/hooks/use-location-options";
import { useServiceCategories } from "@/hooks/use-service-categories";
import { authHeaders, getReferralApiUrl, parseReferralResponse, ReferralApiError, type ApiSuccess, type MyReferral } from "@/lib/business-referrals";

const inputClass = "mt-2 w-full rounded-lg border border-[#D0D5DD] bg-white px-3 py-2.5 text-sm text-[#344054] outline-none focus:border-[#292D73] focus:ring-2 focus:ring-[#292D73]/15";

type SelectOption = {
  value: string;
  label: string;
};

type ReferralSelectProps = {
  label: string;
  name: string;
  options: SelectOption[];
  value: string;
  placeholder: string;
  loading?: boolean;
  disabled?: boolean;
  error?: string;
  onChange: (value: string) => void;
};

function ReferralSelect({
  label,
  name,
  options,
  value,
  placeholder,
  loading = false,
  disabled = false,
  error,
  onChange,
}: ReferralSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const id = useId();
  const selectedLabel = options.find((option) => option.value === value)?.label;
  const normalizedSearchTerm = searchTerm.trim().toLocaleLowerCase();
  const filteredOptions = normalizedSearchTerm
    ? options.filter((option) => option.label.toLocaleLowerCase().includes(normalizedSearchTerm))
    : options;

  const toggleOpen = () => {
    setIsOpen((current) => {
      if (current) setSearchTerm("");
      return !current;
    });
  };

  return (
    <label className="block text-xs font-semibold text-[#344054]">
      {label} *
      <input type="hidden" name={name} value={value} />
      <div className="relative mt-2">
        <button
          id={id}
          type="button"
          role="combobox"
          aria-controls={isOpen ? `${id}-options` : undefined}
          disabled={disabled || loading}
          onClick={toggleOpen}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="flex w-full items-center justify-between rounded-lg border border-[#D0D5DD] bg-white px-3 py-2.5 text-left text-sm font-normal text-[#344054] outline-none transition focus:border-[#292D73] focus:ring-2 focus:ring-[#292D73]/15 disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:text-[#98A2B3]"
        >
          <span className={selectedLabel ? "truncate" : "truncate text-[#98A2B3]"}>
            {loading ? "Loading..." : selectedLabel || placeholder}
          </span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-[#667085] transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && !loading && !disabled && (
          <div className="absolute z-30 mt-1 w-full rounded-lg border border-[#D0D5DD] bg-white p-1 shadow-[0_12px_24px_rgba(16,24,40,0.16)]">
            <div className="relative border-b border-[#EAECF0] p-1 pb-2">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-[#667085]" aria-hidden="true" />
              <input
                autoFocus
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setIsOpen(false);
                    setSearchTerm("");
                  }
                }}
                placeholder={`Search ${label.toLocaleLowerCase()}...`}
                aria-label={`Search ${label.toLocaleLowerCase()}`}
                className="w-full rounded-md border border-[#D0D5DD] py-2 pl-8 pr-3 text-sm font-normal text-[#344054] outline-none focus:border-[#292D73] focus:ring-2 focus:ring-[#292D73]/15"
              />
            </div>
            <div id={`${id}-options`} role="listbox" aria-labelledby={id} className="max-h-48 overflow-y-auto pt-1">
              {filteredOptions.length ? filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={value === option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`block w-full rounded-md px-3 py-2 text-left text-sm transition ${value === option.value ? "bg-[#EEF1FF] font-semibold text-[#292D73]" : "text-[#344054] hover:bg-[#F8FAFC]"}`}
                >
                  {option.label}
                </button>
              )) : (
                <p className="px-3 py-3 text-sm font-normal text-[#667085]">No matching {label.toLocaleLowerCase()} found.</p>
              )}
            </div>
          </div>
        )}
      </div>
      {error ? <span id={`${id}-error`} className="mt-1 block text-xs text-red-600">{error}</span> : null}
      {!loading && !disabled && options.length === 0 && (
        <span className="mt-2 block text-xs font-normal text-[#667085]">No options are available yet.</span>
      )}
    </label>
  );
}

function ReferralForm({ onClose, token }: { onClose: () => void; token: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const categoriesQuery = useServiceCategories(100);
  const statesQuery = useLocationStates();
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const imageInput = useRef<HTMLInputElement>(null);
  const errorFor = (name: string) => fieldErrors[name]
    ? <span className="mt-1 block text-xs text-red-600">{fieldErrors[name]}</span>
    : null;
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStateName, setSelectedStateName] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const states = statesQuery.data?.data ?? [];
  const selectedState = states.find((state) => state.name === selectedStateName);
  const citiesQuery = useLocationCities(selectedState);
  const cities = citiesQuery.data?.data.cities ?? [];
  const createReferral = useMutation({
    mutationKey: ["create-business-referral"],
    mutationFn: async (body: FormData) => {
      const response = await fetch(`${getReferralApiUrl()}/business-referrals`, {
        method: "POST",
        headers: authHeaders(token),
        body,
      });
      return parseReferralResponse<ApiSuccess<MyReferral>>(response);
    },
  });

  useEffect(() => () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const image = event.target.files?.[0];
    if (!image) {
      setImagePreview(null);
      return;
    }

    if (!image.type.startsWith("image/") || image.size > 5 * 1024 * 1024) {
      event.target.value = "";
      setImagePreview(null);
      setMessage("Please upload an image smaller than 5 MB.");
      return;
    }

    setMessage("");
    setImagePreview(URL.createObjectURL(image));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (createReferral.isPending) return;
    setMessage("");
    setFieldErrors({});
    const form = event.currentTarget;
    const values = new FormData(event.currentTarget);
    const businessName = String(values.get("businessName") ?? "").trim();
    const businessEmail = String(values.get("businessEmail") ?? "").trim();
    const businessPhone = String(values.get("businessPhone") ?? "").trim();
    const review = String(values.get("review") ?? "").trim();
    const image = values.get("image");

    if (businessName.length < 2) {
      setMessage("Please enter a business name.");
      return;
    }
    if (!selectedCategory) {
      setMessage("Please select a category.");
      return;
    }
    if (!selectedStateName || !selectedCity) {
      setMessage("Please select the business state and city.");
      return;
    }
    if (image instanceof File && image.size && (!image.type.startsWith("image/") || image.size > 5 * 1024 * 1024)) {
      setMessage("Please upload an image of 5 MB or smaller.");
      return;
    }
    if (!businessEmail) {
      setMessage("Please enter the business email address.");
      return;
    }
    const body = new FormData();
    body.append("businessName", businessName);
    body.append("serviceCategoryId", selectedCategory);
    body.append("state", selectedStateName);
    body.append("city", selectedCity);
    body.append("businessEmail", businessEmail.toLowerCase());
    if (businessPhone) body.append("businessPhone", businessPhone);
    if (rating) body.append("rating", String(rating));
    if (review) body.append("review", review);
    if (image instanceof File && image.size) body.append("image", image);

    createReferral.mutate(body, {
      onSuccess: async (result) => {
        if (result.data.emailDeliveryStatus === "failed") {
          toast.warning("Your referral is public, but the claim email could not be delivered. You can retry from My Referrals.");
        } else {
          toast.success(result.data.emailDeliveryStatus === "sent"
            ? "Your referral is now public. We sent the business a secure claim link."
            : "Your referral is now public. Check My Referrals for claim email delivery updates.");
        }
        form.reset();
        setSelectedCategory("");
        setSelectedStateName("");
        setSelectedCity("");
        setRating(0);
        setImagePreview(null);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["business-search"] }),
          queryClient.invalidateQueries({ queryKey: ["my-business-referrals"] }),
        ]);
        onClose();
      },
      onError: (error) => {
        if (error instanceof ReferralApiError) {
          if (error.status === 401) {
            onClose();
            router.push(
              `/login?callbackUrl=${encodeURIComponent("/account/profile?referBusiness=1")}`,
            );
          } else if (error.status === 403) {
            setMessage("Switch to your personal profile before referring a business.");
          } else if (error.status === 409) {
            setMessage("This business already has a referral or registered profile.");
          } else if (error.status === 413) {
            setMessage("Image must be 5 MB or smaller.");
          } else {
            setFieldErrors(Object.fromEntries(error.errorSources.map((source) => [String(source.path), source.message])));
            setMessage(error.errorSources[0]?.message || error.message);
          }
          return;
        }
        setMessage(error instanceof Error ? error.message : "Unable to submit your referral.");
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      onChange={(event) => {
        const name = (event.target as HTMLInputElement).name;
        if (name) setFieldErrors((current) => ({ ...current, [name]: "" }));
        if ((event.target as HTMLInputElement).name !== "image") {
          setMessage("");
        }
      }}
      className="space-y-5 p-5 sm:p-6 [&_[aria-invalid=true]]:border-red-500"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-xs font-semibold text-[#344054] sm:col-span-2">
          Business name *
          <input name="businessName" required minLength={2} maxLength={150} aria-invalid={Boolean(fieldErrors.businessName)} placeholder="Enter the business name" className={inputClass} />
          {errorFor("businessName")}
        </label>
        <div className="sm:col-span-2 lg:col-span-1">
          <ReferralSelect
            label="Category"
            name="serviceCategoryId"
            error={fieldErrors.serviceCategoryId}
            value={selectedCategory}
            options={(categoriesQuery.data?.data ?? []).map((category) => ({ value: category._id, label: category.name }))}
            placeholder="Select a category"
            loading={categoriesQuery.isLoading}
            disabled={categoriesQuery.isError}
            onChange={(value) => { setSelectedCategory(value); setFieldErrors((current) => ({ ...current, serviceCategoryId: "" })); }}
          />
          {categoriesQuery.isError && <p role="alert" className="mt-2 text-xs text-red-600">Could not load categories. <button type="button" onClick={() => void categoriesQuery.refetch()} className="font-semibold underline">Try again</button></p>}
        </div>
        <div>
          <ReferralSelect
            label="State"
            name="state"
            error={fieldErrors.state}
            value={selectedStateName}
            options={states.map((state) => ({ value: state.name, label: state.name }))}
            placeholder="Select a state"
            loading={statesQuery.isLoading}
            disabled={statesQuery.isError}
            onChange={(stateName) => {
              setSelectedStateName(stateName);
              setSelectedCity("");
              setFieldErrors((current) => ({ ...current, state: "", city: "" }));
            }}
          />
          {statesQuery.isError && <p role="alert" className="mt-2 text-xs text-red-600">Could not load states. <button type="button" onClick={() => void statesQuery.refetch()} className="font-semibold underline">Try again</button></p>}
        </div>
        <div>
          <ReferralSelect
            label="City"
            name="city"
            error={fieldErrors.city}
            value={selectedCity}
            options={cities.map((city) => ({ value: city, label: city }))}
            placeholder={selectedState ? "Select a city" : "Select a state first"}
            loading={Boolean(selectedState) && citiesQuery.isLoading}
            disabled={!selectedState || citiesQuery.isError}
            onChange={(value) => { setSelectedCity(value); setFieldErrors((current) => ({ ...current, city: "" })); }}
          />
          {citiesQuery.isError && <p role="alert" className="mt-2 text-xs text-red-600">Could not load cities. <button type="button" onClick={() => void citiesQuery.refetch()} className="font-semibold underline">Try again</button></p>}
        </div>
        <label className="text-xs font-semibold text-[#344054]">
          Business email *
          <input name="businessEmail" type="email" required maxLength={254} aria-invalid={Boolean(fieldErrors.businessEmail)} placeholder="hello@business.com" className={inputClass} aria-describedby="referral-contact-hint" />
          {errorFor("businessEmail")}
        </label>
        <label className="text-xs font-semibold text-[#344054]">
          Business phone
          <input name="businessPhone" type="tel" maxLength={30} aria-invalid={Boolean(fieldErrors.businessPhone)} placeholder="Enter phone number" className={inputClass} aria-describedby="referral-contact-hint" />
          {errorFor("businessPhone")}
        </label>
        <label className="text-xs font-semibold text-[#344054] sm:col-span-2 lg:col-span-1">
          Business image (optional)
          <span className="mt-2 flex min-h-[42px] items-center gap-2 rounded-lg border border-dashed border-[#A8B2D1] bg-[#F8FAFF] px-3 py-2 text-sm font-normal text-[#475467] transition hover:border-[#292D73]">
            <ImagePlus className="h-4 w-4 shrink-0 text-[#292D73]" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">{imagePreview ? "Image selected" : "Upload an image"}</span>
            <input ref={imageInput} name="image" type="file" accept="image/*" aria-invalid={Boolean(fieldErrors.image)} className="w-[115px] text-xs file:mr-2 file:rounded-md file:border-0 file:bg-[#E6E9FA] file:px-2 file:py-1 file:text-xs file:font-semibold file:text-[#292D73] hover:file:bg-[#DCE1FA]" onChange={handleImageChange} />
          </span>
          <span className="mt-1 block text-[11px] font-normal text-[#667085]">Maximum file size: 5 MB.</span>
          {errorFor("image")}
        </label>
      </div>
      {imagePreview && (
        <div className="relative h-36 overflow-hidden rounded-lg border border-[#D0D5DD] bg-[#F8FAFC] sm:h-44">
          <Image src={imagePreview} alt="Business image preview" fill unoptimized className="object-cover" />
          <button
            type="button"
            onClick={() => {
              setImagePreview(null);
              const input = imageInput.current;
              if (input) input.value = "";
            }}
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#475467] shadow-sm hover:bg-white"
            aria-label="Remove business image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <p id="referral-contact-hint" className="text-xs text-[#667085]">The business email is required so we can send its secure claim link. Phone is optional.</p>
      <fieldset>
        <legend className="text-xs font-semibold text-[#344054]">Your rating (optional)</legend>
        <div className="mt-2 flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="cursor-pointer rounded-md p-1">
              <input type="radio" name="rating" value={value} checked={rating === value} onChange={() => setRating(value)} className="peer sr-only" aria-label={`${value} ${value === 1 ? "star" : "stars"}`} />
              <Star aria-hidden="true" className={`h-7 w-7 rounded-sm peer-focus-visible:ring-2 peer-focus-visible:ring-[#292D73] peer-focus-visible:ring-offset-2 ${value <= rating ? "fill-[#FFB800] text-[#FFB800]" : "text-[#98A2B3]"}`} />
            </label>
          ))}
          <span className="text-xs text-[#667085]">{rating ? `${rating}/5` : "Select rating"}</span>
        </div>
      </fieldset>
      {errorFor("rating")}
      <label className="block text-xs font-semibold text-[#344054]">
        Your review (optional)
        <textarea name="review" minLength={10} maxLength={1500} rows={4} aria-invalid={Boolean(fieldErrors.review)} placeholder="Tell us about your experience with this business..." className={`${inputClass} resize-y`} />
        {errorFor("review")}
      </label>
      {message && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className="rounded-lg border border-[#D0D5DD] px-5 py-2.5 text-sm font-semibold text-[#475467] hover:bg-[#F8FAFC]">Cancel</button>
        <button type="submit" disabled={createReferral.isPending || categoriesQuery.isLoading || categoriesQuery.isError || !(categoriesQuery.data?.data.length)} className="rounded-lg bg-[#292D73] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#20255F] disabled:cursor-not-allowed disabled:opacity-50">{createReferral.isPending ? "Publishing..." : "Submit Referral"}</button>
      </div>
    </form>
  );
}

type ReferBusinessDialogProps = {
  triggerClassName?: string;
  trigger?: ReactNode;
};

export default function ReferBusinessDialog({
  triggerClassName,
  trigger,
}: ReferBusinessDialogProps = {}) {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionUser = session?.user as
    | { role?: string; token?: string; accessToken?: string }
    | undefined;
  const token = sessionUser?.accessToken ?? sessionUser?.token;

  useEffect(() => {
    if (
      searchParams.get("referBusiness") === "1" &&
      status === "authenticated" &&
      sessionUser?.role === "user"
    ) {
      setOpen(true);
    }
  }, [searchParams, sessionUser?.role, status]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setOpen(false);
      return;
    }
    if (status === "loading") return;
    if (status !== "authenticated" || !token) {
      router.push(
        `/login?callbackUrl=${encodeURIComponent("/account/profile?referBusiness=1")}`,
      );
      return;
    }
    if (sessionUser?.role !== "user") {
      toast.error("Switch to your personal profile to refer a business.");
      return;
    }
    setOpen(true);
  };

  if (status === "authenticated" && sessionUser?.role === "businessOwner") {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <button
            type="button"
            className={
              triggerClassName ||
              "inline-flex h-11 w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[#292D73] bg-[#EEF0FF] px-3 text-[13px] font-semibold text-[#292D73] transition hover:bg-[#E0E4FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73] focus-visible:ring-offset-2 lg:px-4"
            }
          >
            <Building2 className={triggerClassName ? "h-5 w-5 shrink-0" : "h-4 w-4 shrink-0"} />
            <span>Refer a Business</span>
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-xl p-0">
        <DialogHeader className="border-b border-[#E4E8EF] bg-[#F7F9FF] p-5 text-left sm:p-6">
          <DialogTitle className="text-xl font-extrabold text-[#292D73]">Refer a Business</DialogTitle>
          <DialogDescription className="text-sm text-[#667085]">Recommend a business and share your experience. Fields marked * are required.</DialogDescription>
        </DialogHeader>
        {token ? <ReferralForm onClose={() => setOpen(false)} token={token} /> : null}
      </DialogContent>
    </Dialog>
  );
}
