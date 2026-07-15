"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useServices } from "@/hooks/use-services";
import { MapPin, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type BusinessSearchFormProps = {
  initialService?: string;
  initialLocation?: string;
};

const BusinessSearchForm = ({
  initialService = "",
  initialLocation = "",
}: BusinessSearchFormProps) => {
  const router = useRouter();
  const [service, setService] = useState(initialService);
  const [location, setLocation] = useState(initialLocation);
  const { data, isPending, isError, refetch, isFetching } = useServices();
  const services = data?.data ?? [];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams();
    if (service.trim()) params.set("service", service.trim());
    if (location.trim()) params.set("location", location.trim());

    router.push(
      `/services/businesses${params.toString() ? `?${params}` : ""}`,
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-[1160px] flex-col overflow-hidden rounded-[10px] bg-white px-2 py-2 shadow-[0_8px_22px_rgba(32,42,70,0.12)] ring-1 ring-[#E6E8F0] sm:flex-row"
    >
      <label className="relative flex min-w-0 flex-1 items-center gap-2 border-b border-[#ECEEF5] px-4 py-3 sm:border-b-0 sm:border-r">
        <Search className="h-5 w-5 shrink-0 text-[#7E7E7E]" />
        {isPending ? (
          <Skeleton className="h-5 w-3/4" />
        ) : isError ? (
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-left text-[12px] font-semibold text-red-600 hover:underline disabled:opacity-60"
          >
            {isFetching ? "Loading services..." : "Services unavailable — retry"}
          </button>
        ) : (
          <select
            value={service}
            onChange={(event) => setService(event.target.value)}
            className="w-full appearance-none bg-transparent text-[13px] font-medium text-[#292E78] outline-none"
            aria-label="Select a service"
          >
            <option value="">What services do you need?</option>
            {services.map((item) => (
              <option key={item._id} value={item.title}>
                {item.title}
              </option>
            ))}
          </select>
        )}
      </label>

      <label className="flex min-w-0 flex-1 items-center gap-2 border-b border-[#ECEEF5] px-4 py-3 sm:border-b-0 sm:border-r">
        <MapPin className="h-5 w-5 shrink-0 text-[#7E7E7E]" />
        <input
          type="text"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="City or Zip code"
          className="w-full bg-transparent text-[13px] font-medium text-[#292E78] outline-none placeholder:text-[#7E7E7E]"
        />
      </label>

      <button
        type="submit"
        className="h-12 rounded-[8px] bg-[#292D73] px-8 text-[13px] font-extrabold text-white transition hover:bg-[#1F2464] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#292E78] focus-visible:ring-offset-2 sm:h-auto"
      >
        Search
      </button>
    </form>
  );
};

export default BusinessSearchForm;
