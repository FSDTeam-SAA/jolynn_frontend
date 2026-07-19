import { useQuery } from "@tanstack/react-query";

export type RatingBreakdown = Record<"1" | "2" | "3" | "4" | "5", number>;

export type BusinessOverviewData = {
  ownerId: string;
  displayName?: string;
  businessName: string;
  category?: string;
  serviceArea?: string;
  businessEmail?: string;
  email?: string;
  businessWebsiteUrl?: string;
  city?: string;
  state?: string;
  address?: string;
  rating?: number;
  totalReviews?: number;
  reviewSummary?: {
    averageRating: number;
    totalReviews: number;
    ratingBreakdown: RatingBreakdown;
  };
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("The business profile API is not configured.");
  return apiUrl;
};

const fetchBusinessOverview = async (businessId: string) => {
  const response = await fetch(
    `${getApiUrl()}/user/public-business/${encodeURIComponent(businessId)}`,
    { headers: { accept: "*/*" } },
  );
  const result = (await response.json()) as ApiResponse<BusinessOverviewData>;
  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || "Unable to load this business.");
  }
  return result.data;
};

export const usePublicBusinessProfile = (businessId: string) =>
  useQuery({
    queryKey: ["public-business", businessId],
    queryFn: () => fetchBusinessOverview(businessId),
    enabled: Boolean(businessId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
