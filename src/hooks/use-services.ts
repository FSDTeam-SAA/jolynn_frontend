import { ServicesResponse } from "@/types/service";
import { useQuery } from "@tanstack/react-query";

const fetchServices = async (): Promise<ServicesResponse> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error("The service catalogue is not configured.");
  }

  const response = await fetch(`${apiUrl}/service?limit=10&page=1`, {
    headers: { Accept: "*/*" },
  });

  if (!response.ok) {
    throw new Error("We couldn't load the services. Please try again.");
  }

  const result = (await response.json()) as ServicesResponse;

  if (!result.success || !Array.isArray(result.data)) {
    throw new Error(result.message || "We couldn't load the services.");
  }

  return result;
};

export const useServices = () =>
  useQuery<ServicesResponse>({
    queryKey: ["services", { page: 1, limit: 10 }],
    queryFn: fetchServices,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
