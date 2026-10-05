"use client";

import { useEffect, useId, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Building2, ChevronDown, ImagePlus, Star, X } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLocationCities, useLocationStates } from "@/hooks/use-location-options";
import { useServiceCategories } from "@/hooks/use-service-categories";

const inputClass = "mt-2 w-full rounded-lg border border-[#D0D5DD] bg-white px-3 py-2.5 text-sm text-[#344054] outline-none focus:border-[#292D73] focus:ring-2 focus:ring-[#292D73]/15";
const imageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

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
  onChange,
}: ReferralSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const id = useId();
  const selectedLabel = options.find((option) => option.value === value)?.label;

  return (
    <label className="block text-xs font-semibold text-[#344054]">
      {label} *
      <input type="hidden" name={name} value={value} />
      <div className="relative mt-2">
        <button
          id={id}
          type="button"
          disabled={disabled || loading}
          onClick={() => setIsOpen((current) => !current)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className="flex w-full items-center justify-between rounded-lg border border-[#D0D5DD] bg-white px-3 py-2.5 text-left text-sm font-normal text-[#344054] outline-none transition focus:border-[#292D73] focus:ring-2 focus:ring-[#292D73]/15 disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:text-[#98A2B3]"
        >
          <span className={selectedLabel ? "truncate" : "truncate text-[#98A2B3]"}>
            {loading ? "Loading..." : selectedLabel || placeholder}
          </span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-[#667085] transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
        {isOpen && !loading && !disabled && (
          <div role="listbox" aria-labelledby={id} className="absolute z-30 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-[#D0D5DD] bg-white p-1 shadow-[0_12px_24px_rgba(16,24,40,0.16)]">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={value === option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`block w-full rounded-md px-3 py-2 text-left text-sm transition ${value === option.value ? "bg-[#EEF1FF] font-semibold text-[#292D73]" : "text-[#344054] hover:bg-[#F8FAFC]"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {!loading && !disabled && options.length === 0 && (
        <span className="mt-2 block text-xs font-normal text-[#667085]">No options are available yet.</span>
      )}
    </label>
  );
}

function ReferralForm({ onClose }: { onClose: () => void }) {
  const categoriesQuery = useServiceCategories();
  const statesQuery = useLocationStates();
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStateName, setSelectedStateName] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const states = statesQuery.data?.data ?? [];
  const selectedState = states.find((state) => state.name === selectedStateName);
  const citiesQuery = useLocationCities(selectedState);
  const cities = citiesQuery.data?.data.cities ?? [];

  useEffect(() => () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const image = event.target.files?.[0];
    if (!image) return;

    if (!imageTypes.has(image.type) || image.size > 5 * 1024 * 1024) {
      event.target.value = "";
      setMessage("Please upload a JPG, PNG, or WebP image smaller than 5 MB.");
      return;
    }

    setMessage("");
    setImagePreview(URL.createObjectURL(image));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    if (!String(values.get("businessName") ?? "").trim()) {
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
    if (!(values.get("businessImage") instanceof File) || !(values.get("businessImage") as File).size) {
      setMessage("Please upload a business image.");
      return;
    }
    if (!String(values.get("email") ?? "").trim() && !String(values.get("phoneNumber") ?? "").trim()) {
      setMessage("Please enter a business email address or phone number.");
      return;
    }
    if (!rating || !String(values.get("review") ?? "").trim()) {
      setMessage("Please select a rating and write a short review.");
      return;
    }
    setMessage("Your form is ready, but referral submission is not available yet. No data has been sent.");
  };

  return (
    <form
      onSubmit={handleSubmit}
      onChange={(event) => {
        if ((event.target as HTMLInputElement).name !== "businessImage") {
          setMessage("");
        }
      }}
      className="space-y-5 p-5 sm:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="text-xs font-semibold text-[#344054] sm:col-span-2">
          Business name *
          <input name="businessName" required maxLength={150} placeholder="Enter the business name" className={inputClass} />
        </label>
        <div className="sm:col-span-2 lg:col-span-1">
          <ReferralSelect
            label="Category"
            name="category"
            value={selectedCategory}
            options={(categoriesQuery.data?.data ?? []).map((category) => ({ value: category._id, label: category.name }))}
            placeholder="Select a category"
            loading={categoriesQuery.isLoading}
            disabled={categoriesQuery.isError}
            onChange={setSelectedCategory}
          />
          {categoriesQuery.isError && <p role="alert" className="mt-2 text-xs text-red-600">Could not load categories. <button type="button" onClick={() => void categoriesQuery.refetch()} className="font-semibold underline">Try again</button></p>}
        </div>
        <div>
          <ReferralSelect
            label="State"
            name="state"
            value={selectedStateName}
            options={states.map((state) => ({ value: state.name, label: state.name }))}
            placeholder="Select a state"
            loading={statesQuery.isLoading}
            disabled={statesQuery.isError}
            onChange={(stateName) => {
              setSelectedStateName(stateName);
              setSelectedCity("");
            }}
          />
          {statesQuery.isError && <p role="alert" className="mt-2 text-xs text-red-600">Could not load states. <button type="button" onClick={() => void statesQuery.refetch()} className="font-semibold underline">Try again</button></p>}
        </div>
        <div>
          <ReferralSelect
            label="City"
            name="city"
            value={selectedCity}
            options={cities.map((city) => ({ value: city, label: city }))}
            placeholder={selectedState ? "Select a city" : "Select a state first"}
            loading={Boolean(selectedState) && citiesQuery.isLoading}
            disabled={!selectedState || citiesQuery.isError}
            onChange={setSelectedCity}
          />
          {citiesQuery.isError && <p role="alert" className="mt-2 text-xs text-red-600">Could not load cities. <button type="button" onClick={() => void citiesQuery.refetch()} className="font-semibold underline">Try again</button></p>}
        </div>
        <label className="text-xs font-semibold text-[#344054]">
          Business email
          <input name="email" type="email" maxLength={254} placeholder="hello@business.com" className={inputClass} aria-describedby="referral-contact-hint" />
        </label>
        <label className="text-xs font-semibold text-[#344054]">
          Business phone
          <input name="phoneNumber" type="tel" maxLength={40} placeholder="Enter phone number" className={inputClass} aria-describedby="referral-contact-hint" />
        </label>
        <label className="text-xs font-semibold text-[#344054] sm:col-span-2 lg:col-span-1">
          Business image *
          <span className="mt-2 flex min-h-[42px] items-center gap-2 rounded-lg border border-dashed border-[#A8B2D1] bg-[#F8FAFF] px-3 py-2 text-sm font-normal text-[#475467] transition hover:border-[#292D73]">
            <ImagePlus className="h-4 w-4 shrink-0 text-[#292D73]" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">{imagePreview ? "Image selected" : "Upload JPG, PNG, or WebP"}</span>
            <input name="businessImage" type="file" accept="image/jpeg,image/png,image/webp" required className="w-[115px] text-xs file:mr-2 file:rounded-md file:border-0 file:bg-[#E6E9FA] file:px-2 file:py-1 file:text-xs file:font-semibold file:text-[#292D73] hover:file:bg-[#DCE1FA]" onChange={handleImageChange} />
          </span>
          <span className="mt-1 block text-[11px] font-normal text-[#667085]">Maximum file size: 5 MB.</span>
        </label>
      </div>
      {imagePreview && (
        <div className="relative h-36 overflow-hidden rounded-lg border border-[#D0D5DD] bg-[#F8FAFC] sm:h-44">
          <Image src={imagePreview} alt="Business image preview" fill unoptimized className="object-cover" />
          <button
            type="button"
            onClick={() => {
              setImagePreview(null);
              const input = document.querySelector<HTMLInputElement>('input[name="businessImage"]');
              if (input) input.value = "";
            }}
            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#475467] shadow-sm hover:bg-white"
            aria-label="Remove business image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <p id="referral-contact-hint" className="text-xs text-[#667085]">Provide at least one contact method: email or phone.</p>
      <fieldset>
        <legend className="text-xs font-semibold text-[#344054]">Your rating *</legend>
        <div className="mt-2 flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="cursor-pointer rounded-md p-1">
              <input type="radio" name="rating" value={value} checked={rating === value} onChange={() => setRating(value)} required className="peer sr-only" aria-label={`${value} ${value === 1 ? "star" : "stars"}`} />
              <Star aria-hidden="true" className={`h-7 w-7 rounded-sm peer-focus-visible:ring-2 peer-focus-visible:ring-[#292D73] peer-focus-visible:ring-offset-2 ${value <= rating ? "fill-[#FFB800] text-[#FFB800]" : "text-[#98A2B3]"}`} />
            </label>
          ))}
          <span className="text-xs text-[#667085]">{rating ? `${rating}/5` : "Select rating"}</span>
        </div>
      </fieldset>
      <label className="block text-xs font-semibold text-[#344054]">
        Your review *
        <textarea name="review" required maxLength={2000} rows={4} placeholder="Tell us about your experience with this business..." className={`${inputClass} resize-y`} />
      </label>
      {message && <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{message}</p>}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className="rounded-lg border border-[#D0D5DD] px-5 py-2.5 text-sm font-semibold text-[#475467] hover:bg-[#F8FAFC]">Cancel</button>
        <button type="submit" disabled={categoriesQuery.isLoading || categoriesQuery.isError || !(categoriesQuery.data?.data.length)} className="rounded-lg bg-[#292D73] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#20255F] disabled:cursor-not-allowed disabled:opacity-50">Submit Referral</button>
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
  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
        <ReferralForm onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
