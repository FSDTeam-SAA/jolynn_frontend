import { useQuery } from "@tanstack/react-query";

export type ServiceCategory = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: {
    url: string;
    publicId: string;
  };
  status: "approved";
  isActive: boolean;
  sortOrder: number;
};

type ServiceCategoriesResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: ServiceCategory[];
};

const fetchServiceCategories = async (): Promise<ServiceCategoriesResponse> => {
  const apiUrl = (
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.NEXT_PUBLIC_BACKEND_API_URL
  )?.replace(/\/$/, "");
  if (!apiUrl) throw new Error("The service category API is not configured.");

  const params = new URLSearchParams({
    sortBy: "sortOrder",
    limit: "50",
    page: "1",
  });
  const response = await fetch(`${apiUrl}/service-categories/public?${params}`, {
    headers: { Accept: "*/*" },
  });
  const result = (await response.json()) as ServiceCategoriesResponse;

  if (!response.ok || !result.success || !Array.isArray(result.data)) {
    throw new Error(result.message || "Unable to load service categories.");
  }

  return result;
};

export const useServiceCategories = () =>
  useQuery<ServiceCategoriesResponse>({
    queryKey: [
      "public-service-categories",
      { sortBy: "sortOrder", limit: 50, page: 1 },
    ],
    queryFn: fetchServiceCategories,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
