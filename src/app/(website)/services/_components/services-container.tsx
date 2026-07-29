"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useServiceCategories } from "@/hooks/use-service-categories";
import {
  AlertCircle,
  ArrowUpRight,
  BriefcaseBusiness,
  Layers3,
  LayoutGrid,
  List,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import BusinessSearchForm from "../businesses/_components/business-search-form";

const ServicesContainer = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { data, isPending, isError, error, refetch, isFetching } =
    useServiceCategories();
  const services = data?.data ?? [];

  return (
    <section className="min-h-screen bg-[#DFF0EE] px-4 py-8 sm:px-6 md:py-10 lg:px-8 lg:py-10">
      <div className="container">
        <div className="text-center">
          <h1 className="text-[28px] font-extrabold leading-tight text-[#292E78] sm:text-[32px] md:text-[36px]">
            Select a Service
          </h1>
          <p className="mt-3 text-xs lg:text-sm  font-medium text-[#515E6E] sm:text-[13px]">
            Choose a service to get started
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 xl:flex-row xl:items-center">
          <div className="min-w-0 flex-1">
            <BusinessSearchForm compact />
          </div>
          <div
            className="inline-flex h-[51px] shrink-0 self-end items-center rounded-xl border border-[#C7D8D6] bg-white/70 p-1 shadow-sm xl:self-auto"
            role="group"
            aria-label="Choose services view"
          >
            <button
              type="button"
              onClick={() => setViewMode("list")}
              aria-pressed={viewMode === "list"}
              title="List view"
              className={`inline-flex h-full items-center justify-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292E78]/40 sm:px-3 ${
                viewMode === "list"
                  ? "bg-[#292E78] text-white shadow-sm"
                  : "text-[#667085] hover:bg-white hover:text-[#292E78]"
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
              className={`inline-flex h-full items-center justify-center gap-1.5 rounded-lg px-2.5 text-[11px] font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292E78]/40 sm:px-3 ${
                viewMode === "grid"
                  ? "bg-[#292E78] text-white shadow-sm"
                  : "text-[#667085] hover:bg-white hover:text-[#292E78]"
              }`}
            >
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>
        </div>

        {isPending ? (
          <div
            className={`mt-5 grid grid-cols-1 gap-5 ${
              viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-4 lg:gap-6" : ""
            }`}
          >
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className={`flex rounded-[7px] bg-white p-4 ${
                  viewMode === "grid"
                    ? "min-h-[174px] flex-col items-center"
                    : "min-h-[116px] items-center gap-5"
                }`}
              >
                <Skeleton className="h-9 w-9" />
                <div className={viewMode === "grid" ? "w-full" : "flex-1"}>
                  <Skeleton className="mt-3 h-4 w-24" />
                  <Skeleton className="mt-3 h-8 w-4/5" />
                  <Skeleton className="mt-4 h-[34px] w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div
            role="alert"
            className="mt-8 flex flex-col items-center rounded-lg border border-red-200 bg-red-50 px-5 py-10 text-center"
          >
            <AlertCircle className="h-9 w-9 text-red-500" />
            <h2 className="mt-3 font-bold text-red-900">
              Unable to load services
            </h2>
            <p className="mt-1 text-sm text-red-700">
              {error instanceof Error ? error.message : "Please try again."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="mt-4 rounded-[5px] bg-[#292E78] px-5 py-2.5 text-xs font-bold text-white disabled:opacity-60"
            >
              {isFetching ? "Trying again..." : "Try again"}
            </button>
          </div>
        ) : services.length === 0 ? (
          <div className="mt-8 flex flex-col items-center rounded-lg border border-[#D5E3E1] bg-white/70 px-5 py-10 text-center">
            <Layers3 className="h-9 w-9 text-[#667085]" />
            <h2 className="mt-3 font-bold text-[#292E78]">
              No services available
            </h2>
            <p className="mt-1 text-sm text-[#667085]">
              Please check back later for new service categories.
            </p>
          </div>
        ) : (
          <div
            className={`mt-5 grid grid-cols-1 gap-5 ${
              viewMode === "grid"
                ? "sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-[21px]"
                : ""
            }`}
          >
            {services.map((service) => (
              <article
                key={service._id}
                className={`group relative isolate flex overflow-hidden rounded-[14px] border border-white/90 bg-white px-4 py-5 shadow-[0_5px_18px_rgba(32,42,70,0.06)] transition-[transform,box-shadow,border-color] duration-500 ease-out hover:-translate-y-1.5 hover:border-[#4365D0]/20 hover:shadow-[0_20px_45px_rgba(32,42,70,0.14)] focus-within:-translate-y-1 focus-within:border-[#4365D0]/30 focus-within:shadow-[0_18px_40px_rgba(32,42,70,0.12)] sm:px-5 ${
                  viewMode === "grid"
                    ? "min-h-[224px] flex-col items-center text-center"
                    : "min-h-[128px] flex-col gap-4 text-left sm:flex-row sm:items-center"
                }`}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-24 bg-gradient-to-b from-[#EEF3FF] to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="pointer-events-none absolute -right-10 -top-12 -z-10 h-28 w-28 rounded-full bg-[#4365D0]/[0.06] blur-2xl transition-transform duration-700 group-hover:scale-150" />

                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-[#4365D0]/10 bg-[#F2F5FF] p-2.5 shadow-[0_6px_16px_rgba(67,101,208,0.10)] transition duration-500 ease-out group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:border-[#4365D0]/20 group-hover:bg-[#E9EEFF]">
                  {service.logo?.url ? (
                    <Image
                      src={service.logo.url}
                      alt={`${service.name} service`}
                      width={56}
                      height={56}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Layers3
                      className="h-7 w-7 text-[#4365D0]"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className={viewMode === "list" ? "min-w-0 flex-1" : ""}>
                  <h2
                    className={`text-[15px] font-extrabold leading-tight text-[#292E78] transition-colors duration-300 group-hover:text-[#4365D0] lg:text-base ${
                      viewMode === "grid" ? "mt-4" : ""
                    }`}
                  >
                    {service.name}
                  </h2>
                  <p
                    className={`mt-2 line-clamp-3 text-[11px] font-medium leading-[1.45] text-[#667085] md:text-xs ${
                      viewMode === "grid" ? "min-h-[45px]" : ""
                    }`}
                  >
                    {service.description ??
                      "Explore available local services."}
                  </p>
                </div>
                <Link
                  href={`/services/businesses?service=${encodeURIComponent(service.name)}`}
                  className={`flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-[#292E78]/10 bg-[#F6F7FA] px-5 text-[11px] font-bold text-[#292E78] transition duration-300 hover:border-[#292E78] hover:bg-[#292E78] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292E78] focus-visible:ring-offset-2 ${
                    viewMode === "grid" ? "mt-4 w-full" : "w-full sm:w-auto"
                  }`}
                >
                  Get Started
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </article>
            ))}

            <article
              className={`group relative isolate order-first flex overflow-hidden rounded-[14px] border border-dashed border-[#4365D0]/40 bg-[#F5F7FF] px-4 py-5 shadow-[0_5px_18px_rgba(32,42,70,0.06)] transition duration-300 hover:-translate-y-1 hover:border-[#4365D0] hover:shadow-[0_16px_35px_rgba(32,42,70,0.12)] sm:px-5 ${
                viewMode === "grid"
                  ? "min-h-[224px] flex-col items-center text-center"
                  : "min-h-[128px] flex-col gap-4 text-left sm:flex-row sm:items-center"
              }`}
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#292E78] text-white shadow-[0_7px_18px_rgba(41,46,120,0.22)]">
                <BriefcaseBusiness className="h-7 w-7" aria-hidden="true" />
              </div>
              <div className={viewMode === "list" ? "min-w-0 flex-1" : ""}>
                <h2
                  className={`text-[15px] font-extrabold leading-tight text-[#292E78] lg:text-base ${
                    viewMode === "grid" ? "mt-4" : ""
                  }`}
                >
                  Add Your Business
                </h2>
                <p
                  className={`mt-2 text-[11px] font-medium leading-[1.45] text-[#667085] md:text-xs ${
                    viewMode === "grid" ? "min-h-[45px]" : ""
                  }`}
                >
                  Join SideQuote and connect with customers looking for your
                  services.
                </p>
              </div>
              <Link
                href="/add-your-business"
                className={`flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-[#292E78] px-5 text-[11px] font-bold text-white transition hover:bg-[#1F2464] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292E78] focus-visible:ring-offset-2 ${
                  viewMode === "grid" ? "mt-4 w-full" : "w-full sm:w-auto"
                }`}
              >
                Add Your Business
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </article>
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesContainer;
