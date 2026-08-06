import { useQuery } from "@tanstack/react-query";

export type BusinessOwner = {
  businessOwnerId: string;
  businessName: string;
  category: string;
  city: string;
  state: string;
  country?: string;
  address: string;
  serviceArea: string;
  profilePicture?: string;
  bio?: string;
  businessWebsiteUrl: string;
  businessEmail?: string;
  phoneNumber?: string;
  rating: number | null;
  totalReviews: number | null;
  createdAt: string;
  service: {
    id: string;
    title: string;
    description?: string | null;
    logo?: {
      url: string;
      publicId: string;
    } | null;
  } | null;
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
  searchTerm: string;
  page: number;
  limit?: number;
  category?: string;
  minimumRating?: string;
  state?: string;
  city?: string;
};

const fetchBusinessOwners = async (
  filters: BusinessOwnerFilters,
): Promise<BusinessOwnersResponse> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) throw new Error("The business service is not configured.");

  const params = new URLSearchParams({
    limit: String(filters.limit || 10),
    page: String(filters.page),
  });

  const optionalFilters = {
    searchTerm: filters.searchTerm,
    category: filters.category,
    minimumRating: filters.minimumRating,
    state: filters.state,
    city: filters.city,
  };

  Object.entries(optionalFilters).forEach(([key, value]) => {
    if (value?.trim()) params.set(key, value.trim());
  });

  const response = await fetch(
    `${apiUrl}/service/search/business-owners?${params}`,
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
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
