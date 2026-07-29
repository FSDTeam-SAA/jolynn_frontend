"use client";

import {
  useLocationCities,
  useLocationStates,
} from "@/hooks/use-location-options";
import { useServices } from "@/hooks/use-services";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  ArrowRight,
  Check,
  ChevronsUpDown,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

type BusinessSearchFormProps = {
  initialService?: string;
  initialState?: string;
  initialCity?: string;
  compact?: boolean;
};

type LocationDropdownProps = {
  value: string;
  options: string[];
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  clearLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
  onChange: (value: string) => void;
};

const LocationDropdown = ({
  value,
  options,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  clearLabel = "None",
  disabled = false,
  loading = false,
  compact = false,
  onChange,
}: LocationDropdownProps) => {
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
          className={`flex w-full min-w-0 items-center justify-between gap-2 bg-transparent px-4 text-left text-[13px] font-medium text-[#292E78] outline-none disabled:cursor-not-allowed disabled:text-[#98A2B3] ${
            compact ? "h-12 xl:h-[43px]" : "h-12"
          }`}
        >
          <span className="min-w-0 flex-1 truncate" title={value || placeholder}>
            {loading ? "Loading..." : value || placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-[#4365D0]" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={7}
        className="z-[70] w-[min(280px,calc(100vw-2rem))] overflow-hidden rounded-md border border-[#E4E7EC] bg-white p-0 shadow-[0_14px_35px_rgba(41,45,115,0.18)]"
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
            className="flex w-full items-start rounded-md px-2.5 py-2 text-left text-xs font-medium leading-5 text-[#344054] transition hover:bg-[#F2F4F7] focus:bg-[#EEF2FF] focus:outline-none"
          >
            <Check
              className={`mr-2 mt-[3px] h-3.5 w-3.5 shrink-0 text-[#4365D0] ${
                value === "" ? "opacity-100" : "opacity-0"
              }`}
            />
            <span>{clearLabel}</span>
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

const BusinessSearchForm = ({
  initialService = "",
  initialState = "",
  initialCity = "",
  compact = false,
}: BusinessSearchFormProps) => {
  const router = useRouter();
  const [service, setService] = useState(initialService);
  const [stateName, setStateName] = useState(initialState);
  const [city, setCity] = useState(initialCity);
  const { data } = useServices();
  const statesQuery = useLocationStates();
  const states = (statesQuery.data?.data ?? []).filter(
    (state) => state.name.trim().toLowerCase() !== "armed forces europe",
  );
  const selectedState = states.find((state) => state.name === stateName);
  const citiesQuery = useLocationCities(selectedState);
  const cities = citiesQuery.data?.data.cities ?? [];

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
    setStateName(initialState);
    setCity(initialCity);
  }, [initialCity, initialState]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams();
    if (service.trim()) params.set("service", service.trim());
    if (stateName) params.set("state", stateName);
    if (city) params.set("city", city);

    router.push(
      `/services/businesses${params.toString() ? `?${params}` : ""}`,
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`mx-auto grid w-full max-w-[1160px] grid-cols-1 overflow-hidden rounded-xl border border-white/80 bg-white shadow-[0_10px_28px_rgba(32,42,70,0.12)] sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_auto] ${
        compact ? "p-2 xl:h-[51px] xl:p-1" : "p-2"
      }`}
    >
      <label
        className={`relative flex min-w-0 items-center gap-2 border-b border-[#ECEEF5] px-4 sm:border-r lg:border-b-0 ${
          compact ? "py-3 xl:h-[43px] xl:py-0" : "py-3"
        }`}
      >
        <Search className="h-5 w-5 shrink-0 text-[#4365D0]" />
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

      <div className="min-w-0 border-b border-[#ECEEF5] sm:border-b lg:border-b-0 lg:border-r">
        <LocationDropdown
          value={stateName}
          options={states.map((state) => state.name)}
          placeholder={statesQuery.isError ? "States unavailable" : "Select state"}
          searchPlaceholder="Search states..."
          emptyMessage="No state found."
          clearLabel="None"
          loading={statesQuery.isPending}
          compact={compact}
          disabled={statesQuery.isError || states.length === 0}
          onChange={(nextState) => {
            setStateName(nextState);
            setCity("");
          }}
        />
      </div>

      <div className="min-w-0 border-b border-[#ECEEF5] sm:border-b-0 sm:border-r">
        <LocationDropdown
          value={city}
          options={cities}
          placeholder={
            !selectedState
              ? "Select state first"
              : citiesQuery.isError
                ? "Cities unavailable"
                : "Select city"
          }
          searchPlaceholder="Search cities..."
          emptyMessage="No city found."
          clearLabel="None"
          loading={Boolean(selectedState) && citiesQuery.isPending}
          compact={compact}
          disabled={
            !selectedState ||
            citiesQuery.isError ||
            (!citiesQuery.isPending && cities.length === 0)
          }
          onChange={setCity}
        />
      </div>

      <button
        type="submit"
        className={`flex items-center justify-center gap-2 rounded-lg bg-[#292D73] px-7 text-[13px] font-extrabold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#1F2464] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4365D0] focus-visible:ring-offset-2 sm:col-span-2 lg:col-span-1 ${
          compact ? "h-12 xl:h-[43px]" : "h-12"
        }`}
      >
        Search
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
};

export default BusinessSearchForm;
