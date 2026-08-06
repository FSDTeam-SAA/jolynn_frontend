"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  type BusinessOwnerFilters,
  useBusinessOwners,
} from "@/hooks/use-business-owners";
import { useServiceCategories } from "@/hooks/use-service-categories";
import {
  useLocationCities,
  useLocationStates,
} from "@/hooks/use-location-options";
import {
  AlertCircle,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  LayoutGrid,
  List,
  MapPin,
  MessageCircle,
  Search,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import BusinessSearchForm from "./business-search-form";
import NoBusinessResults from "./no-business-results";
import ReportBusinessModal from "./report-business-modal";

type ServicesSearchContainerProps = {
  initialSearchTerm?: string;
  initialState?: string;
  initialCity?: string;
};

type DraftFilters = {
  searchTerm: string;
  category: string;
  minimumRating: string;
  state: string;
  city: string;
};

type ViewMode = "list" | "grid";

type SelectedBusiness = {
  id: string;
  name: string;
};

const excludedStateNames = new Set([
  "armed forces pacific",
  "armed forces of the americas",
]);

type FilterLocationDropdownProps = {
  value: string;
  options: string[];
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  clearLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  onChange: (value: string) => void;
};

const FilterLocationDropdown = ({
  value,
  options,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  clearLabel = "None",
  disabled = false,
  loading = false,
  onChange,
}: FilterLocationDropdownProps) => {
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
          className="flex h-11 w-full items-center justify-between gap-2 rounded-[6px] border border-[#A7A7A7] bg-white px-3 text-left text-[12px] font-medium text-[#8A8F99] outline-none transition focus:ring-2 focus:ring-[#292D73]/20 disabled:cursor-not-allowed disabled:bg-[#F8FAFC]"
        >
          <span className="min-w-0 flex-1 truncate" title={value || placeholder}>
            {loading ? "Loading..." : value || placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="z-[70] w-[min(260px,calc(100vw-2rem))] overflow-hidden rounded-md border border-[#E4E7EC] bg-white p-0 shadow-[0_14px_35px_rgba(41,45,115,0.16)]"
      >
        <div className="flex h-10 items-center border-b border-[#EAECF0] px-3">
          <Search className="h-4 w-4 shrink-0 text-[#4365D0]" />
          <input
            autoFocus
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-full min-w-0 flex-1 bg-transparent px-2 text-xs font-medium text-[#292D73] outline-none placeholder:text-[#98A2B3]"
          />
        </div>
        <div className="max-h-52 overflow-y-auto p-1.5">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
              setSearchTerm("");
            }}
            className="flex w-full items-center rounded-md px-2.5 py-2 text-left text-xs font-medium text-[#344054] transition hover:bg-[#F2F4F7] focus:bg-[#EEF2FF] focus:outline-none"
          >
            <Check
              className={`mr-2 h-3.5 w-3.5 shrink-0 text-[#4365D0] ${
                value === "" ? "opacity-100" : "opacity-0"
              }`}
            />
            {clearLabel}
          </button>

          {filteredOptions.length === 0 && searchTerm.trim() ? (
            <p className="px-3 py-5 text-center text-xs text-[#667085]">
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
                className="flex w-full items-start rounded-md px-2.5 py-2 text-left text-xs font-medium leading-5 text-[#344054] transition hover:bg-[#F2F4F7] focus:bg-[#EEF2FF] focus:outline-none"
              >
                <Check
                  className={`mr-2 mt-[3px] h-3.5 w-3.5 shrink-0 text-[#4365D0] ${
                    value === option ? "opacity-100" : "opacity-0"
                  }`}
                />
                <span className="min-w-0 whitespace-normal break-words">
                  {option}
                </span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const BusinessCardsSkeleton = () => (
  <div
    className="grid grid-cols-1 gap-4 xl:grid-cols-2"
    aria-label="Loading businesses"
  >
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className="rounded-[8px] bg-white p-4 shadow-[0_6px_18px_rgba(30,45,75,0.12)] ring-1 ring-[#E8ECF2]"
      >
        <div className="flex gap-3">
          <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="mt-4 h-4 w-40" />
        <Skeleton className="mt-3 h-4 w-3/4" />
        <Skeleton className="mt-3 h-10 w-full" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
    ))}
  </div>
);

const ServicesSearchContainer = ({
  initialSearchTerm = "",
  initialState = "",
  initialCity = "",
}: ServicesSearchContainerProps) => {
  const categoriesQuery = useServiceCategories();
  const categories = categoriesQuery.data?.data ?? [];
  const statesQuery = useLocationStates();
  const states = (statesQuery.data?.data ?? []).filter(
    (state) => !excludedStateNames.has(state.name.trim().toLowerCase()),
  );

  const [draftFilters, setDraftFilters] = useState<DraftFilters>({
    searchTerm: initialSearchTerm,
    category: "",
    minimumRating: "",
    state: initialState,
    city: initialCity,
  });
  const [appliedFilters, setAppliedFilters] = useState<DraftFilters>({
    searchTerm: initialSearchTerm,
    category: "",
    minimumRating: "",
    state: initialState,
    city: initialCity,
  });
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedBusiness, setSelectedBusiness] =
    useState<SelectedBusiness | null>(null);
  const selectedDraftState = states.find(
    (state) => state.name === draftFilters.state,
  );
  const citiesQuery = useLocationCities(selectedDraftState);
  const cities = citiesQuery.data?.data.cities ?? [];

  useEffect(() => {
    const syncedFilters: DraftFilters = {
      searchTerm: initialSearchTerm,
      category: "",
      minimumRating: "",
      state: initialState,
      city: initialCity,
    };
    setDraftFilters(syncedFilters);
    setAppliedFilters(syncedFilters);
    setPage(1);
  }, [
    initialCity,
    initialSearchTerm,
    initialState,
  ]);

  const queryFilters: BusinessOwnerFilters = {
    searchTerm: appliedFilters.searchTerm,
    page,
    limit: 10,
    category: appliedFilters.category,
    minimumRating: appliedFilters.minimumRating,
    state: appliedFilters.state,
    city: appliedFilters.city,
  };
  const businessQuery = useBusinessOwners(queryFilters);
  const businesses = useMemo(
    () => businessQuery.data?.data ?? [],
    [businessQuery.data?.data],
  );

  console.log("businessQuery", businesses);
  const total = businessQuery.data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 10));

  const updateFilters = (changes: Partial<DraftFilters>) => {
    setDraftFilters((current) => ({ ...current, ...changes }));
    setAppliedFilters((current) => ({ ...current, ...changes }));
    setPage(1);
  };

  const updateFilter = (name: keyof DraftFilters, value: string) => {
    updateFilters({ [name]: value });
  };

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAppliedFilters(draftFilters);
    setPage(1);
  };

  const resetFilters = () => {
    const reset: DraftFilters = {
      searchTerm: initialSearchTerm,
      category: "",
      minimumRating: "",
      state: "",
      city: "",
    };
    setDraftFilters(reset);
    setAppliedFilters(reset);
    setPage(1);
  };

  return (
    <div className="mt-10 md:mt-14 lg:mt-16">
      <main className="min-h-screen bg-white">
        <section className="bg-[#DFF0EE] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="container">
            <BusinessSearchForm
              initialSearchTerm={initialSearchTerm}
              initialState={initialState}
              initialCity={initialCity}
            />
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 md:py-12 lg:px-8 lg:py-14">
          <div className="container">
            <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
              <aside className="h-fit rounded-[8px] bg-white p-5 shadow-[0_8px_24px_rgba(30,45,75,0.13)] ring-1 ring-[#E8ECF2] lg:sticky lg:top-24">
                <h2 className="text-[16px] font-semibold text-[#111827]">
                  Filter Results
                </h2>

                <form onSubmit={applyFilters} className="mt-5 space-y-3">
                  <label className="relative block">
                    <span className="sr-only">Search by service</span>
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A8F99]" />
                    <input
                      type="search"
                      value={draftFilters.searchTerm}
                      onChange={(event) =>
                        updateFilter("searchTerm", event.target.value)
                      }
                      placeholder="Search by Keyword..."
                      autoComplete="off"
                      className="h-11 w-full rounded-[6px] border border-[#A7A7A7] bg-white pl-10 pr-3 text-[12px] font-medium text-[#344054] outline-none placeholder:text-[#8A8F99] focus:border-[#292D73] focus:ring-2 focus:ring-[#292D73]/15"
                    />
                  </label>

                  {categoriesQuery.isPending ? (
                    <Skeleton className="h-10 w-full" />
                  ) : categoriesQuery.isError ? (
                    <button
                      type="button"
                      onClick={() => categoriesQuery.refetch()}
                      className="h-10 w-full rounded-[5px] border border-red-200 bg-red-50 px-3 text-left text-[11px] font-semibold text-red-700"
                    >
                      Categories unavailable — retry
                    </button>
                  ) : (
                    <label className="relative block">
                      <span className="sr-only">Category</span>
                      <select
                        value={draftFilters.category}
                        onChange={(event) =>
                          updateFilter("category", event.target.value)
                        }
                        className="h-11 w-full appearance-none rounded-[6px] border border-[#A7A7A7] bg-white px-3 pr-9 text-[12px] font-medium text-[#8A8F99] focus:outline-none focus:ring-2 focus:ring-[#292D73]/20"
                      >
                        <option value="">Select Category</option>
                        {categories
                          .filter((category) => category.isActive)
                          .map((category) => (
                            <option key={category._id} value={category.name}>
                              {category.name}
                            </option>
                          ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A8F99]" />
                    </label>
                  )}

                  <label className="relative block">
                    <span className="sr-only">Minimum rating</span>
                    <select
                      value={draftFilters.minimumRating}
                      onChange={(event) =>
                        updateFilter("minimumRating", event.target.value)
                      }
                      className="h-11 w-full appearance-none rounded-[6px] border border-[#A7A7A7] bg-white px-3 pr-9 text-[12px] font-medium text-[#8A8F99] focus:outline-none focus:ring-2 focus:ring-[#292D73]/20"
                    >
                      <option value="">Minimum Rating</option>
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <option key={rating} value={rating}>
                          {rating}+ stars
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A8F99]" />
                  </label>

                  <FilterLocationDropdown
                    value={draftFilters.state}
                    options={states.map((state) => state.name)}
                    placeholder={
                      statesQuery.isError ? "States unavailable" : "State"
                    }
                    searchPlaceholder="Search states..."
                    emptyMessage="No state found."
                    clearLabel="None"
                    loading={statesQuery.isPending}
                    disabled={statesQuery.isError || states.length === 0}
                    onChange={(nextState) => {
                      updateFilters({ state: nextState, city: "" });
                    }}
                  />

                  <FilterLocationDropdown
                    value={draftFilters.city}
                    options={cities}
                    placeholder={
                      !selectedDraftState
                        ? "Select State First"
                        : citiesQuery.isError
                          ? "Cities unavailable"
                          : "City"
                    }
                    searchPlaceholder="Search cities..."
                    emptyMessage="No city found."
                    clearLabel="None"
                    loading={Boolean(selectedDraftState) && citiesQuery.isPending}
                    disabled={
                      !selectedDraftState ||
                      citiesQuery.isError ||
                      (!citiesQuery.isPending && cities.length === 0)
                    }
                    onChange={(nextCity) => updateFilter("city", nextCity)}
                  />

                  <button
                    type="submit"
                    disabled={businessQuery.isFetching}
                    className="h-11 w-full rounded-[6px] bg-[#292D73] text-[12px] font-extrabold text-white transition hover:bg-[#20255F] disabled:cursor-wait disabled:opacity-60"
                  >
                    {businessQuery.isFetching ? "Applying..." : "Apply Filters"}
                  </button>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="h-11 w-full rounded-[6px] bg-[#EEEEEE] text-[11px] font-extrabold text-[#292D73] transition hover:bg-[#E5E7EB]"
                  >
                    Reset
                  </button>
                </form>
              </aside>

              <div>
                <div className="mb-4 flex min-h-10 flex-wrap items-center justify-between gap-3">
                  <p
                    className="text-[12px] font-semibold text-[#515E6E] sm:text-[13px]"
                    aria-live="polite"
                  >
                    {businessQuery.isPending
                      ? "Finding businesses..."
                      : `${total} business${total === 1 ? "" : "es"} found`}
                  </p>

                  <div
                    className="inline-flex items-center rounded-[7px] border border-[#D8DEE8] bg-[#F5F7FA] p-1"
                    role="group"
                    aria-label="Choose results view"
                  >
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      aria-pressed={viewMode === "list"}
                      title="List view"
                      className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-[5px] px-2.5 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73]/40 sm:px-3 ${
                        viewMode === "list"
                          ? "bg-[#292D73] text-white shadow-sm"
                          : "text-[#667085] hover:bg-white hover:text-[#292D73]"
                      }`}
                    >
                      <List className="h-4 w-4" aria-hidden="true" />
                      <span className="hidden sm:inline">List</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
                      aria-pressed={viewMode === "grid"}
                      title="Grid view"
                      className={`inline-flex h-8 items-center justify-center gap-1.5 rounded-[5px] px-2.5 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292D73]/40 sm:px-3 ${
                        viewMode === "grid"
                          ? "bg-[#292D73] text-white shadow-sm"
                          : "text-[#667085] hover:bg-white hover:text-[#292D73]"
                      }`}
                    >
                      <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                      <span className="hidden sm:inline">Grid</span>
                    </button>
                  </div>
                </div>

                {businessQuery.isPending ? (
                  <BusinessCardsSkeleton />
                ) : businessQuery.isError ? (
                  <div
                    role="alert"
                    className="flex flex-col items-center rounded-[8px] border border-red-200 bg-red-50 px-6 py-12 text-center"
                  >
                    <AlertCircle className="h-9 w-9 text-red-500" />
                    <h2 className="mt-3 font-bold text-red-900">
                      Unable to load businesses
                    </h2>
                    <p className="mt-1 text-sm text-red-700">
                      {businessQuery.error instanceof Error
                        ? businessQuery.error.message
                        : "Please try again."}
                    </p>
                    <button
                      type="button"
                      onClick={() => businessQuery.refetch()}
                      className="mt-4 rounded-[5px] bg-[#292D73] px-5 py-2.5 text-xs font-bold text-white"
                    >
                      Try again
                    </button>
                  </div>
                ) : businesses.length === 0 ? (
                  <div className="rounded-xl border border-[#E3E8EF] bg-white shadow-[0_6px_18px_rgba(30,45,75,0.08)]">
                    <NoBusinessResults />
                  </div>
                ) : (
                  <div
                    className={`grid grid-cols-1 gap-4 ${
                      viewMode === "grid" ? "xl:grid-cols-2" : ""
                    }`}
                  >
                    {businesses?.map((business) => {
                      const profileHref = business.service?.id
                        ? `/services/businesses/${business.businessOwnerId}?serviceId=${encodeURIComponent(business.service.id)}`
                        : `/services/businesses/${business.businessOwnerId}`;
                      const serviceTitle =
                        business.service?.title ||
                        business.category ||
                        "Local service";
                      const serviceLogoUrl = business.service?.logo?.url;
                      const rating =
                        typeof business.rating === "number"
                          ? business.rating
                          : 0;
                      const totalReviews = business.totalReviews ?? 0;
                      const serviceDescription =
                        business.service?.description ||
                        business.bio ||
                        "Contact this business to learn more about its services.";

                      if (viewMode === "list") {
                        return (
                          <article
                            key={business.businessOwnerId}
                            className="group relative overflow-hidden rounded-xl border border-[#E3E8EF] bg-white shadow-[0_4px_16px_rgba(30,45,75,0.07)] transition duration-300 hover:-translate-y-0.5 hover:border-[#B9C9DC] hover:shadow-[0_12px_30px_rgba(30,45,75,0.13)]"
                          >
                            <div className="absolute inset-y-0 left-0 w-1 bg-[linear-gradient(180deg,#292D73,#0082D7)]" />

                            <div className="flex flex-col gap-4 p-4 pl-5 sm:pl-6 lg:flex-row lg:items-center lg:gap-5">
                              <div className="flex min-w-0 flex-1 items-center gap-3.5 sm:gap-4">
                                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white bg-[linear-gradient(145deg,#F7F9FF_0%,#E9F2F4_100%)] shadow-[0_7px_18px_rgba(41,46,120,0.13)] ring-1 ring-[#DDE5F0] transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_10px_24px_rgba(41,46,120,0.18)] sm:h-[72px] sm:w-[72px]">
                                  {serviceLogoUrl ? (
                                    <Image
                                      src={serviceLogoUrl}
                                      alt={`${serviceTitle} logo`}
                                      fill
                                      sizes="(min-width: 640px) 72px, 56px"
                                      className="object-contain p-2 transition duration-500 ease-out group-hover:scale-105 sm:p-2.5"
                                    />
                                  ) : (
                                    <BriefcaseBusiness className="absolute inset-0 m-auto h-6 w-6 text-[#98A2B3]" />
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <h3 className="truncate text-base font-extrabold leading-tight text-[#292D73] sm:text-[17px]">
                                    {business.businessName}
                                  </h3>
                                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                                    <span className="inline-flex rounded-full bg-[#E6F3F2] px-2.5 py-1 text-[10px] font-semibold leading-none text-[#426078]">
                                      {business.category || serviceTitle}
                                    </span>
                                    <div
                                      className="flex items-center gap-1"
                                      aria-label={`${rating} out of 5 stars`}
                                    >
                                      <Star className="h-3.5 w-3.5 fill-[#FFB800] text-[#FFB800]" />
                                      <span className="text-[11px] font-bold text-[#292E78]">
                                        {rating.toFixed(1)}
                                      </span>
                                      <span className="text-[10px] text-[#667085]">
                                        ({totalReviews})
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 border-t border-[#EDF0F4] pt-4 sm:flex sm:items-center lg:shrink-0 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                                <Link
                                  href={profileHref}
                                  className="inline-flex h-9 items-center justify-center rounded-md bg-[#292E78] px-3.5 text-[11px] font-bold text-white transition hover:bg-[#1F2464]"
                                >
                                  View Profile
                                </Link>
                                <Link
                                  href={`/services/businesses/${business.businessOwnerId}?tab=reviews`}
                                  className="inline-flex h-9 items-center justify-center rounded-md border border-[#F2C66D] bg-[#FFF8E8] px-3.5 text-[11px] font-semibold text-[#C96800] transition hover:border-[#F8AA18] hover:bg-[#FFF2CC]"
                                >
                                  Review
                                </Link>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedBusiness({
                                      id: business.businessOwnerId,
                                      name: business.businessName,
                                    })
                                  }
                                  className="inline-flex h-9 items-center justify-center rounded-md bg-[#A7A7A7] px-3.5 text-[11px] font-bold text-white transition hover:bg-[#8E8E8E]"
                                >
                                  Report
                                </button>
                                <Link
                                  href={business?.businessEmail ? `mailto:${business?.businessEmail}` : "#"}
                                  className={`inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-[#292E78] bg-white text-[#292E78] transition hover:bg-[#292E78] hover:text-white ${!business.businessEmail ? "pointer-events-none opacity-50" : ""}`}
                                  aria-label={business.businessEmail ? `Email ${business.businessName}` : `Email unavailable for ${business.businessName}`}
                                  aria-disabled={!business.businessEmail}
                                >
                                  <MessageCircle className="h-4 w-4" />
                                </Link>
                              </div>
                            </div>
                          </article>
                        );
                      }

                      return (
                        <article
                          key={business.businessOwnerId}
                          className="group rounded-[8px] bg-white p-4 shadow-[0_6px_18px_rgba(30,45,75,0.14)] ring-1 ring-[#E8ECF2] transition duration-200 hover:-translate-y-1"
                        >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white bg-[linear-gradient(145deg,#F7F9FF_0%,#E9F2F4_100%)] shadow-[0_6px_16px_rgba(41,46,120,0.12)] ring-1 ring-[#DDE5F0] transition duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_9px_22px_rgba(41,46,120,0.17)]">
                              {serviceLogoUrl ? (
                                <Image
                                  src={serviceLogoUrl}
                                  alt={`${serviceTitle} logo`}
                                  fill
                                  sizes="48px"
                                  className="object-contain p-1.5 transition duration-500 ease-out group-hover:scale-105"
                                />
                              ) : (
                                <BriefcaseBusiness className="absolute inset-0 m-auto h-5 w-5 text-[#98A2B3]" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="line-clamp-1 text-[15px] font-extrabold leading-tight text-[#292D73]">
                                {business.businessName}
                              </h3>
                              <span className="mt-1 inline-flex rounded-[3px] bg-[#DFEEEE] px-2 py-0.5 text-[11px] font-semibold leading-none text-[#426078]">
                                {business.category || serviceTitle}
                              </span>
                            </div>
                          </div>
                          <Link
                            href={`/services/businesses/${business.businessOwnerId}?tab=reviews`}
                            className="inline-flex h-9 shrink-0 items-center justify-center rounded-[5px] border border-[#F8AA18] bg-[#FFF6D8] px-4 text-xs font-medium text-[#E56D00] transition hover:bg-[#F8AA18] hover:text-white"
                          >
                            Review
                          </Link>
                        </div>

                        <div>
                          <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            <div
                              className="flex gap-px"
                              aria-label={`${rating} out of 5 stars`}
                            >
                              {Array.from({ length: 5 }).map((_, index) => (
                                <Star
                                  key={index}
                                  className={`h-[12px] w-[12px] ${
                                    index < Math.round(rating)
                                      ? "fill-[#FFB800] text-[#FFB800]"
                                      : "text-[#D9DEE7]"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-bold text-[#292E78]">
                              {rating.toFixed(1)}
                            </span>
                            <span className="text-xs text-[#667085]">
                              ({totalReviews} reviews)
                            </span>
                          </div>

                          <div className="mt-3 flex items-start gap-1 text-xs text-[#667085]">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span>
                              {[business.city, business.state]
                                .filter(Boolean)
                                .join(", ") || business.address || business.serviceArea}
                            </span>
                          </div>
                          <p className="mt-1.5 line-clamp-2 min-h-[32px] text-xs leading-[1.4] text-[#667085]">
                            {serviceDescription}
                          </p>
                        </div>

                        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_34px] gap-1.5">
                          <Link
                            href={profileHref}
                            className="inline-flex h-8 items-center justify-center rounded-[4px] bg-[#292E78] px-3 text-xs font-bold text-white transition hover:bg-[#1F2464]"
                          >
                            View Profile
                          </Link>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedBusiness({
                                id: business.businessOwnerId,
                                name: business.businessName,
                              })
                            }
                            className="inline-flex h-8 items-center justify-center rounded-[4px] bg-[#A7A7A7] px-3 text-xs font-bold text-white transition hover:bg-[#8E8E8E]"
                          >
                            Report
                          </button>
                          <Link
                            href={business.businessEmail ? `mailto:${business.businessEmail}` : "#"}
                            className={`inline-flex h-8 items-center justify-center rounded-[4px] border border-[#292E78] bg-white text-[#292E78] transition hover:bg-[#292E78] hover:text-white ${!business.businessEmail ? "pointer-events-none opacity-50" : ""}`}
                            aria-label={business.businessEmail ? `Email ${business.businessName}` : `Email unavailable for ${business.businessName}`}
                            aria-disabled={!business.businessEmail}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Link>
                        </div>
                        </article>
                      );
                    })}
                  </div>
                )}

                {!businessQuery.isPending && totalPages > 1 && (
                  <nav
                    className="mt-12 flex items-center justify-center gap-2"
                    aria-label="Business results pagination"
                  >
                    <button
                      type="button"
                      onClick={() => setPage((current) => current - 1)}
                      disabled={page === 1}
                      className="flex h-8 w-8 items-center justify-center rounded border border-[#B8C0CC] text-[#667085] disabled:opacity-40"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    {Array.from({ length: totalPages }).map((_, index) => {
                      const pageNumber = index + 1;
                      return (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() => setPage(pageNumber)}
                          className={`flex h-8 w-8 items-center justify-center rounded border text-xs font-bold ${
                            page === pageNumber
                              ? "border-[#292D73] bg-[#292D73] text-white"
                              : "border-[#B8C0CC] text-[#475467]"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setPage((current) => current + 1)}
                      disabled={page === totalPages}
                      className="flex h-8 w-8 items-center justify-center rounded border border-[#B8C0CC] text-[#667085] disabled:opacity-40"
                      aria-label="Next page"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </nav>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <ReportBusinessModal
        ownerId={selectedBusiness?.id ?? ""}
        businessName={selectedBusiness?.name ?? ""}
        open={Boolean(selectedBusiness)}
        onOpenChange={(open) => {
          if (!open) setSelectedBusiness(null);
        }}
      />
    </div>
  );
};

export default ServicesSearchContainer;
