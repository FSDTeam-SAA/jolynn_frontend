"use client";

import { Skeleton } from "@/components/ui/skeleton";
import {
  type BusinessOwnerFilters,
  useBusinessOwners,
} from "@/hooks/use-business-owners";
import { useServices } from "@/hooks/use-services";
import {
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MapPin,
  MessageCircle,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import BusinessSearchForm from "./business-search-form";
import NoBusinessResults from "./no-business-results";

type ServicesSearchContainerProps = {
  initialService?: string;
  initialLocation?: string;
};

type DraftFilters = {
  serviceId: string;
  minimumRating: string;
  location: string;
  searchTerm: string;
};

const uniqueValues = (values: string[]) =>
  Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );

const BusinessCardsSkeleton = () => (
  <div
    className="grid grid-cols-1 gap-4 xl:grid-cols-2"
    aria-label="Loading businesses"
  >
    {Array.from({ length: 6 }).map((_, index) => (
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
  initialService = "",
  initialLocation = "",
}: ServicesSearchContainerProps) => {
  const servicesQuery = useServices();
  const services = servicesQuery.data?.data ?? [];

  const initialServiceId =
    services.find(
      (service) =>
        service._id === initialService ||
        service.title.toLowerCase() === initialService.toLowerCase(),
    )?._id || (!initialService ? services[0]?._id || "" : "");

  const [draftFilters, setDraftFilters] = useState<DraftFilters>({
    serviceId: "",
    minimumRating: "",
    location: initialLocation,
    searchTerm: "",
  });
  const [appliedFilters, setAppliedFilters] = useState<DraftFilters>({
    serviceId: "",
    minimumRating: "",
    location: initialLocation,
    searchTerm: "",
  });
  const [page, setPage] = useState(1);

  const selectedServiceId = appliedFilters.serviceId || initialServiceId;
  const queryFilters: BusinessOwnerFilters = {
    serviceId: selectedServiceId,
    page,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
    minimumRating: appliedFilters.minimumRating,
    location: appliedFilters.location,
    searchTerm: appliedFilters.searchTerm,
  };
  const businessQuery = useBusinessOwners(queryFilters);
  const businesses = useMemo(
    () => businessQuery.data?.data ?? [],
    [businessQuery.data?.data],
  );
  const total = businessQuery.data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 10));

  const locations = useMemo(
    () =>
      uniqueValues(
        businesses.map((business) =>
          [business.city, business.state].filter(Boolean).join(", "),
        ),
      ),
    [businesses],
  );
  const keywords = useMemo(
    () => uniqueValues(businesses.map((business) => business.businessName)),
    [businesses],
  );

  const updateFilter = (name: keyof DraftFilters, value: string) => {
    setDraftFilters((current) => ({ ...current, [name]: value }));
  };

  const applyFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAppliedFilters({
      ...draftFilters,
      serviceId: draftFilters.serviceId || selectedServiceId,
    });
    setPage(1);
  };

  const resetFilters = () => {
    const reset: DraftFilters = {
      serviceId: initialServiceId,
      minimumRating: "",
      location: "",
      searchTerm: "",
    };
    setDraftFilters(reset);
    setAppliedFilters(reset);
    setPage(1);
  };

  const serviceWasNotFound =
    servicesQuery.isSuccess && Boolean(initialService) && !selectedServiceId;
  const businessesWereNotFound =
    businessQuery.isSuccess && businesses.length === 0;

  if (serviceWasNotFound || businessesWereNotFound) {
    return (
      <main className="mt-20 min-h-[420px] bg-white md:mt-24">
        <NoBusinessResults />
      </main>
    );
  }

  return (
    <div className="mt-10 md:mt-14 lg:mt-16">
      <main className="min-h-screen bg-white">
        <section className="bg-[#DFF0EE] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="container">
            <BusinessSearchForm
              initialService={initialService}
              initialLocation={initialLocation}
            />
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 md:py-12 lg:px-8 lg:py-14">
          <div className="container">
            <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
              <aside className="h-fit rounded-[8px] bg-white p-5 shadow-[0_8px_24px_rgba(30,45,75,0.13)] ring-1 ring-[#E8ECF2]">
                <h2 className="text-[16px] font-semibold text-[#111827]">
                  Filter Results
                </h2>

                <form onSubmit={applyFilters} className="mt-5 space-y-3">
                  {servicesQuery.isPending ? (
                    <Skeleton className="h-10 w-full" />
                  ) : servicesQuery.isError ? (
                    <button
                      type="button"
                      onClick={() => servicesQuery.refetch()}
                      className="h-10 w-full rounded-[5px] border border-red-200 bg-red-50 px-3 text-left text-[11px] font-semibold text-red-700"
                    >
                      Services unavailable — retry
                    </button>
                  ) : (
                    <label className="relative block">
                      <span className="sr-only">Service</span>
                      <select
                        value={draftFilters.serviceId || initialServiceId}
                        onChange={(event) =>
                          updateFilter("serviceId", event.target.value)
                        }
                        className="h-11 w-full appearance-none rounded-[6px] border border-[#A7A7A7] bg-white px-3 pr-9 text-[12px] font-medium text-[#8A8F99] focus:outline-none focus:ring-2 focus:ring-[#292D73]/20"
                      >
                        {services.map((service) => (
                          <option key={service._id} value={service._id}>
                            {service.title}
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
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A8F99]" />
                  </label>

                  <label className="relative block">
                    <span className="sr-only">Location</span>
                    <select
                      value={draftFilters.location}
                      onChange={(event) =>
                        updateFilter("location", event.target.value)
                      }
                    className="h-11 w-full appearance-none rounded-[6px] border border-[#A7A7A7] bg-white px-3 pr-9 text-[12px] font-medium text-[#8A8F99] focus:outline-none focus:ring-2 focus:ring-[#292D73]/20"
                    >
                      <option value="">Location</option>
                      {locations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A8F99]" />
                  </label>

                  <label className="relative block">
                    <span className="sr-only">Keywords</span>
                    <select
                      value={draftFilters.searchTerm}
                      onChange={(event) =>
                        updateFilter("searchTerm", event.target.value)
                      }
                      className="h-11 w-full appearance-none rounded-[6px] border border-[#A7A7A7] bg-white px-3 pr-9 text-[12px] font-medium text-[#8A8F99] focus:outline-none focus:ring-2 focus:ring-[#292D73]/20"
                    >
                      <option value="">Keywords</option>
                      {keywords.map((keyword) => (
                        <option key={keyword} value={keyword}>
                          {keyword}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A8F99]" />
                  </label>

                  <button
                    type="submit"
                    disabled={!initialServiceId || servicesQuery.isPending}
                    className="h-11 w-full rounded-[6px] bg-[#292D73] text-[12px] font-extrabold text-white transition hover:bg-[#20255F] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Apply Filters
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
                {!servicesQuery.isPending && !servicesQuery.isError && (
                  <p className="mb-4 text-[12px] font-semibold text-[#515E6E]">
                    {total} business{total === 1 ? "" : "es"} found
                  </p>
                )}

                {servicesQuery.isPending || businessQuery.isPending ? (
                  <BusinessCardsSkeleton />
                ) : servicesQuery.isError ? (
                  <div
                    role="alert"
                    className="flex flex-col items-center rounded-[8px] border border-red-200 bg-red-50 px-6 py-12 text-center"
                  >
                    <AlertCircle className="h-9 w-9 text-red-500" />
                    <h2 className="mt-3 font-bold text-red-900">
                      Unable to load services
                    </h2>
                    <button
                      type="button"
                      onClick={() => servicesQuery.refetch()}
                      className="mt-4 rounded-[5px] bg-[#292D73] px-5 py-2.5 text-xs font-bold text-white"
                    >
                      Try again
                    </button>
                  </div>
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
                ) : (
                  <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {businesses.map((business) => (
                      <article
                        key={business.businessOwnerId}
                        className="rounded-[8px] bg-white p-4 shadow-[0_6px_18px_rgba(30,45,75,0.14)] ring-1 ring-[#E8ECF2] transition duration-200 hover:-translate-y-1"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#4D1979]">
                              <Image
                                src={business.service.logo.url}
                                alt={`${business.service.title} logo`}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <h3 className="line-clamp-1 text-[15px] font-extrabold leading-tight text-[#292D73]">
                                {business.businessName}
                              </h3>
                              <span className="mt-1 inline-flex rounded-[3px] bg-[#DFEEEE] px-2 py-0.5 text-[9px] font-semibold leading-none text-[#426078]">
                                {business.category || business.service.title}
                              </span>
                            </div>
                          </div>
                          <Link
                            href={`/services/businesses/${business.businessOwnerId}`}
                            className="inline-flex h-9 shrink-0 items-center justify-center rounded-[5px] border border-[#F8AA18] bg-[#FFF6D8] px-4 text-[10px] font-medium text-[#E56D00] transition hover:bg-[#F8AA18] hover:text-white"
                          >
                            Review
                          </Link>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                          <div
                            className="flex gap-px"
                            aria-label={`${business.rating} out of 5 stars`}
                          >
                            {Array.from({ length: 5 }).map((_, index) => (
                              <Star
                                key={index}
                                className={`h-[12px] w-[12px] ${
                                  index < Math.round(business.rating)
                                    ? "fill-[#FFB800] text-[#FFB800]"
                                    : "text-[#D9DEE7]"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-[#292E78]">
                            {business.rating.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-[#667085]">
                            ({business.totalReviews} reviews)
                          </span>
                        </div>

                        <div className="mt-3 flex items-start gap-1 text-[10px] text-[#667085]">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            {[business.city, business.state]
                              .filter(Boolean)
                              .join(", ") || business.address || business.serviceArea}
                          </span>
                        </div>
                        <p className="mt-1.5 line-clamp-2 min-h-[32px] text-[9.5px] leading-[1.4] text-[#667085]">
                          {business.service.description}
                        </p>

                        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_34px] gap-1.5">
                          <Link
                            href={`/services/businesses/${business.businessOwnerId}`}
                            className="inline-flex h-8 items-center justify-center rounded-[4px] bg-[#292E78] px-3 text-[9px] font-bold text-white transition hover:bg-[#1F2464]"
                          >
                            View Profile
                          </Link>
                          <Link
                            href={`/report?serviceId=${encodeURIComponent(business.service.id)}`}
                            className="inline-flex h-8 items-center justify-center rounded-[4px] bg-[#A7A7A7] px-3 text-[9px] font-bold text-white transition hover:bg-[#8E8E8E]"
                          >
                            Report
                          </Link>
                          <Link
                            href={business.businessWebsiteUrl || "#"}
                            target={business.businessWebsiteUrl ? "_blank" : undefined}
                            rel={business.businessWebsiteUrl ? "noreferrer" : undefined}
                            className="inline-flex h-8 items-center justify-center rounded-[4px] border border-[#292E78] bg-white text-[#292E78] transition hover:bg-[#292E78] hover:text-white"
                            aria-label={`Visit ${business.businessName} website`}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Link>
                        </div>
                      </article>
                    ))}
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
    </div>
  );
};

export default ServicesSearchContainer;
