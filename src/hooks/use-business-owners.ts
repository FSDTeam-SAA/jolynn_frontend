import { useQuery } from "@tanstack/react-query";
import {
  getReferralApiUrl,
  parseReferralResponse,
  ReferralApiError,
  type BusinessCard,
  type PaginatedResponse,
} from "@/lib/business-referrals";

export type BusinessOwner = BusinessCard;

type BusinessOwnersResponse = PaginatedResponse<BusinessCard> & {
  registeredOnly?: boolean;
};

type LegacyBusinessOwner = Omit<BusinessCard,
  "listingId" | "listingType" | "claimStatus" | "isClaimable" | "profileUrl" | "rating" | "totalReviews"
> & {
  businessOwnerId: string;
  profileUrl?: string;
  rating: number | null;
  totalReviews: number | null;
};

export type BusinessOwnerFilters = {
  searchTerm: string;
  page: number;
  limit?: number;
  service?: string;
  serviceCategoryId?: string;
  category?: string;
  minimumRating?: string;
  state?: string;
  city?: string;
  location?: string;
  listingType?: "all" | "registered" | "referred";
  claimStatus?: "" | "unclaimed" | "claimed";
  sortBy?: "createdAt" | "rating" | "businessName";
  sortOrder?: "asc" | "desc";
};

export const fetchBusinessOwners = async (
  filters: BusinessOwnerFilters,
): Promise<BusinessOwnersResponse> => {
  const params = new URLSearchParams({
    limit: String(filters.limit || 10),
    page: String(filters.page),
    listingType: filters.listingType || "all",
    sortBy: filters.sortBy || "createdAt",
    sortOrder: filters.sortOrder || "desc",
  });

  const optionalFilters = {
    searchTerm: filters.searchTerm,
    service: filters.service,
    serviceCategoryId: filters.serviceCategoryId,
    category: filters.category,
    minimumRating: filters.minimumRating,
    state: filters.state,
    city: filters.city,
    location: filters.location,
    claimStatus: filters.claimStatus,
  };

  Object.entries(optionalFilters).forEach(([key, value]) => {
    if (value?.trim()) params.set(key, value.trim());
  });

  const response = await fetch(
    `${getReferralApiUrl()}/businesses/search?${params}`,
    { headers: { Accept: "application/json" } },
  );
  try {
    return await parseReferralResponse<BusinessOwnersResponse>(response);
  } catch (error) {
    // Older deployments do not have the unified discovery route yet. Only
    // fall back for that missing route, never for auth, validation or 5xx errors.
    const missingDiscoveryRoute = error instanceof ReferralApiError &&
      error.status === 404 && error.message.startsWith("Cannot GET ") &&
      error.message.split("?")[0].endsWith("/businesses/search");
    if (!missingDiscoveryRoute) throw error;

    if (filters.listingType === "referred" || filters.claimStatus === "unclaimed") {
      throw new ReferralApiError(404, {
        message: "Referral search is temporarily unavailable. Select All Businesses or Registered Businesses to browse registered listings.",
      });
    }
    if (filters.serviceCategoryId?.trim()) {
      throw new ReferralApiError(404, {
        message: "This category filter is temporarily unavailable. Please select a category by name or try again later.",
      });
    }

    const legacyParams = new URLSearchParams(params);
    legacyParams.delete("listingType");
    legacyParams.delete("claimStatus");
    legacyParams.delete("serviceCategoryId");
    const legacyResponse = await fetch(
      `${getReferralApiUrl()}/service/search/business-owners?${legacyParams}`,
      { headers: { Accept: "application/json" } },
    );
    const result = await parseReferralResponse<PaginatedResponse<LegacyBusinessOwner>>(legacyResponse);
    if (!Array.isArray(result.data)) {
      throw new Error("We couldn't load the businesses. Please try again.");
    }
    return {
      ...result,
      registeredOnly: true,
      data: result.data.map((business) => ({
        ...business,
        listingId: business.businessOwnerId,
        listingType: "registered",
        profileUrl: business.profileUrl || (business.username
          ? `/${encodeURIComponent(business.username)}`
          : `/services/businesses/${encodeURIComponent(business.businessOwnerId)}`),
        rating: business.rating ?? 0,
        totalReviews: business.totalReviews ?? 0,
        claimStatus: "claimed",
        isClaimable: false,
      })),
    };
  }
};

export const useBusinessOwners = (filters: BusinessOwnerFilters) =>
  useQuery<BusinessOwnersResponse>({
    queryKey: ["business-search", filters],
    queryFn: () => fetchBusinessOwners(filters),
    staleTime: 2 * 60 * 1000,
    retry: (failureCount, error) => failureCount < 1 &&
      !(error instanceof ReferralApiError && error.status >= 400 && error.status < 500),
  });
