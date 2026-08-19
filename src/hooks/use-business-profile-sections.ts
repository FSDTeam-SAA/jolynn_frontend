import type { RatingBreakdown } from "@/hooks/use-public-business-profile";
import { useQuery } from "@tanstack/react-query";

type ApiListResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta: { page: number; limit: number; total: number };
};

export type BusinessService = {
  _id: string;
  title: string;
  description?: string;
  status: "active" | "inactive";
  logo?: { url: string; publicId: string };
};

export type BusinessGalleryItem = {
  _id: string;
  title: string;
  images: { url: string; publicId: string }[];
};

export type BusinessReview = {
  _id: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  message: string;
  createdAt: string;
  reply?: { message: string; repliedByName: string; repliedAt: string };
};

export type BusinessReviewsData = {
  summary: {
    averageRating: number;
    totalReviews: number;
    ratingBreakdown: RatingBreakdown;
  };
  reviews: BusinessReview[];
};

const getApiUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) throw new Error("The business API is not configured.");
  return apiUrl;
};

const fetchSection = async <T,>(path: string): Promise<ApiListResponse<T>> => {
  const response = await fetch(`${getApiUrl()}${path}`, {
    headers: { accept: "*/*" },
  });
  const result = (await response.json()) as ApiListResponse<T>;
  if (!response.ok || !result.success) {
    throw new Error(result.message || "Unable to load this section.");
  }
  return result;
};

export const useBusinessServices = (businessId: string) =>
  useQuery({
    queryKey: ["business-services", businessId],
    queryFn: () =>
      fetchSection<BusinessService[]>(
        `/service/owner/${encodeURIComponent(businessId)}?sortBy=createdAt&limit=10&page=1`,
      ),
    enabled: Boolean(businessId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useBusinessGallery = (businessId: string) =>
  useQuery({
    queryKey: ["business-gallery", businessId],
    queryFn: () =>
      fetchSection<BusinessGalleryItem[]>(
        `/gallary/owner/${encodeURIComponent(businessId)}?sortBy=createdAt&limit=10&page=1`,
      ),
    enabled: Boolean(businessId),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

export const useBusinessReviews = (businessId: string) =>
  useQuery({
    queryKey: ["business-reviews", businessId],
    queryFn: () =>
      fetchSection<BusinessReviewsData>(
        `/reviews/business/${encodeURIComponent(businessId)}?sortBy=createdAt&limit=10&page=1`,
      ),
    enabled: Boolean(businessId),
    staleTime: 60 * 1000,
    retry: 1,
  });
