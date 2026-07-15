import { useQuery } from "@tanstack/react-query";

export type BusinessOwner = {
  businessOwnerId: string;
  businessName: string;
  category: string;
  city: string;
  state: string;
  address: string;
  serviceArea: string;
  businessWebsiteUrl: string;
  rating: number;
  totalReviews: number;
  createdAt: string;
  service: {
    id: string;
    title: string;
    description: string;
    logo: {
      url: string;
      publicId: string;
    };
  };
};

type BusinessOwnersResponse = {
  statusCode: number;
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: BusinessOwner[];
};

export type BusinessOwnerFilters = {
  serviceId: string;
  page: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  minimumRating?: string;
  location?: string;
  state?: string;
  city?: string;
  category?: string;
  businessName?: string;
  searchTerm?: string;
};

const fetchBusinessOwners = async (
  filters: BusinessOwnerFilters,
): Promise<BusinessOwnersResponse> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) throw new Error("The business service is not configured.");

  const params = new URLSearchParams({
    sortBy: filters.sortBy || "createdAt",
    sortOrder: filters.sortOrder || "desc",
    limit: String(filters.limit || 10),
    page: String(filters.page),
  });

  const optionalFilters = {
    minimumRating: filters.minimumRating,
    location: filters.location,
    state: filters.state,
    city: filters.city,
    category: filters.category,
    businessName: filters.businessName,
    searchTerm: filters.searchTerm,
  };

  Object.entries(optionalFilters).forEach(([key, value]) => {
    if (value?.trim()) params.set(key, value.trim());
  });

  const response = await fetch(
    `${apiUrl}/service/${encodeURIComponent(filters.serviceId)}/business-owners?${params}`,
    { headers: { Accept: "*/*" } },
  );

  if (!response.ok) {
    throw new Error("We couldn't load the businesses. Please try again.");
  }

  const result = (await response.json()) as BusinessOwnersResponse;
  if (!result.success || !Array.isArray(result.data)) {
    throw new Error(result.message || "We couldn't load the businesses.");
  }

  return result;
};

export const useBusinessOwners = (filters: BusinessOwnerFilters) =>
  useQuery<BusinessOwnersResponse>({
    queryKey: ["business-owners", filters],
    queryFn: () => fetchBusinessOwners(filters),
    enabled: Boolean(filters.serviceId),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
