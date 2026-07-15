"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useServices } from "@/hooks/use-services";
import { AlertCircle, Layers3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const ServicesContainer = () => {
  const { data, isPending, isError, error, refetch, isFetching } =
    useServices();
  const services = data?.data ?? [];

  return (
    <section className="min-h-screen bg-[#DFF0EE] px-4 py-12 sm:px-6 md:py-16 lg:px-8 lg:py-[86px]">
      <div className="container">
        <div className="text-center">
          <h1 className="text-[28px] font-extrabold leading-tight text-[#292E78] sm:text-[32px] md:text-[36px]">
            Select a Service
          </h1>
          <p className="mt-3 text-[12px] font-medium text-[#515E6E] sm:text-[13px]">
            Choose a service to get started
          </p>
        </div>

        {isPending ? (
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="flex min-h-[174px] flex-col items-center rounded-[7px] bg-white p-4"
              >
                <Skeleton className="h-9 w-9" />
                <Skeleton className="mt-3 h-4 w-24" />
                <Skeleton className="mt-3 h-8 w-4/5" />
                <Skeleton className="mt-auto h-[34px] w-full" />
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
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-[21px] xl:mt-[34px]">
            {services.map((service) => (
              <article
                key={service._id}
                className="group flex min-h-[174px] flex-col items-center rounded-[7px] bg-white px-4 pb-3.5 pt-4 text-center shadow-[0_1px_2px_rgba(32,42,70,0.04)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(32,42,70,0.12)]"
              >
                <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-[5px] bg-[#E8EEFF] p-1.5 transition group-hover:scale-105">
                  <Image
                    src={service.logo.url}
                    alt=""
                    width={36}
                    height={36}
                    className="h-full w-full object-contain"
                  />
                </div>
                <h2 className="mt-3 text-[16px] font-extrabold leading-none text-[#292E78]">
                  {service.title}
                </h2>
                <p className="mt-2 min-h-[34px] max-w-[210px] text-[10.5px] font-medium leading-[1.15] text-[#6F7D90]">
                  {service.description}
                </p>
                <Link
                  href={`/services/businesses?service=${encodeURIComponent(service.title)}`}
                  className="mt-auto flex h-[34px] w-full items-center justify-center rounded-[5px] bg-[#F1F1F1] text-[10.5px] font-semibold text-[#171B2F] transition hover:bg-[#292E78] hover:text-white"
                >
                  Get Started
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ServicesContainer;
