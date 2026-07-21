import { useQuery } from "@tanstack/react-query";

export type LocationState = {
  id: number;
  mongoId: string;
  name: string;
  iso2: string;
  countryCode: string;
  countryName: string;
};

type StatesResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: LocationState[];
};

type CitiesResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    state: LocationState;
    dataSource: string;
    cities: string[];
  };
};

const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("The location service is not configured.");
  return apiUrl;
};

const fetchStates = async (): Promise<StatesResponse> => {
  const response = await fetch(`${getApiUrl()}/locations/states?countryCode=US`, {
    headers: { accept: "*/*" },
  });
  const result = (await response.json()) as StatesResponse;

  if (!response.ok || !result.success || !Array.isArray(result.data)) {
    throw new Error(result.message || "Unable to load states.");
  }
  return result;
};

const fetchCities = async (state: LocationState): Promise<CitiesResponse> => {
  const params = new URLSearchParams({
    countryName: state.countryName || "United States",
    limit: "500",
  });
  const response = await fetch(
    `${getApiUrl()}/locations/states/${encodeURIComponent(state.mongoId)}/cities?${params}`,
    { headers: { accept: "*/*" } },
  );
  const result = (await response.json()) as CitiesResponse;

  if (!response.ok || !result.success || !Array.isArray(result.data?.cities)) {
    throw new Error(result.message || "Unable to load cities.");
  }
  return result;
};

export const useLocationStates = () =>
  useQuery<StatesResponse>({
    queryKey: ["location-states", { countryCode: "US" }],
    queryFn: fetchStates,
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

export const useLocationCities = (state?: LocationState) =>
  useQuery<CitiesResponse>({
    queryKey: ["location-cities", state?.mongoId],
    queryFn: () => fetchCities(state!),
    enabled: Boolean(state?.mongoId),
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });
