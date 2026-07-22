"use client";

import { useServices } from "@/hooks/use-services";
import { MapPin, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

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
  const { data } = useServices();
  const canonicalInitialService = useMemo(
    () =>
      data?.data.find(
        (item) =>
          item._id === initialService ||
          item.title.toLowerCase() === initialService.toLowerCase(),
      )?.title || initialService,
    [data?.data, initialService],
  );

  useEffect(() => {
    setService(canonicalInitialService);
  }, [canonicalInitialService]);

  useEffect(() => {
    setLocation(initialLocation);
  }, [initialLocation]);

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
        <input
          type="search"
          value={service}
          onChange={(event) => setService(event.target.value)}
          placeholder="What services do you need?"
          autoComplete="off"
          aria-label="Search for a service"
          className="w-full bg-transparent text-[13px] font-medium text-[#292E78] outline-none placeholder:text-[#7E7E7E]"
        />
      </label>

      <label className="flex min-w-0 flex-1 items-center gap-2 border-b border-[#ECEEF5] px-4 py-3 sm:border-b-0 sm:border-r">
        <MapPin className="h-5 w-5 shrink-0 text-[#7E7E7E]" />
        <input
          type="text"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          placeholder="Location"
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
