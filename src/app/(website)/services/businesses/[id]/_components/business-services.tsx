"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useBusinessServices } from "@/hooks/use-business-profile-sections";
import { AlertCircle, Layers3 } from "lucide-react";
import Image from "next/image";

const BusinessServices = ({ businessId }: { businessId: string }) => {
  const { data, isPending, isError, error, refetch, isFetching } =
    useBusinessServices(businessId);
  const services = data?.data ?? [];

  return (
    <article className="rounded-[8px] border border-[#E1E7EC] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(17,24,39,0.03)]">
      <h2 className="text-[20px] font-extrabold leading-tight text-[#111827]">
        Services Offered
      </h2>

      {isPending ? (
        <div
          className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
          aria-label="Loading services offered"
        >
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-[43px] w-full" />
          ))}
        </div>
      ) : isError ? (
        <div
          role="alert"
          className="mt-4 flex flex-col items-center rounded-[6px] border border-red-200 bg-red-50 px-4 py-7 text-center"
        >
          <AlertCircle className="h-7 w-7 text-red-500" />
          <p className="mt-2 text-sm font-semibold text-red-900">
            Unable to load services
          </p>
          <p className="mt-1 text-xs text-red-700">
            {error instanceof Error ? error.message : "Please try again."}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="mt-3 rounded-[5px] bg-[#292E78] px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
          >
            {isFetching ? "Trying again..." : "Try again"}
          </button>
        </div>
      ) : services.length === 0 ? (
        <div className="mt-4 flex flex-col items-center rounded-[6px] bg-[#F4F7F9] px-4 py-7 text-center">
          <Layers3 className="h-7 w-7 text-[#667085]" />
          <p className="mt-2 text-sm font-semibold text-[#292E78]">
            No services available
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {services.map((service) => (
            <div
              key={service._id}
              className="flex min-h-[43px] items-center gap-3 rounded-[6px] bg-[#EAF2F7] px-4 text-[13px] font-semibold text-[#111827]"
            >
              {service.logo?.url && (
                <Image src={service.logo.url} alt="" width={24} height={24} className="h-6 w-6 object-contain" />
              )}
              {service.title}
            </div>
          ))}
        </div>
      )}
    </article>
  );
};

export default BusinessServices;
